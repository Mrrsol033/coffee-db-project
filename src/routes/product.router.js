const express = require('express');
const router = express.Router();
const productController = require("../controllers/product.controller.js");
const upload = require("../config/multer.js");
const token = require ("../middleware/auth.middleware.js");
// Create product route
router.post('/', upload.single('image'), productController.createProduct);

// To get All Products
router.get(`/`,token, productController.getAllProducts);

// To get one product by id
router.get(`/:id`, productController.getProductById);

// To update product
router.put(`/:id`, upload.single('image'), productController.updateProduct);

// To delete product
router.delete(`/:id`, productController.deleteProduct);


module.exports = router;
