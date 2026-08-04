// Semantic clustering service using keyword frequency vectors and cosine similarity

export function semanticCluster(themes, similarityThreshold = 0.6) {
  if (!Array.isArray(themes) || themes.length === 0) {
    return [];
  }

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < themes.length; i++) {
    if (visited.has(i)) continue;

    const cluster = {
      clusterId: `semantic-${i}-${Date.now()}`,
      items: [themes[i]],
      keyWords: extractKeywords(themes[i].text),
      representativeText: themes[i].text,
      size: 1,
    };

    visited.add(i);

    // Find similar themes
    for (let j = i + 1; j < themes.length; j++) {
      if (visited.has(j)) continue;

      const similarity = cosineSimilarity(
        extractKeywords(themes[i].text),
        extractKeywords(themes[j].text)
      );

      if (similarity >= similarityThreshold) {
        cluster.items.push(themes[j]);
        cluster.size++;
        visited.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters.sort((a, b) => b.size - a.size);
}

function extractKeywords(text) {
  // Remove stop words and extract meaningful keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'is', 'was', 'are', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);

  const words = text.toLowerCase().split(/\s+/);
  const keywords = {};

  for (const word of words) {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      keywords[cleaned] = (keywords[cleaned] || 0) + 1;
    }
  }

  return keywords;
}

function cosineSimilarity(vec1, vec2) {
  // Compute cosine similarity between two frequency vectors
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

  for (const key of allKeys) {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  }

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

export function findSimilarThemes(targetTheme, themes, limit = 5) {
  const targetKeywords = extractKeywords(targetTheme.text);
  const similarities = themes
    .filter(t => t.themeId !== targetTheme.themeId)
    .map(theme => ({
      theme,
      similarity: cosineSimilarity(targetKeywords, extractKeywords(theme.text)),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return similarities;
}

export function getClusterInsights(clusters) {
  return clusters.map(cluster => ({
    clusterId: cluster.clusterId,
    size: cluster.size,
    sentiment: cluster.items[0]?.sentiment || 'neutral',
    severity: cluster.items[0]?.severity || 'low',
    keywords: Object.entries(cluster.keyWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, freq]) => word),
    representativeText: cluster.representativeText,
  }));
}
