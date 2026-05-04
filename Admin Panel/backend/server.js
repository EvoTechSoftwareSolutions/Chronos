require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { applySecurityHeaders } = require('./middleware/security');
const { createRateLimiter } = require('./middleware/rateLimit');
const { requireAuth } = require('./middleware/auth');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const customersRoutes = require('./routes/customersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

const adminProfileRoutes = require('./routes/adminProfileRoutes');
const path = require('path');

const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked for this origin'));
  },
}));
app.use(applySecurityHeaders);
app.use(express.json({ limit: '200kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.',
});

// Register API Routes
app.post('/api/admin/login', loginRateLimit);
app.post('/api/admin/register', loginRateLimit);
app.use('/api/admin', authRoutes); // /api/admin/login, /api/admin/register
app.use('/api/admin', requireAuth);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/customers', customersRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/notifications', notificationsRoutes);

app.use('/api/admin/profile', adminProfileRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
