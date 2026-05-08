import db from "../config/db.js";
import { mapHexToColorName } from "../utils/helpers.js";

const parseStrapSizes = (raw) => {
  if (!raw) return [];
  const s = String(raw).trim();
  if (!s) return [];
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String).map((v) => v.trim()).filter(Boolean);
    } catch (e) {}
  }
  return s.split(",").map((v) => v.trim()).filter(Boolean);
};

const sumStockValue = (stock) => {
  if (stock === null || stock === undefined) return 0;
  if (typeof stock === "object") {
    return Object.values(stock).reduce((s, v) => s + (Number(v) || 0), 0);
  }
  return Number(stock) || 0;
};

// For each strap size, expose ONLY the currently sellable stock:
// consume from the earliest (oldest) tier that still has stock for that size.
const buildVariantInfo = (product, tiers) => {
  const sizes = parseStrapSizes(product.strap_size);
  if (sizes.length === 0) return null;

  const variants = sizes.map((size) => {
    let stock = 0;
    let price = String(product.price || "").replace(/[^0-9.]/g, "") || "0";
    let activeTierIndex = null;

    if (Array.isArray(tiers) && tiers.length > 0) {
      for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i];
        if (typeof t?.stock === "object" && t.stock !== null) {
          const qty = Number(t.stock[size]) || 0;
          if (qty > 0) {
            stock = qty;
            price = String(t.price ?? price);
            activeTierIndex = i;
            break;
          }
        }
      }

      if (activeTierIndex === null && tiers.length > 0) {
        // All empty for this size -> keep a stable price (last tier), stock remains 0
        price = String(tiers[tiers.length - 1]?.price ?? price);
      }
    }

    return {
      size,
      stock,
      soldOut: stock <= 0,
      price,
      tier_index: activeTierIndex,
    };
  });

  const stock_by_size = {};
  const price_by_size = {};
  variants.forEach((v) => {
    stock_by_size[v.size] = v.stock;
    price_by_size[v.size] = v.price;
  });

  return { variants, stock_by_size, price_by_size };
};

const processInventoryTiers = (product) => {
  if (product.inventory_tiers) {
    try {
      const tiers = typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers;
      if (Array.isArray(tiers) && tiers.length > 0) {
        let totalStock = 0;
        let activePrice = product.price;
        let priceSet = false;

        tiers.forEach(tier => {
          // Tier structure: { price: "45000", stock: { "20mm": 5, "22mm": 10 } } OR { price: "45000", stock: 15 }
          const tierStock = sumStockValue(tier.stock);

          totalStock += tierStock;

          if (!priceSet && tierStock > 0) {
            activePrice = tier.price;
            priceSet = true;
          }
        });

        // If all tiers are empty, just use the last tier's price or original price
        if (!priceSet && tiers.length > 0) {
          activePrice = tiers[tiers.length - 1].price;
        }

        const variantInfo = buildVariantInfo(product, tiers);
        return {
          ...product,
          price: activePrice,
          stock_quantity: totalStock,
          ...(variantInfo ? variantInfo : {}),
        };
      }
    } catch (e) {
      console.error("Error parsing inventory_tiers", e);
    }
  }
  // No tiers: still expose variants if strap sizes exist (stock unknown -> derive from total stock)
  const sizes = parseStrapSizes(product.strap_size);
  if (sizes.length > 0) {
    const perSize = Math.floor((Number(product.stock_quantity) || 0) / sizes.length);
    const variants = sizes.map((size, idx) => {
      const stock = idx === 0 ? (Number(product.stock_quantity) || 0) - perSize * (sizes.length - 1) : perSize;
      const price = String(product.price || "").replace(/[^0-9.]/g, "") || "0";
      return { size, stock, soldOut: stock <= 0, price };
    });
    const stock_by_size = {};
    const price_by_size = {};
    variants.forEach((v) => {
      stock_by_size[v.size] = v.stock;
      price_by_size[v.size] = v.price;
    });
    return { ...product, variants, stock_by_size, price_by_size };
  }
  return product;
};

// GET /api/products
export function getAllProducts(req, res) {
  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    // Fetch Orders to calculate Best Sellers
    db.query("SELECT items FROM orders WHERE order_status != 'Canceled' OR order_status IS NULL", (err, orderRows) => {
      const salesCount = {};
      if (!err) {
        orderRows.forEach((row) => {
          try {
            const items = JSON.parse(row.items);
            if (Array.isArray(items)) {
              items.forEach((item) => {
                const id = item.id;
                if (id) {
                  salesCount[id] = (salesCount[id] || 0) + (Number(item.quantity) || 1);
                }
              });
            }
          } catch (e) {}
        });
      }

      // Process Products
      const topSellerIds = Object.entries(salesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => Number(id));

      const newArrivalIds = products.slice(0, 8).map((p) => Number(p.id));

      const enhancedProducts = products.map((rawProduct) => {
        const p = processInventoryTiers(rawProduct);
        const pId = Number(p.id);
        return {
          ...p,
          isBestSeller: topSellerIds.includes(pId),
          isNew: newArrivalIds.includes(pId),
          color: mapHexToColorName(p.color),
          priceVal: parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
          feedback_rate: Number(p.feedback_rate).toFixed(1),
          feedback_count: Number(p.feedback_count),
        };
      });

      res.json(enhancedProducts);
    });
  });
}

// GET /api/products/search
export function searchProducts(req, res) {
  const query = req.query.q;
  if (!query) return res.json([]);

  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.name LIKE ? OR p.brand LIKE ? OR p.category LIKE ?
    GROUP BY p.id
  `;
  const searchTerm = `%${query}%`;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const enhanced = results.map((rawProduct) => {
      const p = processInventoryTiers(rawProduct);
      return {
        ...p,
        feedback_rate: Number(p.feedback_rate).toFixed(1),
        feedback_count: Number(p.feedback_count),
      };
    });

    res.json(enhanced);
  });
}

// GET /api/products/:id
export function getProductById(req, res) {
  const { id } = req.params;
  const sql = `
    SELECT p.*, 
           COUNT(r.id) as feedback_count, 
           COALESCE(AVG(r.rating), 0) as feedback_rate
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });

    const p = processInventoryTiers(result[0]);
    res.json({
      ...p,
      feedback_rate: Number(p.feedback_rate).toFixed(1),
      feedback_count: Number(p.feedback_count),
    });
  });
}
