# System Architecture

Pachis Menu is a serverless web application built with a "Vanilla Plus" approach, utilizing modern standard web technologies hosted on Firebase.

## High-Level Overview

```mermaid
graph TD
    User[User Device] -->|HTTPS| CDN[Firebase Hosting]
    CDN -->|Serves| Client[Single Page App (Vite)]
    
    subgraph Client Application
        Router[Navigation Logic]
        Store[Local Storage]
        UI[Vanilla JS DOM Manipulation]
    end
    
    Client -->|API Calls| API[Firebase Cloud Functions]
    
    subgraph Backend
        API -->|Read/Write| DB[(Firestore)]
        API -->|Webhook| TG[Telegram Bot API]
    end
```

## detailed Components

### Frontend (Client)
-   **Build Tool**: Vite (Lightning fast dev server and optimized builds).
-   **Language**: Vanilla JavaScript (ES Modules). No heavy framework overhead.
-   **Styling**: Pure CSS with Variables (`:root`) for theming.
-   **State Management**: `localStorage` used for:
    -   Cart state (`pachis-cart`)
    -   Age verification (`pachisAgeVerified`)
    -   User settings/region (`pachisVerificationData`)
-   **Routing**: Simple hash-based or tab-based navigation within a single HTML page structure, with separate HTML files for specific sections like `admin/`.

### Backend (Serverless)
-   **Platform**: Firebase Cloud Functions (1st Gen).
-   **Runtime**: Node.js.
-   **Endpoints**:
    -   `sendOrder`: Receives cart data, saves to Firestore, and pushes notification to Telegram.
    -   `saveCustomer`: CRM endpoint to store user contact info.
    -   `telegramWebhook`: Handles two-way communication from Telegram admins.

### Database
-   **Firestore**: NoSQL document database.
    -   `orders` collection: Stores full order history.
    -   `customers` collection: Stores user details for CRM.

## Directory Structure

-   `/js`: Core logic modules (`app.js`, `cart.js`, `products.js`, `pricing.js`).
-   `/css`: Global styles.
-   `/functions`: Backend code.
-   `/admin`: Separate admin dashboard application.
-   `/wholesale`: Separate wholesale portal.

## Data Flow

1.  **Product Loading**: Hardcoded `products` array in `products.js` (Server-side rendering not currently used for products).
2.  **Order Placement**:
    -   User adds items -> `localStorage` updates.
    -   User clicks "Send Order" -> `POST /api/send-order`.
    -   Function validates -> Saves to Firestore -> Sends Telegram msg.
3.  **CRM**:
    -   Age Verification form -> `POST /saveCustomer` -> Firestore.
