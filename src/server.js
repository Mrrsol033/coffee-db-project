const express = require('express');
const app = express();
const productRouter = require('./routes/product.router.js');
const upload = require("./config/multer");
const path = require("path");


// Middleware to parse JSON
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});
app.use('api/product', productRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
