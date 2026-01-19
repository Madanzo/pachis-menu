# Project Checkpoint - 2026-01-19

## ✅ Cleanup Completed

| Item Removed | Details |
|--------------|---------|
| Vercel Analytics script | Removed from `index.html` (unused - Firebase hosted) |
| Console.log statements | Removed 4 debug logs from `js/app.js` |
| Empty `checkpoints/` dir | Deleted |
| `CHECKPOINT_2026-01-16.md` | Old checkpoint deleted |

---

## Project Overview
**Name:** Pachis Menu  
**Description:** A responsive, modern product menu app for Pachis with beautiful turquoise gradient design. Features age verification, multi-currency pricing (USD/MXN), bilingual support (EN/ES), and Telegram order integration.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vanilla JS (ES Modules) | ES6+ |
| Build | Vite | 6.0.0 |
| Hosting | Firebase Hosting | - |
| Backend | Firebase Cloud Functions | Node 22 |
| Database | Firestore | - |
| Styling | Vanilla CSS | - |

### Dependencies
**Root (`package.json`):**
- `vite` ^6.0.0 (dev)
- `firebase-tools` ^15.3.1 (dev)

**Functions (`functions/package.json`):**
- `firebase-functions` ^4.0.0
- `firebase-admin` ^11.0.0
- `node-fetch` ^2.6.7

---

## Folder Structure

```
pachis-menu/
├── admin/              # Admin dashboard (1 file)
├── checkpoints/        # (empty)
├── css/
│   └── styles.css      # Main stylesheet (26KB)
├── dist/               # Build output (gitignored)
├── functions/          # Firebase Cloud Functions
│   ├── index.js        # 6 endpoints
│   └── package.json
├── js/
│   ├── app.js          # Main app (22KB)
│   ├── cart.js         # Cart logic (11KB)
│   ├── i18n.js         # Translations (14KB)
│   ├── pricing.js      # Multi-currency/tiered pricing (12KB)
│   ├── products.js     # Product database (17KB)
│   └── utils.js        # Utilities (0.3KB)
├── wholesale/          # Wholesale portal (1 file)
├── index.html          # Main entry (12KB)
├── firebase.json       # Firebase config
├── vite.config.js      # Build config
└── package.json
```

---

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main SPA entry, age verification modal |
| `js/app.js` | Core app logic, routing, CRM integration |
| `js/products.js` | Product catalog with all specs |
| `js/pricing.js` | USD/MXN pricing, bundle tiers |
| `js/cart.js` | Shopping cart, Telegram order submission |
| `js/i18n.js` | English/Spanish translations |
| `functions/index.js` | 6 Cloud Functions (orders, CRM, webhook) |
| `css/styles.css` | Full styling with neumorphic design |

---

## Environment Variables

| Variable | Location |
|----------|----------|
| `TELEGRAM_BOT_TOKEN` | Firebase Functions config |
| `TELEGRAM_CHAT_ID` | Firebase Functions config |

---

## Integrations

| Service | Purpose |
|---------|---------|
| **Firebase Hosting** | Static file hosting |
| **Firebase Functions** | Backend API (6 endpoints) |
| **Firestore** | Orders + Customers database |
| **Telegram Bot API** | Order notifications + customer chat |
| **Firebase Storage** | Product images/videos (MP4s) |

### Cloud Functions Endpoints
1. `sendOrder` - Submit order to Telegram + Firestore
2. `telegramWebhook` - Handle customer bot interactions
3. `saveCustomer` - CRM: save/update customer
4. `lookupCustomer` - CRM: find by email
5. `getAllCustomers` - Admin: list all customers
6. `getAllOrders` - Admin: list all orders

---

## Database Schema

### `orders` Collection
```
{orderId}: {
  orderId: string,
  cart: array,
  customer: object,
  totalItems: number,
  orderTotal: string,
  createdAt: timestamp,
  status: 'pending' | 'confirmed' | 'shipped',
  telegramConnected: boolean,
  telegramChatId?: string
}
```

### `customers` Collection
```
{email}: {
  firstName, lastName, email, phone,
  streetAddress, city, state, zipCode, country,
  ageConfirmed: boolean,
  createdAt, updatedAt: timestamp
}
```

---

## Recent Changes (2026-01-19)

- ✅ Added MP4 videos for all 5 Dual Dispo products
- ✅ Added 4/20/26 release date messaging ("DROPS 4/20/26 🔥")
- ✅ Redesigned coming soon banner (horizontal vs diagonal)
- ✅ Created `.env.example` for documentation
- ✅ Added `ARCHITECTURE.md`, `CHANGELOG.md`, `DECISIONS.md`, `TODO.md`

---

## Known Issues / TODOs

From `TODO.md`:
- [ ] Image optimization (convert to WebP)
- [ ] Better error handling for API failures
- [ ] Dynamic SEO meta tags per category
- [ ] Product search functionality
- [ ] Favorites feature
- [ ] Order tracking page
- [ ] Crypto payment integration
- [ ] Move products to Firestore (currently hardcoded)
- [ ] Add Jest tests for pricing logic
- [ ] CI/CD with GitHub Actions

---

## Next Steps Planned

1. **Dual Dispo Launch** - Products go live 4/20/26
2. **Admin Dashboard** - Enhance with order management
3. **SEO Optimization** - Meta tags, structured data
4. **Performance** - WebP images, lazy loading
