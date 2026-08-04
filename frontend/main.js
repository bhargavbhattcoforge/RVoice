const state = {
  themes: [],
  actions: [],
  clusters: [],
  spikes: [],
  overview: null,
  filters: {
    product: '',
    journeyStage: '',
    sentiment: '',
  },
};

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function formatDate(value) {
  return new Date(value).toLocaleString([], { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function postJson(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function patchJson(path, payload) {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function setMetrics(summary) {
  document.getElementById('theme-count').textContent = summary.themeCount ?? 0;
  document.getElementById('action-count').textContent = summary.actionCount ?? 0;
  document.getElementById('cluster-count').textContent = summary.clusters?.length ?? 0;
  document.getElementById('spike-count').textContent = summary.spikes?.length ?? 0;
}

function setLastUpdated() {
  document.getElementById('last-updated').textContent = `Last updated: ${formatDate(new Date())}`;
}

function renderItems(containerId, items, template) {
  const container = document.getElementById(containerId);
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<div class="empty-state">No records available</div>';
    return;
  }
  container.innerHTML = items.map(template).join('');
}

function themeTemplate(theme) {
  return `
    <div class="theme-item">
      <div class="item-title">${theme.product || 'General'} — ${theme.themeId}</div>
      <div class="item-meta">${theme.journeyStage || 'general'} · ${theme.sentiment} · score ${theme.issueScore ?? 0}</div>
      <div class="item-details">${theme.text}</div>
      <div class="tags">${theme.aspects
        .map((aspect) => `<span class="tag">${aspect.aspect}: ${aspect.sentiment}</span>`)
        .join('')}</div>
      <button class="small-button detail-button" data-item-type="theme" data-item-id="${theme.themeId}">View details</button>
    </div>
  `;
}

function actionTemplate(action) {
  const recommendations = Array.isArray(action.recommendations)
    ? action.recommendations
        .map((rec) => `<li>${rec.aspect}: ${rec.recommendedAction}</li>`)
        .join('')
    : '';
  const nextStatus = action.status === 'pending' ? 'in_progress' : action.status === 'in_progress' ? 'resolved' : 'closed';
  const buttonLabel = action.status === 'resolved' ? 'Closed' : action.status === 'in_progress' ? 'Resolve' : 'Start';

  return `
    <div class="action-item">
      <div class="item-title">${action.assignedOwner}</div>
      <div class="item-meta">Status: ${action.status} · Severity: ${action.severity}</div>
      <div class="item-details">${action.notes?.length ? `Notes: ${action.notes.join(', ')}` : 'No notes yet.'}</div>
      <ul class="action-list">${recommendations}</ul>
      <div class="note-row">
        <input class="action-note-input" data-action-id="${action.actionId}" type="text" placeholder="Add a note" />
        <button class="small-button action-note-button" data-action-id="${action.actionId}">Save note</button>
      </div>
      <div class="action-footer">
        <button class="small-button detail-button" data-item-type="action" data-item-id="${action.actionId}">View details</button>
        <button class="small-button action-update-button" data-action-id="${action.actionId}" data-next-status="${nextStatus}">${buttonLabel}</button>
      </div>
    </div>
  `;
}

function attachActionUpdateEvents() {
  document.querySelectorAll('.action-update-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const actionId = button.dataset.actionId;
      const status = button.dataset.nextStatus;
      button.disabled = true;
      button.textContent = 'Updating...';
      try {
        await patchJson(`/api/actions/${actionId}`, { status });
        await loadActions();
        renderDashboard();
      } catch (error) {
        console.error(error);
        button.textContent = 'Retry';
      } finally {
        button.disabled = false;
      }
    });
  });

  document.querySelectorAll('.action-note-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const actionId = button.dataset.actionId;
      const input = document.querySelector(`.action-note-input[data-action-id="${actionId}"]`);
      const note = input?.value.trim();
      if (!note) {
        return;
      }
      button.disabled = true;
      button.textContent = 'Saving...';
      try {
        await patchJson(`/api/actions/${actionId}`, { notes: [note] });
        await loadActions();
        renderDashboard();
      } catch (error) {
        console.error(error);
        button.textContent = 'Retry';
      } finally {
        button.disabled = false;
        if (input) {
          input.value = '';
        }
      }
    });
  });

  document.querySelectorAll('.detail-button').forEach((button) => {
    button.addEventListener('click', () => {
      const itemType = button.dataset.itemType;
      const itemId = button.dataset.itemId;
      if (itemType === 'action') {
        const action = state.actions.find((item) => item.actionId === itemId);
        if (action) {
          showModal(`Action: ${action.assignedOwner}`, actionDetailHtml(action));
        }
      }
      if (itemType === 'theme') {
        const theme = state.themes.find((item) => item.themeId === itemId);
        if (theme) {
          showModal(`Theme: ${theme.themeId}`, themeDetailHtml(theme));
        }
      }
    });
  });
}

