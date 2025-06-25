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

export default PromptQualityAnalyzer;-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="prompt">Prompts Only</option>
                        <option value="template">Templates Only</option>
                      </select>

                      <select
                        value={favoritesFilterCategory}
                        onChange={(e) => setFavoritesFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="all">All Categories</option>
                        {getFavoritesCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      
                      <select
                        value={favoritesSortBy}
                        onChange={(e) => setFavoritesSortBy(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A-Z</option>
                        <option value="score">Highest Score</option>
                      </select>
                      
                      <button
                        onClick={() => {
                          setFavorites([]);
                          localStorage.removeItem('promptAnalyzer_favorites');
                        }}
                        disabled={favorites.length === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Archive className="w-4 h-4" />
                        {getFilteredFavorites().length} of {favorites.length} favorites
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Last updated: {favorites.length > 0 ? formatTimestamp(favorites[0].timestamp) : 'Never'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {favorites.filter(f => f.type === 'prompt').length} prompts
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {favorites.filter(f => f.type === 'template').length} templates
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {getFilteredFavorites().length > 0 ? (
                      getFilteredFavorites().map(item => (
                        <FavoriteItem
                          key={item.id}
                          item={item}
                          isExpanded={expandedFavoriteItems.has(item.id)}
                          onToggle={toggleFavoriteItem}
                        />
                      ))
                    ) : (
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                        <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                        <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No Results Found</h4>
                        <p className="text-slate-500 text-sm sm:text-base">Try adjusting your search or filter criteria.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
                  <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No Favorites Yet</h4>
                  <p className="text-slate-500 text-sm sm:text-base mb-6">
                    Start favoriting prompts and templates by clicking the heart icon. Your best content will be saved here for quick access.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setActiveTab('analyzer')}
                      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
                    >
                      <Brain className="w-5 h-5" />
                      Create Prompts
                    </button>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
                    >
                      <Star className="w-5 h-5" />
                      Browse Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm border-t border-orange-500/20">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Support This Project</h3>
              <p className="text-slate-300 text-sm sm:text-base mb-6">Help us keep improving this tool and building better AI experiences for everyone.</p>
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

      {copySuccess && (
        <div 
          className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out"
          onClick={() => setCopySuccess(false)}
        >
          <div 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-green-400/30 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-green-200" />
            <span className="font-medium text-sm sm:text-base">✨ Copied to clipboard!</span>
            <div className="w-2 h-2 bg-green-300 rounded-full animate-ping" />
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div 
          className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out"
          onClick={() => setFeedbackSubmitted(false)}
        >
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-purple-400/30 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
          >
            <Heart className="w-5 h-5 text-purple-200" />
            <span className="font-medium text-sm sm:text-base">💖 Feedback submitted!</span>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-ping" />
          </div>
        </div>
      )}

      <button
        onClick={() => setShowFeedback(true)}
        className="md:hidden fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full border border-slate-600 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-6 text-red-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-white">Send Feedback</h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mb-4">Help us improve! Share your thoughts, suggestions, or report issues.</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback means a lot to us..."
              className="w-full h-24 sm:h-32 bg-slate-700 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4 text-sm sm:text-base"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => submitFeedback()}
                disabled={!feedback.trim()}
                className="flex-1 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptQualityAnalyzer;