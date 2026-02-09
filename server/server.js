const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite (creates file if not exists)
const db = new sqlite3.Database('./assets.db');

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

        db.get('SELECT COUNT(*) AS coaForms FROM assets WHERE accDep IS NOT NULL', (err, row3) => {
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

// Recent activity (last 10 records)
app.get('/recent-activity', (req, res) => {
  db.all(
    'SELECT dateAcquired AS date, property AS user, "Added record" AS action FROM assets ORDER BY dateAcquired DESC LIMIT 10',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
