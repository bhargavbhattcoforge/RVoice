export default function SpikeList({ spikes }) {
  return (
    <section className="card" id="spikes-card">
      <div className="card-header">
        <h2>Emerging Issues</h2>
      </div>
      <div id="spikes">
        {spikes.length === 0 ? (
          <div className="empty-state">No spike records available</div>
        ) : (
          spikes.map((spike) => (
            <div className="spike-item" key={`${spike.themeId}-${spike.reason}`}>
              <div className="item-title">{spike.reason}</div>
              <div className="item-meta">Theme: {spike.themeId} · Score: {spike.score}</div>
              <div className="item-details">{spike.text || 'No source text available.'}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
