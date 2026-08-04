# RVoice Algorithms & Technical Deep Dive

## 1. Z-Score Anomaly Detection Algorithm

### Problem Statement
Traditional threshold-based detection (e.g., "issueScore > 2") treats all products equally. RVoice needs to identify unusual patterns relative to baseline behavior.

### Algorithm

```
Input: themes (array of theme objects, each with issueScore)
Output: anomalies (array with spikeId, anomalyScore, confidence, reason)

1. Group themes by product:
   groups[product] = [theme1, theme2, ...]

2. For each product group:
   a. Extract issue scores: scores = [score1, score2, ...]
   
   b. Calculate statistics:
      mean = sum(scores) / count(scores)
      variance = sum((score - mean)²) / count(scores)
      stddev = sqrt(variance)
   
   c. For each theme:
      z_score = (theme.issueScore - mean) / stddev
      
      if stddev > 0:
         confidence = min(|z_score| / 3, 1.0)  # Cap at 1.0
         if z_score > 2:  # More than 2σ from mean
            ANOMALY DETECTED
            reason = "Issue score 4.5 is 2.5σ above baseline"
            baselineScore = mean

3. Return anomalies sorted by confidence (descending)
```

### Statistical Interpretation
- **z_score = 0**: Exactly at mean
- **z_score = ±1**: 68% of population within this range (1σ)
- **z_score = ±2**: 95% of population within this range (2σ)
- **z_score = ±3**: 99.7% of population within this range (3σ)

**Confidence Mapping**:
- z_score = 2.0 → confidence = 0.67 (67%)
- z_score = 2.5 → confidence = 0.83 (83%)
- z_score = 3.0+ → confidence = 1.00 (capped at 100%)

### Example
```
ProductA issue scores: [1.2, 1.5, 1.8, 1.4, 4.5, 1.3]

mean = (1.2 + 1.5 + 1.8 + 1.4 + 4.5 + 1.3) / 6 = 1.95
variance = ((1.2-1.95)² + ... + (4.5-1.95)²) / 6 = 1.45
stddev = sqrt(1.45) ≈ 1.20

For score 4.5:
z_score = (4.5 - 1.95) / 1.20 = 2.12
confidence = min(2.12 / 3, 1.0) = 0.71

RESULT: Anomaly detected, 71% confidence
```

---

## 2. Semantic Clustering Algorithm

### Problem Statement
Group similar customer complaints together without relying on exact keyword matching or ML models.

### Algorithm (Cosine Similarity)

```
Input: themes (array of feedback texts)
Output: clusters (array of theme groups)

1. Extract keywords for each theme:
   keywords[i] = extractKeywords(themes[i].text)
   - Remove stop words (the, a, is, etc.)
   - Keep words > 3 characters
   - Build frequency map: {word: count}

2. Build frequency vectors:
   vec[i] = {
     "delivery": 2,
     "late": 1,
     "shipping": 1,
     ...
   }

3. Calculate cosine similarity between all pairs:
   similarity(vec_A, vec_B) = 
      sum(A[word] * B[word] for all words) 
      / (||A|| * ||B||)
   
   where:
      sum(A[word] * B[word]) = dot product
      ||A|| = sqrt(sum(A[word]²))     = magnitude of A
      ||B|| = sqrt(sum(B[word]²))     = magnitude of B

4. Cluster similar themes:
   For each unvisited theme:
      Create new cluster
      For each other unvisited theme:
         if similarity > 0.6:
            Add to cluster
            Mark as visited

5. Return clusters sorted by size (largest first)
```

### Cosine Similarity Example

```
Theme A: "Delivery was late and frustrating"
Cleaned keywords: {delivery: 1, late: 1, frustrating: 1}
Vector A = {delivery: 1, late: 1, frustrating: 1}

Theme B: "Late shipment, very unhappy"
Cleaned keywords: {late: 1, shipment: 1, unhappy: 1}
Vector B = {late: 1, shipment: 1, unhappy: 1}

Common words: {late: 1}
Dot product = 1*1 = 1
||A|| = sqrt(1² + 1² + 1²) = sqrt(3) ≈ 1.73
||B|| = sqrt(1² + 1² + 1²) = sqrt(3) ≈ 1.73

similarity = 1 / (1.73 * 1.73) ≈ 0.33

Since 0.33 < 0.6: NOT clustered together
```

