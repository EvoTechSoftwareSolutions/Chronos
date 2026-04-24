import crypto from "crypto";
import express from "express";
import db from "../config/db.js";

const MERCHANT_ID = process.env.MERCHANT_ID || "1234976";
const MERCHANT_SECRET = process.env.MERCHANT_SECRET || "MTk1MTkwMDYyMzIyMjgxMzc4OTgyNDAxNjY0NzM5NTE0MDMyNjM4";

// POST /checkout
export function checkout(req, res) {
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod, email, accountId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, message: "No items in order" });
  }

  const userEmail = email || (shippingDetails && shippingDetails.email) || null;
  const { firstName, lastName, address, mobile, city, province, zipCode } = shippingDetails || {};

  const sql = `
    INSERT INTO orders 
    (customer_id, items, email, subtotal, discount, total, shipping_method, payment_method, first_name, last_name, address, mobile, city, province, zip_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    accountId || null,
    JSON.stringify(items),
    userEmail,
    subtotal,
    discount,
    total,
    shippingMethod || "Standard Delivery",
    paymentMethod || "Credit/Debit",
    firstName,
    lastName,
    address,
    mobile,
    city,
    province,
    zipCode,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log("Error saving order:", err);
      return res.json({ success: false, message: "Error saving order" });
    }

    // Trigger New Order Notification
    const newOrderId = result.insertId;
    const orderNotifText = `New order received: #ORD-${String(newOrderId).padStart(4, "0")} from ${firstName || "Guest"} ${lastName || ""}`;
    db.query("INSERT INTO notifications (text, type) VALUES (?, 'order')", [orderNotifText]);

    // Deduct Stock and Trigger Notifications
    try {
      const parsedItems = JSON.parse(JSON.stringify(items));
      parsedItems.forEach((item) => {
        const updateStockSql = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?";
        db.query(updateStockSql, [item.quantity, item.id], (uerr) => {
          if (uerr) console.error("Error deducting stock for product", item.id, uerr);

          db.query("SELECT name, stock_quantity FROM products WHERE id = ?", [item.id], (serr, rows) => {
            if (!serr && rows.length > 0) {
              const p = rows[0];
              if (p.stock_quantity < 5) {
                const notifText = `Low stock alert for ${p.name}. Only ${p.stock_quantity} left in inventory!`;
                db.query("INSERT INTO notifications (text, type) VALUES (?, 'low_stock')", [notifText]);
              }
            }
          });
        });
      });
    } catch (e) {
      console.error("Stock deduction trigger error:", e);
    }

    // Automatically map into CRM if a user is logged in
    if (userEmail) {
      db.query("SELECT * FROM customers WHERE email = ?", [userEmail], (existsErr, rows) => {
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : "Unknown User";
        const initials = (firstName ? firstName[0].toUpperCase() : "") + (lastName ? lastName[0].toUpperCase() : "");

        if (!existsErr && rows.length === 0) {
          const customer_id = "CUST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
          const insertSql = `
            INSERT INTO customers (customer_id, initials, name, email, orders_count, total_spent, join_date, status)
            VALUES (?, ?, ?, ?, 1, ?, CURDATE(), 'Active')
          `;
          db.query(insertSql, [customer_id, initials, fullName, userEmail, total], (ierr) => {
            if (!ierr) {
              const notifText = `New customer registration: ${fullName} (${customer_id})`;
              db.query("INSERT INTO notifications (text, type) VALUES (?, 'customer')", [notifText]);
              console.log("New customer added from checkout:", customer_id);
            }
          });
        } else {
          const existing = rows[0];
          const isRegistered = existing.customer_id?.startsWith("ACC-");
          const updateSql = `
            UPDATE customers 
            SET orders_count = orders_count + 1, 
                total_spent = total_spent + ?,
                status = 'Active'
                ${!isRegistered ? ", name = ?" : ""}
            WHERE email = ?
          `;
          const params = !isRegistered ? [total, fullName, userEmail] : [total, userEmail];
          db.query(updateSql, params);
        }
      });
    }

    return res.json({ success: true, message: "Order placed successfully!", orderId: result.insertId });
  });
}

// GET /api/user/orders
export function getUserOrders(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const sql = "SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, orders: results });
  });
}

// POST /api/orders/update-payment-status
export function updatePaymentStatus(req, res) {
  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ success: false, message: "orderId and status required" });

  const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
  db.query(sql, [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Status updated" });
  });
}

// POST /generate-payhere-hash
export function generatePayhereHash(req, res) {
  const { order_id, amount, currency } = req.body;
  const merchantSecretHash = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();

  const formattedAmount = Number(amount).toFixed(2);

  const dataToHash = MERCHANT_ID + order_id + formattedAmount + currency + merchantSecretHash;
  const hash = crypto.createHash("md5").update(dataToHash).digest("hex").toUpperCase();

  res.json({ hash, merchant_id: MERCHANT_ID });
}

// POST /payhere-notify
export function payhereNotify(req, res) {
  const merchant_id = req.body.merchant_id;
  const order_id = req.body.order_id;
  const payhere_amount = req.body.payhere_amount;
  const payhere_currency = req.body.payhere_currency;
  const status_code = req.body.status_code;
  const md5sig = req.body.md5sig;

  const merchantSecretHash = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();
  const dataToHash = merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchantSecretHash;
  const local_md5sig = crypto.createHash("md5").update(dataToHash).digest("hex").toUpperCase();

  if (local_md5sig === md5sig) {
    let payment_status = "Pending";
    if (status_code == 2) payment_status = "Paid";
    else if (status_code == 0) payment_status = "Pending";
    else if (status_code == -1) payment_status = "Canceled";
    else if (status_code == -2) payment_status = "Failed";
    else if (status_code == -3) payment_status = "Chargedback";

    const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
    db.query(sql, [payment_status, order_id], (err, result) => {
      if (err) {
        console.log("Error updating payment status in DB", err);
      } else {
        console.log("Payment status updated to", payment_status, "for order_id", order_id);
      }
    });
  } else {
    console.log("Invalid MD5 signature");
  }

  res.sendStatus(200);
}
