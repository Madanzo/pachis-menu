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

    // Store order in Firestore
    try {
        await db.collection('orders').doc(orderId).set({
            orderId,
            cart,
            customer,
            totalItems,
            orderTotal: orderTotal || "N/A", // Handle undefined from old clients
            createdAt: orderDate,
            status: 'pending',
            telegramConnected: false
        });
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

        // Return success with Order ID
        return res.status(200).json({
            success: true,
            message: "Order sent successfully",
            orderId: orderId
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
