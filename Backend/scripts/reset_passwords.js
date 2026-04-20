import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chronos_db',
});

db.connect((err) => {
  if (err) {
    console.log('DB Connection Error:', err);
    process.exit(1);
  }

  console.log('Connected to database.');

  // Reset admin_profile password to plain text
  db.query("UPDATE admin_profile SET password = 'admin123' WHERE id = 1", (err, result) => {
    if (err) console.log('admin_profile error:', err.message);
    else console.log('admin_profile password reset to admin123:', result.affectedRows, 'row(s) updated');
  });

  // Reset admins table passwords to plain text
  db.query("UPDATE admins SET password = 'admin123'", (err, result) => {
    if (err) console.log('admins error:', err.message);
    else console.log('admins passwords reset to admin123:', result.affectedRows, 'row(s) updated');
  });

  // Reset all user passwords to plain text (since we can't recover original passwords from hashes, set a default)
  db.query("SELECT id, email, password FROM users", (err, users) => {
    if (err) {
      console.log('users query error:', err.message);
      db.end();
      return;
    }

    let updated = 0;
    users.forEach((user) => {
      // If password starts with $2 it's bcrypt hashed - reset to 'password123'
      if (user.password && user.password.startsWith('$2')) {
        db.query("UPDATE users SET password = 'password123' WHERE id = ?", [user.id], (err) => {
          if (!err) updated++;
          console.log(`User ${user.email}: password reset to password123`);
        });
      } else {
        console.log(`User ${user.email}: already plain text, skipping`);
      }
    });

    setTimeout(() => {
      console.log(`\nDone! ${updated} user password(s) reset to 'password123'.`);
      console.log("Admin passwords reset to 'admin123'.");
      db.end();
    }, 2000);
  });
});
