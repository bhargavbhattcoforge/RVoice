const stageKeywords = {
  browse: ['browse', 'search', 'discover', 'find'],
  checkout: ['checkout', 'cart', 'payment', 'payment method', 'card'],
  delivery: ['delivery', 'shipping', 'arrival', 'package', 'late'],
  support: ['support', 'help', 'ticket', 'agent', 'customer service'],
};

const productKeywords = ['product', 'sku', 'item', 'model'];
const storeKeywords = ['store', 'location', 'branch', 'shop', 'mall'];

export function categorizeFeedbackItem(item) {
  const text = (item.text || '').toLowerCase();
  const category = {
    product: item.product || null,
    store: item.store || null,
    journeyStage: item.journeyStage || null,
  };

  if (!category.journeyStage) {
    for (const [stage, words] of Object.entries(stageKeywords)) {
      if (words.some((word) => text.includes(word))) {
        category.journeyStage = stage;
        break;
      }
    }
  }

  if (!category.product && item.text) {
    if (productKeywords.some((word) => text.includes(word))) {
      category.product = item.product || 'product';
    }
  }

  if (!category.store && item.text) {
    if (storeKeywords.some((word) => text.includes(word))) {
      category.store = item.store || 'store';
    }
  }

  return category;
}
