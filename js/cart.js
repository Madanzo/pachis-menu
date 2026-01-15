// Cart management
import { products } from './products.js';
import { showToast } from './utils.js';
import { calculateCartTotal, formatPrice, pricingTiers } from './pricing.js';
import { t } from './i18n.js';

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

export function addToCart(productID, quantity = 1, size = null, sizePrice = null) {
    if (quantity <= 0) return;

    const product = products.find(p => p.id === productID);
    if (!product) return;

    const cartItemId = size ? `${productID}_${size}` : productID;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    // Get size name if this product has sizeOptions
    let sizeName = null;
    if (size && product.sizeOptions) {
        const sizeOpt = product.sizeOptions.find(s => s.id === size);
        if (sizeOpt) sizeName = sizeOpt.name;
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            cartItemId: cartItemId,
            id: productID,
            name: product.name,
            type: sizeName || product.type, // Use size name if available
            category: product.category,
            image: product.image,
            size: size,
            sizeName: sizeName,
            price: sizePrice || product.price || null, // Use size price, then product price
            quantity: quantity
        });
    }

    saveCart();

    const sizeText = sizeName ? ` (${sizeName})` : '';
    showToast(`${product.name}${sizeText} ${t('addedToCart')}`);

    const qtyDisplay = document.querySelector(`.qty-display[data-product-id="${productID}"]`);
    if (qtyDisplay) qtyDisplay.textContent = '1';
}

export function updateCartItemQuantity(itemId, change) {
    // Support both cartItemId and regular id
    const item = cart.find(i => i.cartItemId === itemId || i.id === itemId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCart();
        renderCart();
    }
}

export function removeFromCart(itemId) {
    // Support both cartItemId and regular id
    cart = cart.filter(item => item.cartItemId !== itemId && item.id !== itemId);
    saveCart();
    renderCart();
    showToast(t('itemRemoved'));
}

export function clearCart() {
    if (cart.length === 0) return;

    if (confirm(t('confirmClearCart'))) {
        cart = [];
        saveCart();
        renderCart();
        showToast(t('cartCleared'));
    }
}

