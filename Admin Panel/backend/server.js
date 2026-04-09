require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Register API Routes
app.use('/api/admin', authRoutes); // /api/admin/login
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/customers', customersRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/notifications', notificationsRoutes);

app.use('/api/admin/profile', adminProfileRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
