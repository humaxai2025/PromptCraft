import React from 'react';
import { Brain, Star, History, Heart, BookOpen, MessageCircle, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'analyzer', label: 'Analyzer', icon: Brain },
  { id: 'templates', label: 'Templates', icon: Star },
  { id: 'history', label: 'History', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'comparison', label: 'Compare', icon: BarChart3, hidden: true } // Hidden by default, shown when needed
];

const TabNavigation = ({ 
  activeTab, 
  setActiveTab, 
  historyCount, 
  favoritesCount,
  onShowFeedback,
  setMobileMenuOpen,
  isMobile = false,
  showComparison = false // New prop to control comparison tab visibility
}) => {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Filter tabs based on visibility
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'comparison') {
      return showComparison; // Only show comparison tab when needed
    }
    return true;
  });

  const TabButton = ({ tab }) => (
    <button
      onClick={() => handleTabClick(tab.id)}
      className={`${isMobile ? 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all' : 'flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium relative'} ${
        activeTab === tab.id 
          ? 'bg-purple-600 text-white shadow-lg' 
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <tab.icon className="w-5 h-5" />
      {tab.label}
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
      {tab.id === 'comparison' && (
        <span className={`text-white text-xs px-2 py-1 rounded-full ${isMobile ? 'ml-auto bg-green-500' : 'bg-green-500 ml-1'}`}>
          New
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <div className="container mx-auto px-4 py-4 space-y-3">
        {visibleTabs.map(tab => (
          <TabButton key={`mobile-${tab.id}`} tab={tab} />
        ))}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => {
              onShowFeedback();
              setMobileMenuOpen(false);
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
            {visibleTabs.map(tab => (
              <TabButton key={`desktop-${tab.id}`} tab={tab} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;