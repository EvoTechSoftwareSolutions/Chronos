import db from "../config/db.js";
import { mapHexToColorName } from "../utils/helpers.js";

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

      const enhancedProducts = products.map((p) => {
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

    const enhanced = results.map((p) => ({
      ...p,
      feedback_rate: Number(p.feedback_rate).toFixed(1),
      feedback_count: Number(p.feedback_count),
    }));

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

    const p = result[0];
    res.json({
      ...p,
      feedback_rate: Number(p.feedback_rate).toFixed(1),
      feedback_count: Number(p.feedback_count),
    });
  });
}
