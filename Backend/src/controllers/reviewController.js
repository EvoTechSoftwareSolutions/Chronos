import db from "../config/db.js";
import { mapHexToColorName } from "../utils/helpers.js";

// POST /api/reviews
export function createReview(req, res) {
  const { product_id, order_id, rating, comment, customer_name } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      message: "Missing product_id. Reviews can only be submitted for items purchased with the new checkout system.",
    });
  }

  const sql = "INSERT INTO reviews (product_id, order_id, rating, comment, customer_name) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [product_id, order_id, rating, comment, customer_name], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
}

// GET /api/reviews/:product_id
export function getReviewsByProduct(req, res) {
  const { product_id } = req.params;
  db.query("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", [product_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
}

// GET /api/reviews-featured
export function getFeaturedReviews(req, res) {
  const sql = `
    SELECT r.*, p.name as product_name, p.color as product_color
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    WHERE r.rating = 5
    ORDER BY r.created_at DESC
    LIMIT 3
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const mapped = results.map((r) => ({
      ...r,
      product_color: mapHexToColorName(r.product_color),
    }));

    res.json(mapped);
  });
}
