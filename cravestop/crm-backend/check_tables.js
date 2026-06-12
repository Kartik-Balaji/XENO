const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

open({ filename: path.resolve('cravestop.db'), driver: sqlite3.Database })
  .then(async db => {
    const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables found:', rows.map(r => r.name));
    await db.close();
  })
  .catch(err => console.error('Error:', err.message));
