const express = require('express');
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../config/multer");

// Create product route
router.post('/', upload.single('image'), productController.createProduct);

// To get All Products
router.get(`/`, productController.getAllProducts);

// To get one product by id
router.get(`/:id`, productController.getProductById);

// To update product
router.put(`/:id`, upload.single('image'), productController.updateProduct);

// To delete product
router.delete(`/:id`, productController.deleteProduct);


module.exports = router;
