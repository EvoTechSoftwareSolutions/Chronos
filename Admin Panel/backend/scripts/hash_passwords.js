const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    const [rows] = await db.query('SELECT id, password FROM admins');
    console.log(`Found ${rows.length} admins.`);

    for (const admin of rows) {
      // Check if already hashed (bcrypt hashes start with $2)
      if (admin.password.startsWith('$2')) {
        console.log(`Admin ${admin.id} already hashed. Skipping.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, admin.id]);
      console.log(`Hashed password for Admin ${admin.id}.`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
