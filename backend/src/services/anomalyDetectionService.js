import { all } from '../../db.js';

export async function detectAnomaliesWithZScore(themes, timeWindow = 7) {
  if (!Array.isArray(themes) || themes.length === 0) {
    return [];
  }

  // Group themes by product and aspect
  const grouped = {};
  for (const theme of themes) {
    const key = `${theme.product}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(theme);
  }

  // Calculate z-score for each group
  const anomalies = [];
  for (const [key, items] of Object.entries(grouped)) {
    const scores = items.map(t => t.issueScore || 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Flag items with z-score > 2 (>95% confidence)
    for (const item of items) {
      const score = item.issueScore || 0;
      if (stdDev > 0) {
        const zScore = (score - mean) / stdDev;
        const confidence = Math.min(Math.abs(zScore) / 3, 1.0); // Confidence capped at 1.0
        
        if (zScore > 2) {
          anomalies.push({
            spikeId: `spike-${item.themeId}-${Date.now()}`,
            themeId: item.themeId,
            product: item.product,
            journeyStage: item.journeyStage,
            sentiment: item.sentiment,
            severity: item.severity,
            anomalyScore: zScore,
            confidence: confidence,
            reason: `Issue score ${score.toFixed(2)} is ${Math.abs(zScore).toFixed(1)}σ above baseline`,
            baselineScore: mean.toFixed(2),
            detectedAt: new Date().toISOString(),
            notificationSent: 0,
          });
        }
      }
    }
  }

  // Sort by confidence descending
  return anomalies.sort((a, b) => b.confidence - a.confidence);
}

export async function getTrendData(product, days = 30) {
  // Get daily aggregation of themes
  const query = `
    SELECT 
      DATE(extractedAt) as day,
      COUNT(*) as count,
      AVG(CAST(issueScore as REAL)) as avgScore,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positiveCount,
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutralCount
    FROM themes
    WHERE product = ? AND extractedAt >= datetime('now', '-' || ? || ' days')
    GROUP BY DATE(extractedAt)
    ORDER BY day ASC
  `;
  
  try {
    return await all(query, [product, days]);
  } catch (err) {
    console.error('Error getting trend data:', err);
    return [];
  }
}

export async function getWeekOverWeekComparison(product) {
  // Compare this week vs last week
  const query = `
    SELECT 
      'current_week' as period,
      COUNT(*) as count,
      AVG(CAST(issueScore as REAL)) as avgScore,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount
    FROM themes
    WHERE product = ? AND extractedAt >= datetime('now', '-7 days')
    UNION ALL
    SELECT 
      'last_week' as period,
      COUNT(*) as count,
      AVG(CAST(issueScore as REAL)) as avgScore,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount
    FROM themes
    WHERE product = ? AND extractedAt >= datetime('now', '-14 days') AND extractedAt < datetime('now', '-7 days')
  `;
  
  try {
    const results = await all(query, [product, product]);
    if (results.length === 2) {
      const current = results[0];
      const last = results[1];
      return {
        countChange: ((current.count - last.count) / last.count * 100).toFixed(1),
        scoreChange: ((current.avgScore - last.avgScore) / last.avgScore * 100).toFixed(1),
        negativeChange: ((current.negativeCount - last.negativeCount) / last.negativeCount * 100).toFixed(1),
        current,
        last,
      };
    }
    return {};
  } catch (err) {
    console.error('Error getting week-over-week data:', err);
    return {};
  }
}

export async function getPredictedEscalation(themes, days = 7) {
  // Simple trend extrapolation: if score is increasing, flag for escalation
  const predictions = [];
  
  for (const theme of themes) {
    // Check if there's an increasing trend in issueScore
    if (theme.issueScore >= 2.5) {
      const escalationRisk = Math.min(theme.issueScore / 5, 1.0); // 0-1 scale
      predictions.push({
        themeId: theme.themeId,
        product: theme.product,
        currentScore: theme.issueScore,
        escalationRisk: escalationRisk,
        recommendation: escalationRisk > 0.7 ? 'immediate_action' : 'monitor_closely',
        predictedAt: new Date().toISOString(),
      });
    }
  }
  
  return predictions.sort((a, b) => b.escalationRisk - a.escalationRisk).slice(0, 5);
}
