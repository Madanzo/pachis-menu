import { products } from './products.js';
import { loadCart, addToCart, renderCart, clearCart as cartClear, sendToTelegram as cartSend } from './cart.js';
import { showToast } from './utils.js';
import { setRegion, getSizeOptionsForProduct, getRegion } from './pricing.js';

console.log('App module loaded');

// Category header mapping
const categoryHeaders = {
    "Disposable": "LIQUID DIAMONDS – 2G DISPOSABLE",
    "Live Rosin Dabs": "LIVE ROSIN DABS",
    "Pre-Rolls": "PRE-ROLLS",
    "Flower": "FLOWER",
    "Apparel": "PACHIS APPAREL",
    "Pleasure Gear": "PLEASURE GEAR",
    "420 Kit": "420 KIT"
};

// Categories marked as coming soon
const comingSoonCategories = ["Apparel", "Pleasure Gear", "420 Kit"];

// Current active category
let currentCategory = "Disposable";

// Age Verification
const AGE_VERIFICATION_KEY = 'pachisAgeVerified';
const VERIFICATION_DATA_KEY = 'pachisVerificationData';

function updateQuantity(productID, change) {
    const qtyDisplay = document.querySelector(`.qty-display[data-product-id="${productID}"]`);
    if (!qtyDisplay) return;

    let current = parseInt(qtyDisplay.textContent);
    current = Math.max(1, current + change);
    qtyDisplay.textContent = current;
}

function selectSize(productID, size) {
    const selector = document.getElementById(`size-selector-${productID}`);
    if (!selector) return;

    selector.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('selected'));

    const clickedBtn = selector.querySelector(`[data-size="${size}"]`);
    if (clickedBtn) clickedBtn.classList.add('selected');
}

function getSelectedSize(productID) {
    const selector = document.getElementById(`size-selector-${productID}`);
    if (!selector) return null;

    const selectedBtn = selector.querySelector('.size-option.selected');
    if (!selectedBtn) return null;

    return {
        id: selectedBtn.getAttribute('data-size'),
        price: selectedBtn.getAttribute('data-price') ? parseFloat(selectedBtn.getAttribute('data-price')) : null
    };
}

function addToCartWithSize(productID) {
    const qtyDisplay = document.querySelector(`.qty-display[data-product-id="${productID}"]`);
    const quantity = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;
    const sizeData = getSelectedSize(productID);
    const size = sizeData ? sizeData.id : null;
    const sizePrice = sizeData ? sizeData.price : null;
    addToCart(productID, quantity, size, sizePrice);
}

