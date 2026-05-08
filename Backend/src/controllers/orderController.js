import crypto from "crypto";
import express from "express";
import db from "../config/db.js";
import { promisify } from "util";

const MERCHANT_ID = process.env.MERCHANT_ID || "1234976";
const MERCHANT_SECRET = process.env.MERCHANT_SECRET || "MTk1MTkwMDYyMzIyMjgxMzc4OTgyNDAxNjY0NzM5NTE0MDMyNjM4";

// POST /checkout
export function checkout(req, res) {
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod, email, accountId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: false, message: "No items in order" });
  }
  if (!shippingDetails?.firstName || !shippingDetails?.lastName || !shippingDetails?.address) {
    return res.status(400).json({ success: false, message: "Incomplete shipping details" });
  }
  if (!shippingDetails?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shippingDetails.email))) {
    return res.status(400).json({ success: false, message: "Valid email is required for checkout" });
  }
  if (![subtotal, discount, total].every((value) => Number.isFinite(Number(value)))) {
    return res.status(400).json({ success: false, message: "Invalid order totals" });
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
  const allowedStatuses = ["Pending", "Paid", "Canceled", "Failed", "Chargedback"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid payment status" });
  }

  db.query("SELECT * FROM orders WHERE id = ?", [orderId], (selErr, rows) => {
    if (selErr || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = rows[0];
    const previousStatus = order.payment_status;

    const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
    db.query(sql, [status, orderId], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      
      // If status changed to 'Paid', trigger side effects
      if (status === "Paid" && previousStatus !== "Paid") {
        triggerPaidOrderSideEffects(orderId, order);
      }
      
      res.json({ success: true, message: "Status updated" });
    });
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

    db.query("SELECT * FROM orders WHERE id = ?", [order_id], (selErr, orderRows) => {
      if (selErr || orderRows.length === 0) {
        console.log("Order not found or error fetching order in payhereNotify", selErr);
        return;
      }
      const order = orderRows[0];
      const previousStatus = order.payment_status;

      const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
      db.query(sql, [payment_status, order_id], (err, result) => {
        if (err) {
          console.log("Error updating payment status in DB", err);
        } else {
          console.log("Payment status updated to", payment_status, "for order_id", order_id);

          // Only trigger side-effects if status changed to 'Paid' and it wasn't already 'Paid'
          if (payment_status === "Paid" && previousStatus !== "Paid") {
             triggerPaidOrderSideEffects(order_id, order);
          }
        }
      });
    });
  } else {
    console.log("Invalid MD5 signature");
  }

  res.sendStatus(200);
}

// Helper to handle all side effects when an order is paid
function triggerPaidOrderSideEffects(orderId, order) {
  const { first_name, last_name, email: userEmail, total, items: rawItems } = order;
  let items = [];
  try {
    items = JSON.parse(rawItems);
  } catch (e) {
    console.error("Error parsing items for stock deduction", e);
    return;
  }

  // 1. Deduct Stock (FIFO by tier; per strap size).
  // Also record the exact tier allocations into order.items so admin cancel/delete can restock correctly.
  const queryAsync = promisify(db.query).bind(db);

  (async () => {
    const updatedItems = Array.isArray(items) ? items.map((it) => ({ ...it })) : [];

    for (let idx = 0; idx < updatedItems.length; idx++) {
      const item = updatedItems[idx];
      if (!item?.id || !item?.quantity) continue;

      const selectedStrapSize = item.strap_size || item.strapSize || null;
      const requestedQty = Math.max(0, Number(item.quantity) || 0);
      if (requestedQty <= 0) continue;

      let productRows = [];
      try {
        productRows = await queryAsync("SELECT * FROM products WHERE id = ?", [item.id]);
      } catch (e) {
        console.error("Error fetching product for stock deduction", item.id, e);
        continue;
      }
      if (!Array.isArray(productRows) || productRows.length === 0) continue;

      const product = productRows[0];
      let tiers = [];
      try {
        if (product.inventory_tiers) {
          tiers = typeof product.inventory_tiers === "string" ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
        }
      } catch (e) {
        console.error("Error parsing inventory_tiers for product", product.id, e);
        tiers = [];
      }

      const allocations = [];
      let remainingToDeduct = requestedQty;
      let deductedTotal = 0;

      if (Array.isArray(tiers) && tiers.length > 0) {
        for (let tIndex = 0; tIndex < tiers.length; tIndex++) {
          if (remainingToDeduct <= 0) break;
          const tier = tiers[tIndex];

          if (typeof tier?.stock === "object" && tier.stock !== null) {
            if (selectedStrapSize) {
              const qtyInSize = Number(tier.stock[selectedStrapSize]) || 0;
              if (qtyInSize <= 0) continue;
              const take = Math.min(remainingToDeduct, qtyInSize);
              tier.stock[selectedStrapSize] = qtyInSize - take;
              remainingToDeduct -= take;
              deductedTotal += take;
              allocations.push({ tierIndex: tIndex, strapSize: selectedStrapSize, quantity: take });
            } else {
              // Backward-compat: no strap size selected, consume any available size FIFO
              const sizeKeys = Object.keys(tier.stock);
              for (const skey of sizeKeys) {
                if (remainingToDeduct <= 0) break;
                const qtyInSize = Number(tier.stock[skey]) || 0;
                if (qtyInSize <= 0) continue;
                const take = Math.min(remainingToDeduct, qtyInSize);
                tier.stock[skey] = qtyInSize - take;
                remainingToDeduct -= take;
                deductedTotal += take;
                allocations.push({ tierIndex: tIndex, strapSize: skey, quantity: take });
              }
            }
          } else {
            const tierStock = Number(tier?.stock) || 0;
            if (tierStock <= 0) continue;
            const take = Math.min(remainingToDeduct, tierStock);
            tier.stock = tierStock - take;
            remainingToDeduct -= take;
            deductedTotal += take;
            allocations.push({ tierIndex: tIndex, strapSize: selectedStrapSize, quantity: take });
          }
        }

        // If we couldn't fully deduct, DO NOT over-decrement stock_quantity.
        const newTotalStock = Math.max(0, (Number(product.stock_quantity) || 0) - deductedTotal);
        try {
          await queryAsync("UPDATE products SET stock_quantity = ?, inventory_tiers = ? WHERE id = ?", [
            newTotalStock,
            JSON.stringify(tiers),
            item.id,
          ]);
          checkLowStock(item.id, product.name, newTotalStock);
        } catch (e) {
          console.error("Error updating tiers/stock for product", item.id, e);
        }
      } else {
        // Fallback: simple stock deduction (no tier info available)
        deductedTotal = Math.min(requestedQty, Math.max(0, Number(product.stock_quantity) || 0));
        const newTotalStock = Math.max(0, (Number(product.stock_quantity) || 0) - deductedTotal);
        try {
          await queryAsync("UPDATE products SET stock_quantity = ? WHERE id = ?", [newTotalStock, item.id]);
          checkLowStock(item.id, product.name, newTotalStock);
        } catch (e) {
          console.error("Error deducting stock for product", item.id, e);
        }
      }

      item.stock_allocations = allocations;
      item.deducted_quantity = deductedTotal;
    }

    // Persist allocations back into the order record for accurate restocks later.
    try {
      await queryAsync("UPDATE orders SET items = ? WHERE id = ?", [JSON.stringify(updatedItems), orderId]);
    } catch (e) {
      console.error("Failed to persist stock allocations into order", orderId, e);
    }
  })();

  function checkLowStock(pid, pname, newQty) {
    if (newQty < 5) {
      const notifText = `Low stock alert for ${pname}. Only ${newQty} left in inventory!`;
      db.query("INSERT INTO notifications (text, type) VALUES (?, 'low_stock')", [notifText]);
    }
  }

  // 2. Trigger New Order Notification
  const orderNotifText = `New order received: #ORD-${String(orderId).padStart(4, "0")} from ${first_name || "Guest"} ${last_name || ""}`;
  db.query("INSERT INTO notifications (text, type) VALUES (?, 'order')", [orderNotifText]);

  // 3. Automatic CRM update
  if (userEmail) {
    db.query("SELECT * FROM customers WHERE email = ?", [userEmail], (existsErr, rows) => {
      const fullName = first_name && last_name ? `${first_name} ${last_name}` : "Unknown User";
      const initials = (first_name ? first_name[0].toUpperCase() : "") + (last_name ? last_name[0].toUpperCase() : "");

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
}
