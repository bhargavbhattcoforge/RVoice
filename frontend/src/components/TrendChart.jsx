import React, { useState, useEffect } from 'react';

const TrendChart = ({ product = 'ProductA', days = 30 }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [product, days]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/trends?product=${product}&days=${days}`);
      const data = await response.json();
      setTrends(data.trends || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="trend-chart-container loading">Loading trend data...</div>;
  }

  const maxScore = Math.max(...trends.map(t => t.avgScore || 0), 1);
  const minScore = 0;

  return (
    <div className="trend-chart-container">
      <h3>📈 Sentiment Trend ({product})</h3>
      
      <div className="trend-chart">
        {trends.length > 0 ? (
          <svg width="100%" height="250" viewBox={`0 0 ${trends.length * 30} 250`}>
            {/* Y-axis */}
            <line x1="30" y1="20" x2="30" y2="200" stroke="#ccc" strokeWidth="1" />
            {/* X-axis */}
            <line x1="30" y1="200" x2={trends.length * 30} y2="200" stroke="#ccc" strokeWidth="1" />

            {/* Grid lines and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <g key={i}>
                <line x1="25" y1={200 - ratio * 180} x2={trends.length * 30} y2={200 - ratio * 180} stroke="#eee" strokeWidth="1" strokeDasharray="3" />
                <text x="5" y={205 - ratio * 180} fontSize="10" textAnchor="end">{(minScore + ratio * (maxScore - minScore)).toFixed(1)}</text>
              </g>
            ))}

            {/* Data points and line */}
            {trends.map((trend, i) => {
              const x = 30 + i * 30 + 15;
              const score = trend.avgScore || 0;
              const y = 200 - ((score - minScore) / (maxScore - minScore)) * 180;

              return (
                <g key={i}>
                  {i < trends.length - 1 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={30 + (i + 1) * 30 + 15}
                      y2={200 - (((trends[i + 1]?.avgScore || 0) - minScore) / (maxScore - minScore)) * 180}
                      stroke="#007bff"
                      strokeWidth="2"
                    />
                  )}
                  <circle cx={x} cy={y} r="3" fill="#007bff" />
                  <title>{trend.day}: Score {score.toFixed(2)}</title>
                </g>
              );
            })}
          </svg>
        ) : (
          <p>No trend data available</p>
        )}
      </div>

      <div className="trend-stats">
        <div className="stat">
          <span className="label">Avg Issue Score:</span>
          <span className="value">{(trends.reduce((sum, t) => sum + (t.avgScore || 0), 0) / (trends.length || 1)).toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="label">Negative Feedback:</span>
          <span className="value">{trends.reduce((sum, t) => sum + (t.negativeCount || 0), 0)}</span>
        </div>
        <div className="stat">
          <span className="label">Positive Feedback:</span>
          <span className="value">{trends.reduce((sum, t) => sum + (t.positiveCount || 0), 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
