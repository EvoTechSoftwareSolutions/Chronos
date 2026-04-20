const pool = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? OR name = ?', [email, email]);
    
    if (rows.length > 0) {
      const admin = rows[0];
      // Plain text password comparison
      if (password === admin.password) {
        const { password: _, ...adminData } = admin;
        return res.status(200).json({ 
          message: 'Login successful', 
          admin: adminData 
        });
      }
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
