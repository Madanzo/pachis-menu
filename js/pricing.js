// Pricing Configuration for Pachis Menu
// All prices are in USD

export const pricingTiers = {
    // Disposables: 1 for $60, 2 for $100, 3 for $150
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

    // Dabs: Now uses fixed prices per product (defined in products.js)
    // Each jar option is a separate product with its own price
    'Live Rosin Dabs': {
        type: 'fixed',
        description: 'Live Rosin Jars'
    },

    // PreRolls: Now uses fixed prices per product (defined in products.js)
    // Black Box = $75, Blue Box = $400
    'Pre-Rolls': {
        type: 'fixed',
        description: 'Premium Pre-Rolled Joints'
    },

    // Flower: Now uses fixed prices per product (defined in products.js)
    // ¼oz (7g) = $80, ½oz (14g) = $150, 1oz (28g) = $280
    Flower: {
        type: 'fixed',
        description: 'Indoor Premium Flower'
    }
};

/**
 * Calculate price for a given category and quantity/size
 */
export function calculatePrice(category, quantity = 1, sizeOrVariant = null) {
    const pricing = pricingTiers[category];

    if (!pricing) {
        return null; // No pricing defined for this category
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
 * Calculate price for quantity-based tiers (Disposables, Dabs)
 */
function calculateQuantityPrice(pricing, quantity) {
    // Find the best tier for the quantity
    let applicableTier = pricing.tiers[0];

    for (const tier of pricing.tiers) {
        if (quantity >= tier.qty) {
            applicableTier = tier;
        }
    }

    // Calculate how many "packs" of the tier and remaining units
    if (quantity <= pricing.tiers[pricing.tiers.length - 1].qty) {
        // Find exact tier match or calculate based on tiers
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

    // For quantities beyond defined tiers, calculate based on best tier
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
 * Calculate price for variant-based pricing (Pre-Rolls)
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
 * Calculate price for size-based pricing (Flower)
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
 * Format price for display
 */
export function formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Get pricing options for a category (for UI display)
 */
export function getPricingOptions(category) {
    const pricing = pricingTiers[category];
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

    // Group items by category for tier calculation
    const groupedByCategory = {};

    for (const item of cartItems) {
        if (!groupedByCategory[item.category]) {
            groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
    }

    // Calculate prices for each category group
    for (const [category, items] of Object.entries(groupedByCategory)) {
        const pricing = pricingTiers[category];

        if (!pricing) {
            // No pricing for this category, skip
            itemizedPrices.push(...items.map(item => ({
                ...item,
                price: null,
                subtotal: null
            })));
            continue;
        }

        if (pricing.type === 'quantity') {
            // For quantity-based pricing, sum all items in category
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            const priceInfo = calculateQuantityPrice(pricing, totalQty);

            // Distribute price across items proportionally
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
            // For fixed-price products (price defined on product itself)
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
            // For variant/size-based, calculate each item individually
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
