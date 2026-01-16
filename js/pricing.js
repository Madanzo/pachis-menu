// Pricing Configuration for Pachis Menu
// Supports USD (USA) and MXN (Mexico) pricing

// Region storage key
const REGION_KEY = 'pachis_region';

// Get current region (defaults to USA)
export function getRegion() {
    return localStorage.getItem(REGION_KEY) || 'USA';
}

// Set region based on country
export function setRegion(country) {
    const mexicoVariants = ['mexico', 'méxico', 'mx', 'mex'];
    const isMexico = mexicoVariants.includes(country.toLowerCase().trim());
    const region = isMexico ? 'MX' : 'USA';
    localStorage.setItem(REGION_KEY, region);
    return region;
}

// Currency configuration
const currencyConfig = {
    USA: { code: 'USD', symbol: '$', locale: 'en-US' },
    MX: { code: 'MXN', symbol: 'MX$', locale: 'es-MX' }
};

// Pricing tiers for each region
export const pricingTiers = {
    USA: {
        Disposable: {
            type: 'quantity',
            tiers: [
                { qty: 1, price: 60, label: '1 unit', pricePerUnit: 60 },
                { qty: 2, price: 100, label: '2 units', pricePerUnit: 50 },
                { qty: 3, price: 150, label: '3 units', pricePerUnit: 50 }
            ],
            basePrice: 60,
            description: '2G Liquid Diamonds'
        },
        'Dual Dispo': {
            type: 'quantity',
            tiers: [
                { qty: 1, price: 70, label: '1 unit', pricePerUnit: 70 },
                { qty: 2, price: 120, label: '2 units', pricePerUnit: 60 }
            ],
            basePrice: 70,
            description: '4G Dual Flavor (2g + 2g)'
        },
        'Live Rosin Dabs': {
            type: 'fixed',
            description: 'Live Rosin Jars'
        },
        'Pre-Rolls': {
            type: 'fixed',
            description: 'Premium Pre-Rolled Joints'
        },
        Flower: {
            type: 'fixed',
            description: 'Indoor Premium Flower'
        }
    },
    MX: {
        Disposable: {
            type: 'quantity',
            tiers: [
                { qty: 1, price: 1800, label: '1 unit', pricePerUnit: 1800 },
                { qty: 2, price: 3200, label: '2 units', pricePerUnit: 1600 },
                { qty: 3, price: 4800, label: '3 units', pricePerUnit: 1600 }
            ],
            basePrice: 1800,
            description: '2G Liquid Diamonds'
        },
        'Dual Dispo': {
            type: 'quantity',
            tiers: [
                { qty: 1, price: 1900, label: '1 unit', pricePerUnit: 1900 },
                { qty: 2, price: 3500, label: '2 units', pricePerUnit: 1750 }
            ],
            basePrice: 1900,
            description: '4G Dual Flavor (2g + 2g)'
        },
        'Live Rosin Dabs': {
            type: 'fixed',
            description: 'Live Rosin Jars'
        },
        'Pre-Rolls': {
            type: 'fixed',
            description: 'Premium Pre-Rolled Joints'
        },
        Flower: {
            type: 'fixed',
            description: 'Indoor Premium Flower'
        }
    }
};

// Product size options for each region
export const regionSizeOptions = {
    USA: {
        dab_pachis: [
            { id: "1jar_2g", name: "1 Jar (2g)", price: 120 },
            { id: "7jars_halfoz", name: "7 Jars - ½oz (14g)", price: 750 },
            { id: "14jars_1oz", name: "14 Jars - 1oz (28g)", price: 1400 }
        ],
        preroll_pachis: [
            { id: "black_box", name: "Black Box (3 pre-rolls)", price: 75 },
            { id: "blue_box", name: "Blue Box (18 pre-rolls)", price: 400 }
        ],
        flower_premium: [
            { id: "quarter_oz", name: "¼ oz (7g)", price: 80 },
            { id: "half_oz", name: "½ oz (14g)", price: 150 },
            { id: "full_oz", name: "1 oz (28g)", price: 280 }
        ]
    },
    MX: {
        dab_pachis: [
            { id: "1jar_2g", name: "1 Jar (2g)", price: 2600 }
        ],
        preroll_pachis: [
            { id: "black_box", name: "Black Box (3 pre-rolls)", price: 2100 },
            { id: "blue_box", name: "Blue Box (18 pre-rolls)", price: 9900 }
        ],
        flower_premium: [
            { id: "quarter_oz", name: "¼ oz (7g)", price: 400 },
            { id: "half_oz", name: "½ oz (14g)", price: 700 },
            { id: "full_oz", name: "1 oz (28g)", price: 1200 }
        ]
    }
};

// Get size options for a product based on current region
export function getSizeOptionsForProduct(productId) {
    const region = getRegion();
    return regionSizeOptions[region]?.[productId] || regionSizeOptions['USA']?.[productId] || null;
}

// Get pricing tiers for current region
export function getCurrentPricingTiers() {
    const region = getRegion();
    return pricingTiers[region] || pricingTiers['USA'];
}

/**
 * Calculate price for a given category and quantity/size
 */
export function calculatePrice(category, quantity = 1, sizeOrVariant = null) {
    const pricing = getCurrentPricingTiers()[category];

    if (!pricing) {
        return null;
    }

    switch (pricing.type) {
        case 'quantity':
            return calculateQuantityPrice(pricing, quantity);
        case 'variant':
            return calculateVariantPrice(pricing, sizeOrVariant, quantity);
        case 'size':
            return calculateSizePrice(pricing, sizeOrVariant, quantity);
        default:
            return null;
    }
}

