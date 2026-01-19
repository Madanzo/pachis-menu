# Cleanup Candidates - 2026-01-19

This document lists files and code that may be candidates for removal or cleanup. **Do not delete without confirmation.**

---

## 1. Unused Dependencies
✅ **No unused dependencies found.** All packages in `package.json` are actively used.

---

## 2. Debug/Console Logs in Production

| File | Line | Code |
|------|------|------|
| `js/app.js` | 7 | `console.log('App module loaded');` |
| `js/app.js` | 366 | `console.log('Region set to:', region);` |
| `js/app.js` | 395 | `console.log('Customer saved to CRM');` |
| `js/app.js` | 508 | `console.log('Region updated to:', region);` |

**Recommendation:** Remove or wrap in `if(DEBUG)` for production builds.

---

## 3. Empty Directories

| Directory | Status |
|-----------|--------|
| `checkpoints/` | Empty - can be removed or used |

---

## 4. Old Checkpoint File

| File | Notes |
|------|-------|
| `CHECKPOINT_2026-01-16.md` | Previous checkpoint, can be archived or deleted |

---

## 5. Deprecated/Outdated Files
✅ **No old backups found** (no `*_old.js`, `*_backup.js`, `*.bak` files)

---

## 6. Build Artifacts (already gitignored)
- `dist/` - Build output ✅ gitignored
- `.firebase/` - Deploy cache ✅ gitignored
- `node_modules/` - Dependencies ✅ gitignored
- `functions/node_modules/` - Functions deps ✅ gitignored

---

## 7. Potential Code Cleanup

### Vercel Insights Script (Unused)
In `index.html`, there's a reference to Vercel Insights:
```html
<script src="/_vercel/insights/script.js"></script>
```
**Status:** This is inactive since hosting is on Firebase, not Vercel. Can be removed.

---

## 8. CSS Compatibility Warning (Non-Critical)

| File | Line | Issue |
|------|------|-------|
| `css/styles.css` | 322 | Missing standard `mask` property (only has `-webkit-mask`) |

**Impact:** Minor - affects edge case browsers. Low priority.

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Console logs | 4 | Remove for production |
| Empty directories | 1 | Remove `checkpoints/` |
| Old checkpoints | 1 | Archive or delete |
| Unused scripts | 1 | Remove Vercel script |
| Unused dependencies | 0 | None |
| Backup files | 0 | None |

### Estimated Space Savings
- ~4KB (old checkpoint file)
- ~0 bytes (checkpoints folder)
- Negligible code reduction

### Files Flagged for Manual Review
- None - all candidates are safe to remove

---

## Awaiting Confirmation

Please confirm which items to proceed with:
- [ ] Remove console.log statements from `js/app.js`
- [ ] Remove empty `checkpoints/` directory
- [ ] Delete old `CHECKPOINT_2026-01-16.md`
- [ ] Remove Vercel insights script from `index.html`
