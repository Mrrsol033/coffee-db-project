const pool = require("../config/db");
const { BASE_URL } = require("../config/config.js");

exports.createProduct = async (req, res) => {
    const { name, description, basePrice, isActive } = req.body;

    const imageUrl = req.file
        ? `${BASE_URL}/uploads/${req.file.filename}`
        : null;

    if (!name || !basePrice) {
        return res.status(400).send({
            status: 'error',
            message: "Name and price are required"
        });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO products (name, description, base_price, image_url, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                basePrice || null,
                imageUrl || null,
                isActive === undefined ? 1 : isActive
            ]
        );

        const [rows] = await pool.query(
            `SELECT * FROM products WHERE id = ?`,
            [result.insertId]
        );

        res.status(200).send({
            status: 'success',
            message: "Product created successfully!",
            result: rows,
        });

    } catch (error) {
        console.error('❌ DB Error:', error.message);
        res.status(500).send({ status: 'error', message: error.message });
    }
};

// To Get All Products
exports.getAllProducts = async (req, res) => {
    try {

        // Set page or pagination in products
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        // To filter Product
        let {name, minPrice, maxPrice, isActive} = req.query;

        let query = `SELECT * FROM products WHERE 1 = 1 `;
        let params = [];

        // filter about name
        if(name){
            query += `AND name like ?`;
            params.push(`%${name}%`);
        }
        // filter about minPrice the lowest price
        if(minPrice){
            query += `AND base_price >= ?`;
            params.push(minPrice);
        }
        // filter about maxPrice the highest price
        if(maxPrice){
            query += `AND base_price <= ?`;
            params.push(maxPrice);
        }
        // filter about isActive
        if(isActive){
            query += `AND is_active = ?`;
            params.push(isActive);
        }

        query += `LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        // Get total count (without LIMIT/OFFSET)
        const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM products`);
        const total = countRows[0]?.total || 0;

        res.status(200).send({
            status: 'success',
            page: page,
            limit: limit,
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('❌ DB Error:', error.message);
        res.status(500).send({status: 'error', message: error.message});
    }
}

// To Find or get product by ID
exports.getProductById = async (req, res) => {
    const {id} = req.params;

    try {
        const [rows] = await pool.query(`SELECT *
                                         FROM products
                                         WHERE id = ?`, [id]);
        if (!rows.length) {
            res.status(404).send({status: 'error', message: 'Product not found'});
        }
        res.status(200).send({status: 'success', data: rows});
    } catch (error) {
        res.status(500).send({status: 'error', message: error.message});
    }

}

// To Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, basePrice, isActive } = req.body;
        const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;
        const [result] = await pool.query(
            `UPDATE products
             SET name        = COALESCE(?, name),
                 description = COALESCE(?, description),
                 base_price  = COALESCE(?, base_price),
                 image_url   = COALESCE(?, image_url),
                 is_active   = COALESCE(?, is_active)
             WHERE id = ?`,
            [name, description, basePrice, imageUrl, isActive, id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        const [rows] = await pool.query(`SELECT *
                                         FROM products
                                         WHERE id = ?`, [id]);
        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully!',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Database error',
            error: error.message
        });
    }
};

//  To delete Product
exports.deleteProduct = async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);

        if(result.length === 0) {
            res.status(404).send({status: 'error', message: 'Product not found'});
        }

        res.status(200).json({status: 'success', message: 'Product deleted successfully!'});
    } catch (error) {
        console.error(error);
        res.status(500).send({status: 'error', message: error.message});
    }

}
