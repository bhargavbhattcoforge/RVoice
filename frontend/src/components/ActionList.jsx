export default function ActionList({ actions, noteDrafts, onNoteChange, onSaveNote, onUpdateStatus, onDetail }) {
  return (
    <section className="card" id="actions-card">
      <div className="card-header">
        <h2>Recommended Actions</h2>
      </div>
      <div id="actions">
        {actions.length === 0 ? (
          <div className="empty-state">No action records available</div>
        ) : (
          actions.map((action) => {
            const nextStatus = action.status === 'pending' ? 'in_progress' : action.status === 'in_progress' ? 'resolved' : 'closed';
            const buttonLabel = action.status === 'resolved' ? 'Closed' : action.status === 'in_progress' ? 'Resolve' : 'Start';

            return (
              <div className="action-item" key={action.actionId}>
                <div className="item-title">{action.assignedOwner}</div>
                <div className="item-meta">Status: {action.status} · Severity: {action.severity}</div>
                <div className="item-details">{action.notes?.length ? `Notes: ${action.notes.join(', ')}` : 'No notes yet.'}</div>
                <ul className="action-list">
                  {Array.isArray(action.recommendations)
                    ? action.recommendations.map((rec) => (
                        <li key={`${action.actionId}-${rec.aspect}`}>{rec.aspect}: {rec.recommendedAction}</li>
                      ))
                    : null}
                </ul>
                <div className="note-row">
                  <input
                    className="action-note-input"
                    type="text"
                    value={noteDrafts[action.actionId] || ''}
                    placeholder="Add a note"
                    onChange={(event) => onNoteChange(action.actionId, event.target.value)}
                  />
                  <button type="button" className="small-button action-note-button" onClick={() => onSaveNote(action.actionId)}>
                    Save note
                  </button>
                </div>
                <div className="action-footer">
                  <button className="small-button detail-button" type="button" onClick={() => onDetail('action', action.actionId)}>
                    View details
                  </button>
                  <button type="button" className="small-button action-update-button" onClick={() => onUpdateStatus(action.actionId, nextStatus)}>
                    {buttonLabel}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
