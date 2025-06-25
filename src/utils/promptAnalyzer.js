export const analyzePrompt = (promptText) => {
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