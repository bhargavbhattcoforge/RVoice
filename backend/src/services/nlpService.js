// Enhanced NLP service with 15+ aspects, negation handling, entity extraction, and duplicate detection

const POSITIVE_WORDS = ['great', 'good', 'excellent', 'love', 'easy', 'fast', 'helpful', 'positive', 'perfect', 'amazing', 'fantastic', 'wonderful', 'fantastic', 'impressed', 'satisfied'];

const NEGATIVE_WORDS = ['bad', 'terrible', 'poor', 'slow', 'broken', 'hate', 'worst', 'frustrating', 'delay', 'issue', 'problem', 'error', 'crash', 'failed', 'disappointing', 'awful', 'useless'];

const NEGATION_WORDS = ['not', 'no', 'never', 'neither', "don't", "didn't", "doesn't", "won't", "wouldn't"];

// 15+ business aspects with keyword mappings
const ASPECT_KEYWORDS = {
  'checkout': ['checkout', 'payment', 'cart', 'purchase', 'billing', 'payment method', 'credit card', 'proceed to checkout'],
  'delivery': ['delivery', 'shipping', 'late', 'delay', 'shipment', 'delivered', 'tracking', 'fedex', 'ups', 'delivery time'],
  'product-quality': ['quality', 'defect', 'broken', 'damaged', 'packaging', 'durability', 'workmanship', 'material', 'craftsmanship'],
  'customer-support': ['support', 'customer service', 'agent', 'help', 'assistance', 'contact', 'representative', 'response time', 'helpful'],
  'store-experience': ['store', 'location', 'staff', 'line', 'wait', 'cleanliness', 'layout', 'checkout', 'register', 'parking'],
  'pricing': ['price', 'expensive', 'cheap', 'cost', 'value', 'discount', 'promotion', 'coupon', 'expensive', 'overpriced', 'affordable'],
  'returns': ['return', 'refund', 'exchange', 'warranty', 'replacement', 'return policy', 'refund process'],
  'packaging': ['packaging', 'box', 'wrapping', 'protection', 'unboxing', 'presentation', 'label'],
  'website-usability': ['website', 'app', 'mobile', 'interface', 'navigation', 'search', 'user-friendly', 'loading', 'responsive'],
  'mobile-app': ['mobile', 'app', 'ios', 'android', 'download', 'install', 'crash', 'bug', 'feature'],
  'personalization': ['recommendation', 'personalized', 'suggestion', 'relevant', 'tailored', 'customized', 'preference'],
  'inventory': ['stock', 'out of stock', 'availability', 'in stock', 'inventory', 'available'],
  'shipping-speed': ['fast shipping', 'two-day', 'overnight', 'express', 'slow delivery', 'quick shipment'],
  'product-variety': ['variety', 'selection', 'choice', 'options', 'range', 'catalog', 'assortment'],
  'brand-trust': ['brand', 'trust', 'reputation', 'authentic', 'genuine', 'counterfeit', 'reliable', 'established'],
};

// Entity types to extract
const ENTITY_PATTERNS = {
  PRODUCT_NAME: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
  PAYMENT_METHOD: /credit card|debit card|paypal|apple pay|google pay|amazon pay/gi,
  LOCATION: /store|location|branch|outlet|warehouse/gi,
};

export function extractAspectsAndSentiment(text) {
  const normalized = (text || '').toLowerCase().trim();

  // Compute sentiment with negation handling
  const sentiment = computePolarityWithNegation(normalized);
  
  // Extract aspects
  const aspects = extractAspects(normalized);
  
  // Extract entities
  const entities = extractEntities(text);

  return { 
    sentiment, 
    aspects: aspects.length > 0 ? aspects : [{ aspect: 'general', sentiment }],
    entities,
    textLength: text.length,
  };
}

function computePolarityWithNegation(text) {
  let score = 0;
  const sentences = text.split(/[.!?]/);

  for (const sentence of sentences) {
    const hasNegation = NEGATION_WORDS.some(word => sentence.includes(word));
    
    POSITIVE_WORDS.forEach((word) => {
      if (sentence.includes(word)) {
        score += hasNegation ? -1 : 1;
      }
    });

    NEGATIVE_WORDS.forEach((word) => {
      if (sentence.includes(word)) {
        score += hasNegation ? 1 : -1;
      }
    });
  }

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

function extractAspects(text) {
  const aspects = [];
  const seenAspects = new Set();

  for (const [aspect, keywords] of Object.entries(ASPECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!seenAspects.has(aspect)) {
          aspects.push({ aspect, sentiment: 'neutral' }); // sentiment will be set by calling function
          seenAspects.add(aspect);
        }
        break; // Found this aspect, move to next
      }
    }
  }

  return aspects;
}

function extractEntities(text) {
  const entities = {
    paymentMethods: [],
    locations: [],
    productNames: [],
  };

  const paymentMatches = text.match(ENTITY_PATTERNS.PAYMENT_METHOD);
  if (paymentMatches) {
    entities.paymentMethods = [...new Set(paymentMatches.map(m => m.toLowerCase()))];
  }

  const locationMatches = text.match(ENTITY_PATTERNS.LOCATION);
  if (locationMatches) {
    entities.locations = [...new Set(locationMatches)];
  }

  return entities;
}

export function detectDuplicates(text1, text2) {
  // Jaccard similarity: |intersection| / |union|
  const normalize = (t) => t.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  const similarity = intersection.size / union.size;
  return similarity >= 0.7; // 70% similar = duplicate
}

export function computePolarity(text) {
  return computePolarityWithNegation((text || '').toLowerCase());
}
