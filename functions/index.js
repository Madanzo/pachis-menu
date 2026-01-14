const functions = require("firebase-functions");
const fetch = require("node-fetch");

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

    const { cart, customer, totalItems } = req.body;

    if (!cart || !customer) {
        return res.status(400).json({ error: "Missing required data" });
    }

    // Get secrets from Firebase config
    const token = functions.config().telegram?.bot_token;
    const chatId = functions.config().telegram?.chat_id;

    if (!token || !chatId) {
        console.error("Missing Telegram config");
        return res.status(500).json({ error: "Server configuration error" });
    }

    // Format message
    let message = "🛒 *Pachis New Order!* 🚀\n\n";

    const grouped = {};
    cart.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach((category) => {
        message += `📦 *${category}*\n`;
        grouped[category].forEach((item) => {
            const sizeText = item.size ? ` (${item.size})` : "";
            const variantText = item.variant ? ` (${item.variant})` : "";
            message += `• ${item.name}${sizeText}${variantText} x${item.quantity}\n`;
        });
        message += "\n";
    });

    message += `*Total Items:* ${totalItems}\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━\n";
    message += "👤 *Customer Details*\n\n";
    message += `*Name:* ${customer.firstName} ${customer.lastName}\n`;
    message += `*Email:* ${customer.email}\n`;
    message += `*Location:* ${customer.city}, ${customer.state}\n`;
    message += `*Address:* ${customer.streetAddress}, ${customer.zipCode}, ${customer.country}\n`;
    message += "*Verified Status:* ✅ 21+ Confirmed\n";
    message += `*Time:* ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}\n`;

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "Markdown",
                }),
            }
        );

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || "Telegram API Error");
        }

        return res.status(200).json({ success: true, message: "Order sent successfully" });
    } catch (error) {
        console.error("Telegram Send Error:", error);
        return res.status(500).json({ error: "Failed to send order" });
    }
});
