import {
  loadActionStore,
  saveActionStore,
  insertAction,
  getActionById,
  updateAction as dbUpdateAction,
  getActionsByStatus,
  getActionsByOwner,
  getActionsWithPagination,
} from './storageService.js';
import { v4 as uuidv4 } from 'uuid';

const ownerMatrix = {
  checkout: 'ecommerce-product-owner',
  delivery: 'logistics-lead',
  'product quality': 'product-quality-manager',
  'customer support': 'support-manager',
  'store experience': 'store-ops-manager',
  general: 'customer-experience-lead',
};

const actionsByAspect = {
  checkout: 'Review checkout funnel and payment errors for the affected channel.',
  delivery: 'Investigate delivery exceptions and update logistics partner SLA.',
  'product quality': 'Initiate quality review for the referenced SKU and update packaging.',
  'customer support': 'Audit recent contact center interactions and retrain frontline agents.',
  'store experience': 'Review store staff performance and fix any location service gaps.',
  general: 'Consolidate feedback into the VoC dashboard and assign to the relevant team.',
};

const validStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];

export function recommendActionsForTheme(theme) {
  const recommendations = (theme.aspectKeywords || '').split(',').map((aspect) => ({
    aspect: aspect.trim(),
    sentiment: theme.sentiment,
    recommendedAction: actionsByAspect[aspect.trim()] || actionsByAspect.general,
    owner: ownerMatrix[aspect.trim()] || ownerMatrix.general,
  })).filter(r => r.aspect);

  return {
    actionId: uuidv4(),
    themeId: theme.themeId,
    sourceId: theme.sourceId,
    product: theme.product,
    journeyStage: theme.journeyStage,
    sentiment: theme.sentiment,
    issueScore: theme.issueScore || 0,
    severity: theme.severity || 'low',
    status: 'pending',
    assignedOwner: recommendations.length > 0 ? recommendations[0].owner : ownerMatrix.general,
    recommendations: JSON.stringify(recommendations),
    recommendedAt: new Date().toISOString(),
    notes: '[]',
  };
}

export async function persistActions(actions) {
  const saved = [];
  for (const action of actions) {
    const actionRecord = {
      ...action,
      actionId: action.actionId || uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await insertAction(actionRecord);
    saved.push(actionRecord);
  }
  return saved;
}

export async function getActions(query = {}) {
  try {
    if (query.status) {
      return await getActionsByStatus(query.status);
    }
    if (query.owner) {
      return await getActionsByOwner(query.owner);
    }
    return await loadActionStore();
  } catch (err) {
    console.error('Error in getActions:', err);
    return [];
  }
}

export async function updateAction(actionId, updates = {}) {
  try {
    const action = await getActionById(actionId);
    if (!action) {
      throw new Error('Action not found');
    }

    const updated = {
      ...action,
      ...updates,
      status: validStatuses.includes(updates.status) ? updates.status : action.status,
      assignedOwner: updates.assignedOwner || action.assignedOwner,
      updatedAt: new Date().toISOString(),
    };

    return await dbUpdateAction(actionId, updated);
  } catch (err) {
    console.error('Error in updateAction:', err);
    throw err;
  }
}
