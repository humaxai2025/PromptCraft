import React, { useState, useEffect } from 'react';
import { MessageCircle, Coffee } from 'lucide-react';

// Components
import Header from './Header';
import TabNavigation from './TabNavigation';
import AnalyzerTab from './AnalyzerTab';
import LearnTab from './LearnTab';
import ComparisonTab from './ComparisonTab';
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
  
  // Notifications
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Templates
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Comparison state
  const [comparisonData, setComparisonData] = useState({
    originalPrompt: null,
    optimizedPrompt: null,
    originalAnalysis: null,
    optimizedAnalysis: null
  });

  // Custom hooks
  const { history, addToHistory, removeFromHistory, clearHistory } = usePromptHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorited, toggleFavorite, clearFavorites } = useFavorites();
  const { completedLessons, markLessonComplete } = useCompletedLessons();

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
      setComparisonData(optimizationResult);
      setPrompt(optimizationResult.optimizedPrompt);
      setActiveTab('comparison');
    }
  };

  // Comparison tab handlers
  const handleAcceptOptimized = (optimizedPrompt) => {
    setPrompt(optimizedPrompt);
    setActiveTab('analyzer');
  };

  const handleRevertToOriginal = (originalPrompt) => {
    setPrompt(originalPrompt);
    setActiveTab('analyzer');
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

  // Real-time analysis effect
  useEffect(() => {
    const newAnalysis = analyzePrompt(prompt);
    setAnalysis(newAnalysis);
    
    if (newAnalysis && prompt.trim() && prompt.trim().length > 20) {
      const timeoutId = setTimeout(() => {
        const recentPrompts = history.slice(0, 3).map(item => item.prompt);
        if (!recentPrompts.includes(prompt.trim())) {
          addToHistory(prompt.trim(), newAnalysis);
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [prompt, history, addToHistory]);

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return (
          <AnalyzerTab
            prompt={prompt}
            setPrompt={setPrompt}
            analysis={analysis}
            onOptimize={handleOptimize}
            onCopyToClipboard={copyToClipboard}
            onToggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
            INDUSTRY_STANDARD={INDUSTRY_STANDARD}
          />
        );
      
      case 'comparison':
        return (
          <ComparisonTab
            originalPrompt={comparisonData.originalPrompt}
            optimizedPrompt={comparisonData.optimizedPrompt}
            originalAnalysis={comparisonData.originalAnalysis}
            optimizedAnalysis={comparisonData.optimizedAnalysis}
            onAcceptOptimized={handleAcceptOptimized}
            onRevertToOriginal={handleRevertToOriginal}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadPrompt={handleLoadPrompt}
          />
        );
      
      case 'learn':
        return (
          <LearnTab
            completedLessons={completedLessons}
            onLessonComplete={markLessonComplete}
            onTryExample={tryExample}
            onNavigateToTemplates={navigateToTemplates}
          />
        );
      
      case 'templates':
        return (
          <TemplatesTab
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onApplyTemplate={applyTemplate}
            onToggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
          />
        );
      
      case 'history':
        return (
          <HistoryTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
          />
        );
      
      case 'favorites':
        return (
          <FavoritesTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadTemplate={applyTemplate}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

      <div className="relative z-10">
        {/* Header */}
        <Header
          onShowFeedback={() => setShowFeedback(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        >
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            comparisonData={comparisonData}
            historyCount={history.length}
            favoritesCount={favorites.length}
            onShowFeedback={() => setShowFeedback(true)}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </Header>

        {/* Desktop Navigation */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          comparisonData={comparisonData}
          historyCount={history.length}
          favoritesCount={favorites.length}
          onShowFeedback={() => setShowFeedback(true)}
          setMobileMenuOpen={setMobileMenuOpen}
        />

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
    </div>
  );
}

export default PromptQualityAnalyzer;