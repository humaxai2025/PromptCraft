import React from 'react';
import { 
  CheckCircle, XCircle, Lightbulb, Target, Zap, ArrowRight, Star 
} from 'lucide-react';

const LearnTab = ({ 
  completedLessons, 
  onLessonComplete, 
  onTryExample, 
  onNavigateToTemplates 
}) => {
  const lessons = [
    {
      id: 'basics',
      title: 'Prompt Basics: Role Definition',
      level: 'Beginner',
      description: 'Learn how to define clear roles and personas for AI interactions',
      concepts: [
        'Start with "You are..." to establish context',
        'Add expertise level (senior, expert, specialist)',
        'Include relevant background or experience',
        'Be specific about the domain or field'
      ],
      example: {
        bad: 'Write about marketing',
        good: 'You are a senior digital marketing strategist with 10+ years of experience in e-commerce. Write a comprehensive analysis of current social media marketing trends.',
        explanation: 'The improved version establishes expertise, specifies the field, and gives clear direction.'
      }
    },
    {
      id: 'context',
      title: 'Adding Context & Specificity',
      level: 'Beginner',
      description: 'Make your prompts more effective with proper context and specific requirements',
      concepts: [
        'Provide background information and constraints',
        'Specify target audience and use case',
        'Include relevant industry or domain context',
        'Add specific metrics or criteria when possible'
      ],
      example: {
        bad: 'Create a business plan',
        good: 'You are a business consultant. Create a lean startup business plan for a SaaS company targeting small businesses, focusing on customer acquisition strategy and 18-month financial projections.',
        explanation: 'Added target market, business model, specific focus areas, and timeline.'
      }
    },
    {
      id: 'structure',
      title: 'Structure & Formatting',
      level: 'Intermediate',
      description: 'Organize your prompts with clear structure for better AI understanding',
      concepts: [
        'Use headers and bullet points for clarity',
        'Separate different requirements into sections',
        'Number sequential steps or priorities',
        'Use markdown formatting for emphasis'
      ],
      example: {
        bad: 'Analyze competitor pricing and give recommendations with data and next steps',
        good: 'You are a pricing strategist. Conduct a competitor analysis with:\n\n**Analysis Requirements:**\n• Compare 5 direct competitors\n• Focus on subscription pricing models\n• Include feature comparison matrix\n\n**Deliverables:**\n• Executive summary\n• Pricing recommendations\n• Implementation timeline',
        explanation: 'Clear sections and structured requirements make the task unambiguous.'
      }
    },
    {
      id: 'output',
      title: 'Output Requirements',
      level: 'Intermediate', 
      description: 'Specify exactly what you want to receive from the AI',
      concepts: [
        'Define output format (list, table, essay, etc.)',
        'Specify word count or length requirements',
        'Request specific sections or components',
        'Include quality standards or criteria'
      ],
      example: {
        bad: 'Give me a summary of renewable energy',
        good: 'You are an energy sector analyst. Create a 500-word executive summary of renewable energy trends in 2024.\n\n**Required Sections:**\n• Key market developments (150 words)\n• Technology breakthroughs (150 words)\n• Investment outlook (150 words)\n• 3 actionable insights (50 words)',
        explanation: 'Specific format, word count, and section breakdown ensure consistent output.'
      }
    },
    {
      id: 'advanced',
      title: 'Advanced Techniques',
      level: 'Advanced',
      description: 'Use sophisticated prompting techniques for complex tasks',
      concepts: [
        'Chain-of-thought reasoning for complex problems',
        'Few-shot examples for specific formats',
        'Constraint-based prompting for creativity',
        'Multi-step workflows and dependencies'
      ],
      example: {
        bad: 'Help me solve this business problem',
        good: 'You are a management consultant using structured problem-solving. Analyze this challenge step-by-step:\n\n**Problem:** Declining customer retention\n\n**Analysis Framework:**\n1. Root cause analysis (use 5 Whys method)\n2. Stakeholder impact assessment\n3. Solution brainstorming (minimum 5 options)\n4. Cost-benefit evaluation\n5. Implementation roadmap\n\n**For each step, show your reasoning process.**',
        explanation: 'Provides methodology, specific framework, and requests reasoning visibility.'
      }
    },
    {
      id: 'industry',
      title: 'Industry-Specific Optimization',
      level: 'Advanced',
      description: 'Tailor your prompts for specific industries and professional contexts',
      concepts: [
        'Use industry-specific terminology and frameworks',
        'Reference relevant standards and best practices',
        'Include compliance and regulatory considerations',
        'Adapt communication style for the audience'
      ],
      example: {
        bad: 'Create a financial report',
        good: 'You are a senior financial analyst with CFA certification. Prepare a quarterly earnings analysis for institutional investors.\n\n**Analysis Requirements:**\n• GAAP-compliant financial metrics\n• Peer comparison using industry benchmarks\n• Risk assessment per SEC guidelines\n• Forward-looking statements with appropriate disclaimers\n\n**Output:** Professional investment memo (1,000 words) suitable for portfolio managers.',
        explanation: 'Industry credentials, specific standards, target audience, and professional format.'
      }
    }
  ];

  const getProgressPercentage = () => {
    return Math.round((completedLessons.size / lessons.length) * 100);
  };

  const LessonCard = ({ lesson, index, isCompleted }) => {
    const levelColor = lesson.level === 'Beginner' ? 'bg-green-500/20 text-green-400' : 
                     lesson.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 
                     'bg-red-500/20 text-red-400';
    
    return (
      <div 
        className={'bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ' + (
          isCompleted 
            ? 'border-green-500/50 bg-green-500/5' 
            : 'border-white/10 hover:border-purple-500/30'
        )}
      >
        {/* Lesson Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ' + (
              isCompleted 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300'
            )}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
              <span className={'px-2 py-1 rounded-full text-xs font-medium ' + levelColor}>
                {lesson.level}
              </span>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </div>
          )}
        </div>

        {/* Lesson Description */}
        <p className="text-slate-300 text-sm mb-4">{lesson.description}</p>

        {/* Key Concepts */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Key Concepts
          </h4>
          <ul className="space-y-2">
            {lesson.concepts.map((concept, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                {concept}
              </li>
            ))}
          </ul>
        </div>

        {/* Example Section */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Before vs After
          </h4>
          
          {/* Bad Example */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Weak Prompt</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <code className="text-xs text-slate-300">{lesson.example.bad}</code>
            </div>
          </div>

          {/* Good Example */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Strong Prompt</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <code className="text-xs text-slate-300 whitespace-pre-wrap">{lesson.example.good}</code>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-300 text-xs">{lesson.example.explanation}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onTryExample(lesson.example.good)}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            Try This Example
          </button>
          {!isCompleted && (
            <button
              onClick={() => onLessonComplete(lesson.id)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm transition-all"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  const ProgressBar = () => (
    <div className="max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">Your Progress</span>
        <span className="text-sm text-purple-400 font-medium">{completedLessons.size}/{lessons.length} lessons</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000 ease-out"
          style={{ width: getProgressPercentage() + '%' }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-lg font-bold text-purple-400">{getProgressPercentage()}%</span>
        <span className="text-slate-400 text-sm ml-1">Complete</span>
      </div>
    </div>
  );

  const CompletionCelebration = () => (
    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 text-center">
      <div className="mb-4">
        <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4 fill-yellow-400" />
        <h3 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h3>
        <p className="text-green-400 text-lg">You've completed all prompt engineering lessons!</p>
      </div>
      <p className="text-slate-300 text-sm mb-6">
        You're now ready to create professional-grade prompts. Keep practicing with the Templates and Analyzer!
      </p>
      <button
        onClick={onNavigateToTemplates}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
      >
        Explore Professional Templates
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Learn Prompt Engineering</h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-6">
          Master the art of prompt engineering with interactive lessons from beginner to advanced level.
        </p>
        
        <ProgressBar />
      </div>
      
      {/* Lessons Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.has(lesson.id);
          return (
            <LessonCard 
              key={lesson.id}
              lesson={lesson}
              index={index}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>

      {/* Completion Celebration */}
      {completedLessons.size === lessons.length && <CompletionCelebration />}
    </div>
  );
};

export default LearnTab;