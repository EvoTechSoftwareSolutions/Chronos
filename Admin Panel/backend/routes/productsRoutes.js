const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productsController = require('../controllers/productsController');
const { validateProduct } = require('../middleware/validate');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.get('/', productsController.getProducts);
router.post('/', upload.array('images', 5), validateProduct, productsController.addProduct);
router.put('/:id', upload.array('images', 5), validateProduct, productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
