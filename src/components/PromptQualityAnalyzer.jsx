import React, { useState, useEffect } from 'react';
import { MessageCircle, Coffee, Brain, Star, History, Heart, BookOpen, Save, MessageSquare, RotateCcw, Trash2 } from 'lucide-react';

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

  // Optimization handler - simplified to just optimize the current prompt
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

  // Manual save to history function
  const saveToHistory = () => {
    if (prompt.trim() && analysis) {
      console.log('🔍 Manual save triggered:', { prompt: prompt.trim(), score: analysis.overallScore });
      addToHistory(prompt.trim(), analysis);
      setSavedToHistory(true);
      setTimeout(() => setSavedToHistory(false), 2000);
    } else {
      console.log('❌ Cannot save - missing prompt or analysis:', { hasPrompt: !!prompt.trim(), hasAnalysis: !!analysis });
    }
  };

  // Real-time analysis effect
  useEffect(() => {
    const newAnalysis = analyzePrompt(prompt);
    setAnalysis(newAnalysis);
    
    console.log('📊 Analysis updated:', { prompt: prompt.slice(0, 50), score: newAnalysis?.overallScore });
    
    // Auto-save to history for decent prompts (50+ score to test)
    if (newAnalysis && prompt.trim() && prompt.trim().length > 10 && newAnalysis.overallScore >= 50) {
      console.log('⏰ Setting timeout for auto-save...');
      const timeoutId = setTimeout(() => {
        const recentPrompts = history.slice(0, 3).map(item => item.prompt);
        if (!recentPrompts.includes(prompt.trim())) {
          console.log('💾 Auto-saving to history:', newAnalysis.overallScore);
          addToHistory(prompt.trim(), newAnalysis);
        } else {
          console.log('⚠️ Prompt already in recent history, skipping auto-save');
        }
      }, 1000); // Reduced to 1 second for testing
      
      return () => {
        console.log('🧹 Clearing timeout');
        clearTimeout(timeoutId);
      };
    } else {
      console.log('❌ Auto-save conditions not met:', {
        hasAnalysis: !!newAnalysis,
        hasPrompt: !!prompt.trim(),
        promptLength: prompt.trim().length,
        score: newAnalysis?.overallScore
      });
    }
  }, [prompt, history, addToHistory]);

  // Debug history changes
  useEffect(() => {
    console.log('📚 History updated, count:', history.length);
    if (history.length > 0) {
      console.log('Latest history item:', history[0]);
    }
  }, [history]);

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
            onSaveToHistory={saveToHistory}
            INDUSTRY_STANDARD={INDUSTRY_STANDARD}
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
        // Debug HistoryTab inline - using the existing history from the hook
        console.log('🔍 HistoryTab render - history count:', history.length);
        console.log('📚 Full history data:', history);
        
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Prompt History</h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
                Review, reuse, and organize all your analyzed prompts with detailed insights.
              </p>
              
              {/* Debug Info */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-400 font-semibold mb-2">🐛 Debug Info</h3>
                <p className="text-yellow-300 text-sm">
                  Total history items: <strong>{history.length}</strong>
                </p>
                {history.length > 0 && (
                  <p className="text-yellow-300 text-sm">
                    Latest item score: <strong>{history[0]?.analysis?.overallScore}</strong>
                  </p>
                )}
                <button
                  onClick={() => {
                    console.log('🧪 Manual test save to history');
                    addToHistory('Test prompt for debugging', { 
                      overallScore: 75, 
                      scores: { clarity: 70, context: 75, structure: 80, specificity: 70, instructions: 75 },
                      suggestions: [],
                      stats: { words: 5, sentences: 1, characters: 25 } 
                    });
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Test Save to History
                </button>
                <button
                  onClick={() => {
                    console.log('🧹 Clearing all history');
                    clearHistory();
                  }}
                  className="mt-2 ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  Clear History
                </button>
              </div>
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-purple-600/20 rounded-lg flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm sm:text-base font-medium">{item.preview || item.prompt.slice(0, 100)}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                            <span>Score: {item.analysis.overallScore}</span>
                            <span>{item.analysis.stats.words} words</span>
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleLoadPrompt(item.prompt)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          title="Load prompt"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromHistory(item.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <h5 className="text-white font-medium mb-2">Full Prompt</h5>
                      <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono bg-slate-900/50 rounded-lg p-3">
                        {item.prompt}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                <History className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No History Yet</h4>
                <p className="text-slate-500 text-sm sm:text-base mb-6">
                  Start analyzing prompts to build your history. Prompts are automatically saved when analyzed.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'favorites':
        return (
          <FavoritesTab
            onLoadPrompt={handleLoadPrompt}
            onCopySuccess={() => setCopySuccess(true)}
            onLoadTemplate={applyTemplate}
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
          {/* Mobile Menu Content */}
          <div className="container mx-auto px-4 py-4 space-y-3">
            {['analyzer', 'templates', 'history', 'favorites', 'learn'].map(tabId => (
              <button
                key={tabId}
                onClick={() => {
                  setActiveTab(tabId);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tabId 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {tabId === 'analyzer' && <Brain className="w-5 h-5" />}
                {tabId === 'templates' && <Star className="w-5 h-5" />}
                {tabId === 'history' && <History className="w-5 h-5" />}
                {tabId === 'favorites' && <Heart className="w-5 h-5" />}
                {tabId === 'learn' && <BookOpen className="w-5 h-5" />}
                <span className="capitalize">{tabId}</span>
                {tabId === 'history' && history.length > 0 && (
                  <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {history.length}
                  </span>
                )}
                {tabId === 'favorites' && favorites.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => {
                  setShowFeedback(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Send Feedback
              </button>
            </div>
          </div>
        </Header>

        {/* Desktop Navigation */}
        <div className="hidden md:block bg-black/10 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
                {['analyzer', 'templates', 'history', 'favorites', 'learn'].map(tabId => (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                      activeTab === tabId 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tabId === 'analyzer' && <Brain className="w-5 h-5" />}
                    {tabId === 'templates' && <Star className="w-5 h-5" />}
                    {tabId === 'history' && <History className="w-5 h-5" />}
                    {tabId === 'favorites' && <Heart className="w-5 h-5" />}
                    {tabId === 'learn' && <BookOpen className="w-5 h-5" />}
                    <span className="capitalize">{tabId}</span>
                    {tabId === 'history' && history.length > 0 && (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                        {history.length}
                      </span>
                    )}
                    {tabId === 'favorites' && favorites.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
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