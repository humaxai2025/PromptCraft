import { analyzePrompt } from './promptAnalyzer.js';

export const optimizePrompt = (prompt, INDUSTRY_STANDARD = 85) => {
  if (!prompt.trim()) return null;
  
  const currentAnalysis = analyzePrompt(prompt);
  
  if (currentAnalysis.overallScore >= INDUSTRY_STANDARD) {
    return null; // Already optimized
  }
  
  let optimized = prompt;
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
    const optimizedAnalysis = analyzePrompt(optimized.trim());
    return {
      originalPrompt: prompt,
      optimizedPrompt: optimized.trim(),
      originalAnalysis: currentAnalysis,
      optimizedAnalysis: optimizedAnalysis
    };
  }
  
  return null;
};