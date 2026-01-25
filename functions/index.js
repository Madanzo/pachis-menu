const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// Helper to generate short order ID
function generateOrderId(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

exports.sendOrder = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { cart, customer, totalItems, orderTotal } = req.body;

    if (!cart || !customer) {
        return res.status(400).json({ error: "Missing required data" });
    }

    // Get secrets from Firebase config
    const token = functions.config().telegram?.bot_token;
    const adminChatId = functions.config().telegram?.chat_id;



    if (!token || !adminChatId) {
        console.error("Missing Telegram config");
        return res.status(500).json({ error: "Server configuration error" });
    }

    // Generate Order ID
    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();

    // Parse order total and split cart for raffle calculation (USD only)
    const currency = req.body.currency || 'USD';
    let orderTotalNum = 0;

    // Prefer the numeric value if provided
    if (req.body.orderTotalValue !== undefined) {
        orderTotalNum = parseFloat(req.body.orderTotalValue) || 0;
    } else if (orderTotal) {
        orderTotalNum = parseFloat(orderTotal.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    let raffleEntries = 0;
    let paidEntries = 0;
    let freeEntries = 0;
    let qualifyingTotal = 0;

    if (currency === 'USD') {
        // 1. Calculate Paid Entries from Raffle Products
        cart.forEach(item => {
            if (item.category === 'Raffle' || item.id.startsWith('raffle_')) {
                // It's a raffle ticket
                const entryVal = item.raffleEntries || (item.id.includes('6_entries') ? 6 : item.id.includes('3_entries') ? 3 : 1);
                paidEntries += (entryVal * item.quantity);
            } else {
                // It's a regular product - counts towards free entries
                qualifyingTotal += (item.price * item.quantity);
            }
        });

        // 2. Calculate Free Entries based on Qualifying Spend (regular products only)
        if (qualifyingTotal >= 150) {
            freeEntries = 6;
        } else if (qualifyingTotal >= 100) {
            freeEntries = 3;
        } else if (qualifyingTotal >= 60) {
            freeEntries = 1;
        } // <$60 gets 0 free entries

        raffleEntries = paidEntries + freeEntries;
    }

    // Store order in Firestore
    try {
        await db.collection('orders').doc(orderId).set({
            orderId,
            cart,
            customer,
            totalItems,
            orderTotal: orderTotal || "N/A",
            orderTotalNum: orderTotalNum,
            qualifyingTotal: qualifyingTotal, // Track spend for free entries
            region: req.body.region || 'USA',
            currency: currency,
            createdAt: orderDate,
            status: 'pending',
            telegramConnected: false,
            raffleEntries: raffleEntries, // Total entries
            paidEntries: paidEntries,
            freeEntries: freeEntries,
            rafflePaid: false
        });

        // Create raffle entry if qualifies
        if (raffleEntries > 0) {
            await db.collection('raffleEntries').doc(orderId).set({
                entryId: orderId,
                orderId: orderId,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email?.toLowerCase().trim() || '',
                phone: customer.phone || '',
                orderTotal: orderTotalNum,
                qualifyingSpend: qualifyingTotal,
                tier: freeEntries > 0 ? `$${qualifyingTotal}+ Spend` : 'Ticket Purchase',
                tierAmount: orderTotalNum,
                entryCount: raffleEntries,
                status: 'pending',
                source: paidEntries > 0 ? 'purchase+spend' : 'spend',
                createdAt: orderDate,
                paidAt: null,
                notes: `Paid: ${paidEntries}, Free: ${freeEntries}`
            });
        }
    } catch (dbError) {
        console.error("Firestore Error:", dbError);
        // Continue even if DB fails
    }

    // Format message for Admin
    let message = `🛒 *Pachis Order #${orderId}* 🚀\n\n`;

    const grouped = {};
    cart.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach((category) => {
        message += `📦 *${escapeMd(category)}*\n`;
        grouped[category].forEach((item) => {
            const sizeText = item.size ? ` (${escapeMd(item.size)})` : "";
            const variantText = item.variant ? ` (${escapeMd(item.variant)})` : "";
            message += `• ${escapeMd(item.name)}${sizeText}${variantText} x${item.quantity}\n`;
        });
        message += "\n";
    });

    message += `*Total:* ${escapeMd(orderTotal || 'N/A')}\n`;
    message += `*Total Items:* ${totalItems}\n`;

    // Add raffle info to Telegram message
    if (raffleEntries > 0) {
        message += "\n🎟️ *RAFFLE:* " + raffleEntries + " entries earned!\n";
    }

    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += "👤 *Customer Details*\n\n";
    message += `*Name:* ${escapeMd(customer.firstName)} ${escapeMd(customer.lastName)}\n`;
    message += `*Phone:* ${escapeMd(customer.phone || 'Not provided')}\n`;
    message += `*Email:* ${escapeMd(customer.email)}\n`;
    message += `*Location:* ${escapeMd(customer.city)}, ${escapeMd(customer.state)}\n`;
    if (customer.streetAddress) {
        message += `*Address:* ${escapeMd(customer.streetAddress)}, ${escapeMd(customer.zipCode)}, ${escapeMd(customer.country)}\n`;
    }
    message += "*Verified Status:* ✅ 21+ Confirmed\n";
    message += `*Time:* ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}\n`;
    message += `*Order ID:* \`${orderId}\`\n`;

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: adminChatId,
                    text: message,
                    parse_mode: "Markdown",
                }),
            }
        );

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || "Telegram API Error");
        }

        // Return success with Order ID and raffle info
        return res.status(200).json({
            success: true,
            message: "Order sent successfully",
            orderId: orderId,
            raffleEntries: raffleEntries
        });
    } catch (error) {
        console.error("Telegram Send Error:", error);
        return res.status(500).json({ error: "Failed to send order" });
    }
});

