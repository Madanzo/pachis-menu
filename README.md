# Pachis Menu

A responsive, modern product menu app for Pachis with a beautiful turquoise gradient design, featuring a shopping cart, age verification, and Telegram integration for orders.

## Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd pachis-menu
    ```
2.  Install dependencies:
    ```bash
    npm install
    cd functions && npm install && cd ..
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Features

-   **Responsive Design**: Adapts seamlessly to desktop, tablet, and mobile.
-   **Dynamic Categories**: Browsable categories (Disposable, Dual Dispo, Live Rosin, etc.) with region-specific content.
-   **Shopping Cart**: Full cart functionality with persistent storage.
-   **Age Verification**: Overlay ensuring compliance (21+).
-   **Telegram Integration**: Orders are sent directly to a Telegram admin bot.
-   **Admin Dashboard**: Basic view of orders and customers (hosted at `/admin`).
-   **Localization**: Support for English (USA) and Spanish (Mexico) based on user location.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the system components and data flow.

## Deployment

### Firebase Hosting & Functions

1.  Login to Firebase:
    ```bash
    firebase login
    ```
2.  Build the project:
    ```bash
    npm run build
    ```
3.  Deploy:
    ```bash
    firebase deploy
    ```

## Environment Variables

See [.env.example](./.env.example) for required keys (primarily for Firebase Functions).

## Documentation

-   [Architecture](./ARCHITECTURE.md)
-   [Changelog](./CHANGELOG.md)
-   [Decisions](./DECISIONS.md)
-   [Todo](./TODO.md)

## License

© 2026 Pachis. All rights reserved.
