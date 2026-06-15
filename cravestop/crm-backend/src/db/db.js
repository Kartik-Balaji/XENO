'use strict';

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DEFAULT_DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'cravestop.db')
  : path.resolve(__dirname, '..', '..', 'cravestop.db');

const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : DEFAULT_DB_PATH;
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

let _db = null;
let _dbPromise = null;

function locateSqlWasm(fileName) {
  return require.resolve(path.join('sql.js/dist', fileName));
}

function bindParams(statement, params = []) {
  if (Array.isArray(params)) {
    statement.bind(params);
    return;
  }

  statement.bind(params || {});
}

class SqlJsCompatDatabase {
  constructor(database, filePath) {
    this.database = database;
    this.filePath = filePath;
  }

  async exec(sql) {
    this.database.exec(sql);
    await this.persist();
  }

  async run(sql, params = []) {
    const statement = this.database.prepare(sql);
    try {
      bindParams(statement, params);
      while (statement.step()) {
        // consume all rows if the statement returns any
      }
    } finally {
      statement.free();
    }

    await this.persist();
    return { changes: this.database.getRowsModified ? this.database.getRowsModified() : 0 };
  }

  async all(sql, params = []) {
    const statement = this.database.prepare(sql);
    const rows = [];

    try {
      bindParams(statement, params);
      while (statement.step()) {
        rows.push(statement.getAsObject());
      }
    } finally {
      statement.free();
    }

    return rows;
  }

  async get(sql, params = []) {
    const rows = await this.all(sql, params);
    return rows[0];
  }

  async persist() {
    if (!this.filePath) {
      return;
    }

    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const data = this.database.export();
    fs.writeFileSync(this.filePath, Buffer.from(data));
  }
}

async function initializeDb() {
  const SQL = await initSqlJs({ locateFile: locateSqlWasm });
  let database;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    database = new SQL.Database(fileBuffer);
  } else {
    database = new SQL.Database();
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    database.exec(schema);
  }

  const wrapped = new SqlJsCompatDatabase(database, DB_PATH);
  await wrapped.exec('PRAGMA foreign_keys = ON');
  return wrapped;
}

async function getDb() {
  if (!_db) {
    _dbPromise = _dbPromise || initializeDb();
    _db = await _dbPromise;
  }

  return _db;
}

module.exports = { getDb, DB_PATH };