// Helper to escape Markdown special characters (Legacy Mode)
function escapeMd(text) {
    if (!text) return '';
    return text.replace(/[_*[`\\]/g, '\\$&'); // Only escape _, *, `, \, [ logic if needed but [ is usually fine unless link
}

// Telegram Webhook Handler
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const update = req.body;
        const message = update.message;

        if (!message || !message.text) {
            return res.status(200).send("OK");
        }

        const chatId = message.chat.id;
        const text = message.text;
        const token = functions.config().telegram?.bot_token;
        const adminChatId = functions.config().telegram?.chat_id;

        // Handle /start ORDER_ID
        if (text.startsWith("/start")) {
            const params = text.split(" ");
            if (params.length > 1) {
                const orderId = params[1].trim();

                // Get order from Firestore
                const db = admin.firestore();
                let doc;
                try {
                    doc = await db.collection('orders').doc(orderId).get();
                } catch (dbError) {
                    console.error("Firestore DB Error within Webhook:", dbError);
                    await sendTelegramMessage(chatId, "❌ System error: Database not accessible.", token);
                    return res.status(200).send("OK");
                }

                if (!doc.exists) {
                    await sendTelegramMessage(chatId, "⚠️ We couldn't find that order number. Please check your link or place a new order!", token);
                    return res.status(200).send("OK");
                }

                const order = doc.data();

                // 1. Send Welcome + Payment Info to Customer
                let paymentInfo = "";
                const country = (order.customer.country || "").toUpperCase();

                if (country.includes("MEX") || country === "MX") {
                    paymentInfo = `
💰 *Instrucciones de Pago (México)*:
• *Bitcoin (BTC):*
\`38cytnaJ7PoP2yXSeEvZH1NFyVyyX89XPk\`

📸 *Envía captura de pago a:* [@Pachisshop](https://t.me/Pachisshop)`;
                } else {
                    // Default to USA
                    paymentInfo = `
💰 *Payment Instructions (USA)*:
• *Zelle / Apple Pay:* \`5712518290\`
• *Bitcoin (BTC):*
\`38cytnaJ7PoP2yXSeEvZH1NFyVyyX89XPk\`

📸 *Send payment screenshot to:* [@Pachisshop](https://t.me/Pachisshop)`;
                }

                let customerMsg = `👋 *¡Hola ${escapeMd(order.customer.firstName)}!*\n\n`;
                customerMsg += `Thanks for connecting! We've received your order *#${orderId}*.\n\n`;

                // Order Summary
                customerMsg += `📦 *Order Summary:*\n`;
                const grouped = {};
                order.cart.forEach((item) => {
                    if (!grouped[item.category]) grouped[item.category] = [];
                    grouped[item.category].push(item);
                });
                Object.keys(grouped).forEach((cat) => {
                    customerMsg += `*${escapeMd(cat)}:*\n`;
                    grouped[cat].forEach(i => {
                        customerMsg += `• ${i.quantity}x ${escapeMd(i.name)}\n`;
                    });
                });

                if (order.orderTotal) {
                    customerMsg += `\n💰 *Total:* ${order.orderTotal}\n`;
                }

                customerMsg += `\n📍 *Delivering to:* ${escapeMd(order.customer.city)}, ${escapeMd(order.customer.state)}`;
                customerMsg += `\n\n${paymentInfo}`;

                await sendTelegramMessage(chatId, customerMsg, token);

                // 2. Notify Admin with Direct Link (Option B)
                // If username exists, t.me/username. If not, tg://user?id=
                const customerUsername = message.from.username;
                const customerName = [message.from.first_name, message.from.last_name].filter(Boolean).join(" ");

                let connectLink = "";
                let linkText = "";

                if (customerUsername) {
                    connectLink = `https://t.me/${customerUsername}`;
                    linkText = `@${escapeMd(customerUsername)}`;
                } else {
                    connectLink = `tg://user?id=${message.from.id}`;
                    linkText = "Direct Chat (No Username)";
                }

                let adminMsg = `🔗 *Customer Connected!*\n\n`;
                adminMsg += `User: *${escapeMd(customerName)}*\n`;
                adminMsg += `Chat: [${linkText}](${connectLink})\n`;
                adminMsg += `Order: *#${orderId}*\n\n`;
                adminMsg += `👉 *Click their name above to chat directly!*`;

                await sendTelegramMessage(adminChatId, adminMsg, token);

                // Update order status
                await db.collection('orders').doc(orderId).update({
                    telegramConnected: true,
                    telegramChatId: chatId,
                    telegramUsername: message.from.username || 'No username'
                });

                return res.status(200).send("OK");
            }
        }

        // Forward other messages to Admin if they don't start with /start
        const senderName = message.from.username ? `@${message.from.username}` : (message.from.first_name || "Customer");

        let forwardMsg = `📩 *Message from ${escapeMd(senderName)}*\n\n`;
        forwardMsg += `"${escapeMd(text)}"\n\n`;
        forwardMsg += `_(This message was sent to the bot. Click their username in the "Connected" message to reply directly!)_`;

        await sendTelegramMessage(adminChatId, forwardMsg, token);

        return res.status(200).send("OK");

    } catch (error) {
        console.error("Webhook Error", error);
        // Don't crash telegram retries loop if possible, but logging is good
        return res.status(500).send("Error");
    }
});

async function sendTelegramMessage(chatId, text, token) {
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            }),
        });
    } catch (e) {
        console.error("Failed to send TG message", e);
    }
}

