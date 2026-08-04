// Notification service for alerts and integrations

export async function formatSlackAlert(anomaly, theme) {
  const severityColor = {
    high: '#FF0000',    // Red
    medium: '#FFA500',  // Orange
    low: '#FFFF00'      // Yellow
  };

  return {
    text: `🚨 VoC Alert: ${theme.sentiment.toUpperCase()} feedback detected`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*VoC Anomaly Detected* 🚨\n*Severity:* ${anomaly.severity}\n*Product:* ${anomaly.product}\n*Journey Stage:* ${anomaly.journeyStage}\n*Confidence:* ${(anomaly.confidence * 100).toFixed(0)}%\n*Issue:* ${anomaly.reason}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Theme:* ${theme.text.substring(0, 80)}...`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Review Theme',
            },
            url: `http://localhost:4000/dashboard/theme/${anomaly.themeId}`,
            action_id: 'review_theme',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Create Action',
            },
            url: `http://localhost:4000/dashboard/action/new?themeId=${anomaly.themeId}`,
            action_id: 'create_action',
          },
        ],
      },
    ],
  };
}

export function formatEmailAlert(anomaly, theme, recipient) {
  return {
    to: recipient,
    subject: `[URGENT] VoC Alert: ${anomaly.severity.toUpperCase()} Issue - ${anomaly.product}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>🚨 Voice of Customer Alert</h2>
          <p><strong>Severity:</strong> <span style="color: ${
            anomaly.severity === 'high' ? 'red' : anomaly.severity === 'medium' ? 'orange' : 'yellow'
          };">${anomaly.severity.toUpperCase()}</span></p>
          <p><strong>Product:</strong> ${anomaly.product}</p>
          <p><strong>Journey Stage:</strong> ${anomaly.journeyStage}</p>
          <p><strong>Detection Confidence:</strong> ${(anomaly.confidence * 100).toFixed(0)}%</p>
          <p><strong>Reason:</strong> ${anomaly.reason}</p>
          <hr />
          <p><strong>Theme:</strong></p>
          <p>${theme.text}</p>
          <hr />
          <p><a href="http://localhost:4000/dashboard/theme/${anomaly.themeId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Dashboard</a></p>
        </body>
      </html>
    `,
  };
}

export async function sendSlackNotification(webhookUrl, message) {
  if (!webhookUrl) {
    console.log('[MOCK] Slack notification would be sent:', JSON.stringify(message, null, 2));
    return { ok: true, mock: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return { ok: response.ok };
  } catch (err) {
    console.error('Error sending Slack notification:', err);
    return { ok: false, error: err.message };
  }
}

export async function sendEmailNotification(emailConfig, message) {
  // Mock implementation - in production would use nodemailer or similar
  if (!emailConfig || !emailConfig.smtp) {
    console.log('[MOCK] Email notification would be sent to:', message.to);
    console.log('[MOCK] Subject:', message.subject);
    return { ok: true, mock: true };
  }

  try {
    // Would integrate with email service here
    console.log('Email sent to:', message.to);
    return { ok: true };
  } catch (err) {
    console.error('Error sending email:', err);
    return { ok: false, error: err.message };
  }
}

export function shouldNotify(anomaly, config = {}) {
  // Determine if notification should be sent based on thresholds
  const minConfidence = config.minConfidence || 0.7;
  const minSeverity = config.minSeverity || 'medium';

  const severityLevels = { low: 0, medium: 1, high: 2 };
  
  if (anomaly.confidence < minConfidence) return false;
  if (severityLevels[anomaly.severity] < severityLevels[minSeverity]) return false;
  
  return true;
}

export function getNotificationTemplate(alertType) {
  const templates = {
    HIGH_SEVERITY_ANOMALY: {
      priority: 'high',
      channels: ['slack', 'email'],
      minConfidence: 0.8,
    },
    MEDIUM_SEVERITY_ANOMALY: {
      priority: 'medium',
      channels: ['slack'],
      minConfidence: 0.7,
    },
    RECURRING_ISSUE: {
      priority: 'high',
      channels: ['slack', 'email'],
      minConfidence: 0.6,
    },
    TREND_ALERT: {
      priority: 'medium',
      channels: ['slack'],
      minConfidence: 0.65,
    },
  };

  return templates[alertType] || templates.HIGH_SEVERITY_ANOMALY;
}
