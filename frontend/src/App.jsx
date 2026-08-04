import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MetricGrid from './components/MetricGrid.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import FiltersPanel from './components/FiltersPanel.jsx';
import IngestCard from './components/IngestCard.jsx';
import ThemeList from './components/ThemeList.jsx';
import ActionList from './components/ActionList.jsx';
import ClusterList from './components/ClusterList.jsx';
import SpikeList from './components/SpikeList.jsx';
import DetailModal from './components/DetailModal.jsx';
import { fetchJson, patchJson, postJson } from './services/api.js';
import { formatDate } from './utils/format.js';
import { buildClusters, buildSpikes } from './utils/dashboard.js';

const initialFilters = { product: '', journeyStage: '', sentiment: '' };
const initialIngest = {
  text: '',
  product: '',
  journeyStage: '',
  source: '',
  store: '',
  id: '',
};

export default function App() {
  const [themes, setThemes] = useState([]);
  const [actions, setActions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [health, setHealth] = useState('Loading...');
  const [lastUpdated, setLastUpdated] = useState('—');
  const [ingestStatus, setIngestStatus] = useState('Submit feedback to the VoC pipeline.');
  const [ingestForm, setIngestForm] = useState(initialIngest);
  const [actionNotes, setActionNotes] = useState({});
  const [detailPayload, setDetailPayload] = useState(null);
  const [detailTitle, setDetailTitle] = useState('Details');
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const products = useMemo(
    () => Array.from(new Set(themes.map((theme) => theme.product).filter(Boolean))).sort(),
    [themes],
  );
  const stages = useMemo(
    () => Array.from(new Set(themes.map((theme) => theme.journeyStage).filter(Boolean))).sort(),
    [themes],
  );

  const filteredThemes = useMemo(
    () =>
      themes.filter((theme) => {
        const matchesProduct = filters.product ? theme.product === filters.product : true;
        const matchesStage = filters.journeyStage ? theme.journeyStage === filters.journeyStage : true;
        const matchesSentiment = filters.sentiment ? theme.sentiment === filters.sentiment : true;
        return matchesProduct && matchesStage && matchesSentiment;
      }),
    [themes, filters],
  );

  const clusters = useMemo(() => buildClusters(filteredThemes), [filteredThemes]);
  const spikes = useMemo(() => buildSpikes(filteredThemes), [filteredThemes]);

  const summary = useMemo(
    () => ({
      themeCount: overview?.themeCount ?? filteredThemes.length,
      actionCount: overview?.actionCount ?? actions.length,
      openActionCount: overview?.openActionCount ?? 0,
      feedbackCount: overview?.feedbackCount ?? 0,
      clusterCount: clusters.length,
      spikeCount: spikes.length,
    }),
    [overview, filteredThemes, actions.length, clusters.length, spikes.length],
  );

  const loadHealth = useCallback(async () => {
    try {
      const result = await fetchJson('/api/health');
      setHealth(result.status === 'ok' ? 'Online' : 'Offline');
    } catch (error) {
      setHealth('Unavailable');
    }
  }, []);

  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchJson('/api/overview');
      setOverview(data);
      setLastUpdated(formatDate(new Date()));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadThemes = useCallback(async () => {
    try {
      const data = await fetchJson('/api/themes');
      setThemes(data.themes || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadActions = useCallback(async () => {
    try {
      const data = await fetchJson('/api/actions');
      setActions(data.actions || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const reloadDashboard = useCallback(async () => {
    setLoadingRefresh(true);
    await Promise.all([loadHealth(), loadOverview(), loadThemes(), loadActions()]);
    setLoadingRefresh(false);
  }, [loadHealth, loadOverview, loadThemes, loadActions]);

  useEffect(() => {
    reloadDashboard();
  }, [reloadDashboard]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
  };

  const updateIngestField = (name, value) => {
    setIngestForm((current) => ({ ...current, [name]: value }));
  };

  const loadSampleFeedback = () => {
    setIngestForm({
      text: 'Checkout failed when applying discount codes, resulting in a declined payment message.',
      product: 'payments',
      journeyStage: 'checkout',
      source: 'web',
      store: 'online',
      id: `sample-${Date.now()}`,
    });
  };

  const submitFeedback = async () => {
    if (!ingestForm.text.trim()) {
      setIngestStatus('Please enter feedback text before ingesting.');
      return;
    }

    try {
      const payload = {
        items: [
          {
            id: ingestForm.id || `feedback-${Date.now()}`,
            text: ingestForm.text,
            product: ingestForm.product,
            journeyStage: ingestForm.journeyStage,
            source: ingestForm.source,
            store: ingestForm.store,
          },
        ],
      };
      const result = await postJson('/api/feedback/ingest', payload);
      setIngestStatus(`Ingested ${result.ingested} item(s). Now estimate themes to see results.`);
      setIngestForm((current) => ({ ...current, text: '' }));
      await loadThemes();
    } catch (error) {
      console.error(error);
      setIngestStatus('Unable to ingest feedback. Check backend status.');
    }
  };

  const estimateThemes = async () => {
    if (!ingestForm.text.trim()) {
      setIngestStatus('Enter feedback text to estimate themes.');
      return;
    }

    try {
      const payload = {
        items: [
          {
            id: ingestForm.id || `feedback-${Date.now()}`,
            text: ingestForm.text,
            product: ingestForm.product,
            journeyStage: ingestForm.journeyStage,
            source: ingestForm.source,
            store: ingestForm.store,
          },
        ],
      };
      const result = await postJson('/api/themes/estimate', payload);
      setThemes(result.themes || []);
      setIngestStatus(`Estimated ${result.themes?.length ?? 0} theme(s). Use refresh to sync the full dashboard.`);
      await loadActions();
    } catch (error) {
      console.error(error);
      setIngestStatus('Unable to estimate themes. Check backend status.');
    }
  };

  const updateActionStatus = async (actionId, status) => {
    try {
      await patchJson(`/api/actions/${actionId}`, { status });
      await loadActions();
    } catch (error) {
      console.error(error);
    }
  };

  const saveActionNote = async (actionId) => {
    const note = actionNotes[actionId]?.trim();
    if (!note) {
      return;
    }

    try {
      await patchJson(`/api/actions/${actionId}`, { notes: [note] });
      setActionNotes((current) => ({ ...current, [actionId]: '' }));
      await loadActions();
    } catch (error) {
      console.error(error);
    }
  };

  const showDetail = (itemType, itemId) => {
    if (itemType === 'action') {
      const action = actions.find((item) => item.actionId === itemId);
      if (action) {
        setDetailTitle(`Action: ${action.assignedOwner}`);
        setDetailPayload(renderActionDetails(action));
      }
    }

    if (itemType === 'theme') {
      const theme = themes.find((item) => item.themeId === itemId);
      if (theme) {
        setDetailTitle(`Theme: ${theme.themeId}`);
        setDetailPayload(renderThemeDetails(theme));
      }
    }
  };

  const hideModal = () => {
    setDetailPayload(null);
  };

  const renderActionDetails = (action) => (
    <div className="detail-section">
      <p><strong>Assigned Owner:</strong> {action.assignedOwner}</p>
      <p><strong>Status:</strong> {action.status}</p>
      <p><strong>Severity:</strong> {action.severity}</p>
      <p><strong>Product:</strong> {action.product || 'general'}</p>
      <p><strong>Stage:</strong> {action.journeyStage || 'general'}</p>
      <p><strong>Issue score:</strong> {action.issueScore ?? 0}</p>
      <p><strong>Recommendations:</strong></p>
      <ul>
        {Array.isArray(action.recommendations)
          ? action.recommendations.map((rec) => (
              <li key={`${action.actionId}-${rec.aspect}`}>
                <strong>{rec.aspect}</strong>: {rec.recommendedAction}
              </li>
            ))
          : null}
      </ul>
      <p><strong>Notes:</strong> {action.notes?.length ? action.notes.join(', ') : 'No notes yet.'}</p>
      <p><strong>Created:</strong> {action.recommendedAt || 'unknown'}</p>
    </div>
  );

  const renderThemeDetails = (theme) => (
    <div className="detail-section">
      <p><strong>Theme ID:</strong> {theme.themeId}</p>
      <p><strong>Source:</strong> {theme.source || 'n/a'}</p>
      <p><strong>Product:</strong> {theme.product || 'general'}</p>
      <p><strong>Store:</strong> {theme.store || 'n/a'}</p>
      <p><strong>Stage:</strong> {theme.journeyStage || 'general'}</p>
      <p><strong>Sentiment:</strong> {theme.sentiment}</p>
      <p><strong>Issue score:</strong> {theme.issueScore ?? 0}</p>
      <p><strong>Text:</strong></p>
      <div className="item-details">{theme.text}</div>
      <p><strong>Aspects:</strong></p>
      <div className="tags">
        {Array.isArray(theme.aspects)
          ? theme.aspects.map((aspect) => (
              <span className="tag" key={`${theme.themeId}-${aspect.aspect}`}>
                {aspect.aspect}: {aspect.sentiment}
              </span>
            ))
          : null}
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Header onRefresh={reloadDashboard} refreshing={loadingRefresh} />

      <main>
        <section className="card status-card">
          <div>
            <h2>Backend status</h2>
            <div>{health}</div>
          </div>
          <span className="badge">Last updated: {lastUpdated}</span>
        </section>

        <MetricGrid summary={summary} />

        <InsightsPanel overview={overview} />

        <FiltersPanel
          filters={filters}
          products={products}
          stages={stages}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        <IngestCard
          form={ingestForm}
          onChange={updateIngestField}
          onSubmit={submitFeedback}
          onEstimate={estimateThemes}
          onSample={loadSampleFeedback}
          status={ingestStatus}
        />

        <ThemeList themes={filteredThemes} onDetail={showDetail} />

        <ActionList
          actions={actions}
          noteDrafts={actionNotes}
          onNoteChange={(actionId, value) => {
            setActionNotes((current) => ({ ...current, [actionId]: value }));
          }}
          onSaveNote={saveActionNote}
          onUpdateStatus={updateActionStatus}
          onDetail={showDetail}
        />

        <ClusterList clusters={clusters} />

        <SpikeList spikes={spikes} />
      </main>

      {detailPayload && (
        <DetailModal title={detailTitle} onClose={hideModal}>
          {detailPayload}
        </DetailModal>
      )}
    </div>
  );
}
