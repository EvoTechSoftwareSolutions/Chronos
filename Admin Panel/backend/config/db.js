const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chronos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed (MVC): ', err.message);
  } else {
    console.log('Successfully connected to MySQL database (MVC)');
    connection.release();
  }
});

module.exports = pool.promise(); // Use promises for cleaner async/await in controllers
