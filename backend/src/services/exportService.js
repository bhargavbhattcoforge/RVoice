// Export service for data export to BI tools

export function generateCSVHeader() {
  return [
    'ThemeId',
    'Product',
    'JourneyStage',
    'Sentiment',
    'Severity',
    'IssueScore',
    'MentionCount',
    'AspectKeywords',
    'CreatedDate',
    'Week',
  ].join(',');
}

export function themeToCSVRow(theme) {
  const createdAt = new Date(theme.createdAt || theme.extractedAt);
  const year = createdAt.getFullYear();
  const week = Math.ceil((createdAt.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  return [
    theme.themeId,
    `"${theme.product || 'general'}"`,
    `"${theme.journeyStage || 'general'}"`,
    theme.sentiment || 'neutral',
    theme.severity || 'low',
    (theme.issueScore || 0).toFixed(2),
    theme.mentionCount || 1,
    `"${theme.aspectKeywords || ''}"`,
    createdAt.toISOString().split('T')[0],
    `${year}-W${String(week).padStart(2, '0')}`,
  ].join(',');
}

export function themesToCSV(themes) {
  const rows = [generateCSVHeader()];
  for (const theme of themes) {
    rows.push(themeToCSVRow(theme));
  }
  return rows.join('\n');
}

export function generateMetricsCSVHeader() {
  return [
    'Date',
    'Product',
    'TotalThemes',
    'NegativeCount',
    'PositiveCount',
    'NeutralCount',
    'AvgIssueScore',
    'HighSeverityCount',
    'MediumSeverityCount',
    'LowSeverityCount',
  ].join(',');
}

export function generateMetricsCSV(metricsData) {
  const rows = [generateMetricsCSVHeader()];
  
  for (const metric of metricsData) {
    rows.push([
      metric.date,
      metric.product || 'all',
      metric.totalThemes || 0,
      metric.negativeCount || 0,
      metric.positiveCount || 0,
      metric.neutralCount || 0,
      (metric.avgIssueScore || 0).toFixed(2),
      metric.highSeverityCount || 0,
      metric.mediumSeverityCount || 0,
      metric.lowSeverityCount || 0,
    ].join(','));
  }

  return rows.join('\n');
}

export function aggregateThemesToMetrics(themes, groupByProduct = false) {
  const aggregated = {};

  for (const theme of themes) {
    const date = (theme.createdAt || theme.extractedAt)?.split('T')[0] || 'unknown';
    const key = groupByProduct ? `${date}|${theme.product || 'all'}` : date;

    if (!aggregated[key]) {
      aggregated[key] = {
        date,
        product: groupByProduct ? theme.product : undefined,
        totalThemes: 0,
        negativeCount: 0,
        positiveCount: 0,
        neutralCount: 0,
        issueScores: [],
        severities: { high: 0, medium: 0, low: 0 },
      };
    }

    const bucket = aggregated[key];
    bucket.totalThemes++;
    
    if (theme.sentiment === 'negative') bucket.negativeCount++;
    else if (theme.sentiment === 'positive') bucket.positiveCount++;
    else bucket.neutralCount++;

    bucket.issueScores.push(theme.issueScore || 0);
    if (theme.severity) bucket.severities[theme.severity]++;
  }

  // Calculate averages
  return Object.values(aggregated).map(bucket => ({
    date: bucket.date,
    product: bucket.product,
    totalThemes: bucket.totalThemes,
    negativeCount: bucket.negativeCount,
    positiveCount: bucket.positiveCount,
    neutralCount: bucket.neutralCount,
    avgIssueScore: bucket.issueScores.length > 0 
      ? bucket.issueScores.reduce((a, b) => a + b) / bucket.issueScores.length 
      : 0,
    highSeverityCount: bucket.severities.high,
    mediumSeverityCount: bucket.severities.medium,
    lowSeverityCount: bucket.severities.low,
  }));
}

export function generateExportReport(themes) {
  const metrics = aggregateThemesToMetrics(themes, true);
  const csv = generateMetricsCSV(metrics);

  return {
    exportedAt: new Date().toISOString(),
    totalRecords: themes.length,
    totalDays: new Set(metrics.map(m => m.date)).size,
    totalProducts: new Set(metrics.map(m => m.product)).size,
    csvData: csv,
    format: 'csv',
  };
}
