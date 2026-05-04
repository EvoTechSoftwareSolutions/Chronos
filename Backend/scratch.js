import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Assuming default or I'll check db.js
    database: 'chronos_db'
  });
  const [rows] = await connection.execute('SELECT id, items FROM orders ORDER BY id DESC LIMIT 2');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}
run();
