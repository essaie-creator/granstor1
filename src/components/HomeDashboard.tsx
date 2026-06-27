/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Play, FolderOpen, AlertTriangle, CheckCircle, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ScanStats } from '../types';

interface HomeDashboardProps {
  onStartSimulatedScan: () => void;
  onStartRealScan: (files: FileList) => void;
  isScanning: boolean;
  scanProgress: number;
  scanCurrentFile: string;
  stats: ScanStats | null;
  onNavigateTo: (view: 'duplicates' | 'junk') => void;
  onOpenHelp: () => void;
}

export default function HomeDashboard({
  onStartSimulatedScan,
  onStartRealScan,
  isScanning,
  scanProgress,
  scanCurrentFile,
  stats,
  onNavigateTo,
  onOpenHelp
}: HomeDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRealFolderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onStartRealScan(e.target.files);
    }
  };

  // Helper to format bytes cleanly for grandma
  const formatBytesFriendly = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB (KiloBytes)`;
    }
    return `${mb.toFixed(1)} MB (MegaBytes)`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Welcome Card */}
      {!isScanning && !stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-6 md:p-10 shadow-xl mb-8 text-center"
        >
          <span className="text-6xl md:text-7xl block mb-4">🌸✨</span>
          <h2 className="font-display font-black text-3xl md:text-4.5xl text-[#2D2A26] mb-4 leading-tight">
            Let's Make Your Computer Speedy Clean!
          </h2>
          <p className="text-xl text-[#6B655B] font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            Hi! Over time, computers get cluttered with double-saved pictures, receipt drafts, and temporary junk files.
            Let me find them and safely clean them up for you.
          </p>

          <div className="bg-[#FDEBD0] border-4 border-[#D35400] p-6 rounded-[32px] max-w-xl mx-auto mb-8 text-left shadow-sm">
            <h3 className="font-display font-bold text-xl text-[#D35400] mb-2 flex items-center gap-2">
              🛡️ Safe File Guarantees:
            </h3>
            <ul className="text-[#2D2A26] font-semibold space-y-2 text-base md:text-lg">
              <li className="flex items-start gap-2">
                <span className="text-[#D35400] font-bold">✔️</span>
                <span>We <strong className="text-black">never</strong> touch your files without asking you first.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D35400] font-bold">✔️</span>
                <span>We keep everything on your browser. No files are ever sent to the internet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D35400] font-bold">✔️</span>
                <span>You can undo any cleaning action instantly!</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons Container */}
          <div className="flex flex-col gap-6 justify-center max-w-2xl mx-auto">
            {/* Simulated Scan Button */}
            <button
              onClick={onStartSimulatedScan}
              className="bg-white border-4 border-[#4A6741] rounded-[32px] flex items-center p-6 md:p-8 gap-6 hover:bg-[#F0F4EF] transition-all text-left shadow-lg cursor-pointer group active:scale-98"
              id="scan-demo-btn"
            >
              <div className="w-20 h-20 bg-[#E8F0E5] rounded-full flex items-center justify-center text-[#4A6741] group-hover:scale-105 transition-transform">
                <Play className="w-10 h-10 animate-pulse fill-current" />
              </div>
              <div className="flex-1">
                <div className="text-[26px] font-black text-[#2D2A26] mb-1">1. Scan Virtual Demo</div>
                <p className="text-[18px] font-semibold text-[#6B655B]">
                  Test our AI duplicate and space finder safely using simulated sample files.
                </p>
              </div>
            </button>

            {/* Real Scan Button */}
            <button
              onClick={handleRealFolderClick}
              className="bg-white border-4 border-[#BC5A41] rounded-[32px] flex items-center p-6 md:p-8 gap-6 hover:bg-[#FAF0EE] transition-all text-left shadow-lg cursor-pointer group active:scale-98"
              id="scan-real-btn"
            >
              <div className="w-20 h-20 bg-[#F9EBEA] rounded-full flex items-center justify-center text-[#BC5A41] group-hover:scale-105 transition-transform">
                <FolderOpen className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <div className="text-[26px] font-black text-[#2D2A26] mb-1">2. Scan My Real Folder</div>
                <p className="text-[18px] font-semibold text-[#6B655B]">
                  Select a real directory on your computer to scan and clean offline.
                </p>
              </div>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            id="hidden-folder-input"
          />

          <button
            onClick={onOpenHelp}
            className="mt-8 text-lg font-bold text-stone-500 hover:text-stone-800 underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            id="read-instructions-link"
          >
            <HelpCircle className="w-5 h-5" /> Need help? Read our simple instructions
          </button>
        </motion.div>
      )}

      {/* Scanning Page */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-8 md:p-12 shadow-xl text-center"
        >
          {/* Animated Magnifying Glass / Folder */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#E8F0E5] rounded-2xl border-4 border-[#4A6741]/30 animate-pulse flex items-center justify-center text-5xl">
              📁
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute -inset-2 border-4 border-dashed border-[#4A6741] rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full border-2 border-[#D6CFC1] text-3xl shadow-md">
              🔍
            </div>
          </div>

          <h3 className="font-display font-black text-3xl text-[#2D2A26] mb-2">
            Searching for Clutter...
          </h3>
          <p className="text-lg font-bold text-[#6B655B] mb-6">
            Please keep this tab open. We are inspecting files 100% privately.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-8 rounded-full overflow-hidden border-4 border-[#D6CFC1] mb-4 p-1">
            <motion.div
              className="h-full bg-[#4A6741] rounded-full"
              style={{ width: `${scanProgress}%` }}
              layout
            />
          </div>

          <div className="text-xl font-display font-black text-[#2D2A26] mb-6">
            {scanProgress}% Completed
          </div>

          {/* Current File text */}
          <div className="bg-[#FAF9F6] border-2 border-[#D6CFC1] px-4 py-3 rounded-2xl max-w-lg mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-xs font-mono font-semibold text-[#6B655B] block uppercase tracking-wider mb-1">
              Currently Reading:
            </span>
            <span className="font-mono text-sm text-[#2D2A26] font-bold block" title={scanCurrentFile}>
              {scanCurrentFile || 'Starting search engines...'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Scan Completed Stats Dashboard */}
      {!isScanning && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Banner message */}
          <div className="bg-[#E8F0E5] border-4 border-[#4A6741] rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm">
            <span className="text-5xl">🎉</span>
            <div className="text-center md:text-left">
              <h3 className="font-display font-black text-2xl text-[#4A6741]">
                Folder Scan Completed Successfully!
              </h3>
              <p className="text-lg font-semibold text-[#2D2A26]">
                We safely analyzed {stats.totalFiles} files. Let's see what clutter we can tidy up.
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Cleansable Clutter */}
            <div className="bg-[#BC5A41] text-white border-4 border-[#D6CFC1] rounded-[32px] p-6 flex flex-col justify-between shadow-md">
              <div>
                <span className="text-4xl block mb-2">🗑️</span>
                <h4 className="font-display font-bold text-xl text-[#FAF9F6] uppercase tracking-wide">
                  Cleanable Clutter
                </h4>
              </div>
              <div className="my-4">
                <span className="font-display font-black text-4xl block leading-none">
                  {formatBytesFriendly(stats.duplicateSize + stats.junkSize)}
                </span>
                <span className="text-sm font-semibold opacity-90 mt-1 block">
                  from duplicate & junk files combined
                </span>
              </div>
            </div>

            {/* Exact duplicates count */}
            <div className="bg-white border-4 border-[#D6CFC1] rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-4xl block mb-2">👯</span>
                <h4 className="font-display font-black text-xl text-[#2D2A26]">
                  Double-Saved Files
                </h4>
              </div>
              <div className="my-4">
                <span className="font-display font-black text-4xl block leading-none text-[#2D2A26]">
                  {stats.duplicateCount} files
                </span>
                <span className="text-sm font-bold text-[#6B655B] mt-1 block">
                  accidental identical duplicate copies
                </span>
              </div>
              <button
                onClick={() => onNavigateTo('duplicates')}
                className="w-full py-3 bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold rounded-xl text-base cursor-pointer shadow-sm active:scale-95 transition-all text-center border-none"
                id="view-duplicates-card-btn"
              >
                Review Duplicates
              </button>
            </div>

            {/* Junk files size */}
            <div className="bg-white border-4 border-[#D6CFC1] rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-4xl block mb-2">🧹</span>
                <h4 className="font-display font-black text-xl text-[#2D2A26]">
                  Safe-To-Clean Junk
                </h4>
              </div>
              <div className="my-4">
                <span className="font-display font-black text-4xl block leading-none text-[#2D2A26]">
                  {formatBytesFriendly(stats.junkSize)}
                </span>
                <span className="text-sm font-bold text-[#6B655B] mt-1 block">
                  temporary web caches and error logs
                </span>
              </div>
              <button
                onClick={() => onNavigateTo('junk')}
                className="w-full py-3 bg-[#BC5A41] hover:bg-[#A34B34] text-white font-bold rounded-xl text-base cursor-pointer shadow-sm active:scale-95 transition-all text-center border-none"
                id="view-junk-card-btn"
              >
                Clean Junk Logs
              </button>
            </div>
          </div>

          {/* Large Action Option Row */}
          <div className="bg-white border-[12px] border-[#E8E4D9] rounded-[32px] p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border-4 border-[#D6CFC1] text-4xl hidden sm:block">
                🧐
              </div>
              <div>
                <h4 className="font-display font-black text-2xl text-[#2D2A26]">
                  Ready to Start Tidying Up?
                </h4>
                <p className="text-lg font-semibold text-[#6B655B]">
                  We recommend starting by reviewing your duplicate pictures and documents.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => onNavigateTo('duplicates')}
                className="px-8 py-5 bg-[#4A6741] hover:bg-[#3D5535] text-white font-display font-black text-xl rounded-2xl cursor-pointer shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
                id="start-duplicates-btn"
              >
                1. Review Duplicates 🖼️
              </button>
              <button
                onClick={() => onNavigateTo('junk')}
                className="px-8 py-5 bg-[#BC5A41] hover:bg-[#A34B34] text-white font-display font-black text-xl rounded-2xl cursor-pointer shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
                id="start-junk-btn"
              >
                2. Clean Junk Logs 🧹
              </button>
            </div>
          </div>

          {/* Rescan / Scan Another button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleRealFolderClick}
              className="text-lg font-bold text-[#BC5A41] hover:underline flex items-center gap-2 cursor-pointer"
              id="rescan-real-btn"
            >
              📂 Scan a different computer folder
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
