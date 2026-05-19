const pool = require('../config/db');

const generateCustomerId = () => {
  return 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

function normalizeCanceled(value) {
  if (!value) return value;
  if (value === 'Cancelled') return 'Canceled';
  return value;
}

function isCanceled(value) {
  const v = normalizeCanceled(value);
  return v === 'Canceled';
}

function addTierStock(tier, qty, strapSize) {
  if (!tier) return;
  const addQty = Number(qty) || 0;
  if (addQty <= 0) return;

  if (strapSize) {
    if (typeof tier.stock !== 'object' || tier.stock === null) tier.stock = {};
    tier.stock[strapSize] = (Number(tier.stock[strapSize]) || 0) + addQty;
    return;
  }

  if (typeof tier.stock === 'object' && tier.stock !== null) {
    const keys = Object.keys(tier.stock);
    const key = keys.length > 0 ? keys[0] : 'Default';
    tier.stock[key] = (Number(tier.stock[key]) || 0) + addQty;
    return;
  }

  tier.stock = (Number(tier.stock) || 0) + addQty;
}

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customers ORDER BY join_date DESC');

    const [totalRes] = await pool.query('SELECT COUNT(*) as total FROM customers');
    
    // Active Customers
    const [activeRes] = await pool.query(`
      SELECT COUNT(*) as active 
      FROM customers 
      WHERE status = 'Active' OR status = 'active'
    `);

    // New Customers
    const [newMonthRes] = await pool.query(`
      SELECT COUNT(*) as newCount 
      FROM customers 
      WHERE status = 'New' OR status = 'new'
    `);

    const statsResult = {
      totalCustomers: totalRes[0].total,
      activeCount: activeRes[0].active,
      newMonthCount: newMonthRes[0].newCount
    };

    res.status(200).json({
      customers: customers.map(c => ({
        ...c,
        total_spent: `Rs ${Number(c.total_spent || 0).toLocaleString()}`,
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
    let is_active = 1;
    if (status === 'Inactive') is_active = 0;

    await pool.query(
      `UPDATE customers SET initials=?, name=?, email=?, orders_count=?, total_spent=?, join_date=?, status=?, is_active=? WHERE id=?`,
      [initials, name, email, orders_count, total_spent, join_date, status, is_active, id]
    );

    // Sync with users table
    await pool.query('UPDATE users SET is_active = ? WHERE email = ?', [is_active, email]);

    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Customer update error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get the customer email to find their orders
    const [custRows] = await pool.query('SELECT email FROM customers WHERE id = ?', [id]);

    if (custRows.length > 0) {
      const email = custRows[0].email;

      // 2. Delete all orders for this customer — no stock restocking, no revenue adjustment
      await pool.query('DELETE FROM orders WHERE email = ?', [email]);
    }

    // 3. Delete the customer record
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ message: 'Customer and their orders deleted successfully' });
  } catch (err) {
    console.error('Customer delete error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

exports.toggleCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    // 1. Get the customer email
    const [custRows] = await pool.query('SELECT email FROM customers WHERE id = ?', [id]);
    if (custRows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const email = custRows[0].email;

    // 2. Update customers table
    const statusStr = is_active ? 'Active' : 'Inactive';
    await pool.query('UPDATE customers SET is_active = ?, status = ? WHERE id = ?', [is_active ? 1 : 0, statusStr, id]);
    
    // 3. Sync with users table
    await pool.query('UPDATE users SET is_active = ? WHERE email = ?', [is_active ? 1 : 0, email]);

    res.json({ success: true, message: `Customer has been ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error('Customer toggle status error:', err);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
};
