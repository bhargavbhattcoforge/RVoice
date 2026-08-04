export default function Header({ onRefresh, refreshing }) {
  return (
    <header>
      <div className="header-row">
        <div>
          <h1>Retail VoC Insight</h1>
          <p>Unified feedback, themes, issue scoring, and action recommendations.</p>
        </div>
        <button onClick={onRefresh}>{refreshing ? 'Refreshing...' : 'Refresh dashboard'}</button>
      </div>
    </header>
  );
}
