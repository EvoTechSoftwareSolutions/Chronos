const pool = require('../config/db');

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, text, type, is_read, created_at 
      FROM notifications 
      ORDER BY created_at DESC
    `);
    
    // Format the time for the frontend
    const notifications = rows.map(n => ({
      ...n,
      time: n.created_at
    }));

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications');
    res.status(200).json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.error('Mark All as Read Error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};
