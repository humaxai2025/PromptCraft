import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const AIEnhancer = ({ prompt, onPromptUpdate, className = "" }) => {
  const [aiState, setAiState] = useState({
    loading: false,
    category: null,
    tone: null,
    suggestions: [],
    enhanced: null
  });

  // Simplified AI service calls (can be replaced with real Hugging Face API later)
  const analyzePrompt = async (text) => {
    if (!text.trim() || text.length < 20) return;
    
    setAiState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // AI analysis using simple but effective logic
      const analysis = {
        category: detectCategory(text),
        tone: detectTone(text),
        suggestions: generateSuggestions(text),
      };
      
      setAiState(prev => ({ 
        ...prev, 
        ...analysis,
        loading: false 
      }));
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiState(prev => ({ ...prev, loading: false }));
    }
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setAiState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate AI enhancement processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const enhanced = generateEnhancement(prompt);
      setAiState(prev => ({ ...prev, enhanced, loading: false }));
      
      if (enhanced && onPromptUpdate) {
        onPromptUpdate(enhanced);
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
      setAiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Trigger analysis when prompt changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => analyzePrompt(prompt), 1000);
    return () => clearTimeout(timeoutId);
  }, [prompt]);

  // AI Logic Functions (replace with Hugging Face API calls)
  const detectCategory = (text) => {
    const keywords = {
      'Development': ['code', 'programming', 'software', 'debug', 'function', 'api', 'database', 'developer', 'algorithm', 'javascript', 'python', 'react', 'css', 'html'],
      'Business': ['strategy', 'market', 'revenue', 'customer', 'growth', 'ROI', 'KPI', 'sales', 'profit', 'business', 'company', 'management'],
      'Creative': ['write', 'story', 'creative', 'design', 'artistic', 'poem', 'content', 'blog', 'article', 'novel', 'script', 'copy'],
      'Education': ['teach', 'explain', 'learn', 'student', 'course', 'lesson', 'tutorial', 'education', 'training', 'knowledge'],
      'Data Science': ['data', 'analysis', 'statistics', 'machine learning', 'AI', 'dataset', 'model', 'prediction', 'analytics'],
      'Marketing': ['marketing', 'campaign', 'brand', 'social media', 'advertising', 'promotion', 'audience', 'engagement']
    };
    
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let category = 'General';
    
    Object.entries(keywords).forEach(([cat, words]) => {
      const score = words.filter(word => lowerText.includes(word)).length;
      if (score > maxScore) {
        maxScore = score;
        category = cat;
      }
    });
    
    return { 
      name: category, 
      confidence: Math.min(Math.max(maxScore * 0.25, 0.3), 0.95) 
    };
  };

  const detectTone = (text) => {
    const lowerText = text.toLowerCase();
    
    // Professional tone indicators
    if ((text.includes('You are') && text.includes('expert')) || 
        lowerText.includes('professional') || 
        lowerText.includes('strategic')) {
      return { name: 'Professional', confidence: 0.9 };
    }
    
    // Technical tone
    if (lowerText.includes('technical') || 
        lowerText.includes('specific') || 
        lowerText.includes('detailed')) {
      return { name: 'Technical', confidence: 0.85 };
    }
    
    // Friendly/Polite tone
    if (lowerText.includes('please') || 
        lowerText.includes('help') || 
        lowerText.includes('thank')) {
      return { name: 'Friendly', confidence: 0.8 };
    }
    
    // Urgent tone
    if (lowerText.includes('urgent') || 
        lowerText.includes('immediate') || 
        text.includes('!')) {
      return { name: 'Urgent', confidence: 0.85 };
    }
    
    // Creative tone
    if (lowerText.includes('creative') || 
        lowerText.includes('imagine') || 
        lowerText.includes('innovative')) {
      return { name: 'Creative', confidence: 0.8 };
    }
    
    return { name: 'Neutral', confidence: 0.7 };
  };

  const generateSuggestions = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    
    // Role definition suggestion
    if (!lowerText.includes('you are')) {
      suggestions.push({ 
        type: 'info', 
        text: 'Consider starting with a clear role definition like "You are an expert..."' 
      });
    }
    
    // Length suggestions
    if (text.length < 50) {
      suggestions.push({ 
        type: 'warning', 
        text: 'Add more specific details and context to improve clarity' 
      });
    }
    
    // Example suggestion
    if (!text.includes('example') && text.length > 100) {
      suggestions.push({ 
        type: 'info', 
        text: 'Including examples could significantly improve output quality' 
      });
    }
    
    // Structure suggestion
    if (text.split('.').length < 2 && text.length > 80) {
      suggestions.push({ 
        type: 'warning', 
        text: 'Break down into multiple clear sentences for better readability' 
      });
    }
    
    // Specificity suggestions
    if (!lowerText.includes('specific') && !lowerText.includes('detailed')) {
      suggestions.push({ 
        type: 'info', 
        text: 'Add specific requirements or output format expectations' 
      });
    }
    
    // Context suggestion
    if (text.length > 50 && !lowerText.includes('context') && !lowerText.includes('background')) {
      suggestions.push({ 
        type: 'info', 
        text: 'Consider adding relevant context or background information' 
      });
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const generateEnhancement = (text) => {
    let enhanced = text.trim();
    
    // Add professional role if missing
    if (!text.toLowerCase().includes('you are')) {
      const category = detectCategory(text);
      const roleMap = {
        'Development': 'You are a senior software engineer and technical expert.',
        'Business': 'You are a strategic business consultant with extensive industry experience.',
        'Creative': 'You are a creative professional with expertise in content development.',
        'Education': 'You are an experienced educator and subject matter expert.',
        'Data Science': 'You are a data scientist with expertise in analytics and machine learning.',
        'Marketing': 'You are a marketing strategist with deep industry knowledge.'
      };
      
      const role = roleMap[category.name] || 'You are a professional expert assistant.';
      enhanced = `${role} ${enhanced}`;
    }
    
    // Improve structure for longer prompts
    if (!enhanced.includes('\n') && enhanced.length > 120) {
      const sentences = enhanced.split('. ');
      if (sentences.length > 2) {
        const firstPart = sentences.slice(0, 2).join('. ') + '.';
        const secondPart = sentences.slice(2).join('. ');
        enhanced = `${firstPart}\n\n${secondPart}`;
      }
    }
    
    // Add output specifications if missing
    if (!enhanced.toLowerCase().includes('provide') && 
        !enhanced.toLowerCase().includes('format') && 
        enhanced.length > 50) {
      enhanced += '\n\nPlease provide detailed, well-structured responses with specific examples and actionable insights.';
    }
    
    // Add professional standards
    if (!enhanced.toLowerCase().includes('professional') && 
        !enhanced.toLowerCase().includes('quality')) {
      enhanced += ' Ensure professional quality and industry-standard best practices.';
    }
    
    return enhanced;
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      default: return 'text-slate-300';
    }
  };

  if (!prompt.trim()) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Enhancement Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={enhancePrompt}
          disabled={aiState.loading || !prompt.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {aiState.loading ? 'AI Working...' : '✨ AI Enhance'}
        </button>
        
        {aiState.loading && (
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            Analyzing with AI...
          </div>
        )}
      </div>

      {/* AI Insights Panel */}
      {(aiState.category || aiState.tone || aiState.suggestions.length > 0) && !aiState.loading && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            AI Insights
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {aiState.category && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Category</span>
                </div>
                <p className="text-white text-sm font-semibold">{aiState.category.name}</p>
                <p className="text-slate-400 text-xs">
                  {Math.round(aiState.category.confidence * 100)}% confidence
                </p>
              </div>
            )}

            {aiState.tone && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Tone</span>
                </div>
                <p className="text-white text-sm font-semibold">{aiState.tone.name}</p>
                <p className="text-slate-400 text-xs">
                  {Math.round(aiState.tone.confidence * 100)}% confidence
                </p>
              </div>
            )}
          </div>

          {aiState.suggestions.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                {aiState.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white/5 rounded border border-white/5">
                    {getSuggestionIcon(suggestion.type)}
                    <span className={`text-xs leading-relaxed ${getSuggestionColor(suggestion.type)}`}>
                      {suggestion.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 text-xs text-slate-500 text-center">
            🤖 AI-powered analysis • Upgrade to Hugging Face API for enhanced features
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEnhancer;