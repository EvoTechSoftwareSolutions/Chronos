const pool = require('../config/db');

function normalizeCanceled(value) {
  if (!value) return value;
  if (value === 'Cancelled') return 'Canceled';
  return value;
}

function isCanceled(value) {
  const v = normalizeCanceled(value);
  return v === 'Canceled';
}

function isPaid(value) {
  return String(value || '').trim() === 'Paid';
}

function hasAnyStock(stock) {
  if (stock === null || stock === undefined) return false;
  if (typeof stock === 'object') {
    return Object.values(stock).some((v) => Number(v) > 0);
  }
  return Number(stock) > 0;
}

function sumTierStockValue(stock) {
  if (stock === null || stock === undefined) return 0;
  if (typeof stock === 'object') {
    return Object.values(stock).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }
  return Number(stock) || 0;
}

function recomputeTotalStockFromTiers(tiers) {
  if (!Array.isArray(tiers)) return 0;
  return tiers.reduce((sum, t) => sum + sumTierStockValue(t?.stock), 0);
}

function addTierStock(tier, qty, strapSize) {
  if (!tier) return;
  const addQty = Number(qty) || 0;
  if (addQty <= 0) return;

  if (strapSize) {
    if (typeof tier.stock !== 'object' || tier.stock === null) tier.stock = {};
    tier.stock[strapSize] = (Number(tier.stock[strapSize]) || 0) + addQty;
    return;
  }

  if (typeof tier.stock === 'object' && tier.stock !== null) {
    const keys = Object.keys(tier.stock);
    const key = keys.length > 0 ? keys[0] : 'Default';
    tier.stock[key] = (Number(tier.stock[key]) || 0) + addQty;
    return;
  }

  tier.stock = (Number(tier.stock) || 0) + addQty;
}

function ensureTierExists(tiers, index) {
  if (!Array.isArray(tiers)) return false;
  if (index < 0) return false;
  while (tiers.length <= index) {
    tiers.push({ price: String(tiers[tiers.length - 1]?.price ?? "0"), stock: {} });
  }
  return true;
}

