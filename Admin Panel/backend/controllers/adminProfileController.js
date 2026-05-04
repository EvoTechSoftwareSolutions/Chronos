const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const adminId = req.auth?.adminId || 1;
    const [rows] = await db.query('SELECT id, name, email, first_name, last_name, role, department, phone, bio, created_at FROM admins WHERE id = ?', [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const {
    name,
    email,
    role,
    department,
    phone,
    bio
  } = req.body;
  
  try {
    const adminId = req.auth?.adminId || 1;
    await db.query(`
      UPDATE admins SET
        name = ?,
        email = ?,
        role = ?,
        department = ?,
        phone = ?,
        bio = ?
      WHERE id = ?
    `, [
      name, email, role, department, phone, bio, adminId
    ]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSecurity = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const adminId = req.auth?.adminId || 1;
    // 1. Get the current admin record
    const [rows] = await db.query('SELECT * FROM admins WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    
    const admin = rows[0];

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // 3. Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedNewPassword, admin.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Security update error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
