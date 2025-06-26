import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, MessageSquare, Brain, 
  Zap, Copy, Wand2, Coffee, MessageCircle, RotateCcw, Trash2, Download, History, ChevronDown,
  Settings, Palette, Plus
} from 'lucide-react';

// Components
import FeedbackModal from './FeedbackModal';
import { CopySuccessNotification, FeedbackSubmittedNotification } from './Notifications';

// Utils
import { analyzePrompt } from '../utils/promptAnalyzer';
import { optimizePrompt } from '../utils/promptOptimizer';

const INDUSTRY_STANDARD = 85;

function PromptCraft() {
  const [prompt, setPrompt] = useState('');
  const [previousPrompt, setPreviousPrompt] = useState(''); // For undo functionality
  const [analysis, setAnalysis] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]); // Session prompt history
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  
  // Notifications
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Simple word limit configuration
  const MAX_WORDS = 300;

  // Optimize prompt for specific AI model
  const optimizeForModel = (originalPrompt, targetModel) => {
    if (!originalPrompt.trim()) return originalPrompt;
    
    const modelConfig = aiModels[targetModel];
    let optimizedPrompt = originalPrompt.trim();
    
    // Remove existing model-specific prefixes from other models
    const prefixesToRemove = Object.values(aiModels).map(model => model.style.prefix);
    prefixesToRemove.forEach(prefix => {
    const cleanPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\  // Handle AI model change with visual feedback')
    const handleModelChange = (newModel) => {
    const oldModel = aiModels[selectedAIModel];
    const newModelInfo = aiModels[newModel];
    
    setSelectedAIModel(newModel);
    
    // Show notification
    setModelChangeNotification(`Switched to ${newModelInfo.name} (Max: ${newModelInfo.maxWords} words)`);
    setTimeout(() => setModelChangeNotification(''), 3000);
    
    // If current prompt exceeds new model's limits, truncate it
    if (prompt.trim()) {
      const words = prompt.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length > newModelInfo.maxWords) {
        const limitedWords = words.slice(0, newModelInfo.maxWords);
        const limitedText = limitedWords.join(' ');
        setPrompt(limitedText);
      }
    }
  };'); // Escape regex chars
      const regex = new RegExp(`^${cleanPrefix}\\s*`, 'i');
      optimizedPrompt = optimizedPrompt.replace(regex, '');
    });
    
    // Remove existing suffixes
    const suffixesToRemove = Object.values(aiModels).map(model => model.style.suffix);
    suffixesToRemove.forEach(suffix => {
      if (suffix && optimizedPrompt.includes(suffix.trim())) {
        optimizedPrompt = optimizedPrompt.replace(suffix.trim(), '').trim();
      }
    });
    
    // Clean up the core prompt (remove any "You are" beginnings if they're generic)
    optimizedPrompt = optimizedPrompt.replace(/^(You are an? )?(expert )?AI assistant\.?\s*/i, '');
    optimizedPrompt = optimizedPrompt.replace(/^(Please )?/i, '');
    
    // Build the optimized prompt with model-specific elements
    let newPrompt = modelConfig.style.prefix + ' ' + optimizedPrompt;
    
    // Add model-specific suffix
    if (modelConfig.style.suffix) {
      newPrompt += modelConfig.style.suffix;
    }
    
    // Ensure it fits within word limits
    const words = newPrompt.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length > modelConfig.maxWords) {
      const limitedWords = words.slice(0, modelConfig.maxWords);
      newPrompt = limitedWords.join(' ');
    }
    
    return newPrompt;
  };

  // Handle AI model change with prompt optimization
  const handleModelChange = (newModel) => {
    const oldModel = aiModels[selectedAIModel];
    const newModelInfo = aiModels[newModel];
    
    setSelectedAIModel(newModel);
    
    // Optimize prompt for the new model
    if (prompt.trim()) {
      const optimizedPrompt = optimizeForModel(prompt, newModel);
      setPrompt(optimizedPrompt);
      
      // Show notification about optimization
      setModelChangeNotification(`Optimized for ${newModelInfo.name} - Prompt adapted for better ${newModelInfo.style.emphasis}`);
    } else {
      setModelChangeNotification(`Switched to ${newModelInfo.name} (Max: ${newModelInfo.maxWords} words)`);
    }
    
    setTimeout(() => setModelChangeNotification(''), 4000);
  };
  const detectTone = (text) => {
    if (!text.trim()) return null;
    
    const lowerText = text.toLowerCase();
    
    // Professional indicators
    const professionalWords = ['strategic', 'comprehensive', 'stakeholder', 'framework', 'methodology', 'implementation', 'deliverable', 'analysis', 'optimization', 'professional', 'industry', 'expertise'];
    const professionalCount = professionalWords.filter(word => lowerText.includes(word)).length;
    
    // Technical indicators
    const technicalWords = ['algorithm', 'api', 'database', 'configuration', 'architecture', 'implementation', 'technical', 'system', 'specification', 'protocol', 'integration'];
    const technicalCount = technicalWords.filter(word => lowerText.includes(word)).length;
    
    // Creative indicators  
    const creativeWords = ['creative', 'innovative', 'imaginative', 'artistic', 'design', 'inspiration', 'brainstorm', 'storytelling', 'narrative', 'vision'];
    const creativeCount = creativeWords.filter(word => lowerText.includes(word)).length;
    
    // Casual indicators
    const casualWords = ['hey', 'help me', 'can you', 'please', 'thanks', 'simple', 'easy', 'quick'];
    const casualCount = casualWords.filter(word => lowerText.includes(word)).length;
    
    // Determine dominant tone
    const scores = {
      Professional: professionalCount,
      Technical: technicalCount,
      Creative: creativeCount,
      Casual: casualCount
    };
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return { tone: 'Neutral', confidence: 'low' };
    
    const detectedTone = Object.keys(scores).find(key => scores[key] === maxScore);
    const confidence = maxScore >= 3 ? 'high' : maxScore >= 2 ? 'medium' : 'low';
    
    return { tone: detectedTone, confidence };
  };

  // Quick fix functions
  const quickFixes = {
    addSpecificity: () => {
      if (!prompt.trim()) return;
      const enhanced = prompt + '\n\n**Specific Requirements:**\n• Target audience: [SPECIFY]\n• Output format: [SPECIFY]\n• Key metrics: [SPECIFY]';
      setPrompt(enhanced);
    },
    improveStructure: () => {
      if (!prompt.trim()) return;
      const enhanced = `**Role:** You are an expert professional.\n\n**Task:** ${prompt}\n\n**Deliverables:**\n• [Specify expected outputs]\n• [Include success criteria]`;
      setPrompt(enhanced);
    },
    addContext: () => {
      if (!prompt.trim()) return;
      const enhanced = prompt + '\n\n**Context:**\n• Industry: [SPECIFY]\n• Background: [PROVIDE RELEVANT CONTEXT]\n• Constraints: [LIST ANY LIMITATIONS]';
      setPrompt(enhanced);
    },
    addExamples: () => {
      if (!prompt.trim()) return;
      const enhanced = prompt + '\n\n**Example:**\n[Provide a specific example of what you want]\n\n**Note:** Follow this format and style.';
      setPrompt(enhanced);
    }
  };

  // Get quick fix suggestions based on analysis
  const getQuickFixSuggestions = () => {
    if (!analysis) return [];
    
    const suggestions = [];
    
    if (analysis.scores.specificity < 70) {
      suggestions.push({ key: 'addSpecificity', label: 'Add Specificity', action: quickFixes.addSpecificity });
    }
    if (analysis.scores.structure < 70) {
      suggestions.push({ key: 'improveStructure', label: 'Improve Structure', action: quickFixes.improveStructure });
    }
    if (analysis.scores.context < 70) {
      suggestions.push({ key: 'addContext', label: 'Add Context', action: quickFixes.addContext });
    }
    if (analysis.scores.clarity < 70 && !prompt.toLowerCase().includes('example')) {
      suggestions.push({ key: 'addExamples', label: 'Add Examples', action: quickFixes.addExamples });
    }
    
    return suggestions.slice(0, 3); // Show max 3 suggestions
  };

  // Check word limits
  const checkLimits = () => {
    if (!prompt.trim()) return null;
    
    const words = prompt.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = prompt.length;
    
    const wordStatus = wordCount >= MAX_WORDS ? 'exceeded' : 
                      wordCount >= MAX_WORDS * 0.9 ? 'warning' : 'good';
    
    return {
      words: { count: wordCount, max: MAX_WORDS, status: wordStatus },
      chars: { count: charCount, status: 'good' }
    };
  };

  // Handle prompt change with word limit enforcement
  const handlePromptChange = (e) => {
    const newValue = e.target.value;
    const currentModel = aiModels[selectedAIModel];
    const words = newValue.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Enforce word limit - cut at exactly max words
    if (words.length > currentModel.maxWords) {
      // Take only the first maxWords and rejoin
      const limitedWords = words.slice(0, currentModel.maxWords);
      const limitedText = limitedWords.join(' ');
      setPrompt(limitedText);
    } else {
      setPrompt(newValue);
    }
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

  // Auto-save functionality (save only, don't restore)
  const saveToLocalStorage = (promptText) => {
    try {
      localStorage.setItem('promptcraft_draft', promptText);
      localStorage.setItem('promptcraft_last_saved', new Date().toISOString());
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  // Load session history only (not the draft)
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem('promptcraft_session_history');
      
      if (savedHistory) {
        setSessionHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load from sessionStorage:', err);
    }
  }, []);

  // Auto-save when prompt changes
  useEffect(() => {
    if (prompt.trim()) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage(prompt);
      }, 1000); // Save after 1 second of no typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [prompt]);

  // Add to session history (using sessionStorage)
  const addToSessionHistory = (promptText) => {
    if (!promptText.trim() || promptText.length < 10) return;
    
    const newHistoryItem = {
      id: Date.now(),
      text: promptText,
      preview: promptText.slice(0, 60) + (promptText.length > 60 ? '...' : ''),
      timestamp: new Date().toISOString()
    };
    
    setSessionHistory(prev => {
      const filtered = prev.filter(item => item.text !== promptText);
      const updated = [newHistoryItem, ...filtered].slice(0, 5); // Keep only last 5
      
      try {
        sessionStorage.setItem('promptcraft_session_history', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save history:', err);
      }
      
      return updated;
    });
  };

  // Export as text file
  const exportAsText = () => {
    if (!prompt.trim()) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `prompt-craft-${timestamp}.txt`;
    
    const content = `Prompt Craft Export
Generated: ${new Date().toLocaleString()}
${analysis ? `Quality Score: ${analysis.overallScore}/100` : ''}

===========================================
PROMPT CONTENT:
===========================================

${prompt}

${analysis && analysis.suggestions.length > 0 ? `
===========================================
SUGGESTIONS:
===========================================

${analysis.suggestions.map((s, i) => `${i + 1}. ${s.category}: ${s.text}`).join('\n')}
` : ''}

---
Generated by Prompt Craft - https://promptcraft.app`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load prompt from history
  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem.text);
    setShowHistoryDropdown(false);
  };

  // Clear/Reset functionality
  const clearPrompt = () => {
    setPrompt('');
    setPreviousPrompt('');
    // Clear the auto-saved draft
    localStorage.removeItem('promptcraft_draft');
  };

  // Undo optimization functionality
  const undoOptimization = () => {
    if (previousPrompt) {
      setPrompt(previousPrompt);
      setPreviousPrompt('');
    }
  };

  // Optimization handler
  const handleOptimize = () => {
    if (!prompt.trim()) return;
    
    // Add current prompt to session history before optimizing
    addToSessionHistory(prompt);
    
    // Store current prompt for undo functionality
    setPreviousPrompt(prompt);
    
    const optimizationResult = optimizePrompt(prompt, INDUSTRY_STANDARD);
    
    if (optimizationResult) {
      setPrompt(optimizationResult.optimizedPrompt);
    }
  };

  // Get word/character recommendations
  const getRecommendations = () => {
    if (!analysis) return null;
    
    const words = analysis.stats.words;
    const chars = analysis.stats.characters;
    
    // Word recommendations based on MAX_WORDS
    const optimalWords = Math.floor(MAX_WORDS * 0.7); // 70% of max (210 words)
    const wordStatus = words >= MAX_WORDS ? 'exceeded' : 
                      words >= optimalWords ? 'optimal' : 
                      words >= 20 ? 'good' : 'too-short';
    
    const charStatus = chars < 100 ? 'too-short' : chars > 2000 ? 'too-long' : 'good';
    
    return {
      words: { 
        count: words, 
        status: wordStatus, 
        recommendation: `${optimalWords}-${MAX_WORDS} words optimal` 
      },
      chars: { 
        count: chars, 
        status: charStatus, 
        recommendation: '100-2000 characters optimal' 
      }
    };
  };

  // Feedback submission
  const submitFeedback = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
    setFeedback('');
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  // Real-time analysis effect
  useEffect(() => {
    const newAnalysis = analyzePrompt(prompt);
    setAnalysis(newAnalysis);
  }, [prompt]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHistoryDropdown && !event.target.closest('.history-dropdown')) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHistoryDropdown]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Prompt Craft
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Feedback
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Craft Better Prompts</h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                Get real-time feedback on clarity, specificity, and effectiveness.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Your Prompt</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* Session History Dropdown */}
                      {sessionHistory.length > 0 && (
                        <div className="relative history-dropdown">
                          <button
                            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                            className="flex items-center gap-1 p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            title="Recent prompts"
                          >
                            <History className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {showHistoryDropdown && (
                            <div className="absolute top-full right-0 mt-1 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                              <div className="p-2">
                                <div className="text-xs text-slate-400 mb-2 px-2">Recent Session Prompts</div>
                                {sessionHistory.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="w-full text-left p-2 hover:bg-slate-700 rounded text-sm text-slate-300 border-b border-slate-700 last:border-b-0"
                                  >
                                    <div className="font-medium truncate">{item.preview}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {new Date(item.timestamp).toLocaleTimeString()}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Export Button */}
                      <button
                        onClick={exportAsText}
                        disabled={!prompt.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                        title="Export as text file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {/* Undo Button */}
                      {previousPrompt && (
                        <button
                          onClick={undoOptimization}
                          className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          title="Undo last optimization"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Optimize Button */}
                      {analysis && analysis.overallScore >= INDUSTRY_STANDARD ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          ✨ Optimized!
                        </div>
                      ) : (
                        <button
                          onClick={handleOptimize}
                          disabled={!prompt.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-slate-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                        >
                          <Wand2 className="w-4 h-4" />
                          ✨ Optimize
                        </button>
                      )}
                      
                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(prompt)}
                        disabled={!prompt.trim()}
                        className="p-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                        title="Copy prompt"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      {/* Clear Button */}
                      <button
                        onClick={clearPrompt}
                        disabled={!prompt.trim()}
                        className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                        title="Clear prompt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Word Limit Warning */}
                  {(() => {
                    const limits = checkLimits();
                    if (!limits) return null;
                    
                    const isNearLimit = limits.words.status === 'warning';
                    const isAtLimit = limits.words.status === 'exceeded';
                    
                    if (isNearLimit || isAtLimit) {
                      return (
                        <div className={`mb-4 p-3 rounded-lg border ${
                          isAtLimit 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        }`}>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              {isAtLimit 
                                ? `Word limit reached!` 
                                : `Approaching word limit`
                              }
                            </span>
                          </div>
                          <div className="text-xs mt-1">
                            Words: {limits.words.count}/{limits.words.max}
                            {isAtLimit && ' • Further typing blocked'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Enter your prompt here...

Example: You are a senior marketing strategist. Analyze the following campaign data and provide 3 specific recommendations for improving conversion rates. Focus on actionable insights that can be implemented within 30 days."
                    className="w-full h-48 sm:h-64 bg-slate-800/50 border border-slate-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base"
                  />
                  
                  {analysis && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-slate-400">
                          <span>{analysis.stats.words} words • {analysis.stats.sentences} sentences • {analysis.stats.characters} characters</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Tone Detector */}
                          {(() => {
                            const toneInfo = detectTone(prompt);
                            if (!toneInfo) return null;
                            
                            const toneColors = {
                              Professional: 'bg-blue-500/20 text-blue-400',
                              Technical: 'bg-purple-500/20 text-purple-400',
                              Creative: 'bg-pink-500/20 text-pink-400',
                              Casual: 'bg-green-500/20 text-green-400',
                              Neutral: 'bg-slate-500/20 text-slate-400'
                            };
                            
                            return (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${toneColors[toneInfo.tone]}`}>
                                <Palette className="w-3 h-3" />
                                <span>{toneInfo.tone}</span>
                              </div>
                            );
                          })()}
                          
                          {prompt.trim() && (
                            <div className="text-xs text-green-400 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Draft saved
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Fix Buttons */}
                      {(() => {
                        const quickFixSuggestions = getQuickFixSuggestions();
                        if (quickFixSuggestions.length === 0) return null;
                        
                        return (
                          <div className="space-y-2">
                            <div className="text-xs text-slate-400">Quick Fixes:</div>
                            <div className="flex flex-wrap gap-2">
                              {quickFixSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion.key}
                                  onClick={suggestion.action}
                                  className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 rounded-full text-xs transition-colors border border-purple-500/30"
                                >
                                  <Plus className="w-3 h-3" />
                                  {suggestion.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      
                      {(() => {
                        const recommendations = getRecommendations();
                        if (!recommendations) return null;
                        
                        return (
                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                              recommendations.words.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                              recommendations.words.status === 'good' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              <span>📝 {recommendations.words.recommendation}</span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                              recommendations.chars.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                              recommendations.chars.status === 'good' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              <span>📏 {recommendations.chars.recommendation}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Pro Tips */}
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
                    <li>📏 Keep prompts under 300 words for optimal performance</li>
                    <li>🔧 Use quick fix buttons for instant improvements</li>
                  </ul>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="space-y-6">
                {analysis ? (
                  <>
                    {/* Quality Score */}
                    <div className={'bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ' + (analysis.overallScore >= INDUSTRY_STANDARD ? 'border-green-500/50 bg-green-500/5' : 'border-white/10')}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Quality Score</h3>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(analysis.overallScore)}
                          {analysis.overallScore >= INDUSTRY_STANDARD && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">
                              Industry Standard
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className={'text-3xl sm:text-4xl font-bold ' + (analysis.overallScore >= INDUSTRY_STANDARD ? 'text-green-400' : 'text-white')}>
                            {analysis.overallScore}
                          </span>
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

                    {/* Detailed Breakdown */}
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

                    {/* Suggestions */}
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
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">Ready to Craft</h4>
                    <p className="text-slate-500 text-sm sm:text-base">Start typing your prompt to see real-time analysis and suggestions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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

export default PromptCraft;