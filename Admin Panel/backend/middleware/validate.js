function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isPositiveNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!isValidEmail(email) && String(email).trim().length < 3) {
    return res.status(400).json({ error: "Provide a valid admin email or username" });
  }
  next();
}

function validateRegister(req, res, next) {
  const { name, email, password, confirmPassword } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match" });
  }
  next();
}

function validateOrderStatus(req, res, next) {
  const { order_status, payment_status } = req.body || {};
  const allowedOrderStatuses = ["Pending", "Shipped", "Delivered", "Canceled", "Cancelled"];
  const allowedPaymentStatuses = ["Paid", "Pending", "Held", "Delayed", "Failed", "Canceled", "Cancelled"];

  if (order_status === undefined && payment_status === undefined) {
    return res.status(400).json({ error: "order_status or payment_status is required" });
  }

  if (order_status !== undefined && !allowedOrderStatuses.includes(order_status)) {
    return res.status(400).json({ error: "Invalid order_status value" });
  }

  if (payment_status !== undefined && !allowedPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ error: "Invalid payment_status value" });
  }

  next();
}

function validateCustomer(req, res, next) {
  const { name, email, orders_count, total_spent, status } = req.body || {};
  const allowedStatuses = ["New", "Active", "Inactive"];
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Customer name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid customer email is required" });
  }
  if (!isPositiveNumber(orders_count) || !isPositiveNumber(total_spent)) {
    return res.status(400).json({ error: "orders_count and total_spent must be non-negative numbers" });
  }
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid customer status" });
  }
  next();
}

function validateProduct(req, res, next) {
  const { name, price, stock_quantity, brand, category } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Product name is required" });
  }
  if (!brand || !category) {
    return res.status(400).json({ error: "Product brand and category are required" });
  }
  if (!isPositiveNumber(price)) {
    return res.status(400).json({ error: "Product price must be a non-negative number" });
  }
  if (!isPositiveNumber(stock_quantity)) {
    return res.status(400).json({ error: "Stock quantity must be a non-negative number" });
  }
  next();
}

function validateSettings(req, res, next) {
  const { store_name, contact_email, phone_number, accent_color } = req.body || {};
  if (!store_name || String(store_name).trim().length < 2) {
    return res.status(400).json({ error: "Store name is required" });
  }
  if (!isValidEmail(contact_email)) {
    return res.status(400).json({ error: "Valid contact email is required" });
  }
  if (!phone_number || String(phone_number).trim().length < 6) {
    return res.status(400).json({ error: "Valid phone number is required" });
  }
  if (!accent_color || !/^#[0-9A-Fa-f]{6}$/.test(String(accent_color))) {
    return res.status(400).json({ error: "accent_color must be a valid hex color" });
  }
  next();
}

function validateSecurityUpdate(req, res, next) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  next();
}

function validateAdminProfile(req, res, next) {
  const { name, email } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  next();
}

module.exports = {
  validateLogin,
  validateRegister,
  validateOrderStatus,
  validateCustomer,
  validateProduct,
  validateSettings,
  validateSecurityUpdate,
  validateAdminProfile,
};
