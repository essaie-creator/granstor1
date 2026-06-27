/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FileCategory = 'image' | 'video' | 'document' | 'junk' | 'other';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number; // in bytes
  type: FileCategory;
  lastModified: number; // timestamp
  contentHash: string; // for exact duplicate match
  similarHash?: string; // average-hash for image similarity
  isSimulated: boolean;
  previewUrl?: string; // Base64 or Object URL for images
  realFile?: File; // optional real file ref
}

export interface DuplicateGroup {
  id: string;
  type: 'exact' | 'similar';
  files: FileItem[];
  similarityScore?: number; // average similarity percentage for "similar" group
}

export interface TrashItem {
  id: string;
  file: FileItem;
  deletedAt: number;
  groupId?: string; // to put back in its group if restored
}

export interface Settings {
  similarityThreshold: number; // e.g. 85 for 85% match
  darkMode: boolean;
  ignoredFolders: string[];
  safeMode: boolean; // warn when deleting the last remaining file in a duplicate group
}

export interface ScanStats {
  totalSize: number;
  totalFiles: number;
  duplicateSize: number;
  duplicateCount: number;
  junkSize: number;
  junkCount: number;
  rarelyUsedSize: number;
  rarelyUsedCount: number;
}
