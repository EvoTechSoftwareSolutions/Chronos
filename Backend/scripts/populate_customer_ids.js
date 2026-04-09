import mysql from 'mysql2/promise';

const generateCustomerId = () => {
  return 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

async function run() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chronos_db'
    });

    const [customers] = await db.query('SELECT id FROM customers WHERE customer_id IS NULL OR customer_id = ""');
    console.log(`Found ${customers.length} customers needing IDs`);

    for (const c of customers) {
      const id = generateCustomerId();
      await db.execute('UPDATE customers SET customer_id = ? WHERE id = ?', [id, c.id]);
      console.log(`Assigned ${id} to customer ID ${c.id}`);
    }

    await db.end();
    console.log('Customer ID migration completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

run();
