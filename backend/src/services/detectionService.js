export function scoreTheme(theme) {
  const base = theme.aspects.length;
  const negativeCount = theme.aspects.filter((aspect) => aspect.sentiment === 'negative').length;
  const positiveCount = theme.aspects.filter((aspect) => aspect.sentiment === 'positive').length;
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
