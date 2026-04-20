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
