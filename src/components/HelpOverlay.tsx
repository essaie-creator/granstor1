/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Sparkles, FolderSearch, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🌸 Welcome to Your Friendly Cleaner!",
      description: "Hello there, dear! This little helper is designed to make your computer run faster and free up space for more lovely family photos, without any confusing technical jargon.",
      icon: <Sparkles className="w-16 h-16 text-grandma-berry animate-bounce" />,
      color: "bg-amber-50 border-amber-200",
      tips: "We will look for files that got saved twice by accident, and junk that you do not need anymore!"
    },
    {
      title: "🔍 Step 1: Finding the Clutter",
      description: "Click either of the giant buttons on the main screen. You can scan our 'Virtual Demo Computer' to test it out safely, or select a real folder from your own computer!",
      icon: <FolderSearch className="w-16 h-16 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200",
      tips: "Grandma Tip: If you pick a real folder, Chrome or Edge will ask you to confirm. It is 100% safe!"
    },
    {
      title: "✨ Step 2: Compare & Select",
      description: "We show duplicates side-by-side with huge pictures! The computer automatically recommends which one is best to keep, but you can change it with the huge checkboxes.",
      icon: <Check className="w-16 h-16 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      tips: "You are always in control. We will never delete anything without you clicking the giant clean button."
    },
    {
      title: "🛡️ Step 3: Clean & Safety Net",
      description: "When you click 'Clean Selected', files are sent to your Trash. If you make a mistake, don't worry! You have a full 30 seconds to click the giant 'UNDO' button to bring it back instantly.",
      icon: <RotateCcw className="w-16 h-16 text-rose-600" />,
      color: "bg-rose-50 border-rose-200",
      tips: "No stress! We built this safety net because we know accidents happen to everyone."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-grandma-cream rounded-3xl border-8 border-[#7A433F] shadow-2xl overflow-hidden p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 transition-colors cursor-pointer"
              aria-label="Close guide"
              id="close-guide-btn"
            >
              <X className="w-8 h-8 text-stone-700" />
            </button>

            {/* Step Counter */}
            <div className="text-center font-display font-bold text-xl text-stone-500 mb-2">
              Guide Book: Page {currentStep + 1} of {steps.length}
            </div>

            {/* Step Content */}
            <div className={`p-6 rounded-2xl border-4 ${steps[currentStep].color} mb-6 flex flex-col items-center text-center transition-all duration-300 min-h-[340px] justify-center`}>
              <div className="mb-4">
                {steps[currentStep].icon}
              </div>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-stone-900 mb-4 leading-tight">
                {steps[currentStep].title}
              </h3>
              <p className="text-lg md:text-xl text-stone-700 font-medium mb-4 max-w-lg leading-relaxed">
                {steps[currentStep].description}
              </p>
              <div className="bg-white/80 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-base max-w-md">
                💡 <span className="italic">{steps[currentStep].tips}</span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl border-4 border-stone-400 font-bold text-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  currentStep === 0
                    ? 'opacity-40 cursor-not-allowed bg-stone-200'
                    : 'bg-white hover:bg-stone-100 active:scale-95'
                }`}
                id="guide-prev-btn"
              >
                <ArrowLeft className="w-6 h-6" /> Back
              </button>

              {/* Dot Indicators */}
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'bg-[#892E5B] scale-125' : 'bg-stone-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#5F7A61] hover:bg-[#4E644F] active:scale-95 border-4 border-[#3D4E3E] text-white font-bold text-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                id="guide-next-btn"
              >
                {currentStep === steps.length - 1 ? (
                  <>Got it! Let's Go <Check className="w-6 h-6" /></>
                ) : (
                  <>Next Step <ArrowRight className="w-6 h-6" /></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
