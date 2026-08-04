async function fetchJson(path) {
  const res = await fetch(path);
  return res.json();
}

function renderItems(containerId, items, template) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.length
    ? items.map(template).join('')
    : '<div>No records available</div>';
}

function actionTemplate(action) {
  return `
    <div class="action-item">
      <div class="item-title">${action.recommendations[0].recommendedAction}</div>
      <div class="item-meta">Owner: ${action.assignedOwner} · Status: ${action.status} · Severity: ${action.severity}</div>
    </div>
  `;
}

function clusterTemplate(cluster) {
  return `
    <div class="cluster-item">
      <div class="item-title">${cluster.clusterId}</div>
      <div class="item-meta">Count: ${cluster.count} · Product: ${cluster.product || 'general'} · Stage: ${cluster.journeyStage || 'general'}</div>
    </div>
  `;
}

function spikeTemplate(spike) {
  return `
    <div class="spike-item">
      <div class="item-title">${spike.reason}</div>
      <div class="item-meta">Theme: ${spike.themeId} · Score: ${spike.score}</div>
      <div>${spike.text}</div>
    </div>
  `;
}

function renderOverview(summary) {
  const container = document.getElementById('overview');
  container.innerHTML = `
    <div class="item-meta">Themes: ${summary.themeCount} · Actions: ${summary.actionCount}</div>
    <div>${summary.actions.length} actions loaded · ${summary.clusters.length} clusters · ${summary.spikes.length} spikes</div>
  `;
  renderItems('actions', summary.actions || [], actionTemplate);
  renderItems('clusters', summary.clusters || [], clusterTemplate);
  renderItems('spikes', summary.spikes || [], spikeTemplate);
}

window.addEventListener('DOMContentLoaded', async () => {
  const health = document.getElementById('health');
  const result = await fetchJson('/api/health');
  health.textContent = result.status === 'ok' ? 'Online' : 'Offline';

  document.getElementById('load-overview').addEventListener('click', async () => {
    const data = await fetchJson('/api/overview');
    renderOverview(data);
  });

  document.getElementById('load-actions').addEventListener('click', async () => {
    const data = await fetchJson('/api/actions');
    renderItems('actions', data.actions || [], actionTemplate);
  });

  document.getElementById('load-clusters').addEventListener('click', async () => {
    const data = await fetchJson('/api/clusters');
    renderItems('clusters', data.clusters || [], clusterTemplate);
  });

  document.getElementById('load-spikes').addEventListener('click', async () => {
    const data = await fetchJson('/api/detection/spikes');
    renderItems('spikes', data.spikes || [], spikeTemplate);
  });
});
