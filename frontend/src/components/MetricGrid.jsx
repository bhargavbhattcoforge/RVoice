export default function MetricGrid({ summary }) {
  return (
    <section className="card metrics-grid">
      <div className="metric-box">
        <span className="metric-label">Themes</span>
        <strong>{summary.themeCount}</strong>
      </div>
      <div className="metric-box">
        <span className="metric-label">Actions</span>
        <strong>{summary.actionCount}</strong>
      </div>
      <div className="metric-box">
        <span className="metric-label">Clusters</span>
        <strong>{summary.clusterCount}</strong>
      </div>
      <div className="metric-box">
        <span className="metric-label">Spikes</span>
        <strong>{summary.spikeCount}</strong>
      </div>
    </section>
  );
}
