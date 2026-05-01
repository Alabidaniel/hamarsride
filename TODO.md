# HamarsRide - Improvement Roadmap

This document tracks all planned and completed improvements for the HamarsRide food delivery platform.

## Legend

- [x] ✅ COMPLETED
- [ ] 🚧 IN PROGRESS
- [ ] ⏳ PLANNED

---

## Phase 1: Security Enhancements (URGENT)

### 1.1 Admin Audit Logging

- [x] Create audit log utility (`src/utils/auditLog.js`)
- [x] Track all admin CRUD operations
- [ ] Create audit log Prisma model
- [ ] Add admin activity dashboard UI
- [ ] Setup automatic audit report generation

### 1.2 Enhanced Authentication

- [ ] Implement JWT token refresh mechanism
- [ ] Add session management (logout all devices)
- [ ] Add two-factor authentication support
- [ ] Implement account lockout after failed attempts

### 1.3 Input Validation & Sanitization

- [x] Create server-side password policy (`src/utils/PasswordPolicy.js`)
- [ ] Add request sanitization middleware
- [ ] Implement SQL injection prevention
- [ ] Add rate limiting per-user basis

### 1.4 API Security

- [ ] Add request signing for critical endpoints
- [ ] Implement API versioning
- [ ] Add IP-based access control for admin routes
- [ ] Setup request/response encryption

---

## Phase 2: Business Logic Improvements

### 2.1 One Restaurant Per Order

- [x] Updated cart routes to enforce single restaurant
- [x] Added restaurant mismatch error handling
- [ ] Add clear cart + add item from different restaurant flow
- [ ] Add "switch restaurant" UI prompt

### 2.2 Enhanced Pricing System

- [x] Added discountPercentage to MenuItem
- [x] Added baseDeliveryFee to Restaurant
- [x] Server-side price calculation
- [ ] Add promotional codes/coupons
- [ ] Add bulk pricing discounts
- [ ] Add surge pricing for peak hours

### 2.3 Order Management

- [x] Added restaurantId to Order
- [x] Added estimatedDeliveryTime
- [x] Added rating/review fields
- [ ] Add order tracking API
- [ ] Add rider assignment system
- [ ] Add order modification (before processing)

### 2.4 Restaurant & Menu Management

- [x] Created admin restaurant CRUD routes
- [x] Created admin menu item routes
- [x] Added soft delete for restaurants/menu items
- [x] Added isFeatured, isActive flags
- [ ] Add restaurant operating hours
- [ ] Add menu item categories management

---

## Phase 3: API Enhancements

### 3.1 Search Functionality

- [x] Created global search endpoint (`/api/search`)
- [x] Search restaurants and menu items
- [ ] Add search suggestions/autocomplete
- [ ] Add popular searches
- [ ] Add search analytics

### 3.2 Enhanced Pagination

- [ ] Add cursor-based pagination for large datasets
- [ ] Add total count without full scan
- [ ] Implement infinite scroll API support

### 3.3 New API Endpoints

- [ ] GET /api/restaurants/featured - Featured restaurants
- [ ] GET /api/restaurants/nearby - Nearby restaurants
- [ ] GET /api/menu/categories - All menu categories
- [ ] GET /api/orders/tracking/:id - Order tracking
- [ ] POST /api/orders/:id/rate - Rate order

---

## Phase 4: Frontend Improvements

### 4.1 User Experience

- [ ] Add loading states for all async operations
- [ ] Add optimistic UI updates for cart
- [ ] Add pull-to-refresh functionality
- [ ] Add skeleton loading states
- [ ] Improve error handling UI

### 4.2 Admin Dashboard

- [ ] Add restaurant management UI
- [ ] Add menu item management UI
- [ ] Add analytics dashboard
- [ ] Add audit logs viewer
- [ ] Add settings page

### 4.3 Performance

- [ ] Implement image lazy loading
- [ ] Add service worker for caching
- [ ] Implement code splitting
- [ ] Add bundle optimization

---

## Phase 5: Infrastructure & Scaling

### 5.1 Database Optimizations

- [ ] Add database indexes
- [ ] Implement query caching
- [ ] Add read replicas support
- [ ] Add database connection pooling

### 5.2 Caching Strategy

- [ ] Implement Redis caching
- [ ] Cache restaurant data
- [ ] Cache menu items (with invalidation)
- [ ] Add API response caching

### 5.3 Monitoring & Logging

- [ ] Add application monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Add performance metrics
- [ ] Create automated alerts

### 5.4 Deployment

- [ ] Setup CI/CD pipeline
- [ ] Add container orchestration
- [ ] Implement blue-green deployment
- [ ] Add automatic rollback

---

## Completed Files

### Backend Files Created/Modified

1. ✅ `src/utils/auditLog.js` - Admin audit logging
2. ✅ `src/routes/adminRestaurantRoutes.js` - Restaurant CRUD
3. ✅ `src/routes/adminMenuItemRoutes.js` - Menu item CRUD
4. ✅ `src/routes/cartRoutes.js` - One restaurant per order
5. ✅ `src/routes/searchRoutes.js` - Global search
6. ✅ `src/utils/PasswordPolicy.js` - Password validation
7. ✅ `src/app.js` - Route registration
8. ✅ `prisma/migrations/20260410000000_add_audit_log_and_enhanced_fields/` - Database migration

---

## Backlog / Deferred

### Future Features - No Timeline

- [ ] Real-time order tracking with WebSocket
- [ ] Push notifications
- [ ] In-app chat support
- [ ] Loyalty points system
- [ ] Subscription/membership
- [ ] Multi-vendor orders
- [ ] Scheduled orders
- [ ] Gift cards

---

## Notes

- This TODO should be updated with each completed task
- Priority order: Phase 1 > Phase 2 > Phase 3 > Phase 4 > Phase 5
- Security issues are marked URGENT and should be addressed first
- Frontend improvements depend on backend API readiness
