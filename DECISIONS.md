# Architectural Decisions Records (ADR)

## 001. Use of Vanilla JavaScript over Frameworks
**Date:** 2026-01-16
**Status:** Accepted

### Context
The project requires a fast, lightweight, and highly distinct visual experience ("wow" factor) for a product menu.

### Decision
We chose to use Vanilla JavaScript (ES Modules) and plain CSS instead of a framework like React or Next.js for the main menu.

### Consequences
-   **Pros**:
    -   Zero bundle size overhead for framework runtime.
    -   Direct DOM manipulation allows for specific, high-performance animations.
    -   Easier to debug simply by looking at the source.
-   **Cons**:
    -   State management requires manual DOM updates (boilerplate).
    -   Component reusability is lower compared to React.

## 002. Persistent State via LocalStorage
**Date:** 2026-01-16
**Status:** Accepted

### Decision
Cart data and User Verification status are stored in the browser's `localStorage`.

### Consequences
-   **Pros**: No login required for persistence; user can close tab and return.
-   **Cons**: Data is tied to the specific device/browser.

## 003. Telegram as Admin Interface
**Date:** 2026-01-16
**Status:** Accepted

### Decision
Instead of building a complex admin order management system immediately, we use Telegram for real-time order notifications.

### Consequences
-   **Pros**: Instant notifications, zero-friction for admins on mobile.
-   **Cons**: Harder to manage historical metrics (solved partially by Firestore backup).