### Threshold Analysis
- **0.9+**: Nearly identical feedback
- **0.6-0.9**: Similar themes (cluster together)
- **0.3-0.6**: Related but distinct themes
- **<0.3**: Different topics

---

## 3. Negation-Aware Sentiment Analysis

### Problem Statement
Keyword-based sentiment fails on negation: "not good" should be negative, but basic keyword matching would see "good" (positive word) and miss the negation.

### Algorithm

```
Input: text (customer feedback)
Output: sentiment (positive|neutral|negative)

1. Normalize and split by sentences:
   sentences = text.lower().split(/[.!?]/)

2. For each sentence:
   score_sentence = 0
   
   a. Check for negation words:
      negation_present = any(["not", "no", "never", "don't", ...] in sentence)
   
   b. Count positive words:
      For each word in ["great", "good", "excellent", ...]:
         if word in sentence:
            if negation_present:
               score_sentence -= 1  # FLIP
            else:
               score_sentence += 1
   
   c. Count negative words:
      For each word in ["bad", "terrible", "slow", "broken", ...]:
         if word in sentence:
            if negation_present:
               score_sentence += 1  # FLIP
            else:
               score_sentence -= 1
   
   score_total += score_sentence

3. Aggregate:
   if score_total > 0: return "positive"
   if score_total < 0: return "negative"
   return "neutral"
```

### Examples

| Text | Negation | Positive | Negative | Score | Result |
|------|----------|----------|----------|-------|--------|
| "Great product" | No | +1 | 0 | +1 | Positive |
| "Not great product" | Yes | -1 | 0 | -1 | Negative |
| "Bad and slow" | No | 0 | -2 | -2 | Negative |
| "Not bad, not slow" | Yes | 0 | +2 | +2 | Positive |
| "Good but broken" | No | +1 | -1 | 0 | Neutral |

---

## 4. Aspect Extraction (15+ Categories)

### Business Aspects Covered

```
Aspect                Keywords
────────────────────────────────────────────────────
'checkout'            checkout, payment, cart, purchase, billing
'delivery'            delivery, shipping, late, delay, tracking
'product-quality'     quality, defect, broken, damaged, packaging
'customer-support'    support, service, agent, help, response
'store-experience'    store, location, staff, line, wait
'pricing'             price, expensive, cost, value, discount
'returns'             return, refund, exchange, warranty
'packaging'           packaging, box, wrapping, protection
'website-usability'   website, app, navigation, search, loading
'mobile-app'          mobile, app, ios, android, crash
'personalization'     recommendation, personalized, relevant
'inventory'           stock, availability, in stock
'shipping-speed'      fast shipping, overnight, express
'product-variety'     variety, selection, range, catalog
'brand-trust'         brand, trust, authentic, genuine, reputation
```

### Aspect Detection Algorithm

```
Input: text (feedback)
Output: aspects (array of aspect names detected)

For each aspect in ASPECT_KEYWORDS:
   For each keyword in ASPECT_KEYWORDS[aspect]:
      if keyword.lower() in text.lower():
         aspects.add(aspect)
         BREAK  # Found this aspect, move to next

Return aspects (or ['general'] if empty)
```

---

## 5. Issue Scoring Formula

### Severity Calculation

```
Input: aspect_count, negative_count, positive_count, sentiment
Output: issueScore, severity

1. Base score from aspect count:
   base_score = aspect_count

2. Sentiment weight:
   sentiment_weight = negative_count - positive_count

3. Total score:
   issueScore = max(0, base_score + sentiment_weight)

4. Severity mapping:
   if issueScore >= 3:
      severity = "high"
   else if issueScore == 2:
      severity = "medium"
   else:
      severity = "low"
```

