# Specification

## Summary
**Goal:** Add admin-only inventory (stock) management per product and enforce stock limits across cart and checkout.

**Planned changes:**
- Extend the backend Product model to persist an integer stock quantity (non-negative) and expose it in existing product read APIs.
- Add admin-only backend endpoints to set/update product stock with clear authorization and not-found error handling.
- Enforce inventory limits in backend cart updates and checkout, returning clear English errors that include the available quantity; decrement stock on successful checkout without allowing stock to go below zero.
- Add upgrade-safe handling/migration so existing products receive a deterministic default stock value after canister upgrades.
- Add React Query hooks for stock-aware product fetching and admin stock updates, including cache invalidation/refetch after updates.
- Add an admin-only “Stock” section in the existing admin page to view and update stock per product with pending-state controls and clear success/error feedback.
- Update customer-facing Product Details, Cart, and Checkout UI to prevent exceeding stock and display clear English messages that include the available quantity.

**User-visible outcome:** Admins can view and update per-product stock quantities from the admin area, and customers are prevented from adding/buying quantities above available stock with clear messages showing current in-stock amounts.
