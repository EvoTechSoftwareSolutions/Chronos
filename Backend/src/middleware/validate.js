function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateAdminLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid admin email is required" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  next();
}

export function validateOrderStatus(req, res, next) {
  const { order_status } = req.body || {};
  const allowed = ["Pending", "Shipped", "Delivered", "Canceled"];
  if (!allowed.includes(order_status)) {
    return res.status(400).json({ error: "Invalid order_status value" });
  }
  next();
}

export function validateCustomer(req, res, next) {
  const { name, email } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Customer name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Valid customer email is required" });
  }
  next();
}

export function validateProduct(req, res, next) {
  const { name, price, stock_quantity, brand, category } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "Product name is required" });
  }
  if (!brand || !category) {
    return res.status(400).json({ error: "Product brand and category are required" });
  }
  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "Product price must be a non-negative number" });
  }
  if (!Number.isFinite(Number(stock_quantity)) || Number(stock_quantity) < 0) {
    return res.status(400).json({ error: "Product stock_quantity must be a non-negative number" });
  }
  next();
}

export function validateSettings(req, res, next) {
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

export function validateProfileSecurity(req, res, next) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  next();
}

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  const pwd = String(password || "");
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const hasSpace = /\s/.test(pwd);
  if (pwd.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial || hasSpace) {
    return res.status(400).json({
      success: false,
      message: "Password must be 8+ chars and include uppercase, lowercase, number, and symbol (no spaces).",
    });
  }
  next();
}

export function validateGoogleRegister(req, res, next) {
  const { name, email } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }
  next();
}

export function validateSubscribe(req, res, next) {
  const { email } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  next();
}
