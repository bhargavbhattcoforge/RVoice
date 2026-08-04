export function scoreThemes(themes) {
  return themes.map((theme) => {
    // Handle both old aspects array and new aspectKeywords string formats
    const aspects = Array.isArray(theme.aspects) ? theme.aspects : (theme.aspectKeywords ? theme.aspectKeywords.split(',').map(a => ({ aspect: a.trim() })) : []);
    
    const negativeCount = aspects.filter((aspect) => aspect.sentiment === 'negative').length;
    const positiveCount = aspects.filter((aspect) => aspect.sentiment === 'positive').length;
    const score = Math.max(0, aspects.length + negativeCount - positiveCount);
    
    return {
      ...theme,
      issueScore: score,
      severity: score >= 3 ? 'high' : score === 2 ? 'medium' : 'low',
      aspectKeywords: theme.aspectKeywords || (Array.isArray(theme.aspects) ? theme.aspects.map(a => a.aspect).join(',') : ''),
    };
  });
}
