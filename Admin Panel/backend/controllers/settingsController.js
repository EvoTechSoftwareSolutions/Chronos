const db = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  const {
    store_name,
    contact_email,
    phone_number,
    dark_mode,
    accent_color,
    email_alerts_orders,
    low_stock_alerts,
    role // Role passed from frontend for validation
  } = req.body;
  
  if (role === 'Store Information Admin') {
    return res.status(403).json({ error: 'Permission Denied: Store Information Admins cannot modify store settings.' });
  }

  try {
    await db.query(`
      UPDATE settings SET
        store_name = ?,
        contact_email = ?,
        phone_number = ?,
        dark_mode = ?,
        accent_color = ?,
        email_alerts_orders = ?,
        low_stock_alerts = ?
      WHERE id = 1
    `, [
      store_name, contact_email, phone_number, dark_mode, accent_color,
      email_alerts_orders, low_stock_alerts
    ]);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
