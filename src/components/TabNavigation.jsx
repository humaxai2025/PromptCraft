import React from 'react';
import { Brain, GitCompare, Star, History, Heart, BookOpen, MessageCircle } from 'lucide-react';

const tabs = [
  { id: 'analyzer', label: 'Analyzer', icon: Brain },
  { id: 'comparison', label: 'Comparison', icon: GitCompare },
  { id: 'templates', label: 'Templates', icon: Star },
  { id: 'history', label: 'History', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'learn', label: 'Learn', icon: BookOpen }
];

const TabNavigation = ({ 
  activeTab, 
  setActiveTab, 
  comparisonData, 
  historyCount, 
  favoritesCount,
  onShowFeedback,
  setMobileMenuOpen,
  isMobile = false
}) => {
  const TabButton = ({ tab }) => {
    const isDisabled = tab.id === 'comparison' && !comparisonData.originalPrompt;
    
    return (
      <button
        key={tab.id}
        onClick={() => {
          if (!isDisabled) {
            setActiveTab(tab.id);
            if (isMobile && setMobileMenuOpen) setMobileMenuOpen(false);
          }
        }}
        disabled={isDisabled}
        className={`${isMobile ? 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all' : 'flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium relative'} ${
          activeTab === tab.id 
            ? 'bg-purple-600 text-white shadow-lg' 
            : isDisabled
            ? 'text-slate-500 cursor-not-allowed opacity-50'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <tab.icon className="w-5 h-5" />
        {tab.label}
        {tab.id === 'comparison' && comparisonData.originalPrompt && (
          <span className={`text-white text-xs px-2 py-1 rounded-full ${isMobile ? 'ml-auto bg-orange-500' : 'bg-orange-500 ml-1'}`}>
            New
          </span>
        )}
        {tab.id === 'history' && historyCount > 0 && (
          <span className={`text-white text-xs px-2 py-1 rounded-full ${isMobile ? 'ml-auto bg-purple-500' : 'bg-purple-500 ml-1'}`}>
            {historyCount}
          </span>
        )}
        {tab.id === 'favorites' && favoritesCount > 0 && (
          <span className={`text-white text-xs px-2 py-1 rounded-full ${isMobile ? 'ml-auto bg-red-500' : 'bg-red-500 ml-1'}`}>
            {favoritesCount}
          </span>
        )}
      </button>
    );
  };

  if (isMobile) {
    return (
      <div className="container mx-auto px-4 py-4 space-y-3">
        {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => {
              onShowFeedback();
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Send Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
            {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;