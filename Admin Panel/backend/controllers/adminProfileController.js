const db = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const adminId = req.query.id || 1;
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
    id,
    first_name,
    last_name,
    email,
    role,
    department,
    phone,
    bio
  } = req.body;
  
  const adminId = id || 1;
  const newName = (first_name || '') + ' ' + (last_name || '');

  try {
    await db.query(`
      UPDATE admins SET
        first_name = ?,
        last_name = ?,
        name = ?,
        email = ?,
        role = ?,
        department = ?,
        phone = ?,
        bio = ?
      WHERE id = ?
    `, [
      first_name, last_name, newName.trim() || 'Admin', email, role, department, phone, bio, adminId
    ]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSecurity = async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;

  // 1. Strict ID Check
  if (!id) {
    return res.status(400).json({ error: 'CRITICAL ERROR: Your Admin ID is missing from the session. Please log out and securely log back in.' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: `Debug: Cannot find Admin Account with ID ${id}` });
    
    const admin = rows[0];

    // 2. Google SSO Fallback Rule
    // If the user signed in with Google, they don't have a real password yet!
    if (admin.password === 'google_sso') {
       if (currentPassword !== 'google_sso') {
          return res.status(401).json({ error: "Notice: Since you created this account using Google SSO, your temporary strictly-enforced Current Password is 'google_sso'. Type that to proceed!" });
       }
    }

    // 3. Mathematical Verification
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    const isPlainTextMatch = (currentPassword === admin.password);

    if (!isMatch && !isPlainTextMatch && admin.password !== 'google_sso') {
      return res.status(401).json({ error: `Incorrect password! We securely evaluated your text against the account: ${admin.email}. Please try again.` });
    }

    // 4. Verification Success => Hash & Save
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedNewPassword, admin.id]);


    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Security update error:', error);
    res.status(500).json({ error: 'Server crashed while updating password' });
  }
};
