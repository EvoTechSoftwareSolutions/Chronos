import crypto from "crypto";
import express from "express";
import db from "../config/db.js";
import { promisify } from "util";

const MERCHANT_ID = process.env.MERCHANT_ID || "1234976";
const MERCHANT_SECRET = process.env.MERCHANT_SECRET || "MTk1MTkwMDYyMzIyMjgxMzc4OTgyNDAxNjY0NzM5NTE0MDMyNjM4";

// POST /checkout
export function checkout(req, res) {
  const { items, subtotal, discount, total, shippingDetails, shippingMethod, paymentMethod, email, accountId } = req.body;
  console.log("[Checkout API] Placing order for email:", email || shippingDetails?.email);

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
  console.log("[User API] Fetching orders for email:", email);
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const sql = "SELECT * FROM orders WHERE email = ? AND payment_status NOT IN ('Declined', 'Failed', 'Canceled') ORDER BY created_at DESC";
  console.log("[User API] Executing SQL:", sql);
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    console.log(`[User API] Found ${results.length} orders (Filtered Declined/Failed/Canceled)`);
    res.json({ success: true, orders: results });
  });
}

// POST /api/orders/update-payment-status
export function updatePaymentStatus(req, res) {
  const { orderId, order_id, status, decline_reason } = req.body;
  const idToUse = orderId || order_id;

  if (!idToUse) {
    return res.status(400).json({ success: false, message: "orderId or order_id is required" });
  }
  if (!status) {
    return res.status(400).json({ success: false, message: "status is required" });
  }
  
  const allowedStatuses = ["Pending", "Paid", "Canceled", "Failed", "Declined", "Chargedback"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid payment status: ${status}. Allowed: ${allowedStatuses.join(", ")}` });
  }

  db.query("SELECT * FROM orders WHERE id = ?", [idToUse], (selErr, rows) => {
    if (selErr || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = rows[0];

    // If decline_reason is provided, log it
    if (decline_reason && (status === "Failed" || status === "Declined")) {
      console.log(`Payment declined for order ${idToUse}: ${decline_reason}`);
    }

    const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
    db.query(sql, [status, idToUse], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      // Trigger side-effects if status changed to 'Paid'
      if (status === "Paid" && order.payment_status !== "Paid") {
        triggerPaidOrderSideEffects(idToUse, order);
      }

      res.json({ success: true, message: `Status updated to ${status}` });
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

  let publicUrl = process.env.PUBLIC_URL || "";
  if (publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }

  const notifyUrl = publicUrl 
    ? `${publicUrl}/payhere-notify` 
    : "http://localhost:5000/payhere-notify";

  res.json({ hash, merchant_id: MERCHANT_ID, notify_url: notifyUrl });
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
    else if (status_code == -2) payment_status = "Declined";
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

      // We no longer delete failed/canceled orders so they remain visible in the admin panel.
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
        
        // Recalculate active price from updated tiers to keep 'price' column in sync for the website/admin
        let activePrice = product.price;
        if (Array.isArray(tiers) && tiers.length > 0) {
          let priceSet = false;
          for (const t of tiers) {
            const tStock = (typeof t.stock === 'object' && t.stock !== null) 
              ? Object.values(t.stock).reduce((a, b) => a + (Number(b) || 0), 0)
              : (Number(t.stock) || 0);
            if (tStock > 0) {
              activePrice = t.price;
              priceSet = true;
              break;
            }
          }
          if (!priceSet && tiers.length > 0) {
            activePrice = tiers[tiers.length - 1].price;
          }
        }
        const finalPrice = "Rs " + Number(String(activePrice).replace(/[^0-9.]/g, '') || 0).toLocaleString();

        try {
          await queryAsync("UPDATE products SET stock_quantity = ?, inventory_tiers = ?, price = ? WHERE id = ?", [
            newTotalStock,
            JSON.stringify(tiers),
            finalPrice,
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

// DELETE /api/user/orders/:orderId - Delete/cancel failed orders (for payment declines)
export function deleteUserOrder(req, res) {
  const { orderId } = req.params;
  
  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  db.query("SELECT * FROM orders WHERE id = ?", [orderId], (selErr, rows) => {
    if (selErr || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = rows[0];
    
    // Only allow deletion of failed/pending orders (not completed transactions)
    const allowedStatuses = ['Pending', 'Failed', 'Canceled'];
    if (!allowedStatuses.includes(order.payment_status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete order with payment status: ${order.payment_status}` 
      });
    }

    // Delete the order
    db.query("DELETE FROM orders WHERE id = ?", [orderId], (delErr, result) => {
      if (delErr) {
        console.error("Error deleting order:", delErr);
        return res.status(500).json({ success: false, message: "Failed to delete order" });
      }

      res.json({ success: true, message: "Order has been deleted successfully" });
    });
  });
}

// GET /api/orders/:orderId/status
export function getOrderStatus(req, res) {
  const { orderId } = req.params;
  
  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  db.query("SELECT payment_status FROM orders WHERE id = ?", [orderId], (err, rows) => {
    if (err) {
      console.error("Error checking order status:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, status: rows[0].payment_status });
  });
}
