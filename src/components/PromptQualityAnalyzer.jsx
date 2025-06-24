import React, { useState, useEffect } from 'react';
import LearnTab from './LearnTab';

import { 
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, MessageSquare, Brain, 
  Zap, Copy, Download, Share2, Coffee, MessageCircle, Wand2, BookOpen, 
  Sparkles, ArrowRight, Send, Heart, Star, Code, PenTool, BarChart3, Mail, Menu, X,
  History, Search, Trash2, Calendar, Clock, Filter, Archive, ChevronDown, ChevronUp,
  RotateCcw, SortDesc, SortAsc, Eye, EyeOff, FileText, Tag, Bookmark
} from 'lucide-react';

function PromptQualityAnalyzer() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('promptAnalyzer_completedLessons');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // History state
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('promptAnalyzer_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySortBy, setHistorySortBy] = useState('newest');
  const [expandedHistoryItems, setExpandedHistoryItems] = useState(new Set());

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('promptAnalyzer_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');
  const [favoritesFilterType, setFavoritesFilterType] = useState('all');
  const [favoritesFilterCategory, setFavoritesFilterCategory] = useState('all');
  const [favoritesSortBy, setFavoritesSortBy] = useState('newest');
  const [expandedFavoriteItems, setExpandedFavoriteItems] = useState(new Set());

  const INDUSTRY_STANDARD = 85;

  const allTemplates = [
    {
      id: 'blog-writer',
      name: 'Blog Post Writer',
      description: 'Create engaging, SEO-optimized blog content',
      category: 'Content Writing',
      icon: PenTool,
      template: 'You are an expert content strategist and SEO specialist with 10+ years of experience creating viral blog content. Write a comprehensive blog post about "[TOPIC]" that:\n\n**Content Requirements:**\n• Target audience: [TARGET_AUDIENCE]\n• Primary keyword: [MAIN_KEYWORD]\n• Word count: [WORD_COUNT] words\n• Tone: [TONE]\n\n**Structure & Format:**\n• Compelling headline with emotional hook\n• Engaging introduction with clear value proposition\n• 5-7 main sections with actionable insights\n• Conclusion with strong call-to-action\n\n**Deliverables:** Complete blog post with headline variations and meta description.'
    },
    {
      id: 'copywriter',
      name: 'Sales Copywriter',
      description: 'High-converting sales and marketing copy',
      category: 'Content Writing',
      icon: Target,
      template: 'You are a world-class copywriter with proven expertise in direct response marketing. Create compelling sales copy for [PRODUCT/SERVICE] that:\n\n**Campaign Details:**\n• Product/Service: [PRODUCT_NAME]\n• Target audience: [IDEAL_CUSTOMER]\n• Primary benefit: [MAIN_BENEFIT]\n• Price point: [PRICE_RANGE]\n\n**Copy Requirements:**\n• Attention-grabbing headline using proven formulas\n• Pain point identification and agitation\n• Clear value proposition and unique selling points\n• Social proof and credibility indicators\n• Compelling call-to-action with urgency\n\n**Deliverables:** Complete sales copy with multiple headline options.'
    },
    {
      id: 'business-analyst',
      name: 'Business Analyst',
      description: 'Strategic analysis and market research',
      category: 'Business Strategy',
      icon: BarChart3,
      template: 'You are a senior business analyst with MBA-level expertise in strategic planning. Conduct a comprehensive analysis of [BUSINESS_TOPIC] including:\n\n**Analysis Framework:**\n• Industry: [SPECIFIC_INDUSTRY]\n• Company/Product: [COMPANY_NAME]\n• Market scope: [GEOGRAPHIC_REGION]\n• Time horizon: [ANALYSIS_PERIOD]\n\n**Research Areas:**\n1. Market size and growth potential\n2. Competitive landscape and positioning\n3. Customer segments and behavior patterns\n4. Industry trends and disruption factors\n\n**Deliverables:** Executive summary with key findings, SWOT analysis, and strategic recommendations.'
    },
    {
      id: 'consultant',
      name: 'Management Consultant',
      description: 'Strategic consulting and problem-solving',
      category: 'Business Strategy',
      icon: Lightbulb,
      template: 'You are a senior management consultant from a top-tier consulting firm. Address the following business challenge:\n\n**Problem Statement:**\n• Challenge: [SPECIFIC_BUSINESS_PROBLEM]\n• Organization: [COMPANY_TYPE_SIZE]\n• Industry context: [INDUSTRY_DETAILS]\n• Timeline: [PROJECT_DURATION]\n\n**Consulting Approach:**\n• Root cause analysis using proven frameworks\n• Benchmark against industry best practices\n• Stakeholder impact assessment\n• Financial implications and ROI analysis\n\n**Deliverables:** Strategic recommendations with business case and implementation plan.'
    },
    {
      id: 'software-architect',
      name: 'Software Architect',
      description: 'System design and technical architecture',
      category: 'Technology',
      icon: Code,
      template: 'You are a senior software architect with 15+ years of experience in scalable system design. Design a technical solution for [PROJECT_NAME] with:\n\n**Project Specifications:**\n• System type: [WEB_APP/MOBILE_APP/API]\n• Technology stack: [PREFERRED_TECHNOLOGIES]\n• Expected users: [USER_SCALE]\n• Performance requirements: [RESPONSE_TIME]\n\n**Architecture Requirements:**\n• Scalability and performance optimization\n• Security best practices and compliance\n• Database design and data modeling\n• API design and integration patterns\n\n**Deliverables:** System architecture diagram, database schema, and implementation guidelines.'
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Data analysis and business intelligence',
      category: 'Data Analytics',
      icon: BarChart3,
      template: 'You are a senior data analyst with expertise in statistical analysis and business intelligence. Analyze the dataset for [BUSINESS_QUESTION]:\n\n**Analysis Context:**\n• Dataset: [DATA_DESCRIPTION]\n• Business question: [SPECIFIC_QUESTION]\n• Stakeholders: [DECISION_MAKERS]\n• Success metrics: [KEY_METRICS]\n\n**Analysis Framework:**\n1. Data Exploration and Quality Assessment\n2. Statistical Analysis and Trends\n3. Insights & Recommendations\n\n**Deliverables:** Comprehensive analysis report with visualizations and strategic recommendations.'
    }
  ];

  const getCategories = () => {
    const categories = allTemplates.map(t => t.category);
    return [...new Set(categories)];
  };

  const copyToClipboard = async (text = prompt) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const applyTemplate = (template) => {
    setPrompt(template.template);
    setActiveTab('analyzer');
    setMobileMenuOpen(false);
  };

  // Favorites functionality
  const addToFavorites = (item, type = 'prompt') => {
    const favoriteItem = {
      id: Date.now() + Math.random(),
      type: type,
      title: type === 'prompt' 
        ? (item.prompt ? item.prompt.slice(0, 50) + '...' : 'Untitled Prompt')
        : item.name,
      content: type === 'prompt' ? item.prompt : item.template,
      analysis: type === 'prompt' ? item.analysis : null,
      category: type === 'template' ? item.category : 'Custom',
      description: type === 'template' ? item.description : '',
      icon: type === 'template' ? item.icon : null,
      timestamp: new Date().toISOString(),
      tags: []
    };

    const updatedFavorites = [favoriteItem, ...favorites];
    setFavorites(updatedFavorites);
    localStorage.setItem('promptAnalyzer_favorites', JSON.stringify(updatedFavorites));
    return favoriteItem.id;
  };

  const removeFromFavorites = (itemId) => {
    const updatedFavorites = favorites.filter(item => item.id !== itemId);
    setFavorites(updatedFavorites);
    localStorage.setItem('promptAnalyzer_favorites', JSON.stringify(updatedFavorites));
  };

  const isFavorited = (content) => {
    return favorites.some(fav => fav.content === content);
  };

  const toggleFavorite = (item, type = 'prompt') => {
    const content = type === 'prompt' ? item.prompt : item.template;
    
    if (isFavorited(content)) {
      const existingFav = favorites.find(fav => fav.content === content);
      if (existingFav) {
        removeFromFavorites(existingFav.id);
        return false;
      }
    } else {
      addToFavorites(item, type);
      return true;
    }
  };

  // Save prompt to history
  const saveToHistory = (promptText, analysisData) => {
    if (!promptText.trim() || !analysisData) return;

    const historyItem = {
      id: Date.now() + Math.random(),
      prompt: promptText,
      analysis: analysisData,
      timestamp: new Date().toISOString(),
      preview: promptText.slice(0, 100) + (promptText.length > 100 ? '...' : '')
    };

    const updatedHistory = [historyItem, ...promptHistory].slice(0, 100);
    setPromptHistory(updatedHistory);
    localStorage.setItem('promptAnalyzer_history', JSON.stringify(updatedHistory));
  };

  // Load prompt from history
  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem.prompt);
    setActiveTab('analyzer');
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

  // Filter and sort history
  const getFilteredHistory = () => {
    let filtered = promptHistory;

    if (historySearchTerm) {
      filtered = filtered.filter(item => 
        item.prompt.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        item.preview.toLowerCase().includes(historySearchTerm.toLowerCase())
      );
    }

    if (historyFilter !== 'all') {
      filtered = filtered.filter(item => {
        const score = item.analysis.overallScore;
        if (historyFilter === 'high') return score >= 80;
        if (historyFilter === 'medium') return score >= 60 && score < 80;
        if (historyFilter === 'low') return score < 60;
        return true;
      });
    }

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

  // Favorites filtering
  const getFavoritesCategories = () => {
    const categories = favorites.map(item => item.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getFilteredFavorites = () => {
    let filtered = favorites;

    if (favoritesSearchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(favoritesSearchTerm.toLowerCase()))
      );
    }

    if (favoritesFilterType !== 'all') {
      filtered = filtered.filter(item => item.type === favoritesFilterType);
    }

    if (favoritesFilterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === favoritesFilterCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (favoritesSortBy) {
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

  const toggleHistoryItem = (itemId) => {
    const newExpanded = new Set(expandedHistoryItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedHistoryItems(newExpanded);
  };

  const toggleFavoriteItem = (itemId) => {
    const newExpanded = new Set(expandedFavoriteItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedFavoriteItems(newExpanded);
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

  const analyzePrompt = (promptText) => {
    if (!promptText.trim()) return null;

    const text = promptText.trim();
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    
    const clarityScore = (() => {
      let score = 60;
      
      const vagueWords = ['better', 'good', 'nice', 'some', 'many', 'few', 'stuff', 'things'];
      const vagueCount = vagueWords.filter(word => 
        text.toLowerCase().includes(' ' + word + ' ') || text.toLowerCase().includes(' ' + word + '.') || text.toLowerCase().includes(' ' + word + ',')
      ).length;
      score -= vagueCount * 5;
      
      const actionWords = ['analyze', 'create', 'generate', 'write', 'explain', 'summarize', 'compare', 'develop', 'implement', 'optimize', 'deliver', 'provide', 'ensure', 'establish', 'evaluate'];
      const actionCount = actionWords.filter(word => text.toLowerCase().includes(word.toLowerCase())).length;
      score += Math.min(actionCount * 8, 30);
      
      const professionalTerms = ['strategic', 'comprehensive', 'actionable', 'measurable', 'evidence-based', 'stakeholder', 'methodology', 'framework', 'best practices', 'industry standard', 'KPI', 'ROI'];
      const professionalCount = professionalTerms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
      score += Math.min(professionalCount * 3, 20);
      
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'which'];
      const hasQuestion = questionWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
      if (hasQuestion) score += 10;
      
      return Math.max(0, Math.min(100, score));
    })();

    const contextScore = (() => {
      let score = 40;
      
      const roleIndicators = ['you are', 'act as', 'imagine you', 'as a', 'role:', 'persona:', 'expert', 'senior', 'specialist', 'consultant', 'professional', 'world-class', 'industry-leading'];
      const roleMatches = roleIndicators.filter(indicator => text.toLowerCase().includes(indicator.toLowerCase())).length;
      score += Math.min(roleMatches * 6, 25);
      
      if (words > 50) score += 15;
      if (words > 100) score += 10;
      if (words > 200) score += 10;
      
      const exampleIndicators = ['example', 'for instance', 'such as', 'like this', 'e.g.', 'case study', 'demonstration', 'illustration'];
      const exampleCount = exampleIndicators.filter(indicator => text.toLowerCase().includes(indicator.toLowerCase())).length;
      score += Math.min(exampleCount * 8, 20);
      
      const contextTerms = ['background', 'context', 'situation', 'environment', 'industry', 'market', 'organizational'];
      const contextCount = contextTerms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
      score += Math.min(contextCount * 5, 15);
      
      return Math.max(0, Math.min(100, score));
    })();

    const structureScore = (() => {
      let score = 50;
      
      if (text[0] === text[0].toUpperCase()) score += 5;
      if (text.includes('.') || text.includes('!') || text.includes('?')) score += 10;
      
      if (sentences > 3) score += 15;
      if (sentences > 6) score += 10;
      
      const formatIndicators = ['**', '•', '-', '1.', '2.', '\n\n'];
      const formatCount = formatIndicators.filter(indicator => text.includes(indicator)).length;
      score += Math.min(formatCount * 5, 25);
      
      const sectionWords = ['objective', 'goal', 'task', 'approach', 'methodology', 'deliverable', 'format', 'requirement', 'standard', 'criteria'];
      const sectionCount = sectionWords.filter(word => text.toLowerCase().includes(word.toLowerCase())).length;
      score += Math.min(sectionCount * 4, 20);
      
      return Math.max(0, Math.min(100, score));
    })();

    const specificityScore = (() => {
      let score = 45;
      
      const formatWords = ['json', 'markdown', 'list', 'table', 'bullet points', 'numbered', 'format:', 'structure:', 'output:', 'deliverable', 'presentation'];
      const formatCount = formatWords.filter(word => text.toLowerCase().includes(word.toLowerCase())).length;
      score += Math.min(formatCount * 8, 25);
      
      const constraintWords = ['must', 'should', 'include', 'exclude', 'limit', 'maximum', 'minimum', 'exactly', 'specific', 'ensure', 'require', 'criteria', 'standard'];
      const constraintCount = constraintWords.filter(word => text.toLowerCase().includes(word.toLowerCase())).length;
      score += Math.min(constraintCount * 3, 25);
      
      const numberMatches = text.match(/\d+/g) || [];
      score += Math.min(numberMatches.length * 2, 15);
      
      const measurementTerms = ['KPI', 'metric', 'timeline', 'deadline', 'milestone', 'benchmark', 'target', 'goal', 'percentage', 'ROI'];
      const measurementCount = measurementTerms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
      score += Math.min(measurementCount * 4, 15);
      
      return Math.max(0, Math.min(100, score));
    })();

    const instructionsScore = (() => {
      let score = 55;
      
      const stepIndicators = ['step', 'first', 'then', 'next', 'finally', 'process', 'steps:', 'phase', 'stage', 'sequence'];
      const stepCount = stepIndicators.filter(indicator => text.toLowerCase().includes(indicator.toLowerCase())).length;
      score += Math.min(stepCount * 6, 20);
      
      const taskWords = ['task:', 'goal:', 'objective:', 'purpose:', 'mission:', 'aim:', 'target:', 'deliverable:', 'outcome:'];
      const taskCount = taskWords.filter(word => text.toLowerCase().includes(word.toLowerCase())).length;
      score += Math.min(taskCount * 8, 20);
      
      if (words >= 20 && words <= 50) score += 5;
      if (words >= 51 && words <= 150) score += 10;
      if (words >= 151 && words <= 300) score += 15;
      if (words > 300) score += 10;
      
      const qualityTerms = ['excellence', 'professional', 'high-quality', 'industry-standard', 'best-practice', 'world-class', 'premium'];
      const qualityCount = qualityTerms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
      score += Math.min(qualityCount * 5, 15);
      
      return Math.max(0, Math.min(100, score));
    })();

    const overallScore = Math.round(
      (clarityScore * 0.22) + 
      (contextScore * 0.25) + 
      (structureScore * 0.18) + 
      (specificityScore * 0.20) + 
      (instructionsScore * 0.15)
    );

    const suggestions = [];
    
    if (clarityScore < 75) {
      suggestions.push({
        type: 'warning',
        category: 'Clarity',
        text: 'Add more specific action words and professional terminology.',
        example: 'Use terms like "analyze", "develop", "implement" and avoid vague words like "good" or "nice".'
      });
    }
    
    if (contextScore < 75) {
      suggestions.push({
        type: 'info',
        category: 'Context',
        text: 'Enhance role definition and provide more background context.',
        example: 'Start with "You are a senior expert..." and add industry context or background information.'
      });
    }
    
    if (specificityScore < 75) {
      suggestions.push({
        type: 'warning',
        category: 'Specificity',
        text: 'Add specific output format requirements and measurable criteria.',
        example: 'Include format requirements, timelines, KPIs, or specific deliverables.'
      });
    }
    
    if (structureScore < 75) {
      suggestions.push({
        type: 'error',
        category: 'Structure',
        text: 'Improve organization with clear sections and formatting.',
        example: 'Use bullet points, numbered lists, or section headers like **Objective:** or **Deliverables:**'
      });
    }

    return {
      overallScore,
      scores: { clarity: clarityScore, context: contextScore, structure: structureScore, specificity: specificityScore, instructions: instructionsScore },
      suggestions,
      stats: { words, sentences, characters: text.length }
    };
  };

  const optimizePrompt = () => {
    if (!prompt.trim()) return;
    
    let optimized = prompt;
    const currentAnalysis = analyzePrompt(prompt);
    
    if (currentAnalysis.overallScore >= INDUSTRY_STANDARD) {
      return;
    }
    
    let improved = false;
    
    if (!optimized.toLowerCase().includes('senior') && !optimized.toLowerCase().includes('expert')) {
      if (optimized.toLowerCase().includes('you are')) {
        optimized = optimized.replace(
          /(you are (?:an? )?)(.*?)(\.|,|$)/i,
          '$1world-class senior expert and industry-leading specialist in $2 with 15+ years of proven success and recognized authority$3'
        );
      } else {
        optimized = 'You are a world-class senior expert and industry-leading specialist with 15+ years of proven success and recognized authority in your field. ' + optimized;
      }
      improved = true;
    }
    else if (!optimized.includes('**Primary Objective') && !optimized.toLowerCase().includes('objective:')) {
      optimized += '\n\n**Primary Objective:** Deliver comprehensive, strategic analysis with actionable insights that exceed industry standards and drive measurable results.';
      improved = true;
    }
    else if (!optimized.includes('**Strategic Methodology') && !optimized.toLowerCase().includes('methodology:')) {
      optimized += '\n\n**Strategic Methodology:** Employ systematic, evidence-based analysis using proven frameworks and industry best practices to ensure optimal outcomes and professional excellence.';
      improved = true;
    }
    else if (!optimized.includes('**Output Requirements') && !optimized.toLowerCase().includes('deliverables:')) {
      optimized += '\n\n**Output Requirements:**\n• Executive summary with key insights and recommendations\n• Detailed analysis with supporting evidence and metrics\n• Specific, measurable, actionable recommendations\n• Implementation timeline with milestones and KPIs\n• Risk assessment and mitigation strategies\n• Professional presentation suitable for stakeholder review';
      improved = true;
    }
    else if (!optimized.includes('**Context Integration') && !optimized.toLowerCase().includes('stakeholder')) {
      optimized += '\n\n**Context Integration:** Incorporate current industry trends, market dynamics, regulatory environment, competitive landscape, and stakeholder requirements into all recommendations and analysis.';
      improved = true;
    }
    else if (!optimized.includes('**Quality Standards') && !optimized.toLowerCase().includes('excellence')) {
      optimized += '\n\n**Quality Standards:** Ensure all deliverables meet professional excellence criteria, industry best practices, and provide measurable business value with clear ROI justification.';
      improved = true;
    }
    else if (!optimized.includes('**Success Criteria') && !optimized.toLowerCase().includes('kpi') && !optimized.toLowerCase().includes('metrics')) {
      optimized += '\n\n**Success Criteria:** Define specific KPIs, performance benchmarks, and measurable outcomes with timeline-based milestones for tracking progress and ensuring accountability.';
      improved = true;
    }
    else if (!optimized.includes('**Implementation Framework') && currentAnalysis.overallScore < 85) {
      optimized += '\n\n**Implementation Framework:** Provide detailed action plan with prioritized steps, resource requirements, responsible parties, timeline, and contingency strategies for seamless execution.';
      improved = true;
    }
    else if (currentAnalysis.overallScore < 85) {
      optimized += '\n\n**Professional Standards:** Maintain industry-leading quality throughout all analysis, ensure comprehensive evidence-based recommendations, and deliver strategic insights that drive optimal business outcomes.';
      improved = true;
    }
    
    if (improved) {
      setPrompt(optimized.trim());
    }
  };

  const submitFeedback = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
    setFeedback('');
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  useEffect(() => {
    const newAnalysis = analyzePrompt(prompt);
    setAnalysis(newAnalysis);
    
    if (newAnalysis && prompt.trim() && prompt.trim().length > 20) {
      const timeoutId = setTimeout(() => {
        const recentPrompts = promptHistory.slice(0, 3).map(item => item.prompt);
        if (!recentPrompts.includes(prompt.trim())) {
          saveToHistory(prompt.trim(), newAnalysis);
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [prompt, promptHistory]);

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

  const tabs = [
    { id: 'analyzer', label: 'Analyzer', icon: Brain },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'templates', label: 'Templates', icon: Star },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart }
  ];

  function markLessonComplete(lessonId) {
    setCompletedLessons(prev => {
      const updated = new Set(prev);
      updated.add(lessonId);
      localStorage.setItem('promptAnalyzer_completedLessons', JSON.stringify(Array.from(updated)));
      return updated;
    });
  }

  function tryExample(exampleText) {
    setPrompt(exampleText);
    setActiveTab('analyzer');
  }

  function navigateToTemplates() {
    setActiveTab('templates');
  }

  // History Item Component
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
            onClick={() => toggleFavorite({ prompt: item.prompt, analysis: item.analysis }, 'prompt')}
            className={'p-2 rounded-lg transition-colors ' + (
              isFavorited(item.prompt) 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-white'
            )}
            title={isFavorited(item.prompt) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={'w-4 h-4 ' + (isFavorited(item.prompt) ? 'fill-current' : '')} />
          </button>
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

          {item.analysis.suggestions && item.analysis.suggestions.length > 0 && (
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

  // Favorites Item Component (embedded version)
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
            onClick={() => {
              if (item.type === 'prompt') {
                setPrompt(item.content);
                setActiveTab('analyzer');
              } else {
                applyTemplate({ template: item.content, name: item.title, category: item.category });
              }
            }}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

      <div className="relative z-10">
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Prompt Quality Analyzer</h1>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Feedback
                </button>
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-black/40 backdrop-blur-sm border-t border-white/10">
              <div className="container mx-auto px-4 py-4 space-y-3">
                {tabs.map(tab =>
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ' + (
                      activeTab === tab.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-300 hover:bg-white/10'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'history' && promptHistory.length > 0 && (
                      <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        {promptHistory.length}
                      </span>
                    )}
                    {tab.id === 'favorites' && favorites.length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                )}
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
            </div>
          )}
        </header>

        <div className="hidden md:block bg-black/10 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
                {tabs.map(tab =>
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={'flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium relative ' + (
                      activeTab === tab.id 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {tab.id === 'history' && promptHistory.length > 0 && (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                        {promptHistory.length}
                      </span>
                    )}
                    {tab.id === 'favorites' && favorites.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {activeTab === 'analyzer' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analyze Your Prompts</h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">Get real-time feedback on clarity, specificity, and effectiveness.</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Your Prompt</h3>
                      </div>
                      <div className="flex gap-2">
                        {prompt.trim() && analysis && (
                          <button
                            onClick={() => toggleFavorite({ prompt: prompt.trim(), analysis }, 'prompt')}
                            className={'p-2 rounded-lg transition-colors ' + (
                              isFavorited(prompt.trim()) 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-slate-600 hover:bg-slate-700 text-white'
                            )}
                            title={isFavorited(prompt.trim()) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart className={'w-4 h-4 ' + (isFavorited(prompt.trim()) ? 'fill-current' : '')} />
                          </button>
                        )}
                        {analysis && analysis.overallScore >= INDUSTRY_STANDARD ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            ✨ Optimized!
                          </div>
                        ) : (
                          <button
                            onClick={optimizePrompt}
                            disabled={!prompt.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-slate-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                          >
                            <Wand2 className="w-4 h-4" />
                            ✨ Optimize
                          </button>
                        )}
                        <button
                          onClick={() => copyToClipboard()}
                          disabled={!prompt.trim()}
                          className="p-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                          title="Copy prompt"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here...

Example: You are a senior marketing strategist. Analyze the following campaign data and provide 3 specific recommendations for improving conversion rates. Focus on actionable insights that can be implemented within 30 days."
                      className="w-full h-48 sm:h-64 bg-slate-800/50 border border-slate-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base"
                    />
                    
                    {analysis && (
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
                        <span>{analysis.stats.words} words • {analysis.stats.sentences} sentences</span>
                        {analysis.overallScore >= 70 && (
                          <span className="text-green-400 text-xs">✓ Auto-saved to history</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white text-base sm:text-lg">Pro Tips</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>✨ Start with a clear role: "You are an expert..."</li>
                      <li>🎯 Be specific about output format and length</li>
                      <li>📝 Include examples when possible</li>
                      <li>⚡ Use action words: analyze, create, summarize</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {analysis ? (
                    <>
                      <div className={'bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ' + (analysis.overallScore >= INDUSTRY_STANDARD ? 'border-green-500/50 bg-green-500/5' : 'border-white/10')}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg sm:text-xl font-semibold text-white">Quality Score</h3>
                          <div className="flex items-center gap-2">
                            {getScoreIcon(analysis.overallScore)}
                            {analysis.overallScore >= INDUSTRY_STANDARD && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">Industry Standard</span>}
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className={'text-3xl sm:text-4xl font-bold ' + (analysis.overallScore >= INDUSTRY_STANDARD ? 'text-green-400' : 'text-white')}>{analysis.overallScore}</span>
                            <div className="text-right">
                              <span className="text-slate-400 text-base sm:text-lg">/100</span>
                              {analysis.overallScore >= INDUSTRY_STANDARD ? (
                                <div className="text-green-400 text-xs font-medium mt-1">🏆 Professional Quality</div>
                              ) : (
                                <div className="text-yellow-400 text-xs mt-1">{INDUSTRY_STANDARD - analysis.overallScore} to industry standard</div>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3 sm:h-4 overflow-hidden relative">
                            <div
                              className={'h-full bg-gradient-to-r ' + getScoreColor(analysis.overallScore) + ' transition-all duration-1000 ease-out'}
                              style={{ width: analysis.overallScore + '%' }}
                            />
                            <div
                              className="absolute top-0 w-px h-full bg-yellow-400 opacity-50"
                              style={{ left: '85%' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>Basic</span>
                            <span className="text-yellow-400">Industry Standard ({INDUSTRY_STANDARD})</span>
                            <span>Perfect</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10">
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Detailed Breakdown</h4>
                        <div className="space-y-4">
                          {Object.entries(analysis.scores).map(([key, score]) =>
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white capitalize font-medium text-sm sm:text-base">{key}</span>
                                <span className="text-slate-300 font-mono text-sm sm:text-base">{score}/100</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className={'h-full bg-gradient-to-r ' + getScoreColor(score) + ' transition-all duration-700 ease-out'}
                                  style={{ width: score + '%' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {analysis.suggestions.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10">
                          <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-6 text-purple-400" />
                            <h4 className="text-base sm:text-lg font-semibold text-white">Suggestions</h4>
                          </div>
                          <div className="space-y-4">
                            {analysis.suggestions.map((suggestion, index) =>
                              <div key={index} className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-600">
                                <div className="flex items-start gap-3">
                                  {getSuggestionIcon(suggestion.type)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-white text-sm sm:text-base">{suggestion.category}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs sm:text-sm mb-2">{suggestion.text}</p>
                                    {suggestion.example && (
                                      <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 border-l-2 border-purple-400">
                                        <p className="text-xs text-slate-400 mb-1">Example:</p>
                                        <p className="text-xs sm:text-sm text-slate-300">{suggestion.example}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
                      <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                      <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">Ready to Analyze</h4>
                      <p className="text-slate-500 text-sm sm:text-base">Start typing your prompt to see real-time analysis and suggestions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <LearnTab
              completedLessons={completedLessons}
              onLessonComplete={markLessonComplete}
              onTryExample={tryExample}
              onNavigateToTemplates={navigateToTemplates}
            />
          )}

          {activeTab === 'templates' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Professional Template Library</h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">Choose from our comprehensive collection of expert-crafted prompts across all key business areas.</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {['All', ...getCategories()].map(category =>
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + (
                        selectedCategory === category
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                      )}
                    >
                      {category}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {allTemplates
                  .filter(template => selectedCategory === 'All' || template.category === selectedCategory)
                  .map(template => {
                    const IconComponent = template.icon;
                    const isTemplateFavorited = isFavorited(template.template);
                    return (
                      <div 
                        key={template.id} 
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer hover:transform hover:scale-105"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 bg-purple-600/20 rounded-xl flex-shrink-0">
                              <IconComponent className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-white text-base sm:text-lg">{template.name}</h4>
                              <p className="text-xs text-purple-300 font-medium">{template.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(template, 'template');
                              }}
                              className={'p-2 rounded-lg transition-colors ' + (
                                isTemplateFavorited 
                                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                                  : 'bg-slate-600 hover:bg-slate-700 text-white'
                              )}
                              title={isTemplateFavorited ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart className={'w-4 h-4 ' + (isTemplateFavorited ? 'fill-current' : '')} />
                            </button>
                            <button
                              onClick={() => applyTemplate(template)}
                              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs sm:text-sm transition-all font-medium"
                            >
                              Use
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-300 text-xs sm:text-sm mb-4">{template.description}</p>
                        
                        <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono max-h-20 overflow-hidden relative">
                          {template.template.slice(0, 120) + '...'}
                          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Professional Template</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-slate-400">Expert</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Prompt History</h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
                  Review, reuse, and organize all your analyzed prompts with detailed insights.
                </p>
              </div>
              
              {promptHistory.length > 0 ? (
                <>
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
                        <option value="low">Low (&lt;60)</option>
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
                    onClick={() => setActiveTab('analyzer')}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
                  >
                    <Brain className="w-5 h-5" />
                    Start Analyzing
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
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
                          value={favoritesSearchTerm}
                          onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      
                      <select
                        value={favoritesFilterType}
                        onChange={(e) => setFavoritesFilterType(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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