const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Admin account already exists for this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    return res.status(201).json({
      message: 'Admin account created successfully',
      adminId: result.insertId,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? OR name = ?', [email, email]);
    
    if (rows.length > 0) {
      const admin = rows[0];
      const isMatch = await bcrypt.compare(password, admin.password); // Use bcrypt for hashed passwords

      if (isMatch) {
        const { password: _, ...adminData } = admin;
        const token = jwt.sign(
          { adminId: admin.id, email: admin.email, role: admin.role || 'Admin' },
          jwtSecret,
          { expiresIn: '8h' }
        );

        return res.status(200).json({ 
          message: 'Login successful', 
          admin: adminData,
          token,
        });
      }
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
