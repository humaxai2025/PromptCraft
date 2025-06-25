import React, { useState } from 'react';
import { 
  Heart, Star, Search, Trash2, Calendar, Clock, Archive, ChevronDown, ChevronUp,
  RotateCcw, Copy, MessageSquare, FileText, Tag, CheckCircle, XCircle, AlertTriangle, Brain
} from 'lucide-react';
import { useFavorites } from '../hooks/useLocalStorage';

const FavoritesTab = ({ onLoadPrompt, onCopySuccess, onLoadTemplate }) => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
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
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getCategories = () => {
    const categories = favorites.map(item => item.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getFilteredFavorites = () => {
    let filtered = favorites;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'score':
          if (a.analysis && b.analysis) {
            return b.analysis.overallScore - a.analysis.overallScore;
          }
          return 0;
        case 'newest':
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

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

  const loadFromFavorites = (item) => {
    if (item.type === 'prompt') {
      onLoadPrompt(item.content);
    } else {
      onLoadTemplate({
        name: item.title,
        template: item.content,
        category: item.category,
        description: item.description,
        icon: item.icon
      });
    }
  };

  const FavoriteItem = ({ item, isExpanded, onToggle }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-purple-600/20 rounded-lg flex-shrink-0">
            {item.type === 'template' && item.icon ? (
              React.createElement(item.icon, { className: "w-5 h-5 text-purple-400" })
            ) : (
              <MessageSquare className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white text-sm sm:text-base font-medium truncate">{item.title}</h3>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'prompt' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {item.type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(item.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {item.category}
              </span>
              {item.analysis && (
                <span className="flex items-center gap-1">
                  {getScoreIcon(item.analysis.overallScore)}
                  Score: {item.analysis.overallScore}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => copyToClipboard(item.content)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title="Copy content"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadFromFavorites(item)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Load content"
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
            onClick={() => removeFromFavorites(item.id)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Remove from favorites"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {item.description && (
        <p className="text-slate-300 text-sm mb-4">{item.description}</p>
      )}

      {isExpanded && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
              {item.type === 'prompt' ? <MessageSquare className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
              {item.type === 'prompt' ? 'Prompt Content' : 'Template Content'}
            </h5>
            <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {item.content}
            </pre>
          </div>

          {item.analysis && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h5 className="text-white font-medium mb-3">Quality Scores</h5>
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
                    <span className="text-slate-300">Overall Score</span>
                    <span className="text-white font-bold">{item.analysis.overallScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Words</span>
                    <span className="text-white">{item.analysis.stats.words}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Sentences</span>
                    <span className="text-white">{item.analysis.stats.sentences}</span>
                  </div>
                </div>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          <Heart className="w-8 h-8 text-red-400 inline-block mr-3 fill-red-400" />
          My Favorites
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          Your bookmarked prompts and templates - quick access to your best content.
        </p>
      </div>
      
      {favorites.length > 0 ? (
        <>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="prompt">Prompts Only</option>
                <option value="template">Templates Only</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="score">Highest Score</option>
              </select>
              
              <button
                onClick={clearFavorites}
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
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={toggleItem}
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
              onClick={() => onLoadPrompt('')}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
            >
              <Brain className="w-5 h-5" />
              Create Prompts
            </button>
            <button
              onClick={() => onLoadTemplate(null)}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
            >
              <Star className="w-5 h-5" />
              Browse Templates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;