### Example
```
Theme with 2 aspects, both with negative sentiment:
base_score = 2
sentiment_weight = 2 - 0 = 2
issueScore = 2 + 2 = 4
severity = "high"  (because 4 >= 3)
```

---

## 6. Week-Over-Week Comparison

### Algorithm

```
Input: product (string)
Output: comparison (object with percentage changes)

1. Current week data (last 7 days):
   SELECT COUNT(*), AVG(issueScore), COUNT(negative_sentiment)
   FROM themes
   WHERE product = ? AND extractedAt >= NOW() - 7 DAYS

2. Previous week data (7-14 days ago):
   SELECT COUNT(*), AVG(issueScore), COUNT(negative_sentiment)
   FROM themes
   WHERE product = ? 
     AND extractedAt >= NOW() - 14 DAYS
     AND extractedAt < NOW() - 7 DAYS

3. Calculate percentage change:
   countChange = ((current - previous) / previous) * 100
   scoreChange = ((current_avg - previous_avg) / previous_avg) * 100
   negativeChange = ((current_neg - previous_neg) / previous_neg) * 100

4. Return:
   {
      countChange: "15.5%",
      scoreChange: "-12.3%",
      negativeChange: "8.2%",
      insight: "Volume up, quality improved week-over-week"
   }
```

---

## 7. Confidence Scoring Framework

### Multi-Factor Confidence

```
Base Confidence Factors:

1. Z-Score Confidence:
   confidence_zscore = min(|z_score| / 3, 1.0)
   Range: 0.0 to 1.0

2. Sample Size Confidence:
   if sample_size < 10:
      confidence *= 0.7  # Less data = less confident
   if sample_size >= 100:
      confidence *= 1.0  # Sufficient data = full confidence

3. Consistency Confidence:
   if variance > threshold:
      confidence *= 0.8  # High variance = less confident

Final Confidence = confidence_zscore * size_factor * consistency_factor

Display to users as percentage: confidence * 100%
```

---

## 8. Recommendation Engine

### Logic

```
Input: theme (with severity, sentiment, aspect)
Output: recommendation (with owner, action, urgency)

1. Map aspect to owner:
   owner = ASPECT_OWNER_MAPPING[theme.aspect] 
   → e.g., "delivery" → "logistics-lead"

2. Map aspect to action:
   action = ASPECT_ACTION_MAPPING[theme.aspect]
   → e.g., "Investigate delivery SLA"

3. Determine urgency:
   if severity == "high" && sentiment == "negative":
      urgency = "critical"
      confidence = 0.95
   else if severity == "high" OR sentiment == "negative":
      urgency = "high"
      confidence = 0.85
   else if severity == "medium":
      urgency = "medium"
      confidence = 0.75
   else:
      urgency = "standard"
      confidence = 0.60

4. Generate reasoning:
   - "Critical negative feedback with high severity score"
   - "Recurring issue (5 mentions)"
   - "Affects checkout, a revenue-critical process"

Return: {
   recommendedOwner: string,
   recommendedAction: string,
   urgency: string,
   confidence: float 0-1,
   reasoning: string,
   estimatedResolutionTime: string
}
```

---

## Performance & Complexity Analysis

| Algorithm | Time Complexity | Space | Suitable For |
|-----------|-----------------|-------|--------------|
| Z-Score | O(n) | O(n) | Real-time detection |
| Semantic Clustering | O(n²) | O(n²) | Batch processing |
| NLP Sentiment | O(n*m) | O(m) | Per-record processing |
| Aspect Extraction | O(n*k) | O(k) | Per-record processing |
| W/W Comparison | O(1) | O(1) | DB queries with indexes |

**Optimizations**:
- Z-score: Incremental calculation on new data
- Clustering: LSH (Locality Sensitive Hashing) for 10k+ items
- Sentiment: Pre-computed word lists (hash lookup)
- Aspect: Trie data structure for keyword matching

