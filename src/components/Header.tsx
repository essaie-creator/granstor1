/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, Settings as SettingsIcon, Download, Sparkles } from 'lucide-react';
import { Settings } from '../types';

interface HeaderProps {
  settings: Settings;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onGoHome: () => void;
}

export default function Header({
  settings,
  onOpenSettings,
  onOpenHelp,
  onGoHome
}: HeaderProps) {
  return (
    <header className="bg-[#E8E4D9] border-b-4 border-[#D6CFC1] py-4 px-6 md:px-12 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Title / Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-4 group cursor-pointer text-left focus:outline-none"
          id="header-home-logo"
        >
          <div className="w-12 h-12 bg-[#4A6741] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="3"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="3"></line>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-[#2D2A26] tracking-tight leading-none flex items-center gap-1.5">
              EasyFile Helper
            </h1>
            <p className="text-sm font-bold text-[#6B655B] mt-1">
              System Offline & Secure Duplicate Finder
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Offline PWA Badge */}
          <div className="bg-[#E8F0E5] border-2 border-[#4A6741]/30 text-[#4A6741] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A6741] animate-pulse" />
            100% Offline Secured
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="px-6 py-3 rounded-2xl bg-white border-4 border-[#4A6741] hover:bg-[#F0F4EF] text-[#2D2A26] font-bold text-lg flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
            id="open-settings-header-btn"
          >
            <SettingsIcon className="w-5 h-5 text-[#4A6741]" />
            Settings
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="px-6 py-3 rounded-2xl bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-lg flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
            id="open-guide-header-btn"
          >
            <HelpCircle className="w-5 h-5" />
            Help Me
          </button>
        </div>
      </div>
    </header>
  );
}
