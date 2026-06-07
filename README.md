# 🏥 ELY Curatives - Admin + E-Commerce Backend Setup

## Overview
Complete admin dashboard and e-commerce system for ELY Curatives with:
- **Admin Login** - Secure authentication
- **Product Management** - Via Google Sheets integration
- **E-Commerce Toggle** - Enable/disable buying features
- **Payment Gateway** - Razorpay (India) or Stripe (Global)
- **Order Tracking** - View and manage all orders
- **Theme Customization** - Colors, animations, branding
- **Cart & Checkout** - Full shopping experience

---

## 📋 Prerequisites

- **Node.js** (v14 or higher) [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Razorpay** account (recommended for India) [Sign up](https://razorpay.com)
- **Google Sheets** account (for product data)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Backend Server

```bash
npm start
```

✓ Server will run on: `http://localhost:3000`  
✓ Admin dashboard: `http://localhost:3000/admin`

### Step 3: Create Admin Account

1. Open `http://localhost:3000/admin` in browser
2. Scroll down to "First Time? Register Admin"
3. Fill in:
   - Admin Name: `Your Name`
   - Email: `admin@elycuratives.com`
   - Password: `Your Secure Password`
4. Click "Create Admin Account"

### Step 4: Login to Admin Dashboard

1. Use the email and password you just created
2. Click "Login"

✓ You're now in the admin dashboard!

---

## 📱 Admin Dashboard Features

### 1️⃣ **Dashboard Tab**
- View e-commerce status
- See total orders count
- Check active payment gateway
- Quick action buttons

### 2️⃣ **E-Commerce Tab**
- **Enable E-Commerce Mode** - Toggle buying features
- **Google Sheets URL** - Paste your product list sheet
- **Cart Settings** - Configure cart behavior
- **Test Connection** - Verify Google Sheets link

### 3️⃣ **Settings Tab**
- View company information
- Contact details display

### 4️⃣ **Orders Tab**
- View all customer orders
- See order status (Pending/Completed)
- Customer details
- Order amounts

### 5️⃣ **Payment Gateway Tab**

#### 🇮🇳 **Razorpay Setup** (Recommended for India)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Copy your **API Key ID** and **API Secret Key**
3. Paste them in the admin dashboard:
   - API Key ID: `rzp_live_xxxxx`
   - API Secret Key: `••••••••••••`
4. Click "Activate Razorpay"
5. ✓ Razorpay is now active!

#### 💳 **Stripe Setup** (Global payment option)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy **Publishable Key** and **Secret Key**
3. Paste them in admin dashboard
4. Click "Activate Stripe"

### 6️⃣ **Theme & Animation Tab**
- Change primary color (Navy)
- Change secondary color (Teal)
- Adjust animation speed (Slow/Normal/Fast)
- Select animation style (Smooth/Bouncy/Minimal)
- Click "Save Theme Settings"

---

## 📊 Google Sheets Integration

### Create Your Product List Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Add columns:
   ```
   Product Name | Category | Price | Packaging | Image URL
   ```
4. Example data:
   ```
   Ronoxy-LB Tablets | tablets | 149 | 10x10 Alu-Alu Strip | https://...
   Dydroel-10 Tablets | gynaecology | 250 | 1x10 Blister | https://...
   ```
5. Share the sheet (get public link):
   - Click "Share"
   - Change to "Anyone with the link"
   - Publish sheet: File → Publish to web

6. In admin dashboard:
   - Go to **E-Commerce Tab**
   - Paste the Google Sheets URL
   - Click "Test Connection"
   - ✓ Products will sync automatically!

---

## 🛒 Customer Shopping Experience

### When E-Commerce is Enabled:

1. Customer visits `/shop.html`
2. Sees "Add to Cart" buttons instead of "Inquire on WhatsApp"
3. Clicks "Add to Cart"
4. Enters quantity and confirms
5. Clicks "🛒 Cart" button in header
6. Sees cart summary
7. Enters name, email, phone
8. Clicks "💳 Proceed to Payment"
9. Razorpay/Stripe payment opens
10. After payment → Order confirmation

---

## 💾 Database

### SQLite Database Location
```
backend/ely_curatives.db
```

### Tables Created Automatically:
- `admins` - Admin users
- `site_settings` - Theme, payment, e-commerce config
- `orders` - Customer orders

No SQL knowledge needed! Everything is managed through admin dashboard.

---

## 📞 WhatsApp vs E-Commerce

### Default Mode (WhatsApp)
- Products show "Inquire on WhatsApp" button
- B2B focused
- Orders via WhatsApp

### E-Commerce Mode
- Products show "Add to Cart" button
- Customers can buy directly
- Orders stored in database
- Payment processing enabled

**Switch between modes in admin dashboard → E-Commerce tab**

---

## 🔐 Security Tips

1. **Strong Admin Password** - Use 12+ characters
2. **Secure Payment Keys** - Never share API keys
3. **HTTPS in Production** - Use SSL certificate
4. **Environment Variables** - Keep `.env` file safe
5. **Backup Database** - Regular backups of SQLite DB

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
```bash
# Check if server is running
npm start
```

### "Payment gateway not configured"
1. Go to admin dashboard → Payment Gateway
2. Enter Razorpay or Stripe keys
3. Click "Activate"

### "Google Sheets not connecting"
1. Verify sheet is **publicly shared**
2. Check URL is correct
3. Try "Test Connection" button
4. Make sure sheet has proper column headers

### Database issues
```bash
# Delete and rebuild database
rm backend/ely_curatives.db
npm start
```

---

## 📚 API Endpoints (for developers)

### Public Routes
```
GET  /api/settings              → Get site settings
GET  /api/health                → Health check
POST /api/orders                → Create order
```

### Admin Routes (requires JWT token)
```
POST   /api/admin/register      → Register admin
POST   /api/admin/login         → Login admin
POST   /api/admin/settings      → Update settings
GET    /api/orders              → Get all orders
POST   /api/admin/orders/:id/status → Update order status
GET    /api/google-sheets/orders    → Fetch from Google Sheets
```

---

## 🚀 Deploy to Production

### Option 1: Heroku (Free tier available)
```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Option 2: Render.com
1. Connect GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`

### Option 3: AWS/GCP
Use Node.js app hosting with environment variables

---

## 📖 File Structure

```
Ely Curatives/
├── backend/
│   ├── server.js              ← Main Express server
│   ├── package.json           ← Dependencies
│   ├── .env                   ← Configuration
│   └── ely_curatives.db       ← SQLite database
├── admin/
│   └── dashboard.html         ← Admin control panel
├── public/
│   └── ecommerce.js          ← Shopping cart logic
├── shop.html                  ← Updated shop page
├── index.html                 ← Home page
└── README.md                  ← This file
```

---

## ✨ Next Steps

1. ✅ Create admin account
2. ✅ Setup payment gateway (Razorpay)
3. ✅ Create Google Sheets product list
4. ✅ Enable E-Commerce mode
5. ✅ Customize theme colors
6. ✅ Test with sample purchase
7. 🚀 Deploy to production

---

## 📧 Support

For issues or questions:
- Email: elycurattivespvtltd3@gmail.com
- WhatsApp: +91 96431 67886
- Dashboard Admin: http://localhost:3000/admin

---

**Version:** 1.0.0  
**Last Updated:** June 2, 2026  
**ELY Curatives Private Limited**
