import mysql from 'mysql2/promise';

const generateProductCode = () => {
  return 'CHRN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

async function run() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chronos_db'
    });

    const [products] = await db.query('SELECT id FROM products WHERE product_code IS NULL OR product_code = ""');
    console.log(`Found ${products.length} products needing codes`);

    for (const p of products) {
      const code = generateProductCode();
      await db.execute('UPDATE products SET product_code = ? WHERE id = ?', [code, p.id]);
      console.log(`Assigned ${code} to product ID ${p.id}`);
    }

    await db.end();
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

run();
