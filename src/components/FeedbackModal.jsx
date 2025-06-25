import React from 'react';
import { Heart, Send } from 'lucide-react';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  feedback, 
  setFeedback, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full border border-slate-600 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-5 h-6 text-red-400" />
          <h3 className="text-lg sm:text-xl font-semibold text-white">Send Feedback</h3>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm mb-4">
          Help us improve! Share your thoughts, suggestions, or report issues.
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback means a lot to us..."
          className="w-full h-24 sm:h-32 bg-slate-700 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4 text-sm sm:text-base"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!feedback.trim()}
            className="flex-1 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;