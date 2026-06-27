/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trash2, ArrowLeft, ShieldAlert, Check, FileCode, HardDrive, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { FileItem } from '../types';

interface CleanupViewProps {
  files: FileItem[];
  selectedFileIds: Set<string>;
  onToggleSelectFile: (fileId: string) => void;
  onCleanSelected: () => void;
  onBackToHome: () => void;
}

export default function CleanupView({
  files,
  selectedFileIds,
  onToggleSelectFile,
  onCleanSelected,
  onBackToHome
}: CleanupViewProps) {

  // Filter junk files
  const junkFiles = files.filter((f) => f.type === 'junk');

  // Filter heavy files (larger than 10MB) that are NOT junk and NOT duplicates
  // Let's filter heavy files (>= 15MB) for clean display
  const heavyFiles = files.filter((f) => f.size >= 15 * 1024 * 1024 && f.type !== 'junk');

  // Formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDateCozy = (timestamp: number) => {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Compute stats
  const selectedJunkFiles = junkFiles.filter(f => selectedFileIds.has(f.id));
  const selectedHeavyFiles = heavyFiles.filter(f => selectedFileIds.has(f.id));

  const selectedCount = selectedJunkFiles.length + selectedHeavyFiles.length;
  const selectedSizeSum = [...selectedJunkFiles, ...selectedHeavyFiles].reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Return */}
      <button
        onClick={onBackToHome}
        className="mb-6 text-lg font-extrabold text-[#BC5A41] hover:text-[#2D2A26] flex items-center gap-2 cursor-pointer transition-colors"
        id="back-home-cleanup-btn"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Main Screen
      </button>

      {/* Header */}
      <div className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-6 md:p-8 shadow-md mb-8">
        <h2 className="font-display font-black text-3xl text-[#2D2A26]">
          安全 Clean Junk & Heavy Files
        </h2>
        <p className="text-lg font-bold text-[#6B655B] mt-1">
          Wipe away invisible system clutter, or inspect old huge files that you haven't opened in years.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section A: Safe-To-Delete Junk */}
        <div className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-5 md:p-6 shadow-md">
          <div className="border-b-4 border-stone-100 pb-4 mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-display font-black text-2xl text-[#4A6741]">
                🧼 Recommended Junk Files
              </h3>
              <p className="text-sm font-bold text-[#6B655B] mt-1">
                These are temporary internet cookies and error installer logs. It is 100% safe to delete them!
              </p>
            </div>
            <span className="bg-[#4A6741] text-white font-extrabold text-sm px-3 py-1 rounded-xl">
              Safe Clean
            </span>
          </div>

          {junkFiles.length === 0 ? (
            <div className="text-center py-8 text-[#6B655B] font-bold">
              🎉 No junk logs found! Your system is pristine!
            </div>
          ) : (
            <div className="space-y-3">
              {junkFiles.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => onToggleSelectFile(file.id)}
                    className={`p-4 rounded-xl border-4 flex justify-between items-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FAF0EE] border-[#BC5A41]'
                        : 'bg-[#FAF9F6] border-[#D6CFC1] hover:border-[#6B655B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCode className="w-8 h-8 text-[#4A6741]" />
                      <div>
                        <span className="font-display font-black text-lg text-[#2D2A26] block leading-tight">
                          {file.name}
                        </span>
                        <span className="font-mono text-xs text-[#6B655B] block mt-1 break-all">
                          📁 {file.path}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-[#2D2A26] bg-[#E8E4D9] px-2.5 py-1 rounded-lg">
                        {formatBytes(file.size)}
                      </span>
                      {/* Big custom checkbox */}
                      <div className={`w-8 h-8 rounded-lg border-4 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#BC5A41] border-[#BC5A41] text-white' : 'bg-white border-[#D6CFC1]'
                      }`}>
                        {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section B: Heavy / Rarely Used Files */}
        <div className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-5 md:p-6 shadow-md">
          <div className="border-b-4 border-stone-100 pb-4 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-2xl text-[#BC5A41]">
                ⚠️ Huge / Rarely Opened Files
              </h3>
              <span className="bg-[#FAF0EE] border-2 border-[#BC5A41] text-[#BC5A41] font-extrabold text-xs px-3 py-1 rounded-xl">
                Manual Review Required
              </span>
            </div>
            <p className="text-sm font-bold text-[#6B655B] mt-2">
              Note: These are <strong className="text-[#BC5A41]">NOT</strong> duplicate files. They are single heavy files (backups, long home videos) that take up lots of room. Only delete them if you are positive you don't need them!
            </p>
          </div>

          {heavyFiles.length === 0 ? (
            <div className="text-center py-8 text-[#6B655B] font-bold">
              No single heavy files found.
            </div>
          ) : (
            <div className="space-y-3">
              {heavyFiles.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => onToggleSelectFile(file.id)}
                    className={`p-4 rounded-xl border-4 flex justify-between items-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FAF0EE] border-[#BC5A41] shadow-inner'
                        : 'bg-[#FAF9F6] border-[#D6CFC1] hover:border-[#6B655B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-8 h-8 text-[#BC5A41]" />
                      <div>
                        <span className="font-display font-black text-lg text-[#2D2A26] block leading-tight">
                          {file.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-[#6B655B] mt-1">
                          <span className="font-mono break-all">📁 {file.path}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D6CFC1]" />
                            Saved: {formatDateCozy(file.lastModified)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-[#BC5A41] bg-[#BC5A41]/10 px-2.5 py-1 rounded-lg">
                        {formatBytes(file.size)}
                      </span>
                      {/* Big checkbox */}
                      <div className={`w-8 h-8 rounded-lg border-4 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#BC5A41] border-[#BC5A41] text-white' : 'bg-white border-[#D6CFC1]'
                      }`}>
                        {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom cleanup bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-8 border-[#E8E4D9] p-4 md:p-6 z-40 shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-display font-black text-2xl text-[#2D2A26] leading-none">
              {selectedCount} Clutter Files Selected
            </h4>
            <p className="text-lg font-bold text-[#6B655B] mt-1">
              You will free up <span className="text-[#BC5A41] font-extrabold">{formatBytes(selectedSizeSum)}</span> of space
            </p>
          </div>
          <button
            onClick={onCleanSelected}
            disabled={selectedCount === 0}
            className={`w-full sm:w-auto px-8 py-5 rounded-2xl font-display font-black text-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md border-none ${
              selectedCount === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                : 'bg-[#BC5A41] hover:bg-[#A34B34] text-white active:scale-95'
            }`}
            id="clean-selected-junk-btn"
          >
            <Trash2 className="w-6 h-6" /> Wipe Selected Clutter
          </button>
        </div>
      </div>
    </div>
  );
}
