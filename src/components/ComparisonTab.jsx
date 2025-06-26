import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft,
  TrendingUp, TrendingDown, Minus, Copy, RotateCcw, 
  Target, Zap, Eye, BarChart3, MessageSquare, Star,
  Award, ThumbsUp, RefreshCw, Download, Share2, Sparkles
} from 'lucide-react';

const ComparisonTab = ({ 
  originalPrompt, 
  optimizedPrompt, 
  originalAnalysis, 
  optimizedAnalysis,
  onAcceptOptimized,
  onRevertToOriginal,
  onCopySuccess,
  onLoadPrompt
}) => {
  const [selectedView, setSelectedView] = useState('side-by-side'); // side-by-side, original, optimized

  if (!originalPrompt || !optimizedPrompt || !originalAnalysis || !optimizedAnalysis) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Before & After Comparison</h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
            Optimize a prompt to see the detailed before and after comparison.
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg sm:text-xl font-semibold text-slate-400 mb-2">No Comparison Available</h4>
          <p className="text-slate-500 text-sm sm:text-base mb-6">
            Go to the Analyzer tab, enter a prompt, and click "Optimize" to see the before and after comparison.
          </p>
          <button
            onClick={() => onLoadPrompt('')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-medium"
          >
            <MessageSquare className="w-5 h-5" />
            Start Analyzing
          </button>
        </div>
      </div>
    );
  }

  const improvement = optimizedAnalysis.overallScore - originalAnalysis.overallScore;
  const isImprovement = improvement > 0;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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

  const getImprovementIcon = (diff) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getImprovementColor = (diff) => {
    if (diff > 0) return 'text-green-400';
    if (diff < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const ScoreComparison = ({ title, original, optimized, metric = '' }) => {
    const diff = optimized - original;
    return (
      <div className="bg-slate-800/50 rounded-xl p-4">
        <h5 className="text-white font-medium mb-3 text-sm">{title}</h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">Before</span>
            <span className="text-white font-mono text-sm">{original}{metric}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">After</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">{optimized}{metric}</span>
              {diff !== 0 && (
                <div className={`flex items-center gap-1 ${getImprovementColor(diff)}`}>
                  {getImprovementIcon(diff)}
                  <span className="text-xs font-medium">
                    {diff > 0 ? '+' : ''}{diff}{metric}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PromptCard = ({ title, prompt, analysis, type, icon: Icon }) => (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${
      type === 'original' ? 'border-red-500/30' : 'border-green-500/30'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            type === 'original' ? 'bg-red-600/20' : 'bg-green-600/20'
          }`}>
            <Icon className={`w-5 h-5 ${
              type === 'original' ? 'text-red-400' : 'text-green-400'
            }`} />
          </div>
          <div>
            <h4 className="text-white font-semibold text-base">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
              {getScoreIcon(analysis.overallScore)}
              <span className="text-white font-bold text-lg">{analysis.overallScore}</span>
              <span className="text-slate-400 text-sm">/100</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(prompt)}
          className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          title="Copy prompt"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
        <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
          {prompt}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className="text-white font-bold">{analysis.stats.words}</div>
          <div className="text-slate-400">Words</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{analysis.stats.sentences}</div>
          <div className="text-slate-400">Sentences</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Before & After Comparison</h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          See how optimization transformed your prompt with detailed analysis and improvements.
        </p>
        
        {/* Improvement Summary */}
        <div className="max-w-md mx-auto">
          <div className={`bg-gradient-to-r p-4 rounded-2xl border ${
            isImprovement 
              ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' 
              : 'from-slate-500/10 to-slate-600/10 border-slate-500/30'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              {isImprovement ? (
                <Award className="w-6 h-6 text-green-400" />
              ) : (
                <BarChart3 className="w-6 h-6 text-slate-400" />
              )}
              <span className={`text-2xl font-bold ${
                isImprovement ? 'text-green-400' : 'text-slate-400'
              }`}>
                {improvement > 0 ? '+' : ''}{improvement} points
              </span>
            </div>
            <p className={`text-sm ${
              isImprovement ? 'text-green-300' : 'text-slate-300'
            }`}>
              {isImprovement ? '🎉 Quality Improvement' : 'Analysis Complete'}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 p-1 bg-black/20 rounded-xl">
          {[
            { id: 'side-by-side', label: 'Side by Side', icon: Eye },
            { id: 'original', label: 'Original Only', icon: ArrowLeft },
            { id: 'optimized', label: 'Optimized Only', icon: ArrowRight }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                selectedView === view.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison View */}
      <div className="space-y-6">
        {/* Prompts Comparison */}
        {selectedView === 'side-by-side' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <PromptCard
              title="Original Prompt"
              prompt={originalPrompt}
              analysis={originalAnalysis}
              type="original"
              icon={MessageSquare}
            />
            <PromptCard
              title="Optimized Prompt"
              prompt={optimizedPrompt}
              analysis={optimizedAnalysis}
              type="optimized"
              icon={Sparkles}
            />
          </div>
        )}

        {selectedView === 'original' && (
          <div className="max-w-4xl mx-auto">
            <PromptCard
              title="Original Prompt"
              prompt={originalPrompt}
              analysis={originalAnalysis}
              type="original"
              icon={MessageSquare}
            />
          </div>
        )}

        {selectedView === 'optimized' && (
          <div className="max-w-4xl mx-auto">
            <PromptCard
              title="Optimized Prompt"
              prompt={optimizedPrompt}
              analysis={optimizedAnalysis}
              type="optimized"
              icon={Sparkles}
            />
          </div>
        )}

        {/* Detailed Analysis Comparison */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Detailed Analysis Comparison
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <ScoreComparison
              title="Overall Score"
              original={originalAnalysis.overallScore}
              optimized={optimizedAnalysis.overallScore}
            />
            <ScoreComparison
              title="Word Count"
              original={originalAnalysis.stats.words}
              optimized={optimizedAnalysis.stats.words}
            />
            <ScoreComparison
              title="Sentences"
              original={originalAnalysis.stats.sentences}
              optimized={optimizedAnalysis.stats.sentences}
            />
          </div>

          {/* Score Breakdown */}
          <div className="bg-slate-800/30 rounded-xl p-4">
            <h4 className="text-white font-medium mb-4">Quality Metrics Breakdown</h4>
            <div className="space-y-3">
              {Object.keys(originalAnalysis.scores).map(metric => {
                const originalScore = originalAnalysis.scores[metric];
                const optimizedScore = optimizedAnalysis.scores[metric];
                const diff = optimizedScore - originalScore;
                
                return (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white capitalize font-medium">{metric}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">{originalScore}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-white font-bold">{optimizedScore}</span>
                        {diff !== 0 && (
                          <div className={`flex items-center gap-1 ${getImprovementColor(diff)}`}>
                            {getImprovementIcon(diff)}
                            <span className="text-xs">
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-700"
                          style={{ width: `${originalScore}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${optimizedScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Improvements */}
        {optimizedAnalysis.suggestions.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Key Improvements Made
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {optimizedAnalysis.suggestions.slice(0, 4).map((suggestion, index) => (
                <div key={index} className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-green-300 font-medium text-sm mb-1">{suggestion.category}</h5>
                      <p className="text-green-100 text-xs">{suggestion.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onAcceptOptimized(optimizedPrompt)}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <ThumbsUp className="w-4 h-4" />
              Accept Optimized
            </button>
            <button
              onClick={() => onRevertToOriginal(originalPrompt)}
              className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Revert to Original
            </button>
            <button
              onClick={() => copyToClipboard(`ORIGINAL:\n${originalPrompt}\n\nOPTIMIZED:\n${optimizedPrompt}`)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Both
            </button>
            <button
              onClick={() => {
                // Trigger re-optimization
                onLoadPrompt(optimizedPrompt);
              }}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Re-optimize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTab;