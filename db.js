// db.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("students.db");

// Buat tabel jika belum ada
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      angkatan TEXT DEFAULT '41',
      tglList TEXT,
      count INTEGER DEFAULT 1
    )
  `);
});

module.exports = db;
