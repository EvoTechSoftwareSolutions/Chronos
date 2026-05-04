const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Core Stats
    const [revResult] = await pool.query(
      'SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE order_status != "Canceled" AND payment_status = "Paid"'
    );
    const totalRevenue = revResult[0].total_revenue || 0;

    const [ordResult] = await pool.query('SELECT COUNT(*) as total_orders FROM orders WHERE payment_status = "Paid"');
    const totalOrders = ordResult[0].total_orders;

    const [custResult] = await pool.query('SELECT COUNT(*) as total_customers FROM customers');
    const totalCustomers = custResult[0].total_customers;

    const [prodResult] = await pool.query('SELECT COUNT(*) as total_products FROM products');
    const totalProducts = prodResult[0].total_products;

    // 2. Recent Orders — joined via email since user_id may be null
    const [recentOrdersRows] = await pool.query(`
      SELECT 
        o.id,
        COALESCE(c.name, CONCAT(o.first_name, ' ', o.last_name), o.email, 'Guest') as customer,
        o.items as product_json,
        o.total as amount,
        COALESCE(o.order_status, 'Pending') as status
      FROM orders o
      LEFT JOIN customers c ON o.email = c.email
      WHERE o.payment_status = 'Paid'
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // 3. Top Products — parse JSON items from all orders
    const [itemRows] = await pool.query(
      'SELECT items FROM orders WHERE payment_status = "Paid" AND (order_status != "Canceled" OR order_status IS NULL) LIMIT 200'
    );
    const productSales = {};
    itemRows.forEach(row => {
      try {
        const items = JSON.parse(row.items);
        if (Array.isArray(items)) {
          items.forEach(item => {
            const name = item.items_name || item.name || item.title || 'Unknown';
            if (name !== 'Unknown') {
              productSales[name] = (productSales[name] || 0) + (Number(item.quantity) || 1);
            }
          });
        }
      } catch (e) { /* skip unparseable rows */ }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // 4. Revenue Trend — last 12 months grouped by month
    const [trendRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        MONTH(created_at) as month_num,
        ROUND(SUM(total), 2) as value
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND payment_status = 'Paid'
        AND (order_status != 'Canceled' OR order_status IS NULL)
      GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    // 5. Real notifications — recent orders + low stock alerts
    const [dbNotifs] = await pool.query(`
      SELECT id, text, created_at, type as name
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    const notifications = dbNotifs.map(n => ({ 
      id: n.id, 
      text: n.text, 
      time: timeAgo(new Date(n.created_at)) 
    }));

    const dashboardData = {
      stats: {
        revenue: { value: `Rs ${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '+12.5%' },
        orders: { value: totalOrders.toString(), trend: '+8.2%' },
        customers: { value: totalCustomers.toString(), trend: '+5.1%' },
        products: { value: totalProducts.toString(), trend: '0%' }
      },
      recentOrders: recentOrdersRows.map(row => {
        let productName = 'Multiple Items';
        try {
          const items = JSON.parse(row.product_json);
          if (Array.isArray(items) && items.length > 0) {
            const firstName = items[0]?.items_name || items[0]?.name || items[0]?.title || 'Item';
            productName = items.length > 1 ? `${firstName} (+${items.length - 1} more)` : firstName;
          }
        } catch (e) {}

        return {
          id: `#${row.id}`,
          customer: row.customer,
          product: productName,
          amount: `Rs ${Number(row.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          status: row.status || 'Pending'
        };
      }),
      topProducts: topProducts.length > 0 ? topProducts : [
        { name: 'No Data Yet', value: 1 }
      ],
      revenueTrend: trendRows.length > 0 ? trendRows.map(r => ({ month: r.month, value: Number(r.value) })) : [
        { month: 'No data', value: 0 }
      ],
      notifications
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', detail: error.message });
  }
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
