const pool = require('../config/db');

const generateProductCode = () => {
  return 'CHRN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

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
        price: `Rs.${Number(String(p.price).replace(/[^0-9.]/g, '') || 0).toLocaleString()}`
      })),
      stats: statsResult[0]
    });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, brand, category, price, stock_quantity, color, strap_size, description } = req.body;
  const product_code = generateProductCode();
  console.log(`[Admin API] Generated Auto Product Code: ${product_code} for ${name}`);
  
  let image_url = '';
  let imagesArr = [];
  
  if (req.files && req.files.length > 0) {
    image_url = `/uploads/${req.files[0].filename}`;
    imagesArr = req.files.map(f => `/uploads/${f.filename}`);
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, product_code, brand, category, price, stock_quantity, color, strap_size, description, image_url, images) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, product_code, brand, category, price, stock_quantity, color, strap_size, description, image_url, JSON.stringify(imagesArr)]
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
  const { name, brand, category, price, stock_quantity, color, strap_size, description } = req.body;
  
  try {
    if (req.files && req.files.length > 0) {
      const image_url = `/uploads/${req.files[0].filename}`;
      const imagesArr = req.files.map(f => `/uploads/${f.filename}`);
      
      await pool.query(
        `UPDATE products SET name=?, brand=?, category=?, price=?, stock_quantity=?, color=?, strap_size=?, description=?, image_url=?, images=? WHERE id=?`,
        [name, brand, category, price, stock_quantity, color, strap_size, description, image_url, JSON.stringify(imagesArr), id]
      );
      res.json({ message: 'Product updated successfully', image_url });
    } else {
      await pool.query(
        `UPDATE products SET name=?, brand=?, category=?, price=?, stock_quantity=?, color=?, strap_size=?, description=? WHERE id=?`,
        [name, brand, category, price, stock_quantity, color, strap_size, description, id]
      );
      res.json({ message: 'Product updated successfully' });
    }

    // Trigger Notification if low stock
    checkStockNotification(name, stock_quantity);
  } catch (err) {
    console.error('Products update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
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
