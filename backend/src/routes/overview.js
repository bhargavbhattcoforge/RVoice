import express from 'express';
import { getActions } from '../services/actionService.js';
import { getThemes } from '../services/themeService.js';
import { getFeedback } from '../services/feedbackService.js';
import { clusterThemes } from '../services/themeClusteringService.js';
import { detectSpikes } from '../services/detectionService.js';
import {
  summarizeSentiment,
  summarizeSeverity,
  topCounts,
  countOpenActions,
  countActionsByOwner,
  topRiskThemes,
  summarizeFeedbackSources,
} from '../services/insightsService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const themes = await getThemes(req.query);
    const actions = await getActions(req.query);
    const feedback = await getFeedback(req.query);
    const clusters = clusterThemes(themes);
    const spikes = detectSpikes(themes);

    res.json({
      themeCount: themes.length,
      actionCount: actions.length,
      openActionCount: countOpenActions(actions),
      actionsByOwner: countActionsByOwner(actions),
      sentimentBreakdown: summarizeSentiment(themes),
      severityBreakdown: summarizeSeverity(themes),
      topProducts: topCounts(themes, 'product'),
      topJourneyStages: topCounts(themes, 'journeyStage'),
      topRiskThemes: topRiskThemes(themes),
      feedbackCount: feedback.length,
      feedbackSources: summarizeFeedbackSources(feedback),
      actions,
      clusters,
      spikes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
