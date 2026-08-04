export default function ThemeList({ themes, onDetail }) {
  return (
    <section className="card" id="themes-card">
      <div className="card-header">
        <h2>Theme insights</h2>
      </div>
      <div id="themes">
        {themes.length === 0 ? (
          <div className="empty-state">No theme records available</div>
        ) : (
          themes.map((theme) => (
            <div className="theme-item" key={theme.themeId}>
              <div className="item-title">{theme.product || 'General'} — {theme.themeId}</div>
              <div className="item-meta">{theme.journeyStage || 'general'} · {theme.sentiment} · score {theme.issueScore ?? 0}</div>
              <div className="item-details">{theme.text}</div>
              <div className="tags">
                {Array.isArray(theme.aspects)
                  ? theme.aspects.map((aspect) => (
                      <span className="tag" key={`${theme.themeId}-${aspect.aspect}`}>
                        {aspect.aspect}: {aspect.sentiment}
                      </span>
                    ))
                  : null}
              </div>
              <button className="small-button detail-button" type="button" onClick={() => onDetail('theme', theme.themeId)}>
                View details
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
