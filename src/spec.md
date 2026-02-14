# Specification

## Summary
**Goal:** Add a simplified 3-step checkout flow (address → review → payment) from the cart and display all prices in INR across the storefront and orders.

**Planned changes:**
- Update the Cart page CTA to start a new checkout experience instead of immediately placing an order.
- Add Step 1 (Address): a delivery address form (full name, mobile number, pincode, address line 1, optional address line 2, optional landmark, city, state) that must be validated and saved before continuing.
- Add Step 2 (Review): show the saved address and a full cart summary (items, quantities, unit prices, line totals, and order total), with Back navigation to the address step without losing the saved address.
- Add Step 3 (Payment): require selecting a payment option (e.g., Cash on Delivery and/or UPI (demo)) and provide “Pay & Place Order” to create the order and navigate to `/order-confirmation/$orderId` without any real payment gateway integration.
- Extend backend order creation to persist the delivery address and chosen payment option on the order record, and return a clear English error when attempting checkout with an empty cart.
- Update price formatting throughout product cards, product details, cart, checkout, and orders list to use INR (₹) and remove “$” formatting.
- Add/adjust TanStack Router routes and navigation for checkout while keeping `/cart` and `/order-confirmation/$orderId` working, and ensure checkout requires sign-in.

**User-visible outcome:** Users can proceed from cart through a 3-step English checkout (save address, review order, choose payment) and place an order, while seeing all prices displayed in INR (₹) across the app.
