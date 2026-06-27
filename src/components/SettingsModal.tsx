/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Settings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onResetDemo: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDemo
}: SettingsModalProps) {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onUpdateSettings({
      ...settings,
      similarityThreshold: val
    });
  };

  const toggleDarkMode = () => {
    onUpdateSettings({
      ...settings,
      darkMode: !settings.darkMode
    });
  };

  const toggleSafeMode = () => {
    onUpdateSettings({
      ...settings,
      safeMode: !settings.safeMode
    });
  };

  // Human-friendly description for the slider values
  const getThresholdLabel = (val: number) => {
    if (val >= 95) return "🔒 Super Strict (Finds only identical shots)";
    if (val >= 85) return "✨ Balanced (Catches blurry, burst-mode shots & slight crops)";
    if (val >= 70) return "🎨 Relaxed (Catches images with similar colors & frames)";
    return "⚠️ Very Loose (Might group unrelated photos together!)";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full max-w-xl bg-white rounded-[32px] border-[12px] border-[#E8E4D9] shadow-2xl overflow-hidden p-6 md:p-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-stone-100 pb-4 mb-6">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#2D2A26] flex items-center gap-3">
                ⚙️ Clean-up Settings
              </h2>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-[#FAF9F6] hover:bg-[#E8E4D9] border-2 border-[#D6CFC1] transition-colors cursor-pointer"
                id="close-settings-btn"
              >
                <X className="w-6 h-6 text-[#2D2A26]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border-2 border-[#D6CFC1]">
                <h3 className="font-display font-bold text-xl text-[#2D2A26] mb-3">
                  🎨 Visual Theme
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-[#6B655B] font-semibold">
                    Use Cozy Dark Mode
                  </span>
                  <button
                    onClick={toggleDarkMode}
                    className={`px-6 py-3 rounded-xl font-bold border-4 text-lg transition-all flex items-center gap-2 cursor-pointer ${
                      settings.darkMode
                        ? 'bg-[#E8F0E5] border-[#4A6741] text-[#4A6741]'
                        : 'bg-stone-200 border-stone-300 text-stone-700'
                    }`}
                    id="toggle-dark-mode"
                  >
                    {settings.darkMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    {settings.darkMode ? "On" : "Off"}
                  </button>
                </div>
                <p className="text-sm text-[#6B655B] mt-2 font-medium">
                  Cozy Dark Mode is softer on senior eyes, especially in the evening.
                </p>
              </div>

              {/* Similarity Slider */}
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border-2 border-[#D6CFC1]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-display font-bold text-xl text-[#2D2A26] flex items-center gap-1.5">
                    🖼️ Photo Similarity Sensitivity
                  </h3>
                  <span className="bg-[#4A6741] text-white font-bold px-3 py-1 text-lg rounded-xl">
                    {settings.similarityThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.similarityThreshold}
                  onChange={handleSliderChange}
                  className="w-full h-4 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#4A6741] outline-none my-4"
                  id="similarity-threshold-slider"
                />
                <div className="text-[#2D2A26] font-semibold text-lg">
                  {getThresholdLabel(settings.similarityThreshold)}
                </div>
                <p className="text-sm text-[#6B655B] mt-2 font-medium">
                  We use an offline canvas comparison to detect similar or blurry family shots.
                </p>
              </div>

              {/* Safety Shield */}
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border-2 border-[#D6CFC1]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#2D2A26] flex items-center gap-2">
                      🛡️ Grandma's Safety Shield
                    </h3>
                    <p className="text-sm text-[#6B655B] mt-1 font-medium">
                      Always warn me or stop me if I try to delete all copies of a file.
                    </p>
                  </div>
                  <button
                    onClick={toggleSafeMode}
                    className={`px-6 py-3 rounded-xl font-bold border-4 text-lg transition-all cursor-pointer ${
                      settings.safeMode
                        ? 'bg-[#E8F0E5] border-[#4A6741] text-[#4A6741]'
                        : 'bg-[#FAF0EE] border-[#BC5A41] text-[#BC5A41]'
                    }`}
                    id="toggle-safe-mode"
                  >
                    {settings.safeMode ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              {/* Demo Restorer */}
              <div className="bg-[#FAF0EE] border-4 border-dashed border-[#BC5A41] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#BC5A41]">
                    🔄 Reset the Virtual Demo
                  </h3>
                  <p className="text-sm text-[#6B655B] mt-1 font-medium">
                    Restores Grandma's messy files so you can try scanning and deleting them again.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onResetDemo();
                    onClose();
                  }}
                  className="px-6 py-4 rounded-xl bg-[#BC5A41] hover:bg-[#A34B34] text-white font-bold text-lg flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all border-none"
                  id="reset-demo-btn"
                >
                  <RefreshCw className="w-5 h-5" /> Reset Files
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-4 border-stone-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-4 rounded-2xl bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-xl cursor-pointer shadow-lg active:scale-95 transition-all border-none"
                id="save-settings-btn"
              >
                Close & Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