/**
 * Calculate price for quantity-based tiers (Disposables)
 */
function calculateQuantityPrice(pricing, quantity) {
    let applicableTier = pricing.tiers[0];

    for (const tier of pricing.tiers) {
        if (quantity >= tier.qty) {
            applicableTier = tier;
        }
    }

    if (quantity <= pricing.tiers[pricing.tiers.length - 1].qty) {
        const exactTier = pricing.tiers.find(t => t.qty === quantity);
        if (exactTier) {
            return {
                total: exactTier.price,
                pricePerUnit: exactTier.pricePerUnit,
                tier: exactTier.label,
                quantity
            };
        }
    }

    const baseTier = pricing.tiers[pricing.tiers.length - 1];
    const packs = Math.floor(quantity / baseTier.qty);
    const remaining = quantity % baseTier.qty;

    let total = packs * baseTier.price;
    if (remaining > 0) {
        const remainingTier = pricing.tiers.find(t => t.qty >= remaining) || pricing.tiers[0];
        total += remainingTier.price;
    }

    return {
        total,
        pricePerUnit: total / quantity,
        tier: `${quantity} units`,
        quantity
    };
}

/**
 * Calculate price for variant-based pricing
 */
function calculateVariantPrice(pricing, variantId, quantity) {
    const variant = pricing.variants.find(v => v.id === variantId) || pricing.variants[0];
    return {
        total: variant.price * quantity,
        pricePerUnit: variant.price,
        variant: variant.name,
        description: variant.description,
        quantity
    };
}

/**
 * Calculate price for size-based pricing
 */
function calculateSizePrice(pricing, sizeId, quantity) {
    const size = pricing.sizes.find(s => s.id === sizeId) || pricing.sizes[0];
    return {
        total: size.price * quantity,
        pricePerUnit: size.price,
        size: size.name,
        grams: size.grams,
        quantity
    };
}

/**
 * Format price for display with correct currency
 */
export function formatPrice(amount) {
    const region = getRegion();
    const config = currencyConfig[region] || currencyConfig['USA'];

    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Get currency symbol for current region
 */
export function getCurrencySymbol() {
    const region = getRegion();
    return currencyConfig[region]?.symbol || '$';
}

/**
 * Get pricing options for a category (for UI display)
 */
export function getPricingOptions(category) {
    const pricing = getCurrentPricingTiers()[category];
    if (!pricing) return null;

    switch (pricing.type) {
        case 'quantity':
            return {
                type: 'quantity',
                options: pricing.tiers.map(tier => ({
                    value: tier.qty,
                    label: tier.label,
                    price: formatPrice(tier.price),
                    pricePerUnit: formatPrice(tier.pricePerUnit)
                })),
                basePrice: formatPrice(pricing.basePrice)
            };
        case 'variant':
            return {
                type: 'variant',
                options: pricing.variants.map(v => ({
                    value: v.id,
                    label: v.name,
                    price: formatPrice(v.price),
                    description: v.description
                })),
                basePrice: formatPrice(pricing.basePrice)
            };
        case 'size':
            return {
                type: 'size',
                options: pricing.sizes.map(s => ({
                    value: s.id,
                    label: s.name,
                    price: formatPrice(s.price),
                    grams: s.grams
                })),
                basePrice: formatPrice(pricing.basePrice)
            };
        default:
            return null;
    }
}

/**
 * Calculate cart total with tiered pricing
 */
export function calculateCartTotal(cartItems) {
    let total = 0;
    const itemizedPrices = [];
    const currentPricing = getCurrentPricingTiers();

    const groupedByCategory = {};

    for (const item of cartItems) {
        if (!groupedByCategory[item.category]) {
            groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
    }

    for (const [category, items] of Object.entries(groupedByCategory)) {
        const pricing = currentPricing[category];

        if (!pricing) {
            itemizedPrices.push(...items.map(item => ({
                ...item,
                price: null,
                subtotal: null
            })));
            continue;
        }

        if (pricing.type === 'quantity') {
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            const priceInfo = calculateQuantityPrice(pricing, totalQty);

            items.forEach(item => {
                const proportion = item.quantity / totalQty;
                const itemSubtotal = priceInfo.total * proportion;
                total += itemSubtotal;
                itemizedPrices.push({
                    ...item,
                    pricePerUnit: priceInfo.pricePerUnit,
                    subtotal: itemSubtotal,
                    tierApplied: priceInfo.tier
                });
            });
        } else if (pricing.type === 'fixed') {
            for (const item of items) {
                if (item.price !== undefined) {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;
                    itemizedPrices.push({
                        ...item,
                        pricePerUnit: item.price,
                        subtotal: subtotal
                    });
                } else {
                    itemizedPrices.push({
                        ...item,
                        price: null,
                        subtotal: null
                    });
                }
            }
        } else {
            for (const item of items) {
                const priceInfo = calculatePrice(category, item.quantity, item.variant || item.size);
                if (priceInfo) {
                    total += priceInfo.total;
                    itemizedPrices.push({
                        ...item,
                        pricePerUnit: priceInfo.pricePerUnit,
                        subtotal: priceInfo.total
                    });
                } else {
                    itemizedPrices.push({
                        ...item,
                        price: null,
                        subtotal: null
                    });
                }
            }
        }
    }

    return {
        total,
        formattedTotal: formatPrice(total),
        items: itemizedPrices
    };
}
