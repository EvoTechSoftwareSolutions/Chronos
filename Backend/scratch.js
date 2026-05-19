import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chronos_db'
  });
  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log("TABLES:", tables.map(t => Object.values(t)[0]));
    
    const [paymentMethodsSchema] = await connection.execute('SHOW CREATE TABLE payment_methods');
    console.log("PAYMENT_METHODS SCHEMA:\n", paymentMethodsSchema[0]['Create Table']);
  } catch (e) {
    console.error("ERROR checking payment_methods:", e.message);
  }
  
  await connection.end();
}
run();
