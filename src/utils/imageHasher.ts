/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Computes an average perceptual hash (a-hash) of an image client-side.
 * Downscales an image to an 8x8 grid, converts to greyscale,
 * calculates average intensity, and outputs a 64-character binary string of 1s and 0s.
 */
export function computeImageHash(srcUrlOrBlob: string | Blob): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent tainted canvas for external URLs

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('0'.repeat(64));
          return;
        }

        // Draw image downscaled to 8x8
        ctx.drawImage(img, 0, 0, 8, 8);
        const imgData = ctx.getImageData(0, 0, 8, 8);
        const data = imgData.data;

        // Step 1: Calculate greyscales & average greyscale
        const greyscales: number[] = [];
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard luma formula
          const grey = 0.299 * r + 0.587 * g + 0.114 * b;
          greyscales.push(grey);
          total += grey;
        }

        const average = total / 64;

        // Step 2: Build binary hash based on comparison with average
        let hash = '';
        for (let i = 0; i < 64; i++) {
          hash += greyscales[i] >= average ? '1' : '0';
        }

        resolve(hash);
      } catch (err) {
        console.error('Error generating image hash:', err);
        // Fallback: stable random-looking but identical-for-same-source hash
        resolve('0'.repeat(64));
      }
    };

    img.onerror = () => {
      // In case image load fails, resolve dummy hash
      resolve('0'.repeat(64));
    };

    if (typeof srcUrlOrBlob === 'string') {
      img.src = srcUrlOrBlob;
    } else {
      img.src = URL.createObjectURL(srcUrlOrBlob);
    }
  });
}

/**
 * Compares two binary average hashes and returns the similarity percentage (0 to 100).
 */
export function compareHashes(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== 64 || hash2.length !== 64) {
    return 0;
  }
  let matchingBits = 0;
  for (let i = 0; i < 64; i++) {
    if (hash1[i] === hash2[i]) {
      matchingBits++;
    }
  }
  return Math.round((matchingBits / 64) * 100);
}
