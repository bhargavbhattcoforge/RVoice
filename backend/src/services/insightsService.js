export function summarizeSentiment(themes = []) {
  return themes.reduce(
    (acc, theme) => {
      const sentiment = theme.sentiment || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 },
  );
}

export function summarizeSeverity(themes = []) {
  return themes.reduce(
    (acc, theme) => {
      const severity = theme.severity || 'low';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );
}

export function topCounts(items = [], key, limit = 3) {
  const counts = items.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function countOpenActions(actions = []) {
  return actions.filter((action) => !['resolved', 'closed'].includes(action.status)).length;
}

export function countActionsByOwner(actions = []) {
  return actions.reduce((acc, action) => {
    const owner = action.assignedOwner || 'Unassigned';
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {});
}

export function topRiskThemes(themes = [], limit = 3) {
  return [...themes]
    .sort((a, b) => (b.issueScore || 0) - (a.issueScore || 0))
    .slice(0, limit)
    .map((theme) => ({
      themeId: theme.themeId,
      product: theme.product || 'general',
      journeyStage: theme.journeyStage || 'general',
      issueScore: theme.issueScore || 0,
      severity: theme.severity || 'low',
      sentiment: theme.sentiment || 'neutral',
    }));
}

export function summarizeFeedbackSources(feedback = []) {
  return feedback.reduce((acc, item) => {
    const source = item.source || item.origin || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
}
