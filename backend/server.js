const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ely-curatives-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'ely_curatives.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database error:', err);
  else console.log('SQLite database connected.');
});

// Create tables on startup
db.serialize(() => {
  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Initialize default admin user on startup
  db.run(`SELECT COUNT(*) as count FROM admins`, async (err, row) => {
    if (row && row.count === 0) {
      try {
        const hashedPassword = await bcryptjs.hash('ElyAdmin', 10);
        db.run(`INSERT INTO admins (id, username, password, name) VALUES (?, ?, ?, ?)`, 
          [uuidv4(), 'Reena', hashedPassword, 'Reena Gupta'],
          (err) => {
            if (err) console.error('Error creating default admin:', err);
            else console.log('✓ Default admin created: username=Reena, password=ElyAdmin');
          }
        );
      } catch (e) {
        console.error('Error hashing password:', e);
      }
    }
  });


  // Settings table (for theme, ecommerce toggle, payment gateway config)
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY,
    ecommerce_enabled INTEGER DEFAULT 0,
    primary_color TEXT DEFAULT '#0F2E3A',
    secondary_color TEXT DEFAULT '#0D9488',
    animation_speed TEXT DEFAULT 'normal',
    payment_gateway TEXT,
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT,
    stripe_public_key TEXT,
    stripe_secret_key TEXT,
    google_sheets_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_list TEXT NOT NULL,
    total_amount REAL NOT NULL,
    order_status TEXT DEFAULT 'pending',
    payment_gateway TEXT,
    payment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Initialize default settings
  db.run(`SELECT COUNT(*) as count FROM site_settings`, (err, row) => {
    if (row && row.count === 0) {
      const { v4: uuidv4 } = require('uuid');
      db.run(`INSERT INTO site_settings (id, ecommerce_enabled) VALUES (?, ?)`, 
        [uuidv4(), 0],
        (err) => {
          if (err) console.error('Error initializing settings:', err);
          else console.log('Default settings initialized.');
        }
      );
    }
  });
});

// ========== AUTH ROUTES ==========

// Admin Login (using username)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(`SELECT * FROM admins WHERE username = ?`, [username], async (err, admin) => {
    if (err || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcryptjs.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({ token, adminName: admin.name, username: admin.username });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== SETTINGS ROUTES ==========

// Get Site Settings
app.get('/api/settings', (req, res) => {
  db.get(`SELECT * FROM site_settings LIMIT 1`, (err, settings) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(settings || {});
  });
});

// Update Site Settings (Admin only)
app.post('/api/admin/settings', verifyToken, (req, res) => {
  const {
    ecommerce_enabled,
    primary_color,
    secondary_color,
    animation_speed,
    payment_gateway,
    razorpay_key_id,
    razorpay_key_secret,
    stripe_public_key,
    stripe_secret_key,
    google_sheets_url
  } = req.body;

  db.run(
    `UPDATE site_settings SET 
      ecommerce_enabled = COALESCE(?, ecommerce_enabled),
      primary_color = COALESCE(?, primary_color),
      secondary_color = COALESCE(?, secondary_color),
      animation_speed = COALESCE(?, animation_speed),
      payment_gateway = COALESCE(?, payment_gateway),
      razorpay_key_id = COALESCE(?, razorpay_key_id),
      razorpay_key_secret = COALESCE(?, razorpay_key_secret),
      stripe_public_key = COALESCE(?, stripe_public_key),
      stripe_secret_key = COALESCE(?, stripe_secret_key),
      google_sheets_url = COALESCE(?, google_sheets_url),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM site_settings LIMIT 1)`,
    [
      ecommerce_enabled !== undefined ? ecommerce_enabled : null,
      primary_color,
      secondary_color,
      animation_speed,
      payment_gateway,
      razorpay_key_id,
      razorpay_key_secret,
      stripe_public_key,
      stripe_secret_key,
      google_sheets_url
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Settings updated successfully' });
    }
  );
});

// ========== ORDERS ROUTES ==========

// Get all orders
app.get('/api/orders', verifyToken, (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders || []);
  });
});

// Create new order (from shop frontend)
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, product_list, total_amount } = req.body;

  if (!customer_name || !customer_email || !product_list || !total_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { v4: uuidv4 } = require('uuid');
  const orderId = uuidv4();

  db.run(
    `INSERT INTO orders (id, customer_name, customer_email, customer_phone, product_list, total_amount)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderId, customer_name, customer_email, customer_phone, JSON.stringify(product_list), total_amount],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ orderId, message: 'Order created successfully' });
    }
  );
});

// Update order status (Admin only)
app.post('/api/admin/orders/:orderId/status', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  db.run(`UPDATE orders SET order_status = ? WHERE id = ?`, [status, orderId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order status updated' });
  });
});

// Get orders from Google Sheets (if configured)
app.get('/api/google-sheets/orders', async (req, res) => {
  db.get(`SELECT google_sheets_url FROM site_settings LIMIT 1`, async (err, settings) => {
    if (err || !settings?.google_sheets_url) {
      return res.status(400).json({ error: 'Google Sheets not configured' });
    }

    try {
      const axios = require('axios');
      const sheetUrl = settings.google_sheets_url.replace(/edit.*/, 'export?format=csv');
      const response = await axios.get(sheetUrl);
      
      // Parse CSV and return as JSON
      const lines = response.data.split('\n');
      const headers = lines[0].split(',');
      const orders = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
          obj[header.trim()] = values[i];
        });
        return obj;
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ ELY Curatives Backend running on http://localhost:${PORT}`);
  console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`✓ API docs: http://localhost:${PORT}/api/health`);
});
