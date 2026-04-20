const pool = require('./config/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT * FROM admins');
    console.log("Admins:", rows);
    const [rows2] = await pool.query('SELECT * FROM admin_profile');
    console.log("Admin Profile:", rows2);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
test();
