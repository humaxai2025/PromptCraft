import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, MessageSquare, Brain,
  History, Search, Trash2, Calendar, Clock, Archive, ChevronDown, ChevronUp,
  RotateCcw, Copy, Heart
} from 'lucide-react';
import { usePromptHistory, useFavorites } from '../hooks/useLocalStorage';

const HistoryTab = ({ onLoadPrompt, onCopySuccess }) => {
  const { history, removeFromHistory, clearHistory } = usePromptHistory();
  
  console.log('🔍 HistoryTab render - history count:', history.length);
  console.log('📚 Full history data:', history);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedItems, setExpandedItems] = useState(new Set());

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

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Debug the filtering
  const getFilteredHistory = () => {
    console.log('🔎 Filtering history...');
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(item => {
        const score = item.analysis.overallScore;
        if (filter === 'high') return score >= 80;
        if (filter === 'medium') return score >= 60 && score < 80;
        if (filter === 'low') return score < 60;
        return true;
      });
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
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

    console.log('✅ Filtered history count:', filtered.length);
    return filtered;
  };

  const toggleItem = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

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
          <p className="text-yellow-300 text-sm">
            Filtered items: <strong>{getFilteredHistory().length}</strong>
          </p>
          {history.length > 0 && (
            <p className="text-yellow-300 text-sm">
              Latest item score: <strong>{history[0]?.analysis?.overallScore}</strong>
            </p>
          )}
        </div>
      </div>
      
      {history.length > 0 ? (
        <>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (&lt;60)</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
              </select>
              
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {getFilteredHistory().length > 0 ? (
              getFilteredHistory().map(item => (
                <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
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
                        onClick={() => onLoadPrompt(item.prompt)}
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

                  {/* Simple prompt display */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      Full Prompt
                    </h5>
                    <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {item.prompt}
                    </pre>
                  </div>
                </div>
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