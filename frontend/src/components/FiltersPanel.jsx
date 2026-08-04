import { useEffect, useState } from 'react';

const emptyFilters = { product: '', journeyStage: '', sentiment: '' };

export default function FiltersPanel({ filters, products, stages, onApply, onClear }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (name, value) => {
    setLocalFilters((current) => ({ ...current, [name]: value }));
  };

  const handleClear = () => {
    setLocalFilters(emptyFilters);
    onClear();
  };

  return (
    <section className="card" id="filters-card">
      <h2>Filters</h2>
      <div className="filters">
        <label>
          Product
          <select value={localFilters.product} onChange={(event) => handleChange('product', event.target.value)}>
            <option value="">All</option>
            {products.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </label>

        <label>
          Journey Stage
          <select value={localFilters.journeyStage} onChange={(event) => handleChange('journeyStage', event.target.value)}>
            <option value="">All</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sentiment
          <select value={localFilters.sentiment} onChange={(event) => handleChange('sentiment', event.target.value)}>
            <option value="">All</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </label>

        <button type="button" onClick={() => onApply(localFilters)}>
          Apply filters
        </button>
        <button type="button" className="secondary" onClick={handleClear}>
          Clear
        </button>
      </div>
    </section>
  );
}
