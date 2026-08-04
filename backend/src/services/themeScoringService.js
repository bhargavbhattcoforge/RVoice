export function scoreThemes(themes) {
  return themes.map((theme) => {
    const negativeCount = theme.aspects.filter((aspect) => aspect.sentiment === 'negative').length;
    const positiveCount = theme.aspects.filter((aspect) => aspect.sentiment === 'positive').length;
    const score = Math.max(0, theme.aspects.length + negativeCount - positiveCount);
    return {
      ...theme,
      issueScore: score,
      severity: score >= 3 ? 'high' : score === 2 ? 'medium' : 'low',
    };
  });
}
