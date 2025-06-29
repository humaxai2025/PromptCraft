// utils/huggingfaceServices.js
const HF_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

class HuggingFaceService {
  async query(model, data) {
    const response = await fetch(`${HF_API_URL}/${model}`, {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // 1. AUTO-CATEGORIZATION - Automatically categorize prompts
  async categorizePrompt(promptText) {
    try {
      const result = await this.query('facebook/bart-large-mnli', {
        inputs: promptText,
        parameters: {
          candidate_labels: [
            'software development', 'web development', 'data science', 'cybersecurity',
            'creative writing', 'business analysis', 'marketing', 'education',
            'healthcare', 'finance', 'legal advice', 'personal development',
            'language learning', 'technical documentation', 'project management'
          ]
        }
      });
      
      return {
        category: result.labels[0],
        confidence: result.scores[0],
        allCategories: result.labels.slice(0, 3)
      };
    } catch (error) {
      console.error('Categorization failed:', error);
      return null;
    }
  }

  // 2. INTENT DETECTION - Understand what user wants to achieve
  async detectIntent(promptText) {
    try {
      const result = await this.query('microsoft/DialoGPT-medium', {
        inputs: `Analyze this prompt and identify the main intent: "${promptText}"`
      });
      
      const intentResult = await this.query('facebook/bart-large-mnli', {
        inputs: promptText,
        parameters: {
          candidate_labels: [
            'create content', 'analyze data', 'solve problem', 'explain concept',
            'generate code', 'write document', 'provide advice', 'answer questions',
            'summarize information', 'translate text', 'review content', 'brainstorm ideas'
          ]
        }
      });
      
      return {
        intent: intentResult.labels[0],
        confidence: intentResult.scores[0],
        description: `This prompt aims to ${intentResult.labels[0].toLowerCase()}`
      };
    } catch (error) {
      console.error('Intent detection failed:', error);
      return null;
    }
  }

  // 3. TONE ANALYSIS - Enhanced tone detection
  async analyzeTone(promptText) {
    try {
      const result = await this.query('cardiffnlp/twitter-roberta-base-sentiment-latest', {
        inputs: promptText
      });
      
      const toneResult = await this.query('facebook/bart-large-mnli', {
        inputs: promptText,
        parameters: {
          candidate_labels: [
            'professional', 'casual', 'formal', 'friendly', 'authoritative',
            'technical', 'creative', 'academic', 'conversational', 'urgent'
          ]
        }
      });
      
      return {
        sentiment: result[0]?.label || 'neutral',
        sentimentScore: result[0]?.score || 0.5,
        tone: toneResult.labels[0],
        toneConfidence: toneResult.scores[0],
        recommendation: this.getToneRecommendation(toneResult.labels[0], result[0]?.label)
      };
    } catch (error) {
      console.error('Tone analysis failed:', error);
      return null;
    }
  }

  // 4. PROMPT ENHANCEMENT - AI-powered prompt improvement
  async enhancePrompt(promptText) {
    try {
      const enhancementPrompt = `Improve this prompt to make it clearer, more specific, and more effective for AI interaction. Keep the core intent but enhance clarity and specificity:

Original prompt: "${promptText}"

Enhanced prompt:`;

      const result = await this.query('microsoft/DialoGPT-large', {
        inputs: enhancementPrompt,
        parameters: {
          max_length: 300,
          temperature: 0.7,
          do_sample: true
        }
      });
      
      return {
        enhancedPrompt: result[0]?.generated_text || '',
        improvements: this.identifyImprovements(promptText, result[0]?.generated_text || ''),
        confidence: 0.8
      };
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      return null;
    }
  }

  // 5. SIMILAR PROMPT SUGGESTIONS - Find related prompts
  async findSimilarPrompts(promptText, promptDatabase) {
    try {
      const embeddings = await this.query('sentence-transformers/all-MiniLM-L6-v2', {
        inputs: promptText
      });
      
      // Calculate similarity with existing prompts (simplified)
      const similarities = promptDatabase.map(prompt => ({
        ...prompt,
        similarity: this.calculateCosineSimilarity(embeddings, prompt.embedding || [])
      }));
      
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .filter(p => p.similarity > 0.6);
    } catch (error) {
      console.error('Similar prompt search failed:', error);
      return [];
    }
  }

  // 6. GRAMMAR & CLARITY CHECK - Improve prompt quality
  async checkGrammarAndClarity(promptText) {
    try {
      // Using a grammar correction model
      const grammarResult = await this.query('vennify/t5-base-grammar-correction', {
        inputs: `grammar: ${promptText}`
      });
      
      const clarityResult = await this.query('facebook/bart-large-mnli', {
        inputs: promptText,
        parameters: {
          candidate_labels: [
            'very clear', 'somewhat clear', 'unclear', 'confusing', 'ambiguous'
          ]
        }
      });
      
      return {
        correctedText: grammarResult[0]?.generated_text || promptText,
        clarityScore: clarityResult.scores[0],
        clarityLevel: clarityResult.labels[0],
        suggestions: this.generateClaritySuggestions(clarityResult.labels[0])
      };
    } catch (error) {
      console.error('Grammar check failed:', error);
      return null;
    }
  }

  // 7. AUTO-COMPLETION - Smart prompt completion
  async completePrompt(partialPrompt) {
    try {
      const result = await this.query('gpt2', {
        inputs: partialPrompt,
        parameters: {
          max_length: partialPrompt.length + 50,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9
        }
      });
      
      const completions = result[0]?.generated_text
        .replace(partialPrompt, '')
        .trim()
        .split('. ')[0] + '.';
      
      return {
        completion: completions,
        confidence: 0.75
      };
    } catch (error) {
      console.error('Auto-completion failed:', error);
      return null;
    }
  }

  // Helper functions
  getToneRecommendation(tone, sentiment) {
    const recommendations = {
      'professional': 'Great for business and formal contexts',
      'casual': 'Perfect for friendly, approachable interactions',
      'technical': 'Ideal for detailed, specific requirements',
      'creative': 'Excellent for innovative and artistic tasks'
    };
    return recommendations[tone] || 'Consider adjusting tone for your target audience';
  }

  identifyImprovements(original, enhanced) {
    const improvements = [];
    if (enhanced.length > original.length) {
      improvements.push('Added more specific details');
    }
    if (enhanced.includes('You are')) {
      improvements.push('Enhanced role definition');
    }
    if (enhanced.includes('Please') || enhanced.includes('Ensure')) {
      improvements.push('Improved instruction clarity');
    }
    return improvements;
  }

  calculateCosineSimilarity(vec1, vec2) {
    // Simplified cosine similarity calculation
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
    
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
    
    return dotProduct / (magnitude1 * magnitude2) || 0;
  }

  generateClaritySuggestions(clarityLevel) {
    const suggestions = {
      'unclear': [
        'Add more specific details about what you want',
        'Define the role or expertise level clearly',
        'Include examples of desired output'
      ],
      'confusing': [
        'Break down complex requests into steps',
        'Use simpler, more direct language',
        'Clarify the main objective'
      ],
      'ambiguous': [
        'Be more specific about requirements',
        'Add context and background information',
        'Define key terms and expectations'
      ]
    };
    return suggestions[clarityLevel] || ['Your prompt is clear!'];
  }
}

export default new HuggingFaceService();

// Component Integration Example
// components/AIEnhancedAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Target, Zap, CheckCircle, Lightbulb } from 'lucide-react';
import HuggingFaceService from '../utils/huggingfaceServices';

const AIEnhancedAnalyzer = ({ prompt, onPromptUpdate, analysis }) => {
  const [aiInsights, setAiInsights] = useState({
    category: null,
    intent: null,
    tone: null,
    enhancement: null,
    grammar: null,
    loading: false
  });

  useEffect(() => {
    if (prompt.trim().length > 20) {
      analyzeWithAI();
    }
  }, [prompt]);

  const analyzeWithAI = async () => {
    setAiInsights(prev => ({ ...prev, loading: true }));
    
    try {
      const [category, intent, tone, grammar] = await Promise.all([
        HuggingFaceService.categorizePrompt(prompt),
        HuggingFaceService.detectIntent(prompt),
        HuggingFaceService.analyzeTone(prompt),
        HuggingFaceService.checkGrammarAndClarity(prompt)
      ]);

      setAiInsights({
        category,
        intent,
        tone,
        grammar,
        loading: false
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiInsights(prev => ({ ...prev, loading: false }));
    }
  };

  const enhancePrompt = async () => {
    setAiInsights(prev => ({ ...prev, loading: true }));
    
    const enhancement = await HuggingFaceService.enhancePrompt(prompt);
    if (enhancement?.enhancedPrompt) {
      onPromptUpdate(enhancement.enhancedPrompt);
    }
    
    setAiInsights(prev => ({ ...prev, enhancement, loading: false }));
  };

  return (
    <div className="space-y-4">
      {/* AI Enhancement Button */}
      <div className="flex gap-2">
        <button
          onClick={enhancePrompt}
          disabled={!prompt.trim() || aiInsights.loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-600 text-white rounded-xl transition-all duration-300 font-medium text-sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Enhance
        </button>
      </div>

      {/* AI Insights Panel */}
      {(aiInsights.category || aiInsights.intent || aiInsights.tone) && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            AI Insights
          </h4>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.category && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Category</span>
                </div>
                <p className="text-white text-sm">{aiInsights.category.category}</p>
                <p className="text-slate-400 text-xs">
                  {Math.round(aiInsights.category.confidence * 100)}% confidence
                </p>
              </div>
            )}

            {aiInsights.intent && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Intent</span>
                </div>
                <p className="text-white text-sm">{aiInsights.intent.intent}</p>
                <p className="text-slate-400 text-xs">{aiInsights.intent.description}</p>
              </div>
            )}

            {aiInsights.tone && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Tone</span>
                </div>
                <p className="text-white text-sm capitalize">{aiInsights.tone.tone}</p>
                <p className="text-slate-400 text-xs">{aiInsights.tone.recommendation}</p>
              </div>
            )}
          </div>

          {aiInsights.grammar && aiInsights.grammar.suggestions.length > 0 && (
            <div className="mt-4 bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">AI Suggestions</span>
              </div>
              <ul className="space-y-1">
                {aiInsights.grammar.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-slate-300 text-xs">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {aiInsights.loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">AI analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEnhancedAnalyzer;