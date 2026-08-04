import React, { useState, useEffect } from 'react';

const RecommendationPanel = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/overview');
      const data = await response.json();
      // Extract top risk themes and generate recommendations
      setRecommendations(data.topRiskThemes?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="recommendation-panel loading">Loading recommendations...</div>;
  }

  const getRecommendedAction = (theme) => {
    const actionMap = {
      'checkout': 'Review checkout flow and payment errors',
      'delivery': 'Investigate delivery delays and logistics issues',
      'product-quality': 'Audit product quality and packaging',
      'customer-support': 'Review support team performance and training',
      'store-experience': 'Evaluate store operations and staff training',
    };
    return actionMap[theme.categorization] || 'Review and prioritize for investigation';
  };

  const getOwner = (theme) => {
    const ownerMap = {
      'checkout': 'E-commerce Team',
      'delivery': 'Logistics Team',
      'product-quality': 'Product Team',
      'customer-support': 'Support Manager',
      'store-experience': 'Store Operations',
    };
    return ownerMap[theme.categorization] || 'Customer Experience Lead';
  };

  return (
    <div className="recommendation-panel">
      <h3>💡 AI-Powered Recommendations</h3>
      
      {recommendations.length === 0 ? (
        <p className="no-recommendations">No critical recommendations at this time</p>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`recommendation-card priority-${rec.severity}`}>
              <div className="rec-header">
                {/* <span className="priority-badge">{rec.severity.toUpperCase()}</span> */}
                <span className="priority-badge">{rec.severity?.toUpperCase() || 'UNKNOWN'}</span>
                <span className="rec-score">Score: {rec.issueScore.toFixed(2)}</span>
              </div>

              <div className="rec-content">
                {/* <p className="rec-issue">Issue: {rec.text.substring(0, 100)}...</p> */}
                <p className="rec-issue">Issue: {rec.text?.substring(0, 100) || 'No details provided'}...</p>
                <p className="rec-action">{getRecommendedAction(rec)}</p>
              </div>

              <div className="rec-metadata">
                <div className="metadata-item">
                  <span className="label">Recommended Owner:</span>
                  <span className="value">{getOwner(rec)}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Timeline:</span>
                  <span className="value">2-4 hours</span>
                </div>
              </div>

              <div className="rec-actions">
                <button className="btn-assign">Assign Action</button>
                <button className="btn-defer">Defer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rec-summary">
        <p>
          <strong>{recommendations.length}</strong> high-priority recommendations based on latest feedback analysis
        </p>
      </div>
    </div>
  );
};

export default RecommendationPanel;
