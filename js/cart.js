// Cart management
import { products } from './products.js';
import { showToast } from './app.js';

let cart = [];
const CART_STORAGE_KEY = 'pachisCart';
const VERIFICATION_DATA_KEY = 'pachisVerificationData';

export function loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }
}

export function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

export function addToCart(productID, quantity = 1, size = null) {
    if (quantity <= 0) return;

    const product = products.find(p => p.id === productID);
    if (!product) return;

    const cartItemId = size ? `${productID}_${size}` : productID;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            cartItemId: cartItemId,
            id: productID,
            name: product.name,
            type: product.type,
            category: product.category,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }

    saveCart();

    const sizeText = size ? ` (${size})` : '';
    showToast(`Added ${product.name}${sizeText} to cart!`);

    const qtyDisplay = document.querySelector(`[data-product-id="${productID}"]`);
    if (qtyDisplay) qtyDisplay.textContent = '1';
}

export function updateCartItemQuantity(productID, change) {
    const item = cart.find(i => i.id === productID);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productID);
    } else {
        saveCart();
        renderCart();
    }
}

export function removeFromCart(productID) {
    cart = cart.filter(item => item.id !== productID);
    saveCart();
    renderCart();
    showToast('Item removed from cart');
}

export function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        renderCart();
        showToast('Cart cleared');
    }
}

export function renderCart() {
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>
    `;
        return;
    }

    container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-type">${item.type}</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
        <span class="cart-qty">${item.quantity}</span>
        <button class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
        <button class="cart-remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');

    // Add event listeners for dynamic cart buttons
    container.querySelectorAll('[data-action="decrease"]').forEach(btn => {
        btn.addEventListener('click', () => updateCartItemQuantity(btn.dataset.id, -1));
    });
    container.querySelectorAll('[data-action="increase"]').forEach(btn => {
        btn.addEventListener('click', () => updateCartItemQuantity(btn.dataset.id, 1));
    });
    container.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
}

function formatCartForTelegram() {
    if (cart.length === 0) return '';

    const grouped = {};
    cart.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });

    let message = '🛒 *Pachis Order*\n\n';

    Object.keys(grouped).forEach(category => {
        message += `📦 *${category}:*\n`;
        grouped[category].forEach(item => {
            const sizeText = item.size ? ` (${item.size})` : '';
            message += `• ${item.name}${sizeText} x${item.quantity}\n`;
        });
        message += '\n';
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    message += `*Total Items:* ${totalItems}\n\n`;

    const verificationDataStr = localStorage.getItem(VERIFICATION_DATA_KEY);
    if (verificationDataStr) {
        try {
            const customerData = JSON.parse(verificationDataStr);

            message += '━━━━━━━━━━━━━━━━━━━━━\n';
            message += '👤 *Customer Information*\n\n';
            message += `*Name:* ${customerData.firstName} ${customerData.lastName}\n`;
            message += `*Email:* ${customerData.email}\n\n`;
            message += `*Address:*\n`;
            message += `${customerData.streetAddress}\n`;
            message += `${customerData.city}, ${customerData.state} ${customerData.zipCode}\n`;
            message += `${customerData.country}\n\n`;
        } catch (e) {
            console.error('Error parsing customer data:', e);
        }
    }

    message += 'Thank you for ordering from Pachis! 🌿';

    return message;
}

export function sendToTelegram() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    const message = formatCartForTelegram();
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/pachisshop?text=${encodedMessage}`;

    window.open(telegramUrl, '_blank');
    showToast('Opening Telegram... Just click Send! 📤');
}

export { cart };
