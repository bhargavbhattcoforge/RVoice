import { v4 as uuidv4 } from 'uuid';
import { normalizeFeedbackItem } from './normalizationService.js';
import { loadFeedbackStore, insertFeedback } from './storageService.js';

export async function ingestFeedback(items) {
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }

  const normalized = [];
  for (const item of items) {
    const id = item.id || uuidv4();
    const record = normalizeFeedbackItem({ ...item, id });
    await insertFeedback(record);
    normalized.push(record);
  }

  return normalized;
}

export async function getFeedback(query = {}) {
  try {
    return await loadFeedbackStore();
  } catch (err) {
    console.error('Error in getFeedback:', err);
    return [];
  }
}