// ============================================
// CRM FUNCTIONS - Customer Database
// ============================================

/**
 * Save or update customer registration to Firestore
 * Uses email as the unique identifier
 */
exports.saveCustomer = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { customer } = req.body;

    if (!customer || !customer.email) {
        return res.status(400).json({ error: "Customer email is required" });
    }

    try {
        // Use email as document ID (normalized to lowercase)
        const emailKey = customer.email.toLowerCase().trim();

        const customerData = {
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: emailKey,
            phone: customer.phone || "",
            streetAddress: customer.streetAddress || "",
            city: customer.city || "",
            state: customer.state || "",
            zipCode: customer.zipCode || "",
            country: customer.country || "",
            ageConfirmed: customer.ageConfirmed || false,
            updatedAt: new Date().toISOString(),
        };

        // Check if customer exists
        const existingDoc = await db.collection('customers').doc(emailKey).get();

        if (existingDoc.exists) {
            // Update existing customer
            await db.collection('customers').doc(emailKey).update(customerData);
        } else {
            // Create new customer with createdAt
            customerData.createdAt = new Date().toISOString();
            await db.collection('customers').doc(emailKey).set(customerData);
        }

        return res.status(200).json({
            success: true,
            message: "Customer saved",
            isNew: !existingDoc.exists
        });
    } catch (error) {
        console.error("Error saving customer:", error);
        return res.status(500).json({ error: "Failed to save customer" });
    }
});

/**
 * Lookup customer by email
 * Returns customer data if found
 */
exports.lookupCustomer = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    // Accept both GET with query param and POST with body
    const email = req.query.email || req.body?.email;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const emailKey = email.toLowerCase().trim();
        const doc = await db.collection('customers').doc(emailKey).get();

        if (!doc.exists) {
            return res.status(404).json({
                found: false,
                message: "Customer not found"
            });
        }

        const customerData = doc.data();

        return res.status(200).json({
            found: true,
            customer: customerData
        });
    } catch (error) {
        console.error("Error looking up customer:", error);
        return res.status(500).json({ error: "Failed to lookup customer" });
    }
});

/**
 * Get all customers for admin dashboard
 * Returns list of all customers sorted by creation date
 */
