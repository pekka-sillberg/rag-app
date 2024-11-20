const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "../data.db"), (err) => {
  if (err) console.error("Database connection error:", err.message);
  else console.log("Connected to SQLite database.");
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE,
      content TEXT,
      embedding TEXT,
      uploadDate TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT UNIQUE,
      answer TEXT,
      count INTEGER DEFAULT 0,
      uploadDate TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Helper functions for querying and running SQL
const queryDatabase = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runDatabase = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = {
  db,
  queryDatabase,
  runDatabase,
};
