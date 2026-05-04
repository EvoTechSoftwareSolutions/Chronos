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
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      // Create new admin if they don't exist
      await pool.query('INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)', [name || 'Google Admin', email, 'google_sso', 'Admin']);
      const [newRows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
      rows = newRows;
    }
    
    const admin = rows[0];
    const { password: _, ...adminData } = admin;
    
    return res.status(200).json({ 
      message: 'Login successful', 
      admin: adminData 
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if admin already exists
    const [existing] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An admin with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new admin
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)', 
      [name, email, hashedPassword, 'Admin']
    );

    const [newRows] = await pool.query('SELECT * FROM admins WHERE id = ?', [result.insertId]);
    const admin = newRows[0];
    const { password: _, ...adminData } = admin;

    return res.status(201).json({ 
      message: 'Admin account created successfully', 
      admin: adminData 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Database error during signup' });
  }
};