exports.getAllCustomers = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    try {
        const snapshot = await db.collection('customers')
            .orderBy('createdAt', 'desc')
            .get();

        const customers = [];
        snapshot.forEach(doc => {
            customers.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            success: true,
            count: customers.length,
            customers: customers
        });
    } catch (error) {
        console.error("Error getting all customers:", error);
        return res.status(500).json({ error: "Failed to get customers" });
    }
});

/**
 * Delete a customer from the database
 * POST { email: "customer@email.com" }
 */
exports.deleteCustomer = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const emailKey = email.toLowerCase().trim();
        const docRef = db.collection('customers').doc(emailKey);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Customer not found" });
        }

        await docRef.delete();

        return res.status(200).json({
            success: true,
            message: `Customer ${email} deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return res.status(500).json({ error: "Failed to delete customer" });
    }
});

/**
 * Get all orders for admin dashboard
 * Returns list of all orders sorted by date
 */
exports.getAllOrders = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        console.error("Error getting all orders:", error);
        return res.status(500).json({ error: "Failed to get orders" });
    }
});

/**
 * Update order status (mark as paid, pending, etc.)
 * POST { orderId, status: 'paid' | 'pending' | 'cancelled' }
 */
exports.updateOrder = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { orderId, status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ error: "Missing orderId or status" });
    }

    if (!['paid', 'pending', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const docRef = db.collection('orders').doc(orderId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Order not found" });
        }

        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };

        if (status === 'paid') {
            updateData.paidAt = new Date().toISOString();
            // Also mark associated raffle entry as paid
            const raffleRef = db.collection('raffleEntries').doc(orderId);
            const raffleDoc = await raffleRef.get();
            if (raffleDoc.exists) {
                await raffleRef.update({
                    status: 'paid',
                    paidAt: new Date().toISOString()
                });
            }
        }

        await docRef.update(updateData);

        return res.status(200).json({
            success: true,
            message: `Order ${orderId} marked as ${status}`
        });
    } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ error: "Failed to update order" });
    }
});

/**
 * Delete an order
 * POST { orderId }
 */
exports.deleteOrder = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: "Missing orderId" });
    }

    try {
        const docRef = db.collection('orders').doc(orderId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Delete order
        await docRef.delete();

        // Also delete associated raffle entry if exists
        const raffleRef = db.collection('raffleEntries').doc(orderId);
        const raffleDoc = await raffleRef.get();
        if (raffleDoc.exists) {
            await raffleRef.delete();
        }

        return res.status(200).json({
            success: true,
            message: `Order ${orderId} deleted`
        });
    } catch (error) {
        console.error("Error deleting order:", error);
        return res.status(500).json({ error: "Failed to delete order" });
    }
});


// ============================================
// RAFFLE FUNCTIONS - Cowboys Jersey Raffle
// ============================================

/**
 * Submit a new raffle entry
 * Stores entry in Firestore and sends Telegram notification
 */
exports.submitRaffleEntry = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { firstName, lastName, email, phone, tier, entries } = req.body;

    if (!firstName || !lastName || !email || !phone || !tier) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Generate unique entry ID
        const entryId = generateOrderId(8);
        const now = new Date().toISOString();

        const entryData = {
            entryId,
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            phone,
            tier: `$${tier}`,
            tierAmount: tier,
            entryCount: entries || 1,
            status: 'pending',
            createdAt: now,
            paidAt: null,
            deletedAt: null,
            notes: ''
        };

        // Save to Firestore
        await db.collection('raffleEntries').doc(entryId).set(entryData);

        // Send Telegram notification to admin
        const token = functions.config().telegram?.bot_token;
        const adminChatId = functions.config().telegram?.chat_id;

        if (token && adminChatId) {
            const msg = `🎟️ *NEW RAFFLE ENTRY*\n\n` +
                `*Entry ID:* \`${entryId}\`\n` +
                `*Name:* ${escapeMd(firstName)} ${escapeMd(lastName)}\n` +
                `*Email:* ${escapeMd(email)}\n` +
                `*Phone:* ${escapeMd(phone)}\n\n` +
                `💰 *Tier:* $${tier} (${entries} entries)\n\n` +
                `⏳ *Status:* PENDING PAYMENT\n\n` +
                `_Waiting for Zelle payment confirmation..._`;

            await sendTelegramMessage(adminChatId, msg, token);
        }

        // Get updated stats
        const stats = await getRaffleStats();

        return res.status(200).json({
            success: true,
            entryId,
            message: "Entry submitted successfully",
            stats
        });

    } catch (error) {
        console.error("Error submitting raffle entry:", error);
        return res.status(500).json({ error: "Failed to submit entry" });
    }
});

/**
 * Get raffle statistics (public endpoint)
 */
