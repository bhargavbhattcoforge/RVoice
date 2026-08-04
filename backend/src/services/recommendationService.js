// AI-powered recommendation service

const ASPECT_OWNER_MAPPING = {
  'checkout': 'ecommerce-lead',
  'delivery': 'logistics-lead',
  'product-quality': 'product-manager',
  'customer-support': 'support-manager',
  'store-experience': 'operations-manager',
  'pricing': 'revenue-manager',
  'returns': 'fulfillment-lead',
  'packaging': 'supply-chain-lead',
  'website-usability': 'tech-lead',
  'mobile-app': 'mobile-lead',
  'personalization': 'data-science-lead',
  'inventory': 'supply-chain-lead',
  'shipping-speed': 'logistics-lead',
  'product-variety': 'merchandising-lead',
  'brand-trust': 'marketing-lead',
  'general': 'customer-experience-lead',
};

const ASPECT_ACTION_MAPPING = {
  'checkout': 'Analyze checkout funnel, payment gateway errors, and cart abandonment patterns',
  'delivery': 'Investigate delivery SLA, carrier performance, and logistics delays',
  'product-quality': 'Initiate quality review, audit manufacturing, and update QA protocols',
  'customer-support': 'Review support interactions, agent training needs, and resolution time',
  'store-experience': 'Audit store operations, staff performance, and customer journey mapping',
  'pricing': 'Review competitive pricing, discount effectiveness, and margin impact',
  'returns': 'Analyze return reasons, restocking process, and refund timeliness',
  'packaging': 'Evaluate packaging material, unboxing experience, and protection adequacy',
  'website-usability': 'Conduct UX testing, improve navigation, and optimize page load times',
  'mobile-app': 'Fix app bugs, improve performance, and enhance user interface',
  'personalization': 'Enhance recommendation engine and personalization algorithms',
  'inventory': 'Optimize stock levels, improve visibility, and reduce stockouts',
  'shipping-speed': 'Evaluate fulfillment process and shipping partner performance',
  'product-variety': 'Expand product catalog and improve discoverability',
  'brand-trust': 'Address product authenticity concerns and improve brand reputation',
  'general': 'Escalate to customer experience team for multi-functional review',
};

const PRIORITY_MAPPING = {
  high: 'immediate',
  medium: 'soon',
  low: 'backlog',
};

export function generateRecommendations(theme) {
  const recommendedOwner = ASPECT_OWNER_MAPPING[theme.categorization] || ASPECT_OWNER_MAPPING.general;
  const recommendedAction = ASPECT_ACTION_MAPPING[theme.categorization] || ASPECT_ACTION_MAPPING.general;
  
  // Determine urgency
  let urgency = 'standard';
  let confidence = 0.6;
  
  if (theme.severity === 'high' && theme.sentiment === 'negative') {
    urgency = 'critical';
    confidence = 0.95;
  } else if (theme.severity === 'high' || theme.sentiment === 'negative') {
    urgency = 'high';
    confidence = 0.85;
  } else if (theme.severity === 'medium') {
    urgency = 'medium';
    confidence = 0.75;
  }

  return {
    recommendedAt: new Date().toISOString(),
    recommendedOwner,
    recommendedAction,
    urgency,
    priority: PRIORITY_MAPPING[theme.severity] || 'backlog',
    estimatedResolutionTime: getEstimatedResolutionTime(theme.categorization),
    confidence,
    reasoning: generateReasoning(theme),
  };
}

export function generateBulkRecommendations(themes) {
  return themes.map(theme => generateRecommendations(theme));
}

function getEstimatedResolutionTime(aspect) {
  const timeMap = {
    'checkout': '2-4 hours',
    'delivery': '1-3 days',
    'product-quality': '3-7 days',
    'customer-support': '1-2 days',
    'store-experience': '2-5 days',
    'pricing': '1-2 days',
    'returns': '1-3 days',
    'packaging': '5-10 days',
    'website-usability': '2-7 days',
    'mobile-app': '3-7 days',
    'personalization': '5-14 days',
    'inventory': '1-2 days',
    'shipping-speed': '2-7 days',
    'product-variety': '7-14 days',
    'brand-trust': '7-21 days',
  };
  return timeMap[aspect] || '3-5 days';
}

function generateReasoning(theme) {
  const reasonings = [];

  if (theme.sentiment === 'negative' && theme.severity === 'high') {
    reasonings.push('Critical negative feedback with high severity score');
  }
  
  if (theme.sentiment === 'negative') {
    reasonings.push('Negative sentiment detected requiring immediate attention');
  }

  if (theme.severity === 'high') {
    reasonings.push(`High severity issue (score: ${theme.issueScore})`);
  }

  if (theme.mentionCount && theme.mentionCount > 3) {
    reasonings.push(`Recurring issue (${theme.mentionCount} mentions)`);
  }

  if (reasonings.length === 0) {
    reasonings.push('Standard review recommended');
  }

  return reasonings.join('; ');
}

export function prioritizeRecommendations(recommendations) {
  const priorityOrder = { critical: 0, high: 1, medium: 2, standard: 3 };
  return recommendations.sort((a, b) => priorityOrder[a.urgency] - priorityOrder[b.urgency]);
}

export function groupRecommendationsByOwner(recommendations) {
  const grouped = {};
  for (const rec of recommendations) {
    if (!grouped[rec.recommendedOwner]) {
      grouped[rec.recommendedOwner] = [];
    }
    grouped[rec.recommendedOwner].push(rec);
  }
  return grouped;
}

export function generateExecutiveSummary(themes) {
  const total = themes.length;
  const byUrgency = {
    critical: 0,
    high: 0,
    medium: 0,
    standard: 0,
  };

  const byOwner = {};
  const recommendations = [];

  for (const theme of themes) {
    const rec = generateRecommendations(theme);
    recommendations.push(rec);
    byUrgency[rec.urgency]++;
    
    if (!byOwner[rec.recommendedOwner]) {
      byOwner[rec.recommendedOwner] = 0;
    }
    byOwner[rec.recommendedOwner]++;
  }

  return {
    totalIssues: total,
    urgencyBreakdown: byUrgency,
    workloadByOwner: byOwner,
    topPriorities: recommendations
      .filter(r => r.urgency === 'critical')
      .slice(0, 5),
    estimatedEffort: `${Math.ceil(total / 10)} person-days`,
  };
}
