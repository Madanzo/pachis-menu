export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cart, customer, totalItems } = req.body;

    if (!cart || !customer) {
        return res.status(400).json({ error: 'Missing required data' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.error('Missing Telegram Environment Variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Format the message
    let message = '🛒 *Pachis New Order!* 🚀\n\n';

    // Group items by category for cleaner reading
    const grouped = {};
    cart.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach(category => {
        message += `📦 *${category}*\n`;
        grouped[category].forEach(item => {
            const sizeText = item.size ? ` (${item.size})` : '';
            message += `• ${item.name}${sizeText} x${item.quantity}\n`;
        });
        message += '\n';
    });

    message += `*Total Items:* ${totalItems}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━\n';
    message += '👤 *Customer Details*\n\n';
    message += `*Name:* ${customer.firstName} ${customer.lastName}\n`;
    message += `*Email:* ${customer.email}\n`;
    message += `*Location:* ${customer.city}, ${customer.state}\n`;
    message += `*Address:* ${customer.streetAddress}, ${customer.zipCode}, ${customer.country}\n`;
    message += `*Verified Status:* ✅ 21+ Confirmed\n`;
    message += `*Time:* ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`; // Default to EST or use UTC

    try {
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'Telegram API Error');
        }

        return res.status(200).json({ success: true, message: 'Order sent successfully' });

    } catch (error) {
        console.error('Telegram Send Error:', error);
        return res.status(500).json({ error: 'Failed to send order to Telegram' });
    }
}
