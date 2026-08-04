export function buildClusters(themes) {
  const clusters = {};

  themes.forEach((theme) => {
    const key = `${theme.product || 'general'}-${theme.journeyStage || 'general'}`;
    clusters[key] = clusters[key] || {
      clusterId: key,
      product: theme.product,
      journeyStage: theme.journeyStage,
      items: [],
    };
    clusters[key].items.push(theme);
  });

  return Object.values(clusters).map((cluster) => ({
    ...cluster,
    count: cluster.items.length,
    sentimentDistribution: cluster.items.reduce(
      (acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 },
    ),
  }));
}

export function buildSpikes(themes) {
  return themes
    .filter((theme) => theme.issueScore >= 2)
    .map((theme) => ({
      themeId: theme.themeId,
      score: theme.issueScore,
      reason: 'Issue score threshold exceeded',
      text: theme.text,
    }));
}