function clusterTemplate(cluster) {
  const sentimentBadges = Object.entries(cluster.sentimentDistribution || {})
    .map(([sentiment, count]) => `<span class="tag">${sentiment}: ${count}</span>`)
    .join('');

  return `
    <div class="cluster-item">
      <div class="item-title">${cluster.clusterId}</div>
      <div class="item-meta">Count: ${cluster.count} · ${cluster.product || 'general'} · ${cluster.journeyStage || 'general'}</div>
      <div class="tags">${sentimentBadges}</div>
    </div>
  `;
}

function spikeTemplate(spike) {
  return `
    <div class="spike-item">
      <div class="item-title">${spike.reason}</div>
      <div class="item-meta">Theme: ${spike.themeId} · Score: ${spike.score}</div>
      <div class="item-details">${spike.text || 'No source text available.'}</div>
    </div>
  `;
}

function renderFilters(themes) {
  const products = Array.from(new Set(themes.map((theme) => theme.product).filter(Boolean))).sort();
  const stages = Array.from(new Set(themes.map((theme) => theme.journeyStage).filter(Boolean))).sort();

  const productSelect = document.getElementById('product-filter');
  const stageSelect = document.getElementById('stage-filter');

  productSelect.innerHTML = '<option value="">All</option>' + products.map((value) => `<option value="${value}">${value}</option>`).join('');
  stageSelect.innerHTML = '<option value="">All</option>' + stages.map((value) => `<option value="${value}">${value}</option>`).join('');
}

function getFilteredThemes() {
  return state.themes.filter((theme) => {
    const matchesProduct = state.filters.product ? theme.product === state.filters.product : true;
    const matchesStage = state.filters.journeyStage ? theme.journeyStage === state.filters.journeyStage : true;
    const matchesSentiment = state.filters.sentiment ? theme.sentiment === state.filters.sentiment : true;
    return matchesProduct && matchesStage && matchesSentiment;
  });
}

function buildClusters(themes) {
  const clusters = {};

  themes.forEach((theme) => {
    const key = `${theme.product || 'general'}-${theme.journeyStage || 'general'}`;
    clusters[key] = clusters[key] || {
      clusterId: key,
      product: theme.product,
      journeyStage: theme.journeyStage,
      items: [],
    };
    clusters[key].items.push(theme);
  });

  return Object.values(clusters).map((cluster) => ({
    ...cluster,
    count: cluster.items.length,
    sentimentDistribution: cluster.items.reduce(
      (acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 },
    ),
  }));
}

function buildSpikes(themes) {
  return themes
    .filter((theme) => theme.issueScore >= 2)
    .map((theme) => ({
      themeId: theme.themeId,
      score: theme.issueScore,
      reason: 'Issue score threshold exceeded',
      text: theme.text,
    }));
}

