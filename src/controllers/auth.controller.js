
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || null, role || 'staff', hashedPassword]
        );

        res.json({ status: 'success', message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(password);
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid email or password.' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ status: 'error', message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ status: 'success', message: 'Login successful.', token });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};