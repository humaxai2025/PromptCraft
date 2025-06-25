import React, { useState, useEffect } from 'react';
import { MessageCircle, Coffee, Brain, Star, History, Heart, BookOpen, Save } from 'lucide-react';

// Components
import Header from './header';
import TabNavigation from './TabNavigation';
import AnalyzerTab from './AnalyzerTab';
import LearnTab from './LearnTab';
import TemplatesTab from './TemplatesTab';
import HistoryTab from './HistoryTab';
import FavoritesTab from './FavoritesTab';
import FeedbackModal from './FeedbackModal';
import { CopySuccessNotification, FeedbackSubmittedNotification } from './Notifications';

// Hooks and Utils
import { useLocalStorage, usePromptHistory, useFavorites, useCompletedLessons } from '../hooks/useLocalStorage';
import { analyzePrompt } from '../utils/promptAnalyzer';
import { optimizePrompt } from '../utils/promptOptimizer';

const INDUSTRY_STANDARD = 85;

function PromptQualityAnalyzer() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0); // Force refresh counter
  
  // Notifications
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  
  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Templates
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Custom hooks
  const { history, addToHistory, removeFromHistory, clearHistory } = usePromptHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorited, toggleFavorite, clearFavorites } = useFavorites();
  const { completedLessons, markLessonComplete } = useCompletedLessons();

  // Force refresh function
  const triggerRefresh = () => {
    setForceRefresh(prev => prev + 1);
    // Emit custom event for cross-component communication
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('promptAnalyzer_refresh'));
    }, 10);
  };

  // Enhanced toggle favorite with refresh
  const handleToggleFavorite = (item, type) => {
    toggleFavorite(item, type);
    triggerRefresh(); // Force refresh after toggling
  };

  // Copy to clipboard functionality
  const copyToClipboard = async (text = prompt) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Manual save to history function with refresh
  const saveToHistory = () => {
    if (prompt.trim() && analysis) {
      addToHistory(prompt.trim(), analysis);
      setSavedToHistory(true);
      setTimeout(() => setSavedToHistory(false), 2000);
      triggerRefresh(); // Force refresh after saving
    }
  };

  // Template application
  const applyTemplate = (template) => {
    setPrompt(template.template);
    setActiveTab('analyzer');
    setMobileMenuOpen(false);
  };

  // Optimization handler
  const handleOptimize = () => {
    if (!prompt.trim()) return;
    
    const optimizationResult = optimizePrompt(prompt, INDUSTRY_STANDARD);
    
    if (optimizationResult) {
      setPrompt(optimizationResult.optimizedPrompt);
    }
  };

  const handleLoadPrompt = (promptText) => {
    setPrompt(promptText);
    setActiveTab('analyzer');
  };

  // Feedback submission
  const submitFeedback = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
    setFeedback('');
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  // Learn tab handlers
  const tryExample = (exampleText) => {
    setPrompt(exampleText);
    setActiveTab('analyzer');
  };

  const navigateToTemplates = () => {
    setActiveTab('templates');
  };

  // Real-time analysis effect (no auto-save)
  useEffect(() => {
    const newAnalysis = analyzePrompt(prompt);
    setAnalysis(newAnalysis);
    // Manual save only - user controls when to save to history
  }, [prompt]);

  // Force re-render when favorites change to sync heart icon state
  useEffect(() => {
    // This effect runs whenever favorites array changes
    // Forces the AnalyzerTab to re-check isFavorited status
  }, [favorites]);

  // Ensure proper state sync when switching tabs
  useEffect(() => {
    // Force a refresh of components when returning from favorites tab
    if (activeTab === 'analyzer') {
      // Force re-evaluation of favorite status
      triggerRefresh();
    }
  }, [activeTab, favorites.length, history.length]); // React to data changes

  // Listen for localStorage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'promptAnalyzer_favorites' || e.key === 'promptAnalyzer_history') {
        triggerRefresh(); // Force refresh when localStorage changes
      }
    };

    // Also listen for custom events (for same-tab changes)
    const handleCustomRefresh = () => {
      triggerRefresh();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('promptAnalyzer_refresh', handleCustomRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('promptAnalyzer_refresh', handleCustomRefresh);
    };
  }, []);

  // Handle tab change with refresh
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    triggerRefresh(); // Refresh when switching tabs
  };

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return (
          <AnalyzerTab
            key={`analyzer-${forceRefresh}-${favorites.length}-${activeTab}`} // Use refresh counter
            prompt={prompt}
            setPrompt={setPrompt}
            analysis={analysis}
            onOptimize={handleOptimize}
            onCopyToClipboard={copyToClipboard}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={isFavorited}
            onSaveToHistory={saveToHistory}
            INDUSTRY_STANDARD={INDUSTRY_STANDARD}
          />
        );
      
      case 'templates':
        return (
          <TemplatesTab
            key={`templates-${forceRefresh}`}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onApplyTemplate={applyTemplate}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={isFavorited}
          />
        );
      
      case 'history':
        return (
          <HistoryTab
            key={`history-${forceRefresh}-${history.length}`}
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onRefresh={triggerRefresh}
          />
        );
      
      case 'favorites':
        return (
          <FavoritesTab
            key={`favorites-${forceRefresh}-${favorites.length}`}
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadTemplate={applyTemplate}
            onRefresh={triggerRefresh}
          />
        );
      
      case 'learn':
        return (
          <LearnTab
            key={`learn-${forceRefresh}`}
            completedLessons={completedLessons}
            onLessonComplete={markLessonComplete}
            onTryExample={tryExample}
            onNavigateToTemplates={navigateToTemplates}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        {/* Header */}
        <Header
          onShowFeedback={() => setShowFeedback(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        >
          {/* Mobile Navigation using TabNavigation component */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            historyCount={history.length}
            favoritesCount={favorites.length}
            onShowFeedback={() => setShowFeedback(true)}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </Header>

        {/* Desktop Navigation using TabNavigation component */}
        <div className="hidden md:block">
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            historyCount={history.length}
            favoritesCount={favorites.length}
            onShowFeedback={() => setShowFeedback(true)}
          />
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {renderTabContent()}
        </main>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm border-t border-orange-500/20">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Support This Project</h3>
              <p className="text-slate-300 text-sm sm:text-base mb-6">
                Help us keep improving this tool and building better AI experiences for everyone.
              </p>
              <a
                href="https://www.buymeacoffee.com/humanxai2025"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <Coffee className="w-6 h-6 group-hover:animate-bounce" />
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3">
              <span className="text-slate-400 text-xs sm:text-sm">Built with</span>
              <span className="text-red-400 text-base sm:text-lg">❤️</span>
              <span className="text-slate-400 text-xs sm:text-sm">by</span>
              <span className="text-purple-400 font-semibold text-xs sm:text-sm">HumanXAI</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Feedback Button */}
      <button
        onClick={() => setShowFeedback(true)}
        className="md:hidden fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Modals and Notifications */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={submitFeedback}
      />

      <CopySuccessNotification
        isVisible={copySuccess}
        onClose={() => setCopySuccess(false)}
      />

      <FeedbackSubmittedNotification
        isVisible={feedbackSubmitted}
        onClose={() => setFeedbackSubmitted(false)}
      />

      {/* Saved to History Notification */}
      {savedToHistory && (
        <div 
          className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out"
          onClick={() => setSavedToHistory(false)}
        >
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-blue-400/30 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
          >
            <Save className="w-5 h-5 text-blue-200" />
            <span className="font-medium text-sm sm:text-base">💾 Saved to history!</span>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptQualityAnalyzer;