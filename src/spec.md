# Specification

## Summary
**Goal:** Let the seller/admin review newly placed customer orders and explicitly accept or decline them, with updated order status shown to buyers.

**Planned changes:**
- Extend the backend `OrderStatus` to include `accepted` and `declined`, while keeping `checkout(...)` creating `pending` orders.
- Add admin-only backend APIs to (1) list all orders and (2) accept/decline a pending order, with clear English errors for non-admin access, missing orders, and invalid status transitions.
- Add frontend React Query hooks for admin order listing and accept/decline mutations, including cache invalidation/refresh for both admin orders and the buyer `['orders']` query.
- Add an admin-only “Order Management” section in `/admin` to view orders and accept/decline pending ones, with English success/error feedback and disabled duplicate submissions during mutation.
- Update buyer `/orders` status badge display/styling to support `accepted` and `declined` consistently.

**User-visible outcome:** Admins can go to `/admin` to see an Order Management list and accept or decline pending orders; buyers see their order status update to accepted or declined in “My Orders.”
