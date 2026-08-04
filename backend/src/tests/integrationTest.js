import { sampleFeedback } from '../utils/sampleData.js';

const BASE = 'http://localhost:4000/api';

async function run() {
  console.log('Ingesting sample feedback...');
  const ingest = await fetch(`${BASE}/feedback/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: sampleFeedback }),
  });
  console.log('Ingest response:', await ingest.json());

  console.log('Estimating themes...');
  const themes = await fetch(`${BASE}/themes/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: sampleFeedback }),
  });
  console.log('Theme estimate response:', await themes.json());

  console.log('Fetching clusters...');
  const clusters = await fetch(`${BASE}/clusters`);
  console.log('Clusters response:', await clusters.json());

  console.log('Fetching actions...');
  const actionsRes = await fetch(`${BASE}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: {} }) });
  const actionsData = await actionsRes.json();
  console.log('Actions response:', actionsData);

  if (actionsData.actions.length > 0) {
    const actionId = actionsData.actions[0].actionId;
    console.log('Updating first action status to assigned...');
    const updateRes = await fetch(`${BASE}/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'assigned', notes: ['Assigned to owner for review.'] }),
    });
    console.log('Update response:', await updateRes.json());
  }

  console.log('Fetching overview...');
  const overview = await fetch(`${BASE}/overview`);
  console.log('Overview response:', await overview.json());

  console.log('Fetching spikes...');
  const spikes = await fetch(`${BASE}/detection/spikes`);
  console.log('Spikes response:', await spikes.json());
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
