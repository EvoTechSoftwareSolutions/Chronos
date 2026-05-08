const pool = require('../config/db');

const generateProductCode = () => {
  return 'CHRN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

function parseStrapSizes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    // Accept JSON array or comma-separated
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) return arr.map(String).map(s => s.trim()).filter(Boolean);
      } catch (e) {}
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function sumTierStock(stock) {
  if (stock === null || stock === undefined) return 0;
  if (typeof stock === 'object') {
    return Object.values(stock).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }
  return Number(stock) || 0;
}

function getActiveTierPrice(tiers, fallbackPrice) {
  if (!Array.isArray(tiers) || tiers.length === 0) return fallbackPrice;
  for (const t of tiers) {
    if (sumTierStock(t.stock) > 0) return t.price;
  }
  return tiers[tiers.length - 1]?.price || fallbackPrice;
}

function addStockToTierStock(tier, qty, strapSize) {
  const addQty = Number(qty) || 0;
  if (!tier || addQty <= 0) return;

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

function normalizeTierStockAsObject(tier, strapSizesArr) {
  if (!tier) return;
  if (typeof tier.stock === 'object' && tier.stock !== null) return;
  const current = Number(tier.stock) || 0;
  tier.stock = {};
  if (Array.isArray(strapSizesArr) && strapSizesArr.length > 0) {
    tier.stock[strapSizesArr[0]] = current;
  } else if (current > 0) {
    tier.stock.Default = current;
  }
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

const checkStockNotification = async (name, stock) => {
  if (Number(stock) < 5) {
    const notifText = `Low stock alert for ${name}. Only ${stock} left in inventory!`;
    try {
      await pool.query("INSERT INTO notifications (text, type) VALUES (?, 'low_stock')", [notifText]);
    } catch (e) {
      console.error("Failed to create low stock notification:", e);
    }
  }
};

exports.getProducts = async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY name ASC');

    const [statsResult] = await pool.query(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(CASE WHEN IFNULL(stock_quantity, 0) > 0 THEN 1 ELSE 0 END) as inStockCount,
        SUM(CASE WHEN IFNULL(stock_quantity, 0) <= 0 THEN 1 ELSE 0 END) as outOfStockCount,
        COUNT(DISTINCT category) as categoriesCount
      FROM products
    `);

    res.status(200).json({
      products: products.map(p => ({
        ...p,
        price: `Rs ${Number(String(p.price).replace(/[^0-9.]/g, '') || 0).toLocaleString()}`
      })),
      stats: statsResult[0]
    });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, brand, category, price, stock_quantity, color, strap_size, strap_sizes, description, inventory_tiers } = req.body;
  const product_code = generateProductCode();
  console.log(`[Admin API] Generated Auto Product Code: ${product_code} for ${name}`);
  
  let image_url = '';
  let imagesArr = [];
  
  if (req.files && req.files.length > 0) {
    image_url = `/uploads/${req.files[0].filename}`;
    imagesArr = req.files.map(f => `/uploads/${f.filename}`);
  }

  const strapSizesArr = parseStrapSizes(strap_sizes || strap_size);
  const strapSizeToSave = strapSizesArr.length > 0 ? JSON.stringify(strapSizesArr) : (strap_size || '');

  let parsedTiers = inventory_tiers ? (typeof inventory_tiers === 'string' ? inventory_tiers : JSON.stringify(inventory_tiers)) : null;
  if (!parsedTiers && price && stock_quantity) {
    const rawPrice = String(price).replace(/[^0-9.]/g, '');
    if (strapSizesArr.length > 0) {
      // Default initial stock goes to the first strap size unless frontend sends inventory_tiers explicitly
      parsedTiers = JSON.stringify([{ price: rawPrice, stock: { [strapSizesArr[0]]: Number(stock_quantity) } }]);
    } else {
      parsedTiers = JSON.stringify([{ price: rawPrice, stock: Number(stock_quantity) }]);
    }
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, product_code, brand, category, price, stock_quantity, color, strap_size, description, image_url, images, inventory_tiers) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, product_code, brand, category, "Rs " + Number(String(price).replace(/[^0-9.]/g, '')).toLocaleString(), Number(stock_quantity), color, strapSizeToSave, description, image_url, JSON.stringify(imagesArr), parsedTiers]
    );

    res.status(201).json({ message: 'Product added successfully', id: result.insertId, image_url });

    // Trigger Notification if low stock
    checkStockNotification(name, stock_quantity);
  } catch (err) {
    console.error('Products add error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, brand, category, price, stock_quantity, color, strap_size, strap_sizes, description } = req.body;
  
  try {
    // 1. Fetch current product state
    const [currentRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (currentRows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = currentRows[0];

    let tiers = [];
    try {
      if (product.inventory_tiers) {
        tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
      }
    } catch (e) { tiers = []; }

    // If no tiers exist yet, create the first one from current state
    if (!Array.isArray(tiers) || tiers.length === 0) {
      const oldPrice = String(product.price).replace(/[^0-9.]/g, '');
      tiers = [{ price: oldPrice, stock: product.stock_quantity }];
    }

    const strapSizesArr = parseStrapSizes(strap_sizes || strap_size);
    const strapSizeToSave = strapSizesArr.length > 0 ? JSON.stringify(strapSizesArr) : (strap_size || '');

    const newPrice = String(price).replace(/[^0-9.]/g, '');
    const newTotalStock = Number(stock_quantity);
    const oldTotalStock = Number(product.stock_quantity);

    let updatedTiers = [...tiers];

    if (newTotalStock > oldTotalStock) {
      // Stock increased
      const addedQty = newTotalStock - oldTotalStock;
      const lastTier = updatedTiers[updatedTiers.length - 1];

      if (lastTier && String(lastTier.price) === newPrice) {
        // Same price as last tier, just add to it
        if (typeof lastTier.stock === 'object' && lastTier.stock !== null) {
          const keys = Object.keys(lastTier.stock);
          const key = keys.length > 0 ? keys[0] : 'Default';
          lastTier.stock[key] = (Number(lastTier.stock[key]) || 0) + addedQty;
        } else {
          lastTier.stock = (Number(lastTier.stock) || 0) + addedQty;
        }
      } else {
        // Different price, create NEW tier
        updatedTiers.push({ price: newPrice, stock: addedQty });
      }
    } else if (newTotalStock < oldTotalStock) {
      // Stock decreased (manually) - Deduct from LATEST tier (LIFO for manual corrections)
      let toRemove = oldTotalStock - newTotalStock;
      for (let i = updatedTiers.length - 1; i >= 0; i--) {
        if (toRemove <= 0) break;
        let tierStock = 0;
        if (typeof updatedTiers[i].stock === 'object') {
          const keys = Object.keys(updatedTiers[i].stock);
          for (let k of keys) {
            let s = Number(updatedTiers[i].stock[k]) || 0;
            let take = Math.min(toRemove, s);
            updatedTiers[i].stock[k] = s - take;
            toRemove -= take;
            if (toRemove <= 0) break;
          }
        } else {
          tierStock = Number(updatedTiers[i].stock) || 0;
          let take = Math.min(toRemove, tierStock);
          updatedTiers[i].stock = tierStock - take;
          toRemove -= take;
        }
      }
    }
    // If price changed but stock didn't increase, we don't automatically create a tier 
    // to avoid confusion with price corrections. 
    // The 'active' price for new customers will be determined by FIFO in productController.

    const parsedTiers = JSON.stringify(updatedTiers);
    // Keep stored product.price aligned with the first in-stock tier price so eka website updates automatically.
    const activeTierPrice = getActiveTierPrice(updatedTiers, newPrice);
    const finalPrice = "Rs " + Number(String(activeTierPrice).replace(/[^0-9.]/g, '')).toLocaleString();

    if (req.files && req.files.length > 0) {
      const image_url = `/uploads/${req.files[0].filename}`;
      const imagesArr = req.files.map(f => `/uploads/${f.filename}`);
      
      await pool.query(
        `UPDATE products SET name=?, brand=?, category=?, price=?, stock_quantity=?, color=?, strap_size=?, description=?, image_url=?, images=?, inventory_tiers=? WHERE id=?`,
        [name, brand, category, finalPrice, newTotalStock, color, strapSizeToSave, description, image_url, JSON.stringify(imagesArr), parsedTiers, id]
      );
      res.json({ message: 'Product updated successfully', image_url });
    } else {
      await pool.query(
        `UPDATE products SET name=?, brand=?, category=?, price=?, stock_quantity=?, color=?, strap_size=?, description=?, inventory_tiers=? WHERE id=?`,
        [name, brand, category, finalPrice, newTotalStock, color, strapSizeToSave, description, parsedTiers, id]
      );
      res.json({ message: 'Product updated successfully' });
    }

    checkStockNotification(name, newTotalStock);
  } catch (err) {
    console.error('Products update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// POST /api/admin/products/:id/add-stock
// Body: { price, quantity, strap_size } OR { price, stock_by_size: { "20mm": 5, "22mm": 10 } }
exports.addStockBatch = async (req, res) => {
  const { id } = req.params;
  const { price, quantity, strap_size, stock_by_size } = req.body || {};
  const rawPrice = String(price || '').replace(/[^0-9.]/g, '');
  if (!rawPrice) return res.status(400).json({ error: 'price is required' });

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = rows[0];

    let tiers = [];
    try {
      if (product.inventory_tiers) {
        tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
      }
    } catch (e) { tiers = []; }
    if (!Array.isArray(tiers)) tiers = [];

    const lastTier = tiers[tiers.length - 1];
    const canMergeToLast = lastTier && String(lastTier.price) === String(rawPrice);

    let addedTotal = 0;
    if (stock_by_size && typeof stock_by_size === 'object') {
      const entries = Object.entries(stock_by_size);
      if (entries.length === 0) return res.status(400).json({ error: 'stock_by_size is empty' });

      const targetTier = canMergeToLast ? lastTier : { price: rawPrice, stock: {} };
      for (const [size, qty] of entries) {
        const q = Number(qty) || 0;
        if (q <= 0) continue;
        addStockToTierStock(targetTier, q, String(size));
        addedTotal += q;
      }
      if (!canMergeToLast) tiers.push(targetTier);
    } else {
      const q = Number(quantity) || 0;
      if (q <= 0) return res.status(400).json({ error: 'quantity must be > 0 (or provide stock_by_size)' });

      const targetTier = canMergeToLast ? lastTier : { price: rawPrice, stock: 0 };
      addStockToTierStock(targetTier, q, strap_size);
      addedTotal += q;
      if (!canMergeToLast) tiers.push(targetTier);
    }

    if (addedTotal <= 0) return res.status(400).json({ error: 'No stock added' });

    const newTotalStock = (Number(product.stock_quantity) || 0) + addedTotal;
    const activeTierPrice = getActiveTierPrice(tiers, String(product.price).replace(/[^0-9.]/g, '') || rawPrice);
    const finalPrice = "Rs " + Number(String(activeTierPrice).replace(/[^0-9.]/g, '')).toLocaleString();

    await pool.query(
      'UPDATE products SET stock_quantity = ?, price = ?, inventory_tiers = ? WHERE id = ?',
      [newTotalStock, finalPrice, JSON.stringify(tiers), id]
    );

    checkStockNotification(product.name, newTotalStock);
    res.json({ success: true, message: 'Stock batch added', added: addedTotal });
  } catch (err) {
    console.error('Add stock batch error:', err);
    res.status(500).json({ error: 'Failed to add stock batch' });
  }
};

// PATCH /api/admin/products/:id/adjust-tier-stock
// Body: { tierIndex, strap_size, delta } (delta can be negative)
exports.adjustTierStock = async (req, res) => {
  const { id } = req.params;
  const { tierIndex, strap_size, delta } = req.body || {};
  const idx = Number(tierIndex);
  const change = Number(delta);
  const strapSize = strap_size ? String(strap_size) : '';

  if (!Number.isInteger(idx) || idx < 0) return res.status(400).json({ error: 'tierIndex must be a non-negative integer' });
  if (!Number.isFinite(change) || change === 0) return res.status(400).json({ error: 'delta must be a non-zero number' });
  if (!strapSize) return res.status(400).json({ error: 'strap_size is required' });

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = rows[0];

    const strapSizesArr = parseStrapSizes(product.strap_size);

    let tiers = [];
    try {
      if (product.inventory_tiers) {
        tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
      }
    } catch (e) { tiers = []; }

    if (!Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({ error: 'This product does not have tiered inventory to adjust' });
    }
    if (idx >= tiers.length) return res.status(400).json({ error: `tierIndex out of range (0..${tiers.length - 1})` });

    const tier = tiers[idx];
    normalizeTierStockAsObject(tier, strapSizesArr);

    const currentQty = Number(tier.stock?.[strapSize]) || 0;
    const nextQty = currentQty + change;
    if (nextQty < 0) return res.status(400).json({ error: 'Resulting stock cannot be negative' });
    tier.stock[strapSize] = nextQty;

    const newTotalStock = recomputeTotalStockFromTiers(tiers);
    await pool.query('UPDATE products SET stock_quantity = ?, inventory_tiers = ? WHERE id = ?', [newTotalStock, JSON.stringify(tiers), id]);

    res.json({ success: true, message: 'Tier stock adjusted', stock_quantity: newTotalStock });
  } catch (err) {
    console.error('Adjust tier stock error:', err);
    res.status(500).json({ error: 'Failed to adjust tier stock' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Products delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
