import React, { useState } from 'react';
import { Check, Info, FileText, ImageIcon, Video, Folder, Calendar, Download, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { DuplicateGroup, FileItem, Settings } from '../types';

interface DuplicatesViewProps {
  groups: DuplicateGroup[];
  selectedFileIds: Set<string>;
  onToggleSelectFile: (fileId: string) => void;
  onCleanSelected: () => void;
  onBackToHome: () => void;
  settings: Settings;
}

export default function DuplicatesView({
  groups,
  selectedFileIds,
  onToggleSelectFile,
  onCleanSelected,
  onBackToHome,
  settings
}: DuplicatesViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'exact' | 'similar'>('all');

  const filteredGroups = groups.filter((group) => {
    if (filterType === 'all') return true;
    return group.type === filterType;
  });

  // Formats bytes to standard readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Human-friendly date formatting
  const formatDateCozy = (timestamp: number) => {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    // Add relative indicator (e.g., "1 year ago")
    const diffMs = Date.now() - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return `${formatted} (Today)`;
    if (diffDays === 1) return `${formatted} (Yesterday)`;
    if (diffDays < 30) return `${formatted} (${diffDays} days ago)`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${formatted} (${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago)`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${formatted} (${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago)`;
  };

  // Get file type icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#4A6741]" />;
      case 'video':
        return <Video className="w-8 h-8 text-[#BC5A41]" />;
      case 'document':
        return <FileText className="w-8 h-8 text-[#34495E]" />;
      default:
        return <FileText className="w-8 h-8 text-stone-500" />;
    }
  };

  // Compute metrics for selected files
  const selectedFilesCount = selectedFileIds.size;
  const selectedSizeSum = groups
    .flatMap((g) => g.files)
    .filter((f) => selectedFileIds.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  // Intelligent recommendations:
  // Usually keep files in standard Pictures, Documents, Desktop, rather than Temp, Downloads, WhatsApp, or For_Facebook
  const getIsRecommendedKeep = (file: FileItem, group: DuplicateGroup) => {
    const pathLower = file.path.toLowerCase();
    const otherFilesInGroup = group.files.filter((f) => f.id !== file.id);

    // If one file is in Temp and the other is not, recommend keeping the non-temp one
    const isTemp = pathLower.includes('temp') || pathLower.includes('appdata');
    const othersTemp = otherFilesInGroup.every((f) => f.path.toLowerCase().includes('temp') || f.path.toLowerCase().includes('appdata'));
    if (isTemp && !othersTemp) return false;
    if (!isTemp && othersTemp) return true;

    // Recommend keeping standard locations over "Downloads" or "NewFolder_Copy" or " WhatsApp"
    const isSpecialCopy = pathLower.includes('copy') || pathLower.includes('whatsapp') || pathLower.includes('facebook') || pathLower.includes('download');
    const othersSpecialCopy = otherFilesInGroup.every((f) => {
      const p = f.path.toLowerCase();
      return p.includes('copy') || p.includes('whatsapp') || p.includes('facebook') || p.includes('download');
    });

    if (isSpecialCopy && !othersSpecialCopy) return false;
    if (!isSpecialCopy && othersSpecialCopy) return true;

    // For similar images, keep the sharper/original size one (i.e. larger size)
    const sizeMax = Math.max(...group.files.map(f => f.size));
    if (group.type === 'similar' && file.size === sizeMax && otherFilesInGroup.some(f => f.size < file.size)) {
      return true;
    }

    // Default: recommend keeping the oldest file as original, unless it's in a bad folder
    const oldestTimestamp = Math.min(...group.files.map(f => f.lastModified));
    return file.lastModified === oldestTimestamp;
  };

  // Generate and download duplicate report as TXT
  const handleExportReport = () => {
    let report = `====================================================\n`;
    report += ` EASYFILE HELPER - DUPLICATES REPORT\n`;
    report += ` Generated on: ${new Date().toLocaleString()}\n`;
    report += `====================================================\n\n`;

    report += `SUMMARY OF FINDINGS:\n`;
    report += `-------------------\n`;
    report += `Total Duplicate Groups: ${groups.length}\n`;
    report += `Total Selected for Deletion: ${selectedFilesCount} files\n`;
    report += `Estimated Space to Free Up: ${formatBytes(selectedSizeSum)}\n\n`;

    report += `DETAILED BREAKDOWN BY GROUP:\n`;
    report += `----------------------------\n\n`;

    groups.forEach((group, idx) => {
      report += `Group #${idx + 1} [Type: ${group.type.toUpperCase()}]\n`;
      if (group.type === 'similar') {
        report += `Visual Similarity Score: ${group.similarityScore || 95}%\n`;
      }
      group.files.forEach((file) => {
        const isSelected = selectedFileIds.has(file.id);
        const isKeep = getIsRecommendedKeep(file, group);
        report += `  - File: ${file.name}\n`;
        report += `    Path: ${file.path}\n`;
        report += `    Size: ${formatBytes(file.size)} (${file.size} bytes)\n`;
        report += `    Modified: ${new Date(file.lastModified).toLocaleDateString()}\n`;
        report += `    Status: ${isSelected ? '[TO BE DELETED 🗑️]' : isKeep ? '[RECOMMENDED KEEP ⭐]' : '[KEEPING]'}\n`;
      });
      report += `\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EasyFile_Helper_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Count active groups
  if (groups.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-8 shadow-xl">
        <span className="text-6xl block mb-4">🌻</span>
        <h3 className="font-display font-black text-3xl text-[#2D2A26] mb-2">
          Your Folders are Crystal Clear!
        </h3>
        <p className="text-xl text-[#6B655B] font-semibold mb-6">
          No double-saved duplicate files or similar pictures were found. Wonderful job!
        </p>
        <button
          onClick={onBackToHome}
          className="px-8 py-4 rounded-2xl bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-xl cursor-pointer shadow-lg active:scale-95 transition-all border-none"
          id="back-home-empty-btn"
        >
          ⬅️ Back to Main Screen
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Return Navigation */}
      <button
        onClick={onBackToHome}
        className="mb-6 text-lg font-extrabold text-[#BC5A41] hover:text-[#2D2A26] flex items-center gap-2 cursor-pointer transition-colors"
        id="back-home-header-btn"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Main Screen
      </button>

      {/* Hero Header */}
      <div className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-6 md:p-8 shadow-md mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display font-black text-3xl text-[#2D2A26]">
            👯 Review Duplicate Files
          </h2>
          <p className="text-lg font-bold text-[#6B655B] mt-1">
            Review these side-by-side. The computer recommends which copy to keep.
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="px-6 py-3 rounded-2xl bg-white border-4 border-[#4A6741] hover:bg-[#F0F4EF] text-[#2D2A26] font-bold text-base flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
          id="export-txt-report-btn"
        >
          <Download className="w-5 h-5 text-[#4A6741]" /> Export Clean-up Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#E8E4D9] p-2 rounded-2xl gap-2 mb-8 border-2 border-[#D6CFC1] max-w-md">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-3 text-lg font-black rounded-xl transition-all cursor-pointer border-none ${
            filterType === 'all'
              ? 'bg-[#4A6741] text-white shadow-md'
              : 'text-[#2D2A26] hover:bg-[#D6CFC1]'
          }`}
          id="filter-all-btn"
        >
          All ({groups.length})
        </button>
        <button
          onClick={() => setFilterType('exact')}
          className={`flex-1 py-3 text-lg font-black rounded-xl transition-all cursor-pointer border-none ${
            filterType === 'exact'
              ? 'bg-[#4A6741] text-white shadow-md'
              : 'text-[#2D2A26] hover:bg-[#D6CFC1]'
          }`}
          id="filter-exact-btn"
        >
          Exact Copy ({groups.filter(g => g.type === 'exact').length})
        </button>
        <button
          onClick={() => setFilterType('similar')}
          className={`flex-1 py-3 text-lg font-black rounded-xl transition-all cursor-pointer border-none ${
            filterType === 'similar'
              ? 'bg-[#4A6741] text-white shadow-md'
              : 'text-[#2D2A26] hover:bg-[#D6CFC1]'
          }`}
          id="filter-similar-btn"
        >
          Similar ({groups.filter(g => g.type === 'similar').length})
        </button>
      </div>

      {/* Duplicates Groups List */}
      <div className="space-y-8">
        {filteredGroups.map((group, groupIndex) => {
          const isSimilarGroup = group.type === 'similar';
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(groupIndex * 0.05, 0.3) }}
              className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-5 md:p-6 shadow-md relative"
            >
              {/* Group Title Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-stone-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border-2 border-[#D6CFC1] font-display text-2xl">
                    {group.files[0]?.type === 'image' ? '📸' : '📄'}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl md:text-2xl text-[#2D2A26]">
                      Group #{groupIndex + 1}: "{group.files[0]?.name}"
                    </h3>
                    <p className="text-sm font-bold text-[#6B655B] mt-1">
                      {isSimilarGroup ? (
                        <span className="text-[#BC5A41] font-extrabold bg-[#BC5A41]/10 px-2.5 py-1 rounded-lg">
                          🧠 AI Image Similarity ({group.similarityScore || 95}% Match)
                        </span>
                      ) : (
                        <span className="text-[#4A6741] font-extrabold bg-[#E8F0E5] px-2.5 py-1 rounded-lg">
                          👯 Exact Identical File Double
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duplicate Copies Grid / Side-by-Side comparisons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {group.files.map((file) => {
                  const isSelectedForDeletion = selectedFileIds.has(file.id);
                  const isRecommendedKeep = getIsRecommendedKeep(file, group);

                  return (
                    <div
                      key={file.id}
                      onClick={() => onToggleSelectFile(file.id)}
                      className={`relative rounded-2xl border-4 p-4 flex flex-col justify-between transition-all cursor-pointer ${
                        isSelectedForDeletion
                          ? 'bg-[#FAF0EE] border-[#BC5A41] shadow-inner'
                          : isRecommendedKeep
                          ? 'bg-[#E8F0E5]/60 border-[#4A6741] shadow-sm'
                          : 'bg-[#FAF9F6] border-[#D6CFC1] hover:border-[#6B655B]'
                      }`}
                    >
                      {/* Image Preview inside Card */}
                      {file.type === 'image' && (file.previewUrl || file.isSimulated) && (
                        <div className="w-full h-44 rounded-xl overflow-hidden bg-[#FAF9F6] border-2 border-[#D6CFC1] mb-4 relative">
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isRecommendedKeep && (
                            <span className="absolute top-2 left-2 bg-[#4A6741] text-white font-black text-xs px-2 py-1 rounded-md shadow-sm">
                              SHARPER/ORIGINAL
                            </span>
                          )}
                        </div>
                      )}

                      {/* Info lines */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          {getFileIcon(file.type)}
                          <div className="overflow-hidden">
                            <span className="font-display font-black text-lg text-[#2D2A26] block break-words leading-tight" title={file.name}>
                              {file.name}
                            </span>
                            <span className="font-mono text-xs font-semibold text-[#6B655B] break-all block mt-1" title={file.path}>
                              📁 {file.path}
                            </span>
                          </div>
                        </div>

                        {/* File attributes: Size and Modified Date */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 text-sm font-bold text-[#6B655B]">
                          <div className="flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-[#D6CFC1]" />
                            <span>{formatBytes(file.size)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Calendar className="w-4 h-4 text-[#D6CFC1]" />
                            <span className="truncate">{formatDateCozy(file.lastModified)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Select Circle & Recommendation Badge */}
                      <div className="mt-4 pt-3 border-t-2 border-dashed border-[#D6CFC1] flex items-center justify-between">
                        {/* Recommendation Badge */}
                        <div>
                          {isRecommendedKeep ? (
                            <span className="bg-[#E8F0E5] border-2 border-[#4A6741] text-[#4A6741] font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                              ⭐ KEEP THIS
                            </span>
                          ) : (
                            <span className="bg-[#FAF0EE] border-2 border-[#BC5A41] text-[#BC5A41] font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                              🗑️ REMOVE DUPLICATE
                            </span>
                          )}
                        </div>

                        {/* Huge Checkbox */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#6B655B]">
                            {isSelectedForDeletion ? "Deleting" : "Keeping"}
                          </span>
                          <div className={`w-10 h-10 rounded-xl border-4 flex items-center justify-center transition-all ${
                            isSelectedForDeletion
                              ? 'bg-[#BC5A41] border-[#BC5A41] text-white'
                              : 'bg-white border-[#D6CFC1]'
                          }`}>
                            {isSelectedForDeletion && <Check className="w-6 h-6 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom Cleanup Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-8 border-[#E8E4D9] p-4 md:p-6 z-40 shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-display font-black text-2xl text-[#2D2A26] leading-none">
              {selectedFilesCount} {selectedFilesCount === 1 ? 'File' : 'Files'} Selected
            </h4>
            <p className="text-lg font-bold text-[#6B655B] mt-1">
              You will free up <span className="text-[#BC5A41] font-extrabold">{formatBytes(selectedSizeSum)}</span> of space
            </p>
          </div>
          <button
            onClick={onCleanSelected}
            disabled={selectedFilesCount === 0}
            className={`w-full sm:w-auto px-8 py-5 rounded-2xl font-display font-black text-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md border-none ${
              selectedFilesCount === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                : 'bg-[#BC5A41] hover:bg-[#A34B34] text-white active:scale-95'
            }`}
            id="clean-selected-duplicates-btn"
          >
            <Trash2 className="w-6 h-6" /> Move Selected Files to Trash
          </button>
        </div>
      </div>
    </div>
  );
}
