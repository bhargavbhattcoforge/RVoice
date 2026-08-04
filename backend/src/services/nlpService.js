export function extractAspectsAndSentiment(text) {
  const normalized = (text || '').toLowerCase();

  const sentiment = computePolarity(normalized);
  const aspects = [];

  if (normalized.includes('checkout') || normalized.includes('payment')) {
    aspects.push({ aspect: 'checkout', sentiment: sentiment });
  }
  if (normalized.includes('delivery') || normalized.includes('shipping') || normalized.includes('late') || normalized.includes('delay')) {
    aspects.push({ aspect: 'delivery', sentiment: sentiment });
  }
  if (normalized.includes('quality') || normalized.includes('defect') || normalized.includes('broken') || normalized.includes('packaging')) {
    aspects.push({ aspect: 'product quality', sentiment: sentiment });
  }
  if (normalized.includes('support') || normalized.includes('customer service') || normalized.includes('agent')) {
    aspects.push({ aspect: 'customer support', sentiment: sentiment });
  }
  if (normalized.includes('store') || normalized.includes('location') || normalized.includes('staff') || normalized.includes('line') || normalized.includes('wait')) {
    aspects.push({ aspect: 'store experience', sentiment: sentiment });
  }

  if (aspects.length === 0) {
    aspects.push({ aspect: 'general', sentiment });
  }

  return { sentiment, aspects };
}

function computePolarity(text) {
  const positive = ['great', 'good', 'excellent', 'love', 'easy', 'fast', 'helpful', 'positive', 'perfect'];
  const negative = ['bad', 'terrible', 'poor', 'slow', 'broken', 'hate', 'worst', 'frustrating', 'delay'];

  let score = 0;
  positive.forEach((word) => {
    if (text.includes(word)) score += 1;
  });
  negative.forEach((word) => {
    if (text.includes(word)) score -= 1;
  });

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
