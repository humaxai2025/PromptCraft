import React from 'react';
import { Brain, MessageCircle, Menu, X } from 'lucide-react';

const Header = ({ 
  onShowFeedback, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  children // For mobile menu content 
}) => {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prompt Quality Analyzer
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onShowFeedback}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Feedback
            </button>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/40 backdrop-blur-sm border-t border-white/10">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;