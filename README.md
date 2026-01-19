# Pachis Menu

A responsive, modern product menu app for Pachis with a beautiful turquoise gradient design, featuring a shopping cart, age verification, and Telegram integration for orders.

## Quick Start

### Prerequisites
- **Node.js**: v22+ (check with `node -v`)
- **npm**: v10+ (check with `npm -v`)
- **Firebase CLI**: `npm install -g firebase-tools`

### Setup
```bash
# Clone the repository
git clone https://github.com/Madanzo/pachis-menu.git
cd pachis-menu

# Install dependencies
npm install
cd functions && npm install && cd ..

# Start development server
npm run dev
```

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Firebase (requires login)
firebase login
firebase deploy
```

## Features

- **Responsive Design**: Adapts seamlessly to desktop, tablet, and mobile
- **Dynamic Categories**: Disposable, Dual Dispo, Live Rosin, Pre-Rolls, Flower, Apparel
- **Shopping Cart**: Full cart functionality with persistent storage
- **Age Verification**: Overlay ensuring compliance (21+)
- **Telegram Integration**: Orders sent directly to admin bot
- **Admin Dashboard**: View orders and customers at `/admin`
- **Localization**: English (USA) and Spanish (Mexico)
- **Multi-Currency**: USD and MXN pricing with bundle tiers

## Environment Setup

### Required Third-Party Accounts
| Service | Purpose | Setup Link |
|---------|---------|------------|
| Firebase | Hosting, Functions, Firestore | [console.firebase.google.com](https://console.firebase.google.com) |
| Telegram Bot | Order notifications | [@BotFather](https://t.me/botfather) |

### Environment Variables
Copy `.env.example` and configure Firebase Functions:
```bash
firebase functions:config:set telegram.bot_token="YOUR_BOT_TOKEN"
firebase functions:config:set telegram.chat_id="YOUR_CHAT_ID"
```

### Dependency Lock
Always commit `package-lock.json`. To verify dependencies:
```bash
npm ci              # Clean install from lockfile
npm audit           # Check for vulnerabilities
```

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [DECISIONS.md](./DECISIONS.md) | Technical decisions (ADR) |
| [TODO.md](./TODO.md) | Backlog and roadmap |
| [checkpoints/](./checkpoints/) | Project snapshots |

## Project Structure

```
pachis-menu/
├── js/           # Core modules (app, cart, products, pricing, i18n)
├── css/          # Styles
├── functions/    # Firebase Cloud Functions
├── admin/        # Admin dashboard
├── wholesale/    # Wholesale portal
├── checkpoints/  # Project snapshots
└── dist/         # Build output (gitignored)
```

## License

© 2026 Pachis. All rights reserved.
