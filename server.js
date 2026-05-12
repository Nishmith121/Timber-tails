require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;
const SECRET_KEY = process.env.SECRET_KEY || 'timber_tales_super_secret_key'; // In production, move to .env

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/ecomerce',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the PostgreSQL database', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            "fullName" VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255)
        )`);
        pool.query(`CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            "userId" INTEGER,
            "shippingAddress" TEXT,
            "paymentMethod" VARCHAR(50),
            items TEXT,
            "totalAmount" REAL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        pool.query(`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            category VARCHAR(100),
            name VARCHAR(255),
            price REAL,
            "imageUrl" TEXT
        )`).then(() => {
            pool.query("SELECT COUNT(*) AS count FROM products").then(res => {
                if (res.rows[0].count == 0) {
                    const text = 'INSERT INTO products (category, name, price, "imageUrl") VALUES ($1, $2, $3, $4)';
                    pool.query(text, ["BEDROOM", "Luxe Velvet Bed Frame", 4850, "images/product_bed.png"]);
                    pool.query(text, ["SOFA", "Heritage Leather Sofa", 7200, "images/product_sofa.png"]);
                    pool.query(text, ["DINING ROOM", "Artisan Dining Table", 5600, "images/hero2.png"]);
                    pool.query(text, ["CHAIR", "Monarch Accent Chair", 2400, "images/hero1.png"]);
                    pool.query(text, ["OFFICE", "Executive Writing Desk", 3800, "images/hero3.png"]);
                    pool.query(text, ["LIVING ROOM", "Grand Bookshelf", 4200, "images/hero4.png"]);
                }
            });
        }).catch(err => console.error('Error creating products table', err));
    }
});

// Signup Endpoint
app.post('/api/auth/signup', (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Valid full name, email, and password (min 6 chars) are required.' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Server error' });

        const sql = 'INSERT INTO users ("fullName", email, password) VALUES ($1, $2, $3)';
        pool.query(sql, [fullName, email, hash], (err) => {
            if (err) {
                if (err.code === '23505') {
                    return res.status(400).json({ error: 'Email already exists.' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User created successfully.' });
        });
    });
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (email === 'admin@gmail.com' && password === 'admin@123') {
        const token = jwt.sign({ id: 0, email: 'admin@gmail.com', role: 'admin' }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token, role: 'admin', user: { id: 0, fullName: 'Super Admin', email: 'admin@gmail.com', role: 'admin' } });
    }

    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '2h' });
            res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
        });
    });
});

// Order Endpoint
app.post('/api/orders', (req, res) => {
    const { userId, shippingAddress, paymentMethod, items, totalAmount } = req.body;

    if (!items || !totalAmount) {
        return res.status(400).json({ error: 'Items and totalAmount are required.' });
    }

    const sql = 'INSERT INTO orders ("userId", "shippingAddress", "paymentMethod", items, "totalAmount") VALUES ($1, $2, $3, $4, $5) RETURNING id';
    pool.query(sql, [userId || null, JSON.stringify(shippingAddress || {}), paymentMethod || 'Unknown', JSON.stringify(items), totalAmount], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Order created successfully.', orderId: result.rows[0].id });
    });
});

// Get Orders Endpoint
app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    pool.query('SELECT * FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(result.rows);
    });
});

// Get Single Order Endpoint
app.get('/api/order/:id', (req, res) => {
    const orderId = req.params.id;
    pool.query('SELECT * FROM orders WHERE id = $1', [orderId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    });
});

// Start Server - Products Endpoints
app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM products', [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(result.rows);
    });
});

app.post('/api/products', (req, res) => {
    let { category, name, price, imageUrl } = req.body;
    
    if (imageUrl && imageUrl.startsWith('data:image/')) {
        const matches = imageUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `images/prod_${Date.now()}.${ext}`;
            try {
                if (!fs.existsSync(path.join(__dirname, 'public', 'images'))) {
                    fs.mkdirSync(path.join(__dirname, 'public', 'images'), { recursive: true });
                }
                fs.writeFileSync(path.join(__dirname, 'public', filename), buffer);
                imageUrl = filename;
            } catch (fileErr) {
                console.error("File save error", fileErr);
            }
        }
    }

    pool.query('INSERT INTO products (category, name, price, "imageUrl") VALUES ($1, $2, $3, $4) RETURNING id', [category, name, price, imageUrl], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: result.rows[0].id, category, name, price, imageUrl });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { category, name, price, imageUrl } = req.body;
    pool.query('UPDATE products SET category=$1, name=$2, price=$3, "imageUrl"=$4 WHERE id=$5', [category, name, price, imageUrl, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.delete('/api/products/:id', (req, res) => {
    pool.query('DELETE FROM products WHERE id=$1', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.get('/api/admin/orders', (req, res) => {
    pool.query('SELECT * FROM orders ORDER BY "createdAt" DESC', [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(result.rows);
    });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

