import React, { useState, useEffect } from 'react';

const AnomalyAlert = ({ product = 'ProductA' }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [product]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/anomalies?product=${product}`);
      const data = await response.json();
      setAnomalies(data.anomalies || []);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && anomalies.length === 0) {
    return <div className="anomaly-alert-container loading">Loading anomalies...</div>;
  }

  return (
    <div className="anomaly-alert-container">
      <h3>🚨 Detected Anomalies</h3>
      
      {anomalies.length === 0 ? (
        <p className="no-alerts">✓ No anomalies detected</p>
      ) : (
        <div className="anomaly-list">
          {anomalies.slice(0, 5).map((anomaly, idx) => (
            <div key={idx} className={`anomaly-card severity-${anomaly.severity}`}>
              <div className="anomaly-header">
                <span className="severity-badge">{anomaly.severity.toUpperCase()}</span>
                <span className="confidence-gauge">
                  {(anomaly.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              
              <div className="anomaly-details">
                <p className="reason">{anomaly.reason}</p>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Product:</span>
                    <span className="value">{anomaly.product}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Stage:</span>
                    <span className="value">{anomaly.journeyStage}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Sentiment:</span>
                    <span className={`value sentiment-${anomaly.sentiment}`}>{anomaly.sentiment}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Score:</span>
                    <span className="value">{anomaly.anomalyScore.toFixed(2)}σ</span>
                  </div>
                </div>
              </div>

              <div className="anomaly-actions">
                <button className="btn-action">Review Theme</button>
                <button className="btn-action btn-primary">Create Action</button>
              </div>
            </div>
          ))}
          
          {anomalies.length > 5 && (
            <p className="more-alerts">+{anomalies.length - 5} more anomalies</p>
          )}
        </div>
      )}

      <div className="anomaly-stats">
        <div className="stat">
          <span className="label">Total Anomalies:</span>
          <span className="value">{anomalies.length}</span>
        </div>
        <div className="stat">
          <span className="label">Avg Confidence:</span>
          <span className="value">
            {anomalies.length > 0
              ? (anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length * 100).toFixed(0)
              : 0}%
          </span>
        </div>
        <div className="stat">
          <span className="label">High Severity:</span>
          <span className="value">{anomalies.filter(a => a.severity === 'high').length}</span>
        </div>
      </div>
    </div>
  );
};

export default AnomalyAlert;
