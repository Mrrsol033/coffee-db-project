const express = require('express');
const app = express();

const path = require("path");
const productRouter = require('./routes/product.router.js');
const upload = require('./config/multer');
const productController = require("./controllers/product.controller");
const authRoutes = require('./routes/auth.routes');
const authController = require("./controllers/auth.controller");


// Middleware to parse JSON
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.post('/products', upload.single('image'), productController.createProduct);
app.use('/api/product', productRouter);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
