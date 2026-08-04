export default function InsightsPanel({ overview }) {
  if (!overview) {
    return null;
  }

  const sentimentItems = Object.entries(overview.sentimentBreakdown || {});
  const severityItems = Object.entries(overview.severityBreakdown || {});
  const productItems = overview.topProducts || [];
  const stageItems = overview.topJourneyStages || [];
  const riskThemes = overview.topRiskThemes || [];
  const ownerItems = overview.actionsByOwner ? Object.entries(overview.actionsByOwner) : [];
  const feedbackSources = overview.feedbackSources ? Object.entries(overview.feedbackSources) : [];

  return (
    <section className="card insights-panel">
      <div className="card-header">
        <h2>Business insights</h2>
      </div>
      <div className="insights-grid">
        <div className="insight-block">
          <strong>Open actions</strong>
          <span>{overview.openActionCount ?? 0}</span>
        </div>
        <div className="insight-block">
          <strong>Feedback count</strong>
          <span>{overview.feedbackCount ?? 0}</span>
        </div>
        <div className="insight-block">
          <strong>Top products</strong>
          <ul>
            {productItems.length === 0 ? <li>None</li> : productItems.map((item) => (
              <li key={item.name}>{item.name}: {item.count}</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Top journey stages</strong>
          <ul>
            {stageItems.length === 0 ? <li>None</li> : stageItems.map((item) => (
              <li key={item.name}>{item.name}: {item.count}</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Sentiment mix</strong>
          <ul>
            {sentimentItems.map(([sentiment, count]) => (
              <li key={sentiment}>{sentiment}: {count}</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Severity mix</strong>
          <ul>
            {severityItems.map(([severity, count]) => (
              <li key={severity}>{severity}: {count}</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Top risk themes</strong>
          <ul>
            {riskThemes.length === 0 ? <li>None</li> : riskThemes.map((theme) => (
              <li key={theme.themeId}>{theme.themeId} ({theme.issueScore})</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Actions by owner</strong>
          <ul>
            {ownerItems.length === 0 ? <li>None</li> : ownerItems.map(([owner, count]) => (
              <li key={owner}>{owner}: {count}</li>
            ))}
          </ul>
        </div>
        <div className="insight-block">
          <strong>Feedback sources</strong>
          <ul>
            {feedbackSources.length === 0 ? <li>None</li> : feedbackSources.map(([source, count]) => (
              <li key={source}>{source}: {count}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