function actionDetailHtml(action) {
  return `
    <div class="detail-section">
      <p><strong>Assigned Owner:</strong> ${action.assignedOwner}</p>
      <p><strong>Status:</strong> ${action.status}</p>
      <p><strong>Severity:</strong> ${action.severity}</p>
      <p><strong>Product:</strong> ${action.product || 'general'}</p>
      <p><strong>Stage:</strong> ${action.journeyStage || 'general'}</p>
      <p><strong>Issue score:</strong> ${action.issueScore ?? 0}</p>
      <p><strong>Recommendations:</strong></p>
      <ul>${action.recommendations
        .map((rec) => `<li><strong>${rec.aspect}</strong>: ${rec.recommendedAction}</li>`)
        .join('')}</ul>
      <p><strong>Notes:</strong> ${action.notes?.length ? action.notes.join(', ') : 'No notes yet.'}</p>
      <p><strong>Created:</strong> ${action.recommendedAt || 'unknown'}</p>
    </div>
  `;
}

function themeDetailHtml(theme) {
  return `
    <div class="detail-section">
      <p><strong>Theme ID:</strong> ${theme.themeId}</p>
      <p><strong>Source:</strong> ${theme.source || 'n/a'}</p>
      <p><strong>Product:</strong> ${theme.product || 'general'}</p>
      <p><strong>Store:</strong> ${theme.store || 'n/a'}</p>
      <p><strong>Stage:</strong> ${theme.journeyStage || 'general'}</p>
      <p><strong>Sentiment:</strong> ${theme.sentiment}</p>
      <p><strong>Issue score:</strong> ${theme.issueScore ?? 0}</p>
      <p><strong>Text:</strong></p>
      <div class="item-details">${theme.text}</div>
      <p><strong>Aspects:</strong></p>
      <div class="tags">${theme.aspects
        .map((aspect) => `<span class="tag">${aspect.aspect}: ${aspect.sentiment}</span>`)
        .join('')}</div>
    </div>
  `;
}

function showModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function hideModal() {
  document.getElementById('detail-modal').classList.add('hidden');
}

function renderDashboard() {
  const filteredThemes = getFilteredThemes();
  renderItems('themes', filteredThemes, themeTemplate);
  renderItems('actions', state.actions, actionTemplate);
  renderItems('clusters', buildClusters(filteredThemes), clusterTemplate);
  renderItems('spikes', buildSpikes(filteredThemes), spikeTemplate);
  attachActionUpdateEvents();
  setMetrics({
    themeCount: state.overview?.themeCount ?? filteredThemes.length,
    actionCount: state.actions.length,
    clusters: buildClusters(filteredThemes),
    spikes: buildSpikes(filteredThemes),
  });
}

async function submitFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  const product = document.getElementById('feedback-product').value.trim();
  const journeyStage = document.getElementById('feedback-stage').value.trim();
  const source = document.getElementById('feedback-source').value.trim();
  const store = document.getElementById('feedback-store').value.trim();
  const id = document.getElementById('feedback-id').value.trim();
  const status = document.getElementById('ingest-status');

  if (!text) {
    status.textContent = 'Please enter feedback text before ingesting.';
    return;
  }

  try {
    const payload = {
      items: [{ id: id || `feedback-${Date.now()}`, text, product, journeyStage, source, store }],
    };
    const result = await postJson('/api/feedback/ingest', payload);
    status.textContent = `Ingested ${result.ingested} item(s). Now estimate themes to see results.`;
    document.getElementById('feedback-text').value = '';
  } catch (error) {
    console.error(error);
    status.textContent = 'Unable to ingest feedback. Check backend status.';
  }
}

