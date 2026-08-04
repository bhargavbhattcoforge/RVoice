export default function IngestCard({ form, onChange, onSubmit, onEstimate, onSample, status }) {
  return (
    <section className="card" id="ingest-card">
      <div className="card-header">
        <h2>Ingest feedback</h2>
        <button type="button" className="secondary" onClick={onEstimate}>
          Estimate themes
        </button>
      </div>

      <div className="input-grid">
        <label>
          Feedback text
          <textarea rows="4" value={form.text} onChange={(event) => onChange('text', event.target.value)} placeholder="Enter customer feedback text" />
        </label>
        <label>
          Product
          <input value={form.product} onChange={(event) => onChange('product', event.target.value)} placeholder="Payments, fulfillment, support" />
        </label>
        <label>
          Journey stage
          <input value={form.journeyStage} onChange={(event) => onChange('journeyStage', event.target.value)} placeholder="checkout, delivery, in-store" />
        </label>
        <label>
          Source
          <input value={form.source} onChange={(event) => onChange('source', event.target.value)} placeholder="web, mobile, store" />
        </label>
        <label>
          Store
          <input value={form.store} onChange={(event) => onChange('store', event.target.value)} placeholder="store-001" />
        </label>
        <label>
          ID
          <input value={form.id} onChange={(event) => onChange('id', event.target.value)} placeholder="feedback-123" />
        </label>
      </div>

      <div className="action-row">
        <button type="button" onClick={onSubmit}>
          Ingest feedback
        </button>
        <button type="button" className="secondary" onClick={onSample}>
          Fill sample
        </button>
      </div>

      <div className="status-line">{status}</div>
    </section>
  );
}
