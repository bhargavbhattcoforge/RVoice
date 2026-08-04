import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import feedbackRoutes from './routes/feedback.js';
import themeRoutes from './routes/themes.js';
import actionRoutes from './routes/actions.js';
import detectionRoutes from './routes/detection.js';
import clusterRoutes from './routes/clusters.js';
import overviewRoutes from './routes/overview.js';
import analyticsRoutes from './routes/analytics.js';
import { initializeDatabase } from '../db.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/feedback', feedbackRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(express.static('../frontend'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`VoC backend listening on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
