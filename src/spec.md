# Specification

## Summary
**Goal:** Let the currently signed-in user self-promote to admin one time (only if no admin exists yet) so they can access admin-gated Product Management.

**Planned changes:**
- Add a backend admin bootstrap method that promotes the authenticated caller to admin only when no admin has been set up yet, returning a clear success/failure result (or a clear English error).
- Add a frontend CTA for signed-in non-admin users (reachable from the existing non-admin experience such as the /admin access-restricted page and/or account menu) to trigger the admin bootstrap action and display success/error feedback in English.
- Refresh/invalidate cached auth/role state on the frontend immediately after the bootstrap completes so admin-gated navigation and /admin access update within the same session.

**User-visible outcome:** A signed-in non-admin user can click a “become admin” action (only available when they are not admin); if no admin exists they become an admin and immediately see/admin-access Product Management without a full page refresh, otherwise they see a clear English error explaining an admin already exists.
