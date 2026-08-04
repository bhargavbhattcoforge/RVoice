import express from 'express';
import { detectAnomaliesWithZScore, getTrendData, getWeekOverWeekComparison, getPredictedEscalation } from '../services/anomalyDetectionService.js';
import { getThemes } from '../services/themeService.js';

const router = express.Router();

// GET /api/analytics/trends?product=X&days=30
router.get('/trends', async (req, res) => {
  try {
    const { product = 'ProductA', days = 30 } = req.query;
    const trendData = await getTrendData(product, parseInt(days));
    
    res.json({
      product,
      days: parseInt(days),
      trends: trendData,
      insight: trendData.length > 0 ? `${trendData.length} days of trend data available` : 'No trend data',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/week-over-week?product=X
router.get('/week-over-week', async (req, res) => {
  try {
    const { product = 'ProductA' } = req.query;
    const comparison = await getWeekOverWeekComparison(product);
    
    res.json({
      product,
      ...comparison,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/anomalies?product=X
router.get('/anomalies', async (req, res) => {
  try {
    const themes = await getThemes({ product: req.query.product });
    const anomalies = await detectAnomaliesWithZScore(themes);
    
    res.json({
      anomalyCount: anomalies.length,
      anomalies: anomalies.slice(0, 10), // Top 10 anomalies
      averageConfidence: anomalies.length > 0 
        ? (anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length).toFixed(2)
        : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/escalation-risk?product=X
router.get('/escalation-risk', async (req, res) => {
  try {
    const themes = await getThemes({ product: req.query.product });
    const predictions = await getPredictedEscalation(themes);
    
    res.json({
      riskLevel: predictions.length > 0 ? 'high' : 'low',
      predictions: predictions.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
