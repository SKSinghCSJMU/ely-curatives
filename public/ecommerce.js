// ELY Curatives E-Commerce Module

const ECOMMERCE_CONFIG = {
    apiUrl: 'http://localhost:3000/api',
    cart: [],
    settings: {}
};

// Load settings from backend
async function loadEcommerceSettings() {
    try {
        const response = await fetch(`${ECOMMERCE_CONFIG.apiUrl}/settings`);
        ECOMMERCE_CONFIG.settings = await response.json();
        
        if (ECOMMERCE_CONFIG.settings.ecommerce_enabled) {
            enableEcommerceFeatures();
        }
    } catch (error) {
        console.warn('Could not load e-commerce settings:', error);
    }
}

function enableEcommerceFeatures() {
    // Update all product cards to show buy buttons
    document.querySelectorAll('.product-item').forEach(card => {
        const inquireBtn = card.querySelector('a[href*="wa.me"]');
        if (inquireBtn) {
            inquireBtn.innerHTML = '🛒 Add to Cart';
            inquireBtn.classList.add('add-to-cart-btn');
            inquireBtn.href = '#';
            
            const productName = card.querySelector('h3').textContent;
            const productPrice = card.querySelector('.text-sm.font-bold.text-\\[\\#0D9488\\]').textContent;
            
            inquireBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addToCart({
                    name: productName,
                    price: parseFloat(productPrice.replace(/[^0-9.]/g, '')),
                    packaging: card.querySelector('.text-\\[10px\\].text-slate-400').textContent
                });
            });
        }
    });

    // Show cart button in header
    showCartButton();
    
    // Load cart from localStorage
    loadCart();
}

function addToCart(product) {
    const quantity = prompt(`How many of "${product.name}" would you like?`, '1');
    if (!quantity) return;

    const item = {
        id: Date.now(),
        ...product,
        quantity: parseInt(quantity)
    };

    ECOMMERCE_CONFIG.cart.push(item);
    saveCart();
    updateCartBadge();
    alert(`✓ Added ${quantity}x ${product.name} to cart`);
}

function showCartButton() {
    const nav = document.querySelector('nav');
    if (nav && !document.getElementById('cart-btn')) {
        const cartBtn = document.createElement('a');
        cartBtn.id = 'cart-btn';
        cartBtn.href = '#';
        cartBtn.className = 'text-slate-500 hover:text-[#0F2E3A] pb-1 transition-all flex items-center gap-2';
        cartBtn.innerHTML = '🛒 Cart <span id="cart-badge" class="bg-[#0D9488] text-white px-2 py-0.5 rounded-full text-xs font-bold">0</span>';
        cartBtn.onclick = (e) => {
            e.preventDefault();
            showCheckout();
        };
        nav.appendChild(cartBtn);
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = ECOMMERCE_CONFIG.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function saveCart() {
    localStorage.setItem('elyCart', JSON.stringify(ECOMMERCE_CONFIG.cart));
}

function loadCart() {
    const saved = localStorage.getItem('elyCart');
    if (saved) {
        ECOMMERCE_CONFIG.cart = JSON.parse(saved);
        updateCartBadge();
    }
}

function showCheckout() {
    if (ECOMMERCE_CONFIG.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    let cartHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0F2E3A; font-weight: bold; margin-bottom: 15px;">🛒 Your Cart</h2>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
    `;

    let total = 0;
    ECOMMERCE_CONFIG.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartHTML += `
            <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <div>
                    <p style="font-weight: bold; color: #0F2E3A;">${item.name}</p>
                    <p style="font-size: 12px; color: #94a3b8;">Qty: ${item.quantity} × ₹${item.price}</p>
                </div>
                <p style="font-weight: bold; color: #0D9488;">₹${itemTotal.toFixed(2)}</p>
            </div>
        `;
    });

    cartHTML += `
            </div>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F2E3A; font-size: 18px;">
                    <span>Total:</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
            </div>
            <form style="space: 15px 0;">
                <input type="text" placeholder="Full Name" id="checkout-name" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;" required>
                <input type="email" placeholder="Email" id="checkout-email" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;" required>
                <input type="tel" placeholder="Phone" id="checkout-phone" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;" required>
            </form>
        </div>
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px;
    `;

    modal.innerHTML = cartHTML + `
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button onclick="this.closest('div[style*=position]').remove()" style="background: #cbd5e1; color: #0F2E3A; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; border: none;">Cancel</button>
            <button onclick="proceedToPayment()" style="background: #0D9488; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; border: none;">💳 Proceed to Payment</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('form').style.display = 'flex';
    modal.querySelector('form').style.flexDirection = 'column';
}

async function proceedToPayment() {
    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    const phone = document.getElementById('checkout-phone').value;

    if (!name || !email || !phone) {
        alert('Please fill in all fields');
        return;
    }

    const total = ECOMMERCE_CONFIG.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        // Create order in backend
        const response = await fetch(`${ECOMMERCE_CONFIG.apiUrl}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                product_list: ECOMMERCE_CONFIG.cart,
                total_amount: total
            })
        });

        const orderData = await response.json();

        if (response.ok) {
            // Close modal
            document.querySelector('div[style*="position: fixed"]').remove();

            // Check which payment gateway is configured
            if (ECOMMERCE_CONFIG.settings.payment_gateway === 'razorpay') {
                initiateRazorpayPayment(orderData.orderId, total, name, email, phone);
            } else if (ECOMMERCE_CONFIG.settings.payment_gateway === 'stripe') {
                initiateStripePayment(orderData.orderId, total);
            } else {
                alert('✓ Order created! Payment gateway not configured yet. Admin will contact you soon.');
                ECOMMERCE_CONFIG.cart = [];
                saveCart();
                updateCartBadge();
            }
        }
    } catch (error) {
        alert('Error creating order: ' + error.message);
    }
}

function initiateRazorpayPayment(orderId, amount, name, email, phone) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
        const options = {
            key: ECOMMERCE_CONFIG.settings.razorpay_key_id,
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            name: 'ELY Curatives',
            description: `Order #${orderId.substring(0, 8)}`,
            customer_id: name,
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            handler: function(response) {
                alert(`✓ Payment successful! Transaction ID: ${response.razorpay_payment_id}`);
                updateOrderPayment(orderId, response.razorpay_payment_id, 'razorpay');
            },
            modal: {
                ondismiss: function() {
                    alert('Payment cancelled');
                }
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    };
    document.body.appendChild(script);
}

function initiateStripePayment(orderId, amount) {
    // Stripe integration would go here
    alert('Stripe payment processing...');
}

async function updateOrderPayment(orderId, paymentId, gateway) {
    await fetch(`${ECOMMERCE_CONFIG.apiUrl}/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', payment_gateway: gateway, payment_id: paymentId })
    });

    ECOMMERCE_CONFIG.cart = [];
    saveCart();
    updateCartBadge();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadEcommerceSettings);
