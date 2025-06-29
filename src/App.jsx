import React, { useState, useEffect } from 'react';
import { Brain, Coffee } from 'lucide-react';

// Components
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import AnalyzerTab from './components/AnalyzerTab';
import TemplatesTab from './components/TemplatesTab';
import HistoryTab from './components/HistoryTab';
import FavoritesTab from './components/FavoritesTab';
import LearnTab from './components/LearnTab';
import ComparisonTab from './components/ComparisonTab';
import FeedbackModal from './components/FeedbackModal';
import { CopySuccessNotification, FeedbackSubmittedNotification } from './components/Notifications';

// Utils and Hooks
import { analyzePrompt } from './utils/promptAnalyzer';
import { optimizePrompt } from './utils/promptOptimizer';
import { usePromptHistory, useFavorites, useCompletedLessons } from './hooks/useLocalStorage';

const INDUSTRY_STANDARD = 85;

function App() {
  // State Management
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Optimization states
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [originalAnalysis, setOriginalAnalysis] = useState(null);
  const [optimizedAnalysis, setOptimizedAnalysis] = useState(null);
  
  // Notifications
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Custom Hooks
  const { history, addToHistory, removeFromHistory, clearHistory } = usePromptHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorited, toggleFavorite, clearFavorites } = useFavorites();
  const { completedLessons, markLessonComplete } = useCompletedLessons();

  // Real-time analysis effect
  useEffect(() => {
    if (prompt.trim()) {
      const newAnalysis = analyzePrompt(prompt);
      setAnalysis(newAnalysis);
    } else {
      setAnalysis(null);
    }
  }, [prompt]);

  // Handle prompt optimization
  const handleOptimize = () => {
    if (!prompt.trim()) return;
    
    const optimizationResult = optimizePrompt(prompt, INDUSTRY_STANDARD);
    
    if (optimizationResult) {
      setOriginalPrompt(optimizationResult.originalPrompt);
      setOptimizedPrompt(optimizationResult.optimizedPrompt);
      setOriginalAnalysis(optimizationResult.originalAnalysis);
      setOptimizedAnalysis(optimizationResult.optimizedAnalysis);
      
      // Update current prompt with optimized version
      setPrompt(optimizationResult.optimizedPrompt);
      
      // Switch to comparison tab to show results
      setActiveTab('comparison');
    }
  };

  // Handle loading prompts (from templates, history, etc.)
  const handleLoadPrompt = (promptText) => {
    setPrompt(promptText);
    setActiveTab('analyzer'); // Switch to analyzer tab
  };

  // Handle copying to clipboard
  const handleCopyToClipboard = async (text = prompt) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Handle saving to history
  const handleSaveToHistory = () => {
    if (prompt.trim() && analysis) {
      addToHistory(prompt, analysis);
    }
  };

  // Handle favorite toggling with refresh callback
  const handleToggleFavorite = (item, type) => {
    return toggleFavorite(item, type);
  };

  // Feedback submission
  const handleSubmitFeedback = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
    setFeedback('');
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  // Handle comparison tab actions
  const handleAcceptOptimized = (optimizedText) => {
    setPrompt(optimizedText);
    setActiveTab('analyzer');
  };

  const handleRevertToOriginal = (originalText) => {
    setPrompt(originalText);
    setActiveTab('analyzer');
  };

  // Handle lesson completion
  const handleLessonComplete = (lessonId) => {
    markLessonComplete(lessonId);
  };

  // Handle template/example usage from learn tab
  const handleTryExample = (examplePrompt) => {
    setPrompt(examplePrompt);
    setActiveTab('analyzer');
  };

  // Navigate to templates from learn tab
  const handleNavigateToTemplates = () => {
    setActiveTab('templates');
  };

  // Refresh function for state updates
  const handleRefresh = () => {
    // This can be used to trigger re-renders if needed
    // Currently not needed as React handles state updates automatically
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analyzer':
        return (
          <AnalyzerTab
            prompt={prompt}
            setPrompt={setPrompt}
            analysis={analysis}
            onOptimize={handleOptimize}
            onCopyToClipboard={handleCopyToClipboard}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={isFavorited}
            onSaveToHistory={handleSaveToHistory}
            favorites={favorites}
            INDUSTRY_STANDARD={INDUSTRY_STANDARD}
          />
        );
      case 'templates':
        return (
          <TemplatesTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={isFavorited}
          />
        );
      case 'history':
        return (
          <HistoryTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onRefresh={handleRefresh}
          />
        );
      case 'favorites':
        return (
          <FavoritesTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadTemplate={handleLoadPrompt}
            onRefresh={handleRefresh}
          />
        );
      case 'learn':
        return (
          <LearnTab
            completedLessons={completedLessons}
            onLessonComplete={handleLessonComplete}
            onTryExample={handleTryExample}
            onNavigateToTemplates={handleNavigateToTemplates}
          />
        );
      case 'comparison':
        return (
          <ComparisonTab
            originalPrompt={originalPrompt}
            optimizedPrompt={optimizedPrompt}
            originalAnalysis={originalAnalysis}
            optimizedAnalysis={optimizedAnalysis}
            onAcceptOptimized={handleAcceptOptimized}
            onRevertToOriginal={handleRevertToOriginal}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadPrompt={handleLoadPrompt}
          />
        );
      default:
        return (
          <AnalyzerTab
            prompt={prompt}
            setPrompt={setPrompt}
            analysis={analysis}
            onOptimize={handleOptimize}
            onCopyToClipboard={handleCopyToClipboard}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={isFavorited}
            onSaveToHistory={handleSaveToHistory}
            favorites={favorites}
            INDUSTRY_STANDARD={INDUSTRY_STANDARD}
          />
        );
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          historyCount={history.length}
          favoritesCount={favorites.length}
          showComparison={originalPrompt && optimizedPrompt}
        />

        {/* Tab Navigation - Desktop */}
        <div className="hidden md:block">
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            historyCount={history.length}
            favoritesCount={favorites.length}
            onShowFeedback={() => setShowFeedback(true)}
            setMobileMenuOpen={setMobileMenuOpen}
            showComparison={originalPrompt && optimizedPrompt}
          />
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {renderActiveTab()}
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

      {/* Modals and Notifications */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={handleSubmitFeedback}
      />

      <CopySuccessNotification
        isVisible={copySuccess}
        onClose={() => setCopySuccess(false)}
      />

      <FeedbackSubmittedNotification
        isVisible={feedbackSubmitted}
        onClose={() => setFeedbackSubmitted(false)}
      />
    </div>
  );
}

export default App;