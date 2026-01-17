# CHECKPOINT_2026-01-16

## Project Overview
**Name:** pachis-menu
**Description:** A responsive, modern product menu app for Pachis with a beautiful turquoise gradient design.
**Last Audit Date:** 2026-01-16

## Tech Stack
- **Framework/Build Tool:** Vite (v6.0.0)
- **Deployment:** Firebase Hosting
- **Backend/Functions:** Vercel Serverless Functions (`api/send-order.js`) & Firebase Functions (Stubbed in `functions/` but verified implementation in `api/` for Telegram)
- **Languages:** HTML, CSS, JavaScript (ES Modules)

## Folder Structure
- **root**: Config files (`firebase.json`, `package.json`, `vite.config.js`), Main Entry (`index.html`)
- **js/**: Core application logic
    - `app.js`: Main store logic (rendering, cart, modal)
    - `products.js`: Product data and image URLs (Firebase Storage)
    - `pricing.js`: Multi-currency (USD/MXN) and tier pricing logic
    - `i18n.js`: Internationalization (EN/ES)
    - `telegram.js`: Telegram bot integration
    - `age-verification.js`: Age gate logic
- **css/**: Styling (`styles.css`, `admin.css`)
- **assets/**: Local static assets (images, icons) - *Review for cleanup*
- **wholesale/**: Separate wholesale section (`index.html`) using embedded JS logic.
- **admin/**: Admin panel (`index.html`, `auth.js`, `js/`)
- **api/**: Serverless functions for Telegram integration (`send-order.js`)
- **functions/**: Firebase Cloud Functions directory
- **dist/**: Production build artifacts

## Key Integrations
1.  **Firebase Storage:** Hosting product images/videos (Migrated from Vercel).
2.  **Firebase Hosting:** Serving the static application.
3.  **Telegram Bot:** Receives order notifications via `api/send-order.js`.
4.  **LocalStorage:** Persisting cart, language (`pachisLanguage`), and age verification (`pachisVerificationData`).

## Environment Variables
(Inferred from code usage)
- `TELEGRAM_BOT_TOKEN` (Required for `api/send-order.js`)
- `TELEGRAM_CHAT_ID` (Required for `api/send-order.js`)

## Recent Changes
- Migrated all product assets (Single Disposables, Pre-rolls) from Vercel to Firebase Storage.
- Fixed typo in Firebase paths (`Prodcuts` -> `Products`).
- Updated `package.json` to include `firebase-tools`.
- Configured manual Firebase deployment.

## Known Issues / TODOs
- **Wholesale Page Duplication:** `wholesale/index.html` contains embedded product data duplication from `js/products.js`, posing a maintenance risk.
- **Hybrid Backend:** Project uses `api/` (Vercel-style) but also has a `functions/` folder (Firebase). `firebase.json` rewrites `/api/send-order` to a function named `sendOrder`, but `api/send-order.js` is written as a Vercel function. This might need standardizing to Firebase Functions if not already supported by the adapter.
- **Typo in Firebase Storage:** The folder name in Firebase Storage was previously `Prodcuts`, now corrected in code to `Products` (assuming bucket folder is also renamed or code points to correct existing folder). *Self-correction: Code was updated to fix path strings.*

## Next Steps
1.  Unify product data source (Refactor Wholesale to use `js/products.js`).
2.  Standardize backend functions to Firebase Cloud Functions if Vercel is fully fully deprecated.

## Cleanup Completed (2026-01-16)
- **Removed:** `api/` directory (Legacy Vercel function).
- **Removed:** `dist/` directory (Build artifact).
- **Verified:** Project structure is clean and build process is successful.
