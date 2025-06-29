import React, { useState, useMemo } from 'react';
import { 
  Search, Star, Users, Code, Briefcase, Heart, Copy, ArrowRight,
  Filter, SortAsc, SortDesc, Grid, List, BookOpen, Zap, Target,
  ChevronDown, ChevronUp, Eye, Check
} from 'lucide-react';

// Import the prompts data
import promptsData from '../data/prompts.json';

const TemplatesTab = ({ onLoadPrompt, onCopySuccess, onToggleFavorite, isFavorited }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all'];
    const devPrompts = promptsData.filter(p => p.for_devs).length;
    const nonDevPrompts = promptsData.filter(p => !p.for_devs).length;
    
    if (devPrompts > 0) cats.push('development');
    if (nonDevPrompts > 0) cats.push('general');
    
    return cats;
  }, []);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = promptsData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.act.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'development') {
        filtered = filtered.filter(template => template.for_devs);
      } else if (selectedCategory === 'general') {
        filtered = filtered.filter(template => !template.for_devs);
      }
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.act.localeCompare(b.act);
        case 'name-desc':
          return b.act.localeCompare(a.act);
        case 'recent':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'development': return <Code className="w-4 h-4" />;
      case 'general': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (forDevs) => {
    return forDevs ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400';
  };

  const handleUseTemplate = (template) => {
    onLoadPrompt(template.prompt);
    onCopySuccess && onCopySuccess();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess && onCopySuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const TemplateCard = ({ template, isExpanded, onToggleExpanded }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex-shrink-0">
            {template.for_devs ? <Code className="w-5 h-5 text-purple-400" /> : <Users className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white text-base sm:text-lg font-semibold mb-2 truncate group-hover:text-purple-300 transition-colors">
              {template.act}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.for_devs)}`}>
                {template.for_devs ? 'Development' : 'General'}
              </span>
              <span className="text-slate-400 text-xs">#{template.id}</span>
            </div>
            <p className="text-slate-300 text-sm line-clamp-2 mb-3">
              {template.prompt.slice(0, 120)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={() => onToggleFavorite({ 
              prompt: template.prompt, 
              analysis: null 
            }, 'template')}
            className={`p-2 rounded-lg transition-colors ${
              isFavorited && isFavorited(template.prompt) 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-white'
            }`}
            title={isFavorited && isFavorited(template.prompt) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${isFavorited && isFavorited(template.prompt) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => copyToClipboard(template.prompt)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleExpanded(template.id)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "View details"}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUseTemplate(template)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Check className="w-4 h-4" />
            Use This
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/10 pt-4 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Full Prompt Template
            </h5>
            <div className="bg-slate-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono">
                {template.prompt}
              </pre>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleUseTemplate(template)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm"
            >
              <ArrowRight className="w-4 h-4" />
              Load in Analyzer
            </button>
            <button
              onClick={() => copyToClipboard(template.prompt)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const TemplateListItem = ({ template }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex-shrink-0">
            {template.for_devs ? <Code className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                {template.act}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.for_devs)}`}>
                {template.for_devs ? 'Dev' : 'General'}
              </span>
            </div>
            <p className="text-slate-400 text-xs truncate">
              {template.prompt.slice(0, 80)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(template.prompt)}
            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleUseTemplate(template)}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all font-medium text-xs"
          >
            <Check className="w-3 h-3" />
            Use
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          <Star className="w-8 h-8 text-purple-400 inline-block mr-3" />
          Browse Templates
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          Discover {promptsData.length}+ professional prompt templates for various use cases. From development to creative writing, find the perfect starting point.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="general">General</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="name">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
          
          <div className="flex gap-1 bg-slate-800/50 border border-slate-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3 h-3" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3 h-3" />
              List
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {filteredTemplates.length} of {promptsData.length} templates
          </span>
          <span className="flex items-center gap-1">
            <Code className="w-4 h-4" />
            {filteredTemplates.filter(t => t.for_devs).length} development
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {filteredTemplates.filter(t => !t.for_devs).length} general
          </span>
        </div>
      </div>

      {/* Templates Display */}
      <div className="space-y-4">
        {filteredTemplates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isExpanded={expandedTemplate === template.id}
                  onToggleExpanded={(id) => setExpandedTemplate(expandedTemplate === id ? null : id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map(template => (
                <TemplateListItem key={template.id} template={template} />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
            <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No Templates Found</h4>
            <p className="text-slate-500 text-sm sm:text-base">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{promptsData.length}+</div>
            <div className="text-slate-300 text-sm">Total Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{promptsData.filter(p => p.for_devs).length}</div>
            <div className="text-slate-300 text-sm">Development</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">{promptsData.filter(p => !p.for_devs).length}</div>
            <div className="text-slate-300 text-sm">General Use</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesTab;