import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'voc.db');

let db = null;

export function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database at', dbPath);
      }
    });
    db.configure('busyTimeout', 5000);
  }
  return db;
}

export async function initializeDatabase() {
  const database = getDb();

  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Feedback table
      database.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          text TEXT NOT NULL,
          rating INTEGER,
          product TEXT,
          journeyStage TEXT,
          timestamp TEXT NOT NULL,
          status TEXT DEFAULT 'new',
          metadata TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Themes table
      database.run(`
        CREATE TABLE IF NOT EXISTS themes (
          themeId TEXT PRIMARY KEY,
          sourceId TEXT,
          text TEXT NOT NULL,
          categorization TEXT,
          sentiment TEXT DEFAULT 'neutral',
          severity TEXT DEFAULT 'low',
          issueScore REAL DEFAULT 0,
          aspectKeywords TEXT,
          mentionCount INTEGER DEFAULT 1,
          extractedAt TEXT NOT NULL,
          product TEXT,
          journeyStage TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Actions table
      database.run(`
        CREATE TABLE IF NOT EXISTS actions (
          actionId TEXT PRIMARY KEY,
          themeId TEXT,
          sentiment TEXT,
          issueScore REAL,
          status TEXT DEFAULT 'pending',
          assignedOwner TEXT,
          priority TEXT DEFAULT 'medium',
          recommendations TEXT,
          notes TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          resolvedAt TEXT,
          FOREIGN KEY(themeId) REFERENCES themes(themeId)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Spikes table (for anomaly detection)
      database.run(`
        CREATE TABLE IF NOT EXISTS spikes (
          spikeId TEXT PRIMARY KEY,
          themeId TEXT,
          detectedAt TEXT NOT NULL,
          confidence REAL,
          reason TEXT,
          anomalyScore REAL,
          notificationSent INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(themeId) REFERENCES themes(themeId)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Decisions table (audit trail)
      database.run(`
        CREATE TABLE IF NOT EXISTS decisions (
          decisionId TEXT PRIMARY KEY,
          actionId TEXT,
          previousStatus TEXT,
          newStatus TEXT,
          madeBy TEXT,
          notes TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(actionId) REFERENCES actions(actionId)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Create indexes for performance
      database.run(`CREATE INDEX IF NOT EXISTS idx_feedback_product_timestamp ON feedback(product, timestamp)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_feedback_source_timestamp ON feedback(source, timestamp)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_feedback_journey_timestamp ON feedback(journeyStage, timestamp)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_themes_product ON themes(product)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_themes_severity ON themes(severity)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_themes_issueScore ON themes(issueScore DESC)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_actions_owner ON actions(assignedOwner)`);
      database.run(`
        CREATE INDEX IF NOT EXISTS idx_spikes_theme_created ON spikes(themeId, createdAt)
      `, () => {
        resolve();
      });
    });
  });
}

export function run(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

export function get(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function all(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

export function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
