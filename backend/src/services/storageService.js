import { all, run, get } from '../../db.js';

// Feedback storage using SQLite
export async function loadFeedbackStore() {
  return all('SELECT * FROM feedback ORDER BY timestamp DESC');
}

export async function saveFeedbackStore(records) {
  // No-op: records are saved individually via insertFeedback
}

export async function insertFeedback(record) {
  const { id, source, text, rating, product, journeyStage, timestamp, status = 'new', metadata } = record;
  await run(
    `INSERT INTO feedback (id, source, text, rating, product, journeyStage, timestamp, status, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, source, text, rating, product, journeyStage, timestamp, status, metadata ? JSON.stringify(metadata) : null]
  );
  return record;
}

export async function getFeedbackById(id) {
  return get('SELECT * FROM feedback WHERE id = ?', [id]);
}

export async function updateFeedback(id, updates) {
  const feedback = await getFeedbackById(id);
  if (!feedback) return null;
  
  const updated = { ...feedback, ...updates };
  await run(
    `UPDATE feedback SET source = ?, text = ?, rating = ?, product = ?, journeyStage = ?, status = ?, metadata = ? WHERE id = ?`,
    [updated.source, updated.text, updated.rating, updated.product, updated.journeyStage, updated.status, updated.metadata, id]
  );
  return updated;
}

export async function getFeedbackByProduct(product) {
  return all('SELECT * FROM feedback WHERE product = ? ORDER BY timestamp DESC', [product]);
}

export async function getFeedbackByDateRange(startDate, endDate) {
  return all(
    'SELECT * FROM feedback WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
    [startDate, endDate]
  );
}

// Theme storage using SQLite
export async function loadThemeStore() {
  return all('SELECT * FROM themes ORDER BY issueScore DESC');
}

export async function saveThemeStore(records) {
  // No-op: records are saved individually via insertTheme
}

export async function insertTheme(record) {
  const { themeId, sourceId, text, categorization, sentiment = 'neutral', severity = 'low', issueScore = 0, aspectKeywords, mentionCount = 1, extractedAt, product, journeyStage } = record;
  await run(
    `INSERT INTO themes (themeId, sourceId, text, categorization, sentiment, severity, issueScore, aspectKeywords, mentionCount, extractedAt, product, journeyStage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [themeId, sourceId, text, categorization, sentiment, severity, issueScore, aspectKeywords, mentionCount, extractedAt, product, journeyStage]
  );
  return record;
}

export async function getThemeById(themeId) {
  return get('SELECT * FROM themes WHERE themeId = ?', [themeId]);
}

export async function updateTheme(themeId, updates) {
  const theme = await getThemeById(themeId);
  if (!theme) return null;
  
  const updated = { ...theme, ...updates };
  await run(
    `UPDATE themes SET sourceId = ?, text = ?, categorization = ?, sentiment = ?, severity = ?, issueScore = ?, aspectKeywords = ?, mentionCount = ?, product = ?, journeyStage = ? WHERE themeId = ?`,
    [updated.sourceId, updated.text, updated.categorization, updated.sentiment, updated.severity, updated.issueScore, updated.aspectKeywords, updated.mentionCount, updated.product, updated.journeyStage, themeId]
  );
  return updated;
}

export async function getThemesByProduct(product) {
  return all('SELECT * FROM themes WHERE product = ? ORDER BY issueScore DESC', [product]);
}

export async function getThemesBySeverity(severity) {
  return all('SELECT * FROM themes WHERE severity = ? ORDER BY issueScore DESC', [severity]);
}

export async function getThemesWithPagination(limit = 50, offset = 0) {
  return all('SELECT * FROM themes ORDER BY issueScore DESC LIMIT ? OFFSET ?', [limit, offset]);
}

// Action storage using SQLite
export async function loadActionStore() {
  return all('SELECT * FROM actions ORDER BY createdAt DESC');
}

export async function saveActionStore(records) {
  // No-op: records are saved individually via insertAction
}

export async function insertAction(record) {
  const { actionId, themeId, sentiment, issueScore, status = 'pending', assignedOwner, priority = 'medium', recommendations, notes } = record;
  await run(
    `INSERT INTO actions (actionId, themeId, sentiment, issueScore, status, assignedOwner, priority, recommendations, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [actionId, themeId, sentiment, issueScore, status, assignedOwner, priority, recommendations ? JSON.stringify(recommendations) : null, notes]
  );
  return record;
}

export async function getActionById(actionId) {
  return get('SELECT * FROM actions WHERE actionId = ?', [actionId]);
}

export async function updateAction(actionId, updates) {
  const action = await getActionById(actionId);
  if (!action) return null;
  
  const updated = { ...action, ...updates };
  await run(
    `UPDATE actions SET themeId = ?, sentiment = ?, issueScore = ?, status = ?, assignedOwner = ?, priority = ?, recommendations = ?, notes = ?, resolvedAt = ? WHERE actionId = ?`,
    [updated.themeId, updated.sentiment, updated.issueScore, updated.status, updated.assignedOwner, updated.priority, updated.recommendations, updated.notes, updated.resolvedAt, actionId]
  );
  return updated;
}

export async function getActionsByStatus(status) {
  return all('SELECT * FROM actions WHERE status = ? ORDER BY createdAt DESC', [status]);
}

export async function getActionsByOwner(owner) {
  return all('SELECT * FROM actions WHERE assignedOwner = ? ORDER BY createdAt DESC', [owner]);
}

export async function getActionsWithPagination(limit = 50, offset = 0) {
  return all('SELECT * FROM actions ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
}
