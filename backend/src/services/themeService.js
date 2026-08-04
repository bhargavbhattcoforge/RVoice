import { extractAspectsAndSentiment } from './nlpService.js';
import { categorizeFeedbackItem } from './categorizationService.js';
import { loadThemeStore, insertTheme, getThemesByProduct, getThemesBySeverity } from './storageService.js';
import { scoreThemes } from './themeScoringService.js';

export async function estimateThemes(items) {
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }

  const themes = items.map((item, index) => {
    const categories = categorizeFeedbackItem(item);
    const analysis = extractAspectsAndSentiment(item.text);
    const themeId = item.id ? `theme-${item.id}` : `theme-${Date.now()}-${index}`;
    return {
      themeId,
      sourceId: item.id || themeId,
      text: item.text,
      product: categories.product,
      journeyStage: categories.journeyStage,
      source: item.source,
      sentiment: analysis.sentiment,
      aspectKeywords: analysis.aspects ? analysis.aspects.map(a => a.aspect).join(',') : '',
      extractedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  });

  const scoredThemes = scoreThemes(themes);
  for (const theme of scoredThemes) {
    await insertTheme(theme);
  }
  return scoredThemes;
}

export async function getThemes(query = {}) {
  try {
    if (query.severity) {
      return await getThemesBySeverity(query.severity);
    }
    if (query.product) {
      return await getThemesByProduct(query.product);
    }
    return await loadThemeStore();
  } catch (err) {
    console.error('Error in getThemes:', err);
    return [];
  }
}
