const pool = require('../config/db');

async function test() {
  try {
    const [revResult] = await pool.query('SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE order_status != "Canceled"');
    console.log('Q1');
    const [ordResult] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
    console.log('Q2');
    const [custResult] = await pool.query('SELECT COUNT(*) as total_customers FROM customers');
    console.log('Q3');
    const [prodResult] = await pool.query('SELECT COUNT(*) as total_products FROM products');
    console.log('Q4');
    const [recentOrdersRows] = await pool.query(`
      SELECT 
        o.id,
        COALESCE(c.name, CONCAT(o.first_name, ' ', o.last_name), o.email, 'Guest') as customer,
        o.items as product_json,
        o.total as amount,
        COALESCE(o.order_status, 'Pending') as status
      FROM orders o
      LEFT JOIN customers c ON o.email = c.email
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    console.log('Q5');
    const [itemRows] = await pool.query('SELECT items FROM orders WHERE order_status != "Canceled" OR order_status IS NULL LIMIT 200');
    console.log('Q6');
    const [trendRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        MONTH(created_at) as month_num,
        ROUND(SUM(total), 2) as value
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND (order_status != 'Canceled' OR order_status IS NULL)
      GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);
    console.log('Q7');
    const [dbNotifs] = await pool.query(`
      SELECT id, text, created_at, type as name
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('Q8');
  } catch(e) {
    console.error('DB ERROR:', e.message);
  }
  process.exit();
}

test();