exports.getRaffleStats = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    try {
        const stats = await getRaffleStats();
        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error getting raffle stats:", error);
        return res.status(500).json({ error: "Failed to get stats" });
    }
});

// Helper function to get raffle stats
async function getRaffleStats() {
    const snapshot = await db.collection('raffleEntries')
        .where('status', 'in', ['pending', 'paid'])
        .get();

    let totalEntries = 0;
    let paidEntries = 0;
    let pendingEntries = 0;
    let totalRevenue = 0;
    const participants = new Set();

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'paid') {
            totalEntries += data.entryCount || 1;
            paidEntries++;
            totalRevenue += data.tierAmount || 0;
        } else if (data.status === 'pending') {
            pendingEntries++;
        }
        participants.add(data.email);
    });

    return {
        totalEntries,
        paidEntries,
        pendingEntries,
        participants: participants.size,
        totalRevenue
    };
}

/**
 * Get all raffle entries (admin endpoint)
 */
exports.getAllRaffleEntries = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    try {
        const snapshot = await db.collection('raffleEntries')
            .orderBy('createdAt', 'desc')
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Don't include deleted entries
            if (data.status !== 'deleted') {
                entries.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        const stats = await getRaffleStats();

        return res.status(200).json({
            success: true,
            count: entries.length,
            entries,
            stats
        });
    } catch (error) {
        console.error("Error getting raffle entries:", error);
        return res.status(500).json({ error: "Failed to get entries" });
    }
});

/**
 * Update raffle entry status (admin endpoint)
 * POST { entryId, status: 'paid' | 'deleted', notes? }
 */
exports.updateRaffleEntry = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { entryId, status, notes } = req.body;

    if (!entryId || !status) {
        return res.status(400).json({ error: "Missing entryId or status" });
    }

    if (!['paid', 'pending', 'deleted'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Use 'paid', 'pending', or 'deleted'" });
    }

    try {
        const docRef = db.collection('raffleEntries').doc(entryId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Entry not found" });
        }

        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };

        if (status === 'paid') {
            updateData.paidAt = new Date().toISOString();
        } else if (status === 'deleted') {
            updateData.deletedAt = new Date().toISOString();
        }

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        await docRef.update(updateData);

        const stats = await getRaffleStats();

        return res.status(200).json({
            success: true,
            message: `Entry ${entryId} marked as ${status}`,
            stats
        });
    } catch (error) {
        console.error("Error updating raffle entry:", error);
        return res.status(500).json({ error: "Failed to update entry" });
    }
});

/**
 * Draw a random winner from paid entries (admin endpoint)
 */
exports.drawRaffleWinner = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    try {
        // Get all paid entries
        const snapshot = await db.collection('raffleEntries')
            .where('status', '==', 'paid')
            .get();

        if (snapshot.empty) {
            return res.status(400).json({ error: "No paid entries to draw from" });
        }

        // Build weighted entries array (more entries = more chances)
        const weightedEntries = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const count = data.entryCount || 1;
            for (let i = 0; i < count; i++) {
                weightedEntries.push({
                    entryId: doc.id,
                    ...data
                });
            }
        });

        // Random selection
        const randomIndex = Math.floor(Math.random() * weightedEntries.length);
        const winner = weightedEntries[randomIndex];

        // Send Telegram notification
        const token = functions.config().telegram?.bot_token;
        const adminChatId = functions.config().telegram?.chat_id;

        if (token && adminChatId) {
            const msg = `🏆🎉 *RAFFLE WINNER DRAWN!* 🎉🏆\n\n` +
                `*Winner:* ${escapeMd(winner.firstName)} ${escapeMd(winner.lastName)}\n` +
                `*Entry ID:* \`${winner.entryId}\`\n` +
                `*Email:* ${escapeMd(winner.email)}\n` +
                `*Phone:* ${escapeMd(winner.phone)}\n\n` +
                `💰 *Tier:* ${winner.tier} (${winner.entryCount} entries)\n\n` +
                `_Total entries in draw: ${weightedEntries.length}_`;

            await sendTelegramMessage(adminChatId, msg, token);
        }

        return res.status(200).json({
            success: true,
            winner: {
                entryId: winner.entryId,
                name: `${winner.firstName} ${winner.lastName}`,
                email: winner.email,
                phone: winner.phone,
                tier: winner.tier,
                entryCount: winner.entryCount
            },
            totalEntriesInDraw: weightedEntries.length
        });
    } catch (error) {
        console.error("Error drawing winner:", error);
        return res.status(500).json({ error: "Failed to draw winner" });
    }
});