export function renderCart() {
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>${t('cartEmpty')}</p>
      </div>
    `;
        updateCartTotal(0);
        return;
    }

    // Calculate prices with tier discounts
    const cartData = calculateCartTotal(cart);

    container.innerHTML = cartData.items.map(item => {
        const priceDisplay = item.subtotal !== null
            ? `<div class="cart-item-price">${formatPrice(item.subtotal)}</div>`
            : '';
        const tierBadge = item.tierApplied
            ? `<span class="cart-tier-badge">${item.tierApplied}</span>`
            : '';

        return `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name} ${tierBadge}</div>
        <div class="cart-item-type">${item.type}${item.size ? ` • ${item.size}` : ''}${item.variant ? ` • ${item.variant}` : ''}</div>
        ${item.pricePerUnit ? `<div class="cart-item-unit-price">${formatPrice(item.pricePerUnit)} each</div>` : ''}
      </div>
      <div class="cart-item-controls">
        ${priceDisplay}
        <div class="cart-qty-controls">
          <button class="cart-qty-btn" data-action="decrease" data-id="${item.cartItemId || item.id}">−</button>
          <span class="cart-qty">${item.quantity}</span>
          <button class="cart-qty-btn" data-action="increase" data-id="${item.cartItemId || item.id}">+</button>
        </div>
        <button class="cart-remove-btn" data-action="remove" data-id="${item.cartItemId || item.id}">Remove</button>
      </div>
    </div>
  `;
    }).join('');

    // Update total display
    updateCartTotal(cartData.total);

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

function updateCartTotal(total) {
    let totalEl = document.getElementById('cart-total');
    if (!totalEl) {
        const footer = document.querySelector('.cart-modal-footer');
        if (footer) {
            const totalDiv = document.createElement('div');
            totalDiv.className = 'cart-total-display';
            totalDiv.innerHTML = `<span>Total:</span><span id="cart-total">${formatPrice(total)}</span>`;
            footer.insertBefore(totalDiv, footer.firstChild);
            totalEl = document.getElementById('cart-total');
        }
    }
    if (totalEl) {
        totalEl.textContent = formatPrice(total);
    }
}

// Show order success modal with Telegram link
function showOrderSuccessModal(orderId = null) {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        if (orderId) {
            const btn = modal.querySelector('.order-success-btn');
            if (btn) {
                // Update link to Pachis Bot with Order ID context
                // Using the specific bot username retrieved earlier
                btn.href = `https://t.me/Pachis_Shop_bot?start=${orderId}`;
            }
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close order success modal (exposed globally)
export function closeOrderSuccess() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export async function sendToTelegram() {
    if (cart.length === 0) {
        showToast(t('cartEmpty'));
        return;
    }

    const verificationDataStr = localStorage.getItem(VERIFICATION_DATA_KEY);
    if (!verificationDataStr) {
        showToast('⚠️ Please verify your profile first in settings.');
        return;
    }

    let customerData;
    try {
        customerData = JSON.parse(verificationDataStr);
    } catch (e) {
        showToast('Error reading profile data.');
        return;
    }

    const sendBtn = document.querySelector('.btn-telegram');
    const originalText = sendBtn ? sendBtn.innerHTML : 'Send to Telegram';
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '⏳ Sending...';
    }

    try {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartData = calculateCartTotal(cart);

        const response = await fetch('/api/send-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart: cart,
                customer: customerData,
                totalItems: totalItems,
                orderTotal: cartData.formattedTotal,
                orderTotalValue: cartData.total
            })
        });

        const result = await response.json();

        if (response.ok) {
            cart = [];
            saveCart();
            renderCart();
            // Close cart modal
            const cartModal = document.getElementById('cart-modal');
            if (cartModal) cartModal.style.display = 'none';

            // Show order success modal with dynamic Telegram link
            showOrderSuccessModal(result.orderId);
        } else {
            throw new Error(result.error || 'Failed to send');
        }

    } catch (error) {
        console.error('Order Error:', error);
        showToast(t('orderFailed'));

        // Fallback to manual method if API fails (e.g. env vars missing)
        if (confirm(t('openTelegramManually'))) {
            sendToTelegramManual();
        }

    } finally {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = originalText;
        }
    }
}

// Fallback manual method
function sendToTelegramManual() {
    if (cart.length === 0) return;

    // Calculate cart total with pricing
    const cartData = calculateCartTotal(cart);

    const grouped = {};
    cartData.items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    let message = '🛒 *Pachis Order (Manual)*\n\n';
    Object.keys(grouped).forEach(category => {
        message += `📦 *${category}:*\n`;
        grouped[category].forEach(item => {
            const sizeText = item.size ? ` (${item.size})` : '';
            const variantText = item.variant ? ` (${item.variant})` : '';
            const priceText = item.subtotal !== null ? ` - ${formatPrice(item.subtotal)}` : '';
            message += `• ${item.name}${sizeText}${variantText} x${item.quantity}${priceText}\n`;
        });
        message += '\n';
    });

    // Add total
    message += '━━━━━━━━━━━━━━━━━━━━━\n';
    message += `💰 *Total: ${cartData.formattedTotal}*\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━\n\n';

    const verificationDataStr = localStorage.getItem(VERIFICATION_DATA_KEY);
    if (verificationDataStr) {
        try {
            const customer = JSON.parse(verificationDataStr);
            message += `👤 *${customer.firstName} ${customer.lastName}*\n`;
            message += `${customer.email}\n`;
            message += `${customer.streetAddress}, ${customer.city}\n`;
        } catch (e) { }
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/pachisshop?text=${encodedMessage}`, '_blank');
}

export { cart };
