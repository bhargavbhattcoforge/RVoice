import React, { useState, useEffect } from 'react';

const CorrelationView = ({ product = 'ProductA' }) => {
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from correlation API
    // For now, show mock data
    fetchCorrelationData();
  }, [product]);

  const fetchCorrelationData = async () => {
    try {
      setLoading(true);
      // Mock correlation data showing feedback ↔ ops metrics links
      const mockCorrelations = [
        {
          signal: 'Delivery Issues Correlation',
          feedbackMetric: '+18% negative delivery feedback this week',
          operationalMetric: 'Delivery success rate dropped from 96% to 94%',
          strength: 0.92,
          impact: 'High - Suggests logistics partner issue',
          recommendation: 'Contact delivery partner and review SLA compliance',
        },
        {
          signal: 'Checkout Issues Correlation',
          feedbackMetric: '8 payment-related complaints in last 3 days',
          operationalMetric: 'Payment error rate increased 2.1%',
          strength: 0.85,
          impact: 'Medium - Localized payment processing issue',
          recommendation: 'Review payment gateway logs and merchant integration',
        },
        {
          signal: 'Support Quality Correlation',
          feedbackMetric: 'Support response time complaints',
          operationalMetric: 'Support team utilization at 85% (above 78% baseline)',
          strength: 0.78,
          impact: 'Medium - Team capacity issue',
          recommendation: 'Consider adding support staff or optimizing workflows',
        },
      ];
      
      setCorrelations(mockCorrelations);
    } catch (error) {
      console.error('Error fetching correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="correlation-view loading">Loading correlations...</div>;
  }

  return (
    <div className="correlation-view">
      <h3>🔗 Feedback ↔ Operations Correlations</h3>
      
      {correlations.length === 0 ? (
        <p className="no-correlations">No significant correlations detected</p>
      ) : (
        <div className="correlations-list">
          {correlations.map((corr, idx) => (
            <div key={idx} className="correlation-card">
              <div className="corr-header">
                <h4>{corr.signal}</h4>
                <div className="strength-indicator">
                  <div className="strength-bar" style={{ width: `${corr.strength * 100}%` }}></div>
                  <span className="strength-label">{(corr.strength * 100).toFixed(0)}% strength</span>
                </div>
              </div>

              <div className="corr-details">
                <div className="corr-item feedback-item">
                  <span className="item-label">📊 Customer Feedback:</span>
                  <p>{corr.feedbackMetric}</p>
                </div>

                <div className="corr-divider">⟷</div>

                <div className="corr-item operational-item">
                  <span className="item-label">📈 Operational Metric:</span>
                  <p>{corr.operationalMetric}</p>
                </div>
              </div>

              <div className="corr-impact">
                <p><strong>Impact:</strong> {corr.impact}</p>
                <p><strong>Recommended Action:</strong> {corr.recommendation}</p>
              </div>

              <div className="corr-actions">
                <button className="btn-correlate">Investigate</button>
                <button className="btn-dismiss">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="correlation-summary">
        <p>
          <strong>{correlations.length}</strong> active correlations between customer feedback and operational metrics
        </p>
      </div>
    </div>
  );
};

export default CorrelationView;
