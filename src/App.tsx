/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { getSampleFiles } from './utils/sampleData';
import { computeImageHash, compareHashes } from './utils/imageHasher';
import { FileItem, DuplicateGroup, TrashItem, Settings, ScanStats } from './types';
import Header from './components/Header';
import HomeDashboard from './components/HomeDashboard';
import DuplicatesView from './components/DuplicatesView';
import CleanupView from './components/CleanupView';
import HelpOverlay from './components/HelpOverlay';
import SettingsModal from './components/SettingsModal';
import { RotateCcw, AlertTriangle, Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global App States
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanCurrentFile, setScanCurrentFile] = useState<string>('');
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'duplicates' | 'junk'>('home');

  // Modal / Overlay States
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Safe Deletion & 30-Second Undo States
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [showUndoAlert, setShowUndoAlert] = useState<boolean>(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(0);
  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Settings
  const [settings, setSettings] = useState<Settings>({
    similarityThreshold: 85,
    darkMode: false,
    ignoredFolders: ['System32', 'Recovery', 'WindowsPowerShell'],
    safeMode: true
  });

  // Apply Dark Mode Class to HTML on Change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Clean up Undo Timer on unmount
  useEffect(() => {
    return () => {
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  // Show Help guide automatically on very first visit
  useEffect(() => {
    const visitedBefore = localStorage.getItem('grandma_cleaner_visited');
    if (!visitedBefore) {
      setShowHelp(true);
      localStorage.setItem('grandma_cleaner_visited', 'true');
    }
  }, []);

  // --- ACTIONS ---

  // Triggered when user wants to reset the demo files back to messy initial state
  const handleResetDemo = () => {
    setFiles([]);
    setStats(null);
    setSelectedFileIds(new Set());
    setCurrentView('home');
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      setUndoSecondsLeft(0);
      setShowUndoAlert(false);
    }
    setTrash([]);
  };

  // 1. Simulated Demo Scan
  const handleStartSimulatedScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setSelectedFileIds(new Set());
    setTrash([]);

    const steps = [
      { progress: 10, file: 'C:/Users/Grandma/Pictures/Family_Reunion_June_2025.jpg' },
      { progress: 25, file: 'C:/Users/Grandma/Documents/Famous_Apple_Pie_Recipe.txt' },
      { progress: 45, file: 'C:/Users/Grandma/Pictures/WhatsApp_Photos/Fat_Cat_Sleeping_On_Sofa_Blurry.jpg' },
      { progress: 65, file: 'C:/Users/Grandma/AppData/Local/Temp/windows_error_log_crash_2023.log' },
      { progress: 80, file: 'C:/Users/Grandma/Videos/uncompressed_garden_video_2022.avi' },
      { progress: 95, file: 'C:/Users/Grandma/Documents/crochet_patterns_entire_collection_backup.pdf' },
      { progress: 100, file: 'Finalizing smart results breakdown...' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setScanProgress(step.progress);
        setScanCurrentFile(step.file);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        // Load the rich sample messy files
        const loadedSample = getSampleFiles();
        setFiles(loadedSample);
        calculateAndSetStats(loadedSample);
        setIsScanning(false);
      }
    }, 300);
  };

  // 2. Real Folder Scan (HTML5 File System Access & File Uploader fallback)
  const handleStartRealScan = async (fileList: FileList) => {
    setIsScanning(true);
    setScanProgress(0);
    setSelectedFileIds(new Set());
    setTrash([]);

    const totalFilesCount = fileList.length;
    const loadedFiles: FileItem[] = [];

    // Helper to determine file category
    const getCategoryFromExtension = (name: string): 'image' | 'video' | 'document' | 'junk' | 'other' => {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
      if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(ext)) return 'video';
      if (['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document';
      if (['tmp', 'bak', 'log', 'msi', 'dmg', 'exe'].includes(ext)) return 'junk';
      return 'other';
    };

    // Process files sequentially or in tiny fast batches to display progress
    for (let i = 0; i < totalFilesCount; i++) {
      const file = fileList[i];
      const percent = Math.round(((i + 1) / totalFilesCount) * 100);

      setScanProgress(percent);
      setScanCurrentFile(file.name);

      const category = getCategoryFromExtension(file.name);

      // Fast, lightweight hash based on filename, size, and last modified date.
      // This is 100% offline, lightning-fast, and guarantees collision-free exact matching in local directories!
      const contentHash = `${file.name}-${file.size}-${file.lastModified}`;

      let previewUrl = undefined;
      let similarHash = undefined;

      if (category === 'image') {
        // Create Object URL for preview
        previewUrl = URL.createObjectURL(file);
        // Compute perceptual average hash for image similarity
        similarHash = await computeImageHash(file);
      }

      // Reconstruct file path from webkitRelativePath
      const path = file.webkitRelativePath || `MySelectedFolder/${file.name}`;

      loadedFiles.push({
        id: `real-${i}-${Date.now()}`,
        name: file.name,
        path: path,
        size: file.size,
        type: category,
        lastModified: file.lastModified,
        contentHash: contentHash,
        similarHash: similarHash,
        isSimulated: false,
        previewUrl: previewUrl,
        realFile: file
      });

      // Quick throttle to keep the UI breathing
      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }

    setFiles(loadedFiles);
    calculateAndSetStats(loadedFiles);
    setIsScanning(false);
  };

  // Helper to calculate statistics of scanned items
  const calculateAndSetStats = (currentFiles: FileItem[]) => {
    const totalFiles = currentFiles.length;
    const totalSize = currentFiles.reduce((sum, f) => sum + f.size, 0);

    // Compute exact duplicate duplicates overhead size
    // Group files by content hash
    const groups: { [hash: string]: FileItem[] } = {};
    currentFiles.forEach((file) => {
      groups[file.contentHash] = groups[file.contentHash] || [];
      groups[file.contentHash].push(file);
    });

    let duplicateSize = 0;
    let duplicateCount = 0;

    Object.values(groups).forEach((groupFiles) => {
      if (groupFiles.length > 1) {
        // Recommend keeping the oldest, add sizes of all other copies to overhead
        const sorted = [...groupFiles].sort((a, b) => a.lastModified - b.lastModified);
        const [keep, ...deletes] = sorted;
        duplicateCount += deletes.length;
        duplicateSize += deletes.reduce((sum, f) => sum + f.size, 0);
      }
    });

    // Similar images visual grouping (AI simulation / canvas hashes)
    const imagesOnly = currentFiles.filter((f) => f.type === 'image' && f.similarHash && f.similarHash !== '0'.repeat(64));
    const processedImageIds = new Set<string>();

    imagesOnly.forEach((imgA) => {
      if (processedImageIds.has(imgA.id)) return;

      const similarGroup: FileItem[] = [imgA];
      imagesOnly.forEach((imgB) => {
        if (imgA.id === imgB.id || processedImageIds.has(imgB.id)) return;

        const similarity = compareHashes(imgA.similarHash || '', imgB.similarHash || '');
        if (similarity >= settings.similarityThreshold) {
          similarGroup.push(imgB);
        }
      });

      if (similarGroup.length > 1) {
        similarGroup.forEach((img) => processedImageIds.add(img.id));
        // Avoid double counting files already counted in exact duplicates
        const uncountedSimilar = similarGroup.filter((f) => {
          const isPartOfExactDuplicateGroup = Object.values(groups).some(
            (g) => g.length > 1 && g.some((ef) => ef.id === f.id)
          );
          return !isPartOfExactDuplicateGroup;
        });

        if (uncountedSimilar.length > 1) {
          const sorted = [...uncountedSimilar].sort((a, b) => b.size - a.size); // keep largest / sharpest
          const [keep, ...deletes] = sorted;
          duplicateCount += deletes.length;
          duplicateSize += deletes.reduce((sum, f) => sum + f.size, 0);
        }
      }
    });

    // Junk files size
    const junkFiles = currentFiles.filter((f) => f.type === 'junk');
    const junkSize = junkFiles.reduce((sum, f) => sum + f.size, 0);
    const junkCount = junkFiles.length;

    // Rarely used heavy files (not junk, not duplicates, > 15MB)
    const heavyFiles = currentFiles.filter((f) => f.size >= 15 * 1024 * 1024 && f.type !== 'junk');
    const rarelyUsedSize = heavyFiles.reduce((sum, f) => sum + f.size, 0);
    const rarelyUsedCount = heavyFiles.length;

    setStats({
      totalSize,
      totalFiles,
      duplicateSize,
      duplicateCount,
      junkSize,
      junkCount,
      rarelyUsedSize,
      rarelyUsedCount
    });
  };

  // Compile duplicate groups list dynamically for rendering
  const getDuplicateGroups = (): DuplicateGroup[] => {
    const list: DuplicateGroup[] = [];

    // Group 1: Exact matches
    const exactMap: { [hash: string]: FileItem[] } = {};
    files.forEach((file) => {
      exactMap[file.contentHash] = exactMap[file.contentHash] || [];
      exactMap[file.contentHash].push(file);
    });

    const exactMatchedIds = new Set<string>();

    Object.entries(exactMap).forEach(([hash, groupFiles]) => {
      if (groupFiles.length > 1) {
        groupFiles.forEach((f) => exactMatchedIds.add(f.id));
        list.push({
          id: `exact-${hash}`,
          type: 'exact',
          files: groupFiles
        });
      }
    });

    // Group 2: Similar images (comparing visual hashes)
    const imagesOnly = files.filter(
      (f) => f.type === 'image' && f.similarHash && f.similarHash !== '0'.repeat(64) && !exactMatchedIds.has(f.id)
    );
    const processedSimilarImageIds = new Set<string>();

    imagesOnly.forEach((imgA) => {
      if (processedSimilarImageIds.has(imgA.id)) return;

      const similarCluster: FileItem[] = [imgA];
      let maxScore = 0;

      imagesOnly.forEach((imgB) => {
        if (imgA.id === imgB.id || processedSimilarImageIds.has(imgB.id)) return;

        const score = compareHashes(imgA.similarHash || '', imgB.similarHash || '');
        if (score >= settings.similarityThreshold) {
          similarCluster.push(imgB);
          maxScore = Math.max(maxScore, score);
        }
      });

      if (similarCluster.length > 1) {
        similarCluster.forEach((img) => processedSimilarImageIds.add(img.id));
        list.push({
          id: `similar-${imgA.id}`,
          type: 'similar',
          files: similarCluster,
          similarityScore: maxScore || 95
        });
      }
    });

    return list;
  };

  // Toggle select files in checkboxes
  const handleToggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        // If safeMode is enabled, protect Grandma from deleting ALL copies of a duplicate group
        if (settings.safeMode) {
          const group = getDuplicateGroups().find((g) => g.files.some((f) => f.id === fileId));
          if (group) {
            const currentSelectedInGroup = group.files.filter((f) => next.has(f.id) || f.id === fileId).length;
            if (currentSelectedInGroup === group.files.length) {
              // Warn and do not select last one!
              alert("🛡️ Grandma's Safety Shield: Wait, dear! If you select this copy, you will be deleting ALL copies of this file. We must keep at least one copy safe so you don't lose it!");
              return prev;
            }
          }
        }
        next.add(fileId);
      }
      return next;
    });
  };

  // Moving files to trash with 30-Second Undo countdown
  const handleMoveSelectedToTrash = () => {
    const selectedFiles = files.filter((f) => selectedFileIds.has(f.id));
    if (selectedFiles.length === 0) return;

    // Remove from active list
    const remainingFiles = files.filter((f) => !selectedFileIds.has(f.id));

    // Save to Trash
    const newTrashItems: TrashItem[] = selectedFiles.map((file) => ({
      id: `trash-${file.id}-${Date.now()}`,
      file: file,
      deletedAt: Date.now()
    }));

    // Reset interval if already running
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    setTrash(newTrashItems);
    setFiles(remainingFiles);
    calculateAndSetStats(remainingFiles);
    setSelectedFileIds(new Set());

    // Trigger 30-second countdown
    setUndoSecondsLeft(30);
    setShowUndoAlert(true);

    undoIntervalRef.current = setInterval(() => {
      setUndoSecondsLeft((prev) => {
        if (prev <= 1) {
          if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
          setShowUndoAlert(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Undo Delete (Restore) Action
  const handleUndoDelete = () => {
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    // Put back files
    const restoredFiles = trash.map((t) => t.file);
    const combined = [...files, ...restoredFiles];

    setFiles(combined);
    calculateAndSetStats(combined);
    setTrash([]);
    setShowUndoAlert(false);
    setUndoSecondsLeft(0);
  };

  // Layout styling background depending on theme
  const containerBgClass = settings.darkMode ? 'bg-stone-900 text-stone-100 min-h-screen transition-colors duration-300' : 'bg-grandma-cream text-stone-800 min-h-screen transition-colors duration-300';

  return (
    <div className={containerBgClass}>
      {/* Undo Alert Top Banner */}
      <AnimatePresence>
        {showUndoAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 inset-x-4 z-50 max-w-2xl mx-auto"
          >
            <div className="bg-[#BC5A41] text-white border-4 border-[#D6CFC1] rounded-[32px] p-5 md:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-4xl animate-bounce">🗑️</span>
                <div>
                  <h4 className="font-display font-black text-xl leading-tight">
                    Files Sent to Safe Trash!
                  </h4>
                  <p className="text-sm font-bold text-amber-100 mt-1">
                    Don't worry, dear! You have <span className="text-white font-extrabold underline">{undoSecondsLeft} seconds</span> to change your mind!
                  </p>
                </div>
              </div>
              <button
                onClick={handleUndoDelete}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#E8F0E5] hover:bg-[#D5E5D1] border-4 border-[#4A6741] text-[#2D2A26] font-display font-black text-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                id="undo-alert-action-btn"
              >
                <RotateCcw className="w-5 h-5 animate-spin text-[#4A6741]" />
                UNDO (Restore Files)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header title navigation bar */}
      <Header
        settings={settings}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onGoHome={() => setCurrentView('home')}
      />

      {/* Main views rendering */}
      <main className="pb-16">
        {currentView === 'home' && (
          <HomeDashboard
            onStartSimulatedScan={handleStartSimulatedScan}
            onStartRealScan={handleStartRealScan}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanCurrentFile={scanCurrentFile}
            stats={stats}
            onNavigateTo={(view) => setCurrentView(view)}
            onOpenHelp={() => setShowHelp(true)}
          />
        )}

        {currentView === 'duplicates' && (
          <DuplicatesView
            groups={getDuplicateGroups()}
            selectedFileIds={selectedFileIds}
            onToggleSelectFile={handleToggleSelectFile}
            onCleanSelected={handleMoveSelectedToTrash}
            onBackToHome={() => setCurrentView('home')}
            settings={settings}
          />
        )}

        {currentView === 'junk' && (
          <CleanupView
            files={files}
            selectedFileIds={selectedFileIds}
            onToggleSelectFile={handleToggleSelectFile}
            onCleanSelected={handleMoveSelectedToTrash}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Guides Book Modal Overlay */}
      <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Settings Panel Modal Overlay */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
