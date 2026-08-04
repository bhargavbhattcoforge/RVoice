import React, { useState } from 'react';

const DemoControls = () => {
  const [demoTime, setDemoTime] = useState(new Date());

  const triggerDemoSpike = async () => {
    console.log('Demo: Simulating spike event...');
    // In a real app, this would call an API to inject synthetic spike data
    alert('🎯 Demo: Spike event triggered! Watch for anomaly detection in the dashboard.');
  };

  const resolveAction = async () => {
    console.log('Demo: Resolving action...');
    alert('✅ Demo: Action resolved. Dashboard will update to reflect status change.');
  };

  const sendAlert = async () => {
    console.log('Demo: Sending test alert...');
    alert('📢 Demo: Test alert sent to Slack (or would be if configured).');
  };

  const scrubTime = (event) => {
    // Simulate time-based data scrubbing for demo
    const progress = event.target.value;
    console.log(`Demo: Scrubbing to ${progress}% through dataset`);
  };

  return (
    <div className="demo-controls-container">
      <h3>🎬 Demo Controls</h3>
      
      <div className="controls-grid">
        <div className="control-group">
          <label>Time Scrubber (for demo)</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="100" 
            onChange={scrubTime}
            className="scrubber"
          />
          <small>Scrub through 30-day dataset</small>
        </div>

        <div className="control-group">
          <button onClick={triggerDemoSpike} className="btn-demo btn-spike">
            🔴 Trigger Spike Event
          </button>
          <small>Simulates surge in negative feedback</small>
        </div>

        <div className="control-group">
          <button onClick={sendAlert} className="btn-demo btn-alert">
            📢 Send Test Alert
          </button>
          <small>Simulates Slack/Email notification</small>
        </div>

        <div className="control-group">
          <button onClick={resolveAction} className="btn-demo btn-resolve">
            ✅ Resolve Action
          </button>
          <small>Marks top action as resolved</small>
        </div>
      </div>

      <div className="demo-info">
        <p>
          <strong>Demo Mode Enabled:</strong> Use these controls to demonstrate RVoice features during presentation.
        </p>
      </div>
    </div>
  );
};

export default DemoControls;
