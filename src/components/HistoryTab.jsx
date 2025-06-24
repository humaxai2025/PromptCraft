import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, MessageSquare, Brain,
  History, Search, Trash2, Calendar, Clock, Filter, Archive, ChevronDown, ChevronUp,
  RotateCcw, SortDesc, SortAsc, Eye, EyeOff, Copy
} from 'lucide-react';

const HistoryTab = ({ onLoadPrompt, onCopySuccess }) => {
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('promptAnalyzer_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // all, high, medium, low
  const [historySortBy, setHistorySortBy] = useState('newest'); // newest, oldest, score-high, score-low
  const [expandedHistoryItems, setExpandedHistoryItems] = useState(new Set());

  // Save prompt to history (called from parent)
  const saveToHistory = (promptText, analysisData) => {
    if (!promptText.trim() || !analysisData) return;

    const historyItem = {
      id: Date.now() + Math.random(),
      prompt: promptText,
      analysis: analysisData,
      timestamp: new Date().toISOString(),
      preview: promptText.slice(0, 100) + (promptText.length > 100 ? '...' : '')
    };

    const updatedHistory = [historyItem, ...promptHistory].slice(0, 100); // Keep last 100 items
    setPromptHistory(updatedHistory);
    localStorage.setItem('promptAnalyzer_history', JSON.stringify(updatedHistory));
  };

  // Expose saveToHistory function to parent component
  useEffect(() => {
    // Store the function in a way that parent can access it
    window.saveToPromptHistory = saveToHistory;
    
    return () => {
      delete window.saveToPromptHistory;
    };
  }, [promptHistory]);

  // Load prompt from history
  const loadFromHistory = (historyItem) => {
    onLoadPrompt(historyItem.prompt);
  };

  // Delete from history
  const deleteFromHistory = (itemId) => {
    const updatedHistory = promptHistory.filter(item => item.id !== itemId);
    setPromptHistory(updatedHistory);
    localStorage.setItem('promptAnalyzer_history', JSON.stringify(updatedHistory));
  };

  // Clear all history
  const clearAllHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem('promptAnalyzer_history');
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Filter and sort history
  const getFilteredHistory = () => {
    let filtered = promptHistory;

    // Search filter
    if (historySearchTerm) {
      filtered = filtered.filter(item => 
        item.prompt.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        item.preview.toLowerCase().includes(historySearchTerm.toLowerCase())
      );
    }

    // Score filter
    if (historyFilter !== 'all') {
      filtered = filtered.filter(item => {
        const score = item.analysis.overallScore;
        if (historyFilter === 'high') return score >= 80;
        if (historyFilter === 'medium') return score >= 60 && score < 80;
        if (historyFilter === 'low') return score < 60;
        return true;
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (historySortBy) {
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'score-high':
          return b.analysis.overallScore - a.analysis.overallScore;
        case 'score-low':
          return a.analysis.overallScore - b.analysis.overallScore;
        case 'newest':
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  };

  const toggleHistoryItem = (itemId) => {
    const newExpanded = new Set(expandedHistoryItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedHistoryItems(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getSuggestionIcon = (type) => {
    if (type === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <Lightbulb className="w-4 h-4 text-blue-400" />;
  };

  const HistoryItem = ({ item, isExpanded, onToggle }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={'p-2 rounded-lg flex-shrink-0 ' + (
            item.analysis.overallScore >= 80 ? 'bg-green-600/20' :
            item.analysis.overallScore >= 60 ? 'bg-yellow-600/20' : 'bg-red-600/20'
          )}>
            {getScoreIcon(item.analysis.overallScore)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm sm:text-base font-medium truncate">{item.preview}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(item.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Score: {item.analysis.overallScore}
              </span>
              <span>{item.analysis.stats.words} words</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => copyToClipboard(item.prompt)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadFromHistory(item)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Load prompt"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(item.id)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteFromHistory(item.id)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Full Prompt
            </h5>
            <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {item.prompt}
            </pre>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h5 className="text-white font-medium mb-3">Score Breakdown</h5>
              <div className="space-y-2">
                {Object.entries(item.analysis.scores).map(([key, score]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 capitalize">{key}</span>
                    <span className="text-white font-mono">{score}/100</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <h5 className="text-white font-medium mb-3">Statistics</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Words</span>
                  <span className="text-white">{item.analysis.stats.words}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Sentences</span>
                  <span className="text-white">{item.analysis.stats.sentences}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Characters</span>
                  <span className="text-white">{item.analysis.stats.characters}</span>
                </div>
              </div>
            </div>
          </div>

          {item.analysis.suggestions.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h5 className="text-white font-medium mb-3">Suggestions</h5>
              <div className="space-y-2">
                {item.analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    {getSuggestionIcon(suggestion.type)}
                    <div>
                      <span className="text-white font-medium">{suggestion.category}:</span>
                      <span className="text-slate-300 ml-1">{suggestion.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Prompt History</h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          Review, reuse, and organize all your analyzed prompts with detailed insights.
        </p>
      </div>
      
      {promptHistory.length > 0 ? (
        <>
          {/* Search and Filter Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (<60)</option>
              </select>
              
              <select
                value={historySortBy}
                onChange={(e) => setHistorySortBy(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
              </select>
              
              <button
                onClick={clearAllHistory}
                disabled={promptHistory.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Archive className="w-4 h-4" />
                {getFilteredHistory().length} of {promptHistory.length} prompts
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last updated: {promptHistory.length > 0 ? formatTimestamp(promptHistory[0].timestamp) : 'Never'}
              </span>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {getFilteredHistory().length > 0 ? (
              getFilteredHistory().map(item => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedHistoryItems.has(item.id)}
                  onToggle={toggleHistoryItem}
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
          <History className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No History Yet</h4>
          <p className="text-slate-500 text-sm sm:text-base mb-6">
            Start analyzing prompts to build your history. Prompts are automatically saved when analyzed.
          </p>
          <button
            onClick={() => onLoadPrompt('')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
          >
            <Brain className="w-5 h-5" />
            Start Analyzing
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;