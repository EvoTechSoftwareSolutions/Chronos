const pool = require('../config/db');

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        COALESCE(c.name, CONCAT(o.first_name, ' ', o.last_name)) as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.email = c.email
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN order_status = 'Pending' OR order_status IS NULL THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN order_status = 'Shipped' THEN 1 ELSE 0 END) as shippedCount,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as deliveredCount
      FROM orders
    `);

    res.status(200).json({
      orders: orders.map(row => {
        let itemsArr = [];
        try { itemsArr = JSON.parse(row.items || '[]'); } catch(e){}
        
        return {
          ...row,
          id: `#${row.id}`,
          customer_id: row.customer_id || 'GUEST',
          customer: row.customer_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Guest',
          items_summary: itemsArr.map(i => i.name).join(', '),
          total_formatted: `Rs ${Number(row.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          date_formatted: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: row.order_status || 'Pending'
        };
      }),
      stats: stats[0]
    });
  } catch (err) {
    console.error('Orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders', detail: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;
  const cleanId = id.replace('#', '');
  console.log(`[Admin API] Updating Order Status. ID: ${id} -> ${cleanId}, Status: ${order_status}`);
  
  if (!order_status) {
    return res.status(400).json({ error: 'order_status is required' });
  }

  try {
    const [result] = await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, cleanId]);
    console.log(`[Admin API] Update result:`, result);
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    console.error('[Admin API] Order update error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
