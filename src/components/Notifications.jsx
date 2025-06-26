import React from 'react';
import { CheckCircle, Heart } from 'lucide-react';

export const CopySuccessNotification = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-green-400/30 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
      >
        <CheckCircle className="w-5 h-5 text-green-200" />
        <span className="font-medium text-sm sm:text-base">✨ Copied to clipboard!</span>
        <div className="w-2 h-2 bg-green-300 rounded-full animate-ping" />
      </div>
    </div>
  );
};

export const FeedbackSubmittedNotification = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-purple-400/30 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
      >
        <Heart className="w-5 h-5 text-purple-200" />
        <span className="font-medium text-sm sm:text-base">💖 Feedback submitted!</span>
        <div className="w-2 h-2 bg-purple-300 rounded-full animate-ping" />
      </div>
    </div>
  );
};