function renderProducts(category) {
    currentCategory = category;
    const grid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');

    // Handle category title potentially missing if elements aren't ready
    if (categoryTitle) {
        categoryTitle.textContent = categoryHeaders[category] || category.toUpperCase();
    }

    if (!products) {
        console.error('Products array is undefined!');
        return;
    }

    const filteredProducts = products.filter(p => p.category === category);

    if (grid) {
        grid.innerHTML = '';

        const isComingSoon = comingSoonCategories.includes(category);

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = isComingSoon ? 'product-card coming-soon' : 'product-card';

            // Get region-specific size options if available
            const regionSizeOptions = getSizeOptionsForProduct(product.id);
            const sizeOptions = regionSizeOptions || product.sizeOptions;
            const hasSizeOptions = sizeOptions && sizeOptions.length > 0;

            let sizesHTML = '';
            if (hasSizeOptions) {
                // Products with selectable size options (like Flower)
                sizesHTML = `
              <div class="size-selector" id="size-selector-${product.id}">
                ${sizeOptions.map((opt, index) => `
                  <button class="size-option ${index === 0 ? 'selected' : ''}"
                          data-size="${opt.id}"
                          data-price="${opt.price}"
                          data-product-id="${product.id}">
                    ${opt.name}
                  </button>
                `).join('')}
              </div>
            `;
            } else if (product.sizes && product.sizes.length > 0) {
                // Legacy size badges (for apparel etc.)
                sizesHTML = `
              <div class="product-sizes">
                ${product.sizes.map(size => `<span class="size-badge">${size}</span>`).join('')}
              </div>
            `;
            }

            let comingSoonHTML = '';
            if (isComingSoon) {
                comingSoonHTML = `
            <div class="coming-soon-overlay"></div>
            <div class="coming-soon-banner">Coming Soon</div>
          `;
            }

            // Check if image is a video
            const isVideo = product.image ? product.image.endsWith('.mp4') : false;
            const mediaHTML = isVideo
                ? `<video src="${product.image}" class="product-image" autoplay loop muted playsinline></video>`
                : `<img src="${product.image || ''}" alt="${product.name}" class="product-image">`;

            let detailsHTML = '';
            if (product.terps && product.thcPercent) {
                detailsHTML = `
            <div class="product-details">
              <div class="product-detail-row">
                <span class="product-detail-label">Terps:</span>
                <span class="product-detail-value">${product.terps.split('(')[0].trim()}</span>
              </div>
              <div class="product-terps">${product.terps.match(/\((.*?)\)/)?.[1] || ''}</div>
              <div class="product-detail-row">
                <span class="product-detail-label">THC:</span>
                <span class="product-detail-value">${product.thcPercent}</span>
              </div>
              <div class="product-detail-row">
                <span class="product-detail-label">THC(mg):</span>
                <span class="product-detail-value">${product.thcMg}</span>
              </div>
              <div class="product-detail-row">
                <span class="product-detail-label">CBD(mg):</span>
                <span class="product-detail-value">${product.cbd}</span>
              </div>
            </div>
          `;
            }

            card.innerHTML = `
          ${comingSoonHTML}
          <div class="product-brand">${product.brand}</div>
          ${mediaHTML}
          <div class="product-name">${product.name}</div>
          <div class="product-descriptor">${product.type}</div>
          ${detailsHTML}
          ${sizesHTML}
          <div class="product-card-actions">
            <button class="qty-btn" data-action="decrease-qty" data-id="${product.id}">−</button>
            <span class="qty-display" data-product-id="${product.id}">1</span>
            <button class="qty-btn" data-action="increase-qty" data-id="${product.id}">+</button>
            <button class="add-to-cart-btn" data-action="add-to-cart" data-id="${product.id}">
              Add to Cart
            </button>
          </div>
        `;

            // Add Event Listeners for buttons inside the card
            card.querySelector('.product-card-actions').addEventListener('click', (e) => e.stopPropagation());

            card.querySelectorAll('[data-action="decrease-qty"]').forEach(btn =>
                btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1))
            );
            card.querySelectorAll('[data-action="increase-qty"]').forEach(btn =>
                btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1))
            );
            card.querySelectorAll('[data-action="add-to-cart"]').forEach(btn =>
                btn.addEventListener('click', () => addToCartWithSize(btn.dataset.id))
            );

            // Add event listeners for size options
            if (hasSizeOptions) {
                card.querySelectorAll('.size-option').forEach(btn => {
                    btn.addEventListener('click', (e) => selectSize(e.target.dataset.productId, e.target.dataset.size));
                });
            }

            grid.appendChild(card);
        });
    }
}

// Age Verification
function isAgeVerified() {
    const verified = localStorage.getItem(AGE_VERIFICATION_KEY);
    return verified === 'true';
}

