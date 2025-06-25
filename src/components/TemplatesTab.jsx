import React from 'react';
import { ArrowRight, Heart, Star, PenTool, Target, BarChart3, Lightbulb, Code } from 'lucide-react';

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

const TemplatesTab = ({ 
  selectedCategory, 
  setSelectedCategory, 
  onApplyTemplate, 
  onToggleFavorite, 
  isFavorited 
}) => {
  const getCategories = () => {
    const categories = allTemplates.map(t => t.category);
    return [...new Set(categories)];
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Professional Template Library</h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          Choose from our comprehensive collection of expert-crafted prompts across all key business areas.
        </p>
        
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
                        onToggleFavorite(template, 'template');
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
                      onClick={() => onApplyTemplate(template)}
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
  );
};

export default TemplatesTab;