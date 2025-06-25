import React from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, MessageSquare, Brain, 
  Zap, Copy, Heart, Wand2
} from 'lucide-react';

const AnalyzerTab = ({ 
  prompt,
  setPrompt,
  analysis,
  onOptimize,
  onCopyToClipboard,
  onToggleFavorite,
  isFavorited,
  INDUSTRY_STANDARD = 85
}) => {
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analyze Your Prompts</h2>
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
              <div className="flex gap-2">
                {prompt.trim() && analysis && (
                  <button
                    onClick={() => onToggleFavorite({ prompt: prompt.trim(), analysis }, 'prompt')}
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
                    onClick={onOptimize}
                    disabled={!prompt.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-slate-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    ✨ Optimize
                  </button>
                )}
                <button
                  onClick={() => onCopyToClipboard(prompt)}
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
              <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">Ready to Analyze</h4>
              <p className="text-slate-500 text-sm sm:text-base">Start typing your prompt to see real-time analysis and suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzerTab;