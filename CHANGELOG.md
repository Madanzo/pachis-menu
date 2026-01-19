# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dual Dispo MP4 videos for all 5 products (yellow, pink, purple, orange, teal)
- 4/20/26 release date messaging ("DROPS 4/20/26 🔥")
- Checkpoint system at `/checkpoints`
- Enhanced README with environment reproducibility section

### Changed
- Coming soon banner redesigned (horizontal instead of diagonal)
- README updated with Node v22+ requirement and third-party accounts

### Removed
- Vercel Analytics script (unused on Firebase hosting)
- Debug console.log statements from production code
- Empty `checkpoints/` directory (recreated with first checkpoint)
- Old `CHECKPOINT_2026-01-16.md`

## [1.0.0] - 2026-01-16
### Added
-   Initial release of Pachis Menu.
-   Shopping Cart functionality with persistent storage.
-   Age Verification overlay (21+).
-   Dual Dispo and Bundle pricing logic.
-   Telegram integration for automated order notifications.
-   Admin dashboard for viewing orders.
-   Mobile-first responsive design with "App-like" feel.
