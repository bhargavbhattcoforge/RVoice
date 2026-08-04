export default function ClusterList({ clusters }) {
  return (
    <section className="card" id="clusters-card">
      <div className="card-header">
        <h2>Theme Clusters</h2>
      </div>
      <div id="clusters">
        {clusters.length === 0 ? (
          <div className="empty-state">No clusters available</div>
        ) : (
          clusters.map((cluster) => (
            <div className="cluster-item" key={cluster.clusterId}>
              <div className="item-title">{cluster.clusterId}</div>
              <div className="item-meta">Count: {cluster.count} · {cluster.product || 'general'} · {cluster.journeyStage || 'general'}</div>
              <div className="tags">
                {Object.entries(cluster.sentimentDistribution || {}).map(([sentiment, count]) => (
                  <span className="tag" key={`${cluster.clusterId}-${sentiment}`}>
                    {sentiment}: {count}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
