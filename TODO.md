# Todo / Backlog

## High Priority
- [ ] **Image Optimization**: Convert all static assets to WebP.
- [ ] **Error Handling**: Improve UI feedback when API calls fail (e.g., net drop).
- [ ] **SEO**: Add unique meta tags per category view (dynamic updating).

## Features
- [ ] **Product Search**: Precise lookup bar.
- [ ] **Favorites**: "Heart" items to save for later.
- [ ] **Order Tracking**: Status page for users to check order progress.
- [ ] **Crypto Payment Integration**: Auto-generate wallet addresses.

## Technical Debt
- [ ] **Refactor**: Move hardcoded `products` array to Firestore db (fetch on load).
- [ ] **CI/CD**: Github Action to auto-deploy on merge to main.

## Testing (Planned)
- [ ] **Smoke Tests**: Verify app builds and critical routes load.
- [ ] **API Tests**: Integration tests for webhook endpoints.
- [ ] **Unit Tests**: Jest tests for `pricing.js` logic.

## Completed ✅
- [x] **Checkpoint System**: `/checkpoints` folder with periodic snapshots.
- [x] **Documentation**: README, ARCHITECTURE, CHANGELOG, DECISIONS.
- [x] **Cleanup**: Remove debug logs, unused scripts.
