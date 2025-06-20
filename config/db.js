const mysql = require('mysql2/promise');
const dbConfig = require('./db.config.js');

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  queueLimit: 0
});

module.exports = { pool }; 