async function estimateThemes() {
  const text = document.getElementById('feedback-text').value.trim();
  const product = document.getElementById('feedback-product').value.trim();
  const journeyStage = document.getElementById('feedback-stage').value.trim();
  const source = document.getElementById('feedback-source').value.trim();
  const store = document.getElementById('feedback-store').value.trim();
  const id = document.getElementById('feedback-id').value.trim();
  const status = document.getElementById('ingest-status');

  if (!text) {
    status.textContent = 'Enter feedback text to estimate themes.';
    return;
  }

  try {
    const payload = {
      items: [{ id: id || `feedback-${Date.now()}`, text, product, journeyStage, source, store }],
    };
    const result = await postJson('/api/themes/estimate', payload);
    state.themes = result.themes || [];
    status.textContent = `Estimated ${state.themes.length} theme(s). Use refresh to sync full dashboard.`;
    await loadActions();
    renderDashboard();
  } catch (error) {
    console.error(error);
    status.textContent = 'Unable to estimate themes. Check backend status.';
  }
}

function fillSampleFeedback() {
  document.getElementById('feedback-text').value = 'Checkout failed when applying discount codes, resulting in a declined payment message.';
  document.getElementById('feedback-product').value = 'payments';
  document.getElementById('feedback-stage').value = 'checkout';
  document.getElementById('feedback-source').value = 'web';
  document.getElementById('feedback-store').value = 'online';
  document.getElementById('feedback-id').value = `sample-${Date.now()}`;
}

async function loadHealth() {
  try {
    const result = await fetchJson('/api/health');
    document.getElementById('health').textContent = result.status === 'ok' ? 'Online' : 'Offline';
  } catch (error) {
    document.getElementById('health').textContent = 'Unavailable';
  }
}

async function loadOverview() {
  try {
    const data = await fetchJson('/api/overview');
    state.overview = data;
    setMetrics(data);
    setLastUpdated();
  } catch (error) {
    console.error(error);
  }
}

async function loadThemes() {
  try {
    const data = await fetchJson('/api/themes');
    state.themes = data.themes || [];
    renderFilters(state.themes);
  } catch (error) {
    document.getElementById('themes').innerHTML = `<div class="empty-state">Unable to load themes</div>`;
  }
}

async function loadActions() {
  try {
    const data = await fetchJson('/api/actions');
    state.actions = data.actions || [];
  } catch (error) {
    document.getElementById('actions').innerHTML = `<div class="empty-state">Unable to load actions</div>`;
  }
}

async function reloadDashboard() {
  await Promise.all([loadHealth(), loadOverview(), loadThemes(), loadActions()]);
  renderDashboard();
}

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('refresh-dashboard').addEventListener('click', async () => {
    document.getElementById('refresh-dashboard').textContent = 'Refreshing...';
    await reloadDashboard();
    document.getElementById('refresh-dashboard').textContent = 'Refresh dashboard';
  });

  document.getElementById('load-themes').addEventListener('click', async () => {
    await loadThemes();
    renderDashboard();
  });

  document.getElementById('load-actions').addEventListener('click', async () => {
    await loadActions();
    renderDashboard();
  });

  document.getElementById('load-clusters').addEventListener('click', async () => {
    renderDashboard();
  });

  document.getElementById('load-spikes').addEventListener('click', async () => {
    renderDashboard();
  });

  document.getElementById('submit-feedback').addEventListener('click', async () => {
    await submitFeedback();
  });

  document.getElementById('estimate-themes').addEventListener('click', async () => {
    await estimateThemes();
  });

  document.getElementById('load-sample').addEventListener('click', () => {
    fillSampleFeedback();
  });

  document.getElementById('apply-filters').addEventListener('click', () => {
    state.filters.product = document.getElementById('product-filter').value;
    state.filters.journeyStage = document.getElementById('stage-filter').value;
    state.filters.sentiment = document.getElementById('sentiment-filter').value;
    renderDashboard();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('product-filter').value = '';
    document.getElementById('stage-filter').value = '';
    document.getElementById('sentiment-filter').value = '';
    state.filters = { product: '', journeyStage: '', sentiment: '' };
    renderDashboard();
  });

  document.getElementById('close-modal').addEventListener('click', hideModal);
  document.getElementById('detail-modal').addEventListener('click', (event) => {
    if (event.target === document.getElementById('detail-modal')) {
      hideModal();
    }
  });

  await reloadDashboard();
});
