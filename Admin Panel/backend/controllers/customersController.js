const pool = require('../config/db');

const generateCustomerId = () => {
  return 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customers ORDER BY join_date DESC');

    const [totalRes] = await pool.query('SELECT COUNT(*) as total FROM customers');
    
    // Active (Last 30 Days) - Based on orders placed
    const [activeRes] = await pool.query(`
      SELECT COUNT(DISTINCT email) as active 
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // New This Month
    const [newMonthRes] = await pool.query(`
      SELECT COUNT(*) as newCount 
      FROM customers 
      WHERE MONTH(join_date) = MONTH(NOW()) AND YEAR(join_date) = YEAR(NOW())
    `);

    const statsResult = {
      totalCustomers: totalRes[0].total,
      activeCount: activeRes[0].active,
      newMonthCount: newMonthRes[0].newCount
    };

    res.status(200).json({
      customers: customers.map(c => ({
        ...c,
        total_spent: `Rs. ${Number(c.total_spent || 0).toLocaleString()}`,
        join_date: c.join_date ? new Date(c.join_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '---'
      })),
      stats: statsResult
    });
  } catch (err) {
    console.error('Customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

exports.addCustomer = async (req, res) => {
  const { name, email, orders_count, total_spent, join_date, status } = req.body;
  const customer_id = generateCustomerId();
  
  // Auto-generate initials
  const nameParts = name.trim().split(' ');
  let initials = 'CU';
  if (nameParts.length > 0) {
    initials = nameParts.length === 1 
      ? nameParts[0].substring(0, 2).toUpperCase() 
      : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (customer_id, initials, name, email, orders_count, total_spent, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, initials, name, email, orders_count || 0, total_spent || 0, join_date, status]
    );

    // Trigger Notification
    const notifText = `New customer added manually: ${name} (${customer_id})`;
    await pool.query("INSERT INTO notifications (text, type) VALUES (?, 'customer')", [notifText]);

    res.status(201).json({ message: 'Customer added successfully', id: result.insertId, customer_id });
  } catch (err) {
    console.error('Customer add error:', err);
    res.status(500).json({ error: 'Failed to add customer' });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, orders_count, total_spent, join_date, status, initials } = req.body;
  try {
    await pool.query(
      `UPDATE customers SET initials=?, name=?, email=?, orders_count=?, total_spent=?, join_date=?, status=? WHERE id=?`,
      [initials, name, email, orders_count, total_spent, join_date, status, id]
    );
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Customer update error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM customers WHERE id=?`, [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Customer delete error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