function showAgeVerification() {
    const modal = document.getElementById('age-verification');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideAgeVerification() {
    const modal = document.getElementById('age-verification');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function verifyAge(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const streetAddress = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value.trim();
    const ageConfirm = document.querySelector('input[name="ageConfirm"]:checked');

    if (!firstName || !lastName || !email || !streetAddress || !city || !state || !zipCode || !country) {
        showToast('Please fill in all required fields');
        return;
    }

    const ageError = document.getElementById('age-error');

    if (!ageConfirm) {
        ageError.textContent = 'Please confirm your age.';
        ageError.style.display = 'block';
        showToast('Please confirm your age');
        return;
    }

    if (ageConfirm.value === 'no') {
        ageError.textContent = 'You must be 21 years or older to access this site.';
        ageError.style.display = 'block';
        showToast('Sorry, you must be 21 or older');
        return;
    }

    ageError.style.display = 'none';

    const verificationData = {
        firstName,
        lastName,
        email,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        ageConfirmed: true,
        verifiedAt: new Date().toISOString()
    };

    localStorage.setItem(AGE_VERIFICATION_KEY, 'true');
    localStorage.setItem(VERIFICATION_DATA_KEY, JSON.stringify(verificationData));

    // Set region based on country for pricing
    const region = setRegion(country);
    console.log('Region set to:', region);

    hideAgeVerification();

    // Re-render products with region-specific pricing
    renderProducts(currentCategory);

    const regionMsg = region === 'MX' ? ' (México)' : ' (USA)';
    showToast(`✅ Verification successful! Welcome to Pachis${regionMsg}`);
}

// Navigation functions
function goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const firstTab = document.querySelector('.tab-button[data-category="Disposable"]');
    if (firstTab) firstTab.click();
}

// UI Functions exposed globally if needed by onclick handlers in HTML (though we try to add listeners via JS)
// Because we are moving to modules, we need to attach global functions to window if we want to keep index.html relatively clean but working with old onclicks. 
// OR better, we replace onclicks in index.html with IDs and add listeners here. 
// For this refactor, I will bind necessary globals to window to minimize HTML churn, but ideal is event listeners.

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        renderCart();
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Settings Modal Functions
function openSettings() {
    document.getElementById('settings-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    loadSettingsData();
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadSettingsData() {
    const verificationDataStr = localStorage.getItem(VERIFICATION_DATA_KEY);
    if (verificationDataStr) {
        try {
            const data = JSON.parse(verificationDataStr);
            document.getElementById('settingsFirstName').value = data.firstName || '';
            document.getElementById('settingsLastName').value = data.lastName || '';
            document.getElementById('settingsEmail').value = data.email || '';
            document.getElementById('settingsStreetAddress').value = data.streetAddress || '';
            document.getElementById('settingsCity').value = data.city || '';
            document.getElementById('settingsState').value = data.state || '';
            document.getElementById('settingsZipCode').value = data.zipCode || '';
            document.getElementById('settingsCountry').value = data.country || '';
        } catch (e) {
            console.error('Error loading settings data:', e);
        }
    }
}

function updateSettings(event) {
    event.preventDefault();

    const updatedData = {
        firstName: document.getElementById('settingsFirstName').value.trim(),
        lastName: document.getElementById('settingsLastName').value.trim(),
        email: document.getElementById('settingsEmail').value.trim(),
        streetAddress: document.getElementById('settingsStreetAddress').value.trim(),
        city: document.getElementById('settingsCity').value.trim(),
        state: document.getElementById('settingsState').value.trim(),
        zipCode: document.getElementById('settingsZipCode').value.trim(),
        country: document.getElementById('settingsCountry').value.trim(),
        ageConfirmed: true,
        verifiedAt: new Date().toISOString()
    };

    localStorage.setItem(VERIFICATION_DATA_KEY, JSON.stringify(updatedData));

    // Update region if country changed
    const region = setRegion(updatedData.country);
    console.log('Region updated to:', region);

    // Re-render products with new region pricing
    renderProducts(currentCategory);

    const regionMsg = region === 'MX' ? ' (México)' : ' (USA)';
    showToast(`✅ Profile updated successfully!${regionMsg}`);
    closeSettings();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // expose functions to window for HTML onclick compatibility (transition step)
    window.verifyAge = verifyAge;
    window.updateSettings = updateSettings;
    window.goHome = goHome;
    window.openCart = openCart;
    window.closeCart = closeCart;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.clearCart = cartClear;
    window.sendToTelegram = cartSend;
    // Note: addToCart is internal now via listeners, or exposed if needed.

    if (!isAgeVerified()) showAgeVerification();

    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            renderProducts(category);
        });
    });

    loadCart();
    renderProducts('Disposable');

    // Add Listeners for close buttons etc that might not have been caught
    document.querySelectorAll('.cart-close-btn').forEach(btn => {
        // Checking if it's cart or settings
        if (btn.closest('#cart-modal')) btn.addEventListener('click', closeCart);
        if (btn.closest('#settings-modal')) btn.addEventListener('click', closeSettings);
    });

    // Age verification form listener if not using onsubmit in HTML
    const ageForm = document.getElementById('age-verification-form');
    if (ageForm) {
        ageForm.addEventListener('submit', verifyAge);
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', updateSettings);
    }

    // Overlays
    document.querySelectorAll('.cart-modal-overlay').forEach(overlay => {
        if (overlay.closest('#cart-modal')) overlay.addEventListener('click', closeCart);
        if (overlay.closest('#settings-modal')) overlay.addEventListener('click', closeSettings);
    });
});