async function deductProductStockFifoByTier({ productId, requestedQty, strapSize }) {
  const qty = Math.max(0, Number(requestedQty) || 0);
  if (!productId || qty <= 0) return { deductedTotal: 0, allocations: [] };

  const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
  if (productRows.length === 0) return { deductedTotal: 0, allocations: [] };

  const product = productRows[0];
  let tiers = [];
  try {
    if (product.inventory_tiers) {
      tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
    }
  } catch (e) {
    tiers = [];
  }

  // No tiers -> fallback to scalar stock_quantity
  if (!Array.isArray(tiers) || tiers.length === 0) {
    const canTake = Math.min(qty, Math.max(0, Number(product.stock_quantity) || 0));
    const newTotal = Math.max(0, (Number(product.stock_quantity) || 0) - canTake);
    await pool.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newTotal, productId]);
    return { deductedTotal: canTake, allocations: [{ tierIndex: null, strapSize: strapSize || null, quantity: canTake }] };
  }

  let remaining = qty;
  let deductedTotal = 0;
  const allocations = [];

  for (let tIndex = 0; tIndex < tiers.length; tIndex++) {
    if (remaining <= 0) break;
    const tier = tiers[tIndex];

    if (typeof tier?.stock === 'object' && tier.stock !== null) {
      if (strapSize) {
        const inSize = Number(tier.stock[strapSize]) || 0;
        if (inSize <= 0) continue;
        const take = Math.min(remaining, inSize);
        tier.stock[strapSize] = inSize - take;
        remaining -= take;
        deductedTotal += take;
        allocations.push({ tierIndex: tIndex, strapSize, quantity: take });
      } else {
        // Backward compat: consume any sizes FIFO
        const keys = Object.keys(tier.stock);
        for (const k of keys) {
          if (remaining <= 0) break;
          const inSize = Number(tier.stock[k]) || 0;
          if (inSize <= 0) continue;
          const take = Math.min(remaining, inSize);
          tier.stock[k] = inSize - take;
          remaining -= take;
          deductedTotal += take;
          allocations.push({ tierIndex: tIndex, strapSize: k, quantity: take });
        }
      }
    } else {
      // Legacy scalar tier stock
      const inTier = Number(tier?.stock) || 0;
      if (inTier <= 0) continue;
      const take = Math.min(remaining, inTier);
      tier.stock = inTier - take;
      remaining -= take;
      deductedTotal += take;
      allocations.push({ tierIndex: tIndex, strapSize: strapSize || null, quantity: take });
    }
  }

  // Keep totals aligned with tier data
  const newTotal = recomputeTotalStockFromTiers(tiers);
  await pool.query('UPDATE products SET stock_quantity = ?, inventory_tiers = ? WHERE id = ?', [
    newTotal,
    JSON.stringify(tiers),
    productId,
  ]);

  return { deductedTotal, allocations };
}

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        COALESCE(c.name, CONCAT(o.first_name, ' ', o.last_name)) as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.email = c.email
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN order_status = 'Pending' OR order_status IS NULL THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN order_status = 'Shipped' THEN 1 ELSE 0 END) as shippedCount,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as deliveredCount
      FROM orders
    `);

    res.status(200).json({
      orders: orders.map(row => {
        let itemsArr = [];
        try { itemsArr = JSON.parse(row.items || '[]'); } catch(e){}
        
        return {
          ...row,
          id: `#${row.id}`,
          customer_id: row.customer_id || 'GUEST',
          customer: row.customer_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Guest',
          items_summary: itemsArr.map(i => i.name).join(', '),
          total_formatted: `Rs ${Number(row.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          date_formatted: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: row.order_status || 'Pending'
        };
      }),
      stats: stats[0]
    });
  } catch (err) {
    console.error('Orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders', detail: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status, payment_status } = req.body;
  const cleanId = id.replace('#', '');
  console.log(`[Admin API] Updating Order Status. ID: ${id} -> ${cleanId}, Status: ${order_status}, Payment Status: ${payment_status}`);
  
  try {
    // 1. Get current order state
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [cleanId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = rows[0];

    const nextOrderStatus = normalizeCanceled(order_status);
    const nextPaymentStatus = payment_status ? normalizeCanceled(payment_status) : order.payment_status;

    // Guard: cannot mark Shipped/Delivered unless payment is Paid
    if ((nextOrderStatus === 'Shipped' || nextOrderStatus === 'Delivered') && !isPaid(nextPaymentStatus)) {
      return res.status(400).json({
        error: 'Cannot set order to Shipped/Delivered unless payment status is Paid',
      });
    }

    // If payment is being set to Paid (from non-Paid), trigger paid side effects:
    // - Deduct stock (FIFO tier per strap size)
    // - Update customer revenue (orders_count/total_spent)
    if (payment_status && isPaid(nextPaymentStatus) && !isPaid(order.payment_status)) {
      let parsedItems = [];
      try { parsedItems = JSON.parse(order.items || '[]'); } catch (e) {}

      // Deduct stock and record allocations into order.items
      for (const item of parsedItems) {
        if (!item?.id || !item?.quantity) continue;
        const strapSize = item.strap_size || item.strapSize || null;
        const { deductedTotal, allocations } = await deductProductStockFifoByTier({
          productId: item.id,
          requestedQty: item.quantity,
          strapSize,
        });
        item.stock_allocations = allocations;
        item.deducted_quantity = deductedTotal;
      }

      await pool.query('UPDATE orders SET items = ? WHERE id = ?', [JSON.stringify(parsedItems), cleanId]);

      // Update customer revenue (if email exists)
      if (order.email) {
        await pool.query(
          'UPDATE customers SET orders_count = orders_count + 1, total_spent = total_spent + ?, status = \'Active\' WHERE email = ?',
          [Number(order.total) || 0, order.email]
        );
      }
    }

    // 2. If changing to Canceled/Cancelled and it wasn't canceled before, restore stock and deduct revenue
    if (isCanceled(nextOrderStatus) && !isCanceled(order.order_status)) {
      // Only restore if it was Paid (because only Paid orders deduct stock/add revenue in this system)
      // And only if it wasn't already delivered/shipped
      if (order.order_status !== 'Delivered' && order.order_status !== 'Shipped' && order.payment_status === 'Paid') {
        let parsedItems = [];
        try { parsedItems = JSON.parse(order.items || '[]'); } catch (e) {}

        for (const item of parsedItems) {
          if (item.id && item.quantity) {
            // Fetch product to get inventory_tiers
            const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [item.id]);
            if (productRows.length > 0) {
              const product = productRows[0];
              let tiers = [];
              try {
                if (product.inventory_tiers) {
                  tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
                }
              } catch (e) { console.error("Restore stock parse error", e); }

              if (Array.isArray(tiers) && tiers.length > 0) {
                // Restore to the exact tiers that were consumed (if tracked), otherwise fall back to first tier.
                const allocations = Array.isArray(item.stock_allocations) ? item.stock_allocations : null;
                if (allocations && allocations.length > 0) {
                  let restored = 0;
                  for (const a of allocations) {
                    const tierIndex = Number(a.tierIndex);
                    const qty = Number(a.quantity) || 0;
                    const size = a.strapSize || item.strap_size || item.strapSize;
                    if (qty <= 0) continue;
                    if (!ensureTierExists(tiers, tierIndex)) continue;
                    addTierStock(tiers[tierIndex], qty, size);
                    restored += qty;
                  }
                  await pool.query(
                    'UPDATE products SET stock_quantity = stock_quantity + ?, inventory_tiers = ? WHERE id = ?',
                    [restored, JSON.stringify(tiers), item.id]
                  );
                } else {
                  addTierStock(tiers[0], item.quantity, item.strap_size || item.strapSize);
                  await pool.query(
                    'UPDATE products SET stock_quantity = stock_quantity + ?, inventory_tiers = ? WHERE id = ?',
                    [item.quantity, JSON.stringify(tiers), item.id]
                  );
                }
              } else {
                await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.id]);
              }
            }
          }
        }

        if (order.email) {
          await pool.query('UPDATE customers SET orders_count = GREATEST(0, orders_count - 1), total_spent = GREATEST(0, total_spent - ?) WHERE email = ?', [order.total, order.email]);
        }
      }
    }

    const updates = [];
    const values = [];
    if (order_status) {
      updates.push('order_status = ?');
      values.push(normalizeCanceled(order_status));
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      values.push(normalizeCanceled(payment_status));
    }
    values.push(cleanId);

    const [result] = await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    console.log(`[Admin API] Update result:`, result);
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err) {
    console.error('[Admin API] Order update error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const cleanId = id.replace('#', '');
  console.log(`[Admin API] Deleting Order. ID: ${id} -> ${cleanId}`);

  try {
    // 1. Get the order first to check its status
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [cleanId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = rows[0];
    const { order_status, payment_status, items, email, total } = order;

    // 2. If it's not delivered, shipped, or already canceled, restore stock and adjust customer revenue
    if (order_status !== 'Delivered' && order_status !== 'Shipped' && !isCanceled(order_status)) {
      if (payment_status === 'Paid') {
        // Restore stock
        let parsedItems = [];
        try {
          parsedItems = JSON.parse(items || '[]');
        } catch (e) {}

        for (const item of parsedItems) {
          if (item.id && item.quantity) {
            // Fetch product to get inventory_tiers
            const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [item.id]);
            if (productRows.length > 0) {
              const product = productRows[0];
              let tiers = [];
              try {
                if (product.inventory_tiers) {
                  tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
                }
              } catch (e) { console.error("Restore stock parse error", e); }

              if (Array.isArray(tiers) && tiers.length > 0) {
                // Restore to the exact tiers that were consumed (if tracked), otherwise fall back to first tier.
                const allocations = Array.isArray(item.stock_allocations) ? item.stock_allocations : null;
                if (allocations && allocations.length > 0) {
                  let restored = 0;
                  for (const a of allocations) {
                    const tierIndex = Number(a.tierIndex);
                    const qty = Number(a.quantity) || 0;
                    const size = a.strapSize || item.strap_size || item.strapSize;
                    if (qty <= 0) continue;
                    if (!ensureTierExists(tiers, tierIndex)) continue;
                    addTierStock(tiers[tierIndex], qty, size);
                    restored += qty;
                  }
                  await pool.query(
                    'UPDATE products SET stock_quantity = stock_quantity + ?, inventory_tiers = ? WHERE id = ?',
                    [restored, JSON.stringify(tiers), item.id]
                  );
                } else {
                  addTierStock(tiers[0], item.quantity, item.strap_size || item.strapSize);
                  await pool.query(
                    'UPDATE products SET stock_quantity = stock_quantity + ?, inventory_tiers = ? WHERE id = ?',
                    [item.quantity, JSON.stringify(tiers), item.id]
                  );
                }
              } else {
                await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.id]);
              }
            }
          }
        }

        // Adjust customer revenue
        if (email) {
          await pool.query('UPDATE customers SET orders_count = GREATEST(0, orders_count - 1), total_spent = GREATEST(0, total_spent - ?) WHERE email = ?', [total, email]);
        }
      }
    }

    // 3. Delete the order
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [cleanId]);
    console.log(`[Admin API] Delete result:`, result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('[Admin API] Order deletion error:', err);
    res.status(500).json({ error: 'Failed to delete order', detail: err.message });
  }
};
