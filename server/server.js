const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory
const staticDir = path.resolve(__dirname, '..');
console.log('Static directory:', staticDir);

app.use(express.static(staticDir, { index: ['index.html'] }));

// Explicit home route
app.get('/', (req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Debug route
app.get('/debug', (req, res) => {
  res.json({ 
    staticDir, 
    __dirname,
    cwd: process.cwd(),
    filesInRoot: fs.readdirSync(staticDir).slice(0, 20)
  });
});

// Connect to SQLite (creates file if not exists)
const dbPath = path.join(__dirname, 'assets.db');
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property TEXT,
  place TEXT,
  description TEXT,
  ppeClass TEXT,
  accountCode TEXT,
  dateAcquired TEXT,
  cost REAL,
  residual REAL,
  usefulLife INTEGER,
  annualDep REAL,
  accDep REAL,
  netBookValue REAL,
  remarks TEXT
)`);

// Alter table to add coaGenerated column if it doesn't exist
db.run(`ALTER TABLE assets ADD COLUMN coaGenerated INTEGER DEFAULT 0`, (err) => {
  // Ignore error if column already exists
});

// =======================
// CRUD Endpoints
// =======================

// Add new record
app.post('/assets', (req, res) => {
  const d = req.body;
  db.run(
    `INSERT INTO assets (property, place, description, ppeClass, accountCode, dateAcquired, cost, residual, usefulLife, annualDep, accDep, netBookValue, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      d.property, d.place, d.description, d.ppeClass, d.accountCode,
      d.dateAcquired, d.cost, d.residual, d.usefulLife,
      d.annualDep, d.accDep, d.netBookValue, d.remarks
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get all records
app.get('/assets', (req, res) => {
  db.all('SELECT * FROM assets', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update record
app.put('/assets/:id', (req, res) => {
  const d = req.body;
  db.run(
    `UPDATE assets SET property=?, place=?, description=?, ppeClass=?, accountCode=?, dateAcquired=?, cost=?, residual=?, usefulLife=?, annualDep=?, accDep=?, netBookValue=?, remarks=? WHERE id=?`,
    [
      d.property, d.place, d.description, d.ppeClass, d.accountCode,
      d.dateAcquired, d.cost, d.residual, d.usefulLife,
      d.annualDep, d.accDep, d.netBookValue, d.remarks, req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete record
app.delete('/assets/:id', (req, res) => {
  db.run(`DELETE FROM assets WHERE id=?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// =======================
// Dashboard Endpoints
// =======================

// Stats for dashboard cards
app.get('/dashboard-stats', (req, res) => {
  db.serialize(() => {
    db.get('SELECT COUNT(*) AS totalRecords FROM assets', (err, row1) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get('SELECT COUNT(*) AS depreciationItems FROM assets WHERE usefulLife IS NOT NULL', (err, row2) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get('SELECT COUNT(*) AS coaForms FROM assets WHERE coaGenerated = 1', (err, row3) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            totalRecords: row1.totalRecords,
            pendingApprovals: 0, // placeholder until approval logic added
            depreciationItems: row2.depreciationItems,
            coaForms: row3.coaForms
          });
        });
      });
    });
  });
});

// Mark COA as generated
app.put('/assets/:id/mark-coa', (req, res) => {
  const id = req.params.id;
  db.run(
    'UPDATE assets SET coaGenerated = 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, updated: this.changes });
    }
  );
});

// Recent activity (last 10 records)
app.get('/recent-activity', (req, res) => {
  db.all(
    'SELECT id, dateAcquired AS date, COALESCE(property, "Unknown") AS property, "Added record" AS action FROM assets ORDER BY dateAcquired DESC LIMIT 10',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log('Recent activity rows:', rows);
      res.json(rows);
    }
  );
});

// Debug all assets
app.get('/api/all-assets-debug', (req, res) => {
  db.all('SELECT * FROM assets', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// =======================
// Start Server
// =======================
app.use((req, res) => {
  res.status(404).send('Not Found: ' + req.url);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.resolve(__dirname, '..')}`);
});


//TEST1//


