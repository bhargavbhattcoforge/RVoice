export function scoreTheme(theme) {
  // Handle both old aspects array and new aspectKeywords string formats
  const aspects = Array.isArray(theme.aspects) ? theme.aspects : (theme.aspectKeywords ? theme.aspectKeywords.split(',').map(a => ({ aspect: a.trim() })) : []);
  
  const base = aspects.length;
  const negativeCount = aspects.filter((aspect) => aspect.sentiment === 'negative').length;
  const positiveCount = aspects.filter((aspect) => aspect.sentiment === 'positive').length;
  const sentimentWeight = negativeCount - positiveCount;
  const issueScore = Math.max(0, base + sentimentWeight);

  return {
    ...theme,
    issueScore,
  };
}

export function detectSpikes(themes) {
  if (!Array.isArray(themes)) {
    return [];
  }

  return themes
    .map(scoreTheme)
    .filter((theme) => theme.issueScore >= 2)
    .map((theme) => ({
      themeId: theme.themeId,
      sourceId: theme.sourceId,
      text: theme.text,
      reason: 'issue score threshold exceeded',
      score: theme.issueScore,
      detectedAt: new Date().toISOString(),
    }));
}
