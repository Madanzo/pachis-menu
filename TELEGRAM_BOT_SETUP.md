# Telegram Bot Setup Instructions

## Your Bot Information

**Bot Token:** `8246598880:AAF6qK7x60AuJIFb0snmtJcDUM219tEHBSw`

⚠️ **IMPORTANT:** Keep this token SECRET! Anyone with this token can control your bot.

---

## Setting Up the Bot to Receive Orders

You need to create a simple script that will receive orders from the menu and forward them to you on Telegram.

### Option 1: Using Python (Simplest)

1. **Install Python** (if not already installed): https://www.python.org/downloads/

2. **Create a file called `bot.py`** with this content:

```python
import asyncio
from telegram import Update
from telegram.ext import Application, MessageHandler, filters

# Your bot token
BOT_TOKEN = "8246598880:AAF6qK7x60AuJIFb0snmtJcDUM219tEHBSw"

# Your Telegram user ID (you'll get this from the bot)
YOUR_CHAT_ID = None  # Will be set automatically

async def handle_web_app_data(update: Update, context):
    """Handle data from Web App"""
    global YOUR_CHAT_ID

    # Save your chat ID on first message
    if YOUR_CHAT_ID is None:
        YOUR_CHAT_ID = update.effective_user.id
        print(f"Your Chat ID: {YOUR_CHAT_ID}")

    # Get the order data from Web App
    web_app_data = update.effective_message.web_app_data

    if web_app_data:
        import json
        order_data = json.loads(web_app_data.data)

        # Format and send order confirmation
        message = order_data['message']
        await update.message.reply_text(
            f"✅ Order Received!\n\n{message}",
            parse_mode='Markdown'
        )

async def main():
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()

    # Add handler for Web App data
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))

    # Start the bot
    print("Bot is running... Press Ctrl+C to stop")
    await application.run_polling()

if __name__ == '__main__':
    asyncio.run(main())
```

3. **Install required library:**
```bash
pip install python-telegram-bot
```

4. **Run the bot:**
```bash
python bot.py
```

5. **Keep it running** - The bot needs to be running to receive orders!

---

### Option 2: Using Node.js

1. **Install Node.js**: https://nodejs.org/

2. **Create `bot.js`:**

```javascript
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = '8246598880:AAF6qK7x60AuJIFb0snmtJcDUM219tEHBSw';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Handle Web App data
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);

  // Send order confirmation
  await bot.sendMessage(chatId, `✅ Order Received!\n\n${data.message}`, {
    parse_mode: 'Markdown'
  });

  console.log('Order received:', data);
});

console.log('Bot is running...');
```

3. **Install library:**
```bash
npm install node-telegram-bot-api
```

4. **Run:**
```bash
node bot.js
```

---

### Option 3: Deploy to Cloud (Always Running)

For a production setup, deploy the bot to a cloud service:

**Free Options:**
- **Heroku** (Free tier)
- **Railway** (Free tier)
- **Replit** (Free tier)
- **Glitch** (Free tier)

I can help you set this up if needed!

---

## Setting Up the Web App Link

After your bot is running:

1. **Open Telegram** and search for **@BotFather**

2. **Send command:** `/newapp`

3. **Select your bot**

4. **Enter details:**
   - **Title:** Pachis Menu
   - **Description:** Order from Pachis
   - **Photo:** Upload your logo (optional)
   - **Short name:** pachis-menu (lowercase, no spaces)
   - **Web App URL:** Your deployed Vercel URL (e.g., `https://pachis-menu.vercel.app`)

5. **Get the link:** BotFather will give you a link like `https://t.me/your_bot_name/pachis-menu`

6. **Share this link** with your customers!

---

## How Customers Will Use It

1. Customer clicks your bot link
2. Telegram opens with your menu
3. Customer adds items to cart
4. Clicks "Send to Telegram"
5. Order arrives in your bot chat instantly! ✅

---

## Troubleshooting

**Bot not receiving orders?**
- Make sure the bot script is running
- Check the bot token is correct
- Make sure Web App URL is set in BotFather

**Need help?**
Let me know and I'll help you set it up!

---

## Security Notes

- ✅ Never share your bot token publicly
- ✅ Store token in environment variables in production
- ✅ Only you will receive the orders
- ✅ Customer data is secure
