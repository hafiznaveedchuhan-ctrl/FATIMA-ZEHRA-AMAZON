# Feature Specification: Fatima Zehra Amazon Shop

**Feature Branch**: `001-amazon-shop`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: Full-stack e-commerce platform with Amazon-like UI, 4 FastAPI microservices, Neon DB, JWT auth, Stripe payments, OpenAI chat

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - User Registration & Account Creation (Priority: P1)

User wants to create a new account on Fatima Zehra Amazon Shop to start shopping. They provide name, email, password, and receive immediate confirmation that their account is created successfully.

**Why this priority**: Account creation is the foundation of the entire platform. No shopping, orders, or personalization is possible without accounts.

**Independent Test**: Fully testable with just signup/login flows. User can create account → see success message → login with credentials → access their profile.

**Acceptance Scenarios**:

1. **Given** user is on the signup page, **When** they fill in valid name/email/password and click "Create Account", **Then** account is created in the database AND "Account Created Successfully!" message appears
2. **Given** user has created an account, **When** they click "Sign In" and enter correct credentials, **Then** they are logged in AND redirected to homepage
3. **Given** user enters invalid credentials on login, **When** they click "Sign In", **Then** error message "Invalid email or password" appears AND form stays on login page (no redirect)
4. **Given** user is logged in, **When** they visit /profile, **Then** their account details are displayed from database
5. **Given** an email already exists, **When** user tries to register with same email, **Then** error "Email already exists" is shown

---

### User Story 2 - Browse Products & Search (Priority: P1)

User wants to discover products on the platform. They can view a grid of products, search by keyword, filter by category, and sort by price or rating. All product data comes from the database (50+ seeded products).

**Why this priority**: Core e-commerce feature. Without browsing and discovery, users cannot place orders. This enables the entire shopping experience.

**Independent Test**: Can be tested by seeding 50 products → browsing homepage → using search/filters → verifying correct products appear.

**Acceptance Scenarios**:

1. **Given** user is on homepage, **When** page loads, **Then** featured products are displayed in a grid with images, names, prices, and ratings (all from Neon DB)
2. **Given** user is on /products, **When** they enter a search term, **Then** products matching that keyword appear
3. **Given** products are displayed, **When** user selects a category filter, **Then** only products in that category are shown
4. **Given** products are displayed, **When** user sorts by "Price: Low to High", **Then** products are reordered by price from lowest to highest
5. **Given** user clicks on a product, **When** product detail page loads, **Then** full description, images, rating, and "Add to Cart" button appear

---

### User Story 3 - Shopping Cart & Checkout (Priority: P1)

User adds products to their cart, reviews the cart, and proceeds to checkout. Cart data persists in the database. During checkout, they see the Stripe fake payment form (test mode with 4242 card) and can complete the order.

**Why this priority**: Core transaction feature. Without cart and checkout, no revenue. Enables end-to-end shopping flow.

**Independent Test**: User can add product → view cart → proceed to checkout → complete Stripe test payment → order is saved to database.

**Acceptance Scenarios**:

1. **Given** user is logged in and viewing a product, **When** they click "Add to Cart", **Then** product is added to their cart in Neon DB
2. **Given** user is on the cart page, **When** the page loads, **Then** all cart items are displayed with quantity, price, and subtotal (from Neon DB)
3. **Given** user is in the cart, **When** they increase/decrease quantity, **Then** cart updates in Neon DB
4. **Given** user has items in cart, **When** they click "Proceed to Checkout", **Then** they are taken to Stripe payment form
5. **Given** user is on Stripe form, **When** they enter test card 4242 4242 4242 4242 and submit, **Then** payment is processed AND order is created in Neon DB orders table
6. **Given** order is successfully placed, **When** checkout completes, **Then** cart is cleared from database AND order appears in /orders/my-orders

---

### User Story 4 - AI Chat Widget (Priority: P2)

User can open a floating chat widget (bottom-right of screen, like Amazon Help) and ask questions. The chat connects to OpenAI API and returns helpful responses. Chat history is optional for MVP.

**Why this priority**: Enhances user experience and provides customer support via AI. Nice-to-have for MVP but adds significant value.

**Independent Test**: User can click chat widget → type question → receive OpenAI response → verify chat API calls work (with OpenAI key from .env.backend).

**Acceptance Scenarios**:

1. **Given** user is on any page, **When** they click the floating chat button (bottom-right), **Then** a chat window opens
2. **Given** chat window is open, **When** user types a message and presses send, **Then** message appears in chat AND is sent to chat-service API (port 8004)
3. **Given** chat-service receives the message, **When** it calls OpenAI API, **Then** GPT-4o-mini responds AND response appears in chat window
4. **Given** user closes chat widget, **When** they reopen it, **Then** previous messages are preserved (from chat_messages table)

---

### User Story 5 - Order History & Account Management (Priority: P2)

User can view their past orders, order details, and manage their account profile. All data is fetched from Neon DB.

**Why this priority**: Secondary feature for user retention and support. Enables users to track purchases and manage their account.

**Independent Test**: User can login → visit /orders → see past orders → click order to view details (all from Neon DB).

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** they visit /orders, **Then** all their past orders are displayed with order ID, date, total, and status (from orders table)
2. **Given** user clicks on an order, **When** order detail page loads, **Then** items in order are listed with quantities and prices (from order_items table)
3. **Given** user visits /profile, **When** page loads, **Then** their account info (name, email) is displayed and editable

---

### Edge Cases

- What happens when user adds product that is out of stock? → System prevents add-to-cart, shows "Out of Stock"
- How does system handle network error during checkout? → Show error message, keep cart data, allow retry
- What if Stripe test payment fails? → Show error message "Payment failed, please try again"
- What if user logs out mid-checkout? → Redirect to login, preserve cart items, allow resume after login
- What if chat API (OpenAI) is unavailable? → Chat widget shows "Service temporarily unavailable, please try later"
- What if user's JWT token expires? → Redirect to login page on next protected route access
- What if user tries to access another user's orders? → 401 Unauthorized error (JWT validation prevents this)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

**Authentication & Security**:
- **FR-001**: System MUST allow users to register with email + password (unique email validation required)
- **FR-002**: System MUST hash passwords using bcrypt before storing in Neon DB (never store plain text)
- **FR-003**: System MUST generate JWT tokens upon successful login (24-hour expiration)
- **FR-004**: System MUST store JWT tokens in httpOnly cookies (frontend cannot access via JavaScript)
- **FR-005**: System MUST validate JWT on all protected endpoints (/cart, /orders, /profile, /chat)
- **FR-006**: System MUST enforce SSL/TLS on all backend services

**Products & Browsing**:
- **FR-007**: System MUST retrieve products from Neon DB (NOT hardcoded)
- **FR-008**: System MUST support product search by name/description
- **FR-009**: System MUST support filtering products by category
- **FR-010**: System MUST support sorting products by price, rating, newest
- **FR-011**: System MUST display product images from database
- **FR-012**: System MUST seed 50+ products across 7 categories via browser automation

**Shopping Cart**:
- **FR-013**: System MUST persist cart items in Neon DB (NOT in memory or localStorage)
- **FR-014**: System MUST track quantity per product in cart
- **FR-015**: System MUST allow users to update/remove items from cart
- **FR-016**: System MUST calculate cart subtotal from product prices and quantities
- **FR-017**: System MUST prevent out-of-stock products from being added to cart

**Checkout & Payment**:
- **FR-018**: System MUST integrate Stripe in test/developer mode
- **FR-019**: System MUST create Stripe PaymentIntent when user checks out
- **FR-020**: System MUST accept test card 4242 4242 4242 4242
- **FR-021**: System MUST create order record in Neon DB when payment succeeds
- **FR-022**: System MUST clear user's cart after successful order
- **FR-023**: System MUST set order status to "confirmed" upon payment success

**AI Chat**:
- **FR-024**: System MUST provide a floating chat widget on all pages
- **FR-025**: System MUST send messages to chat-service API (port 8004)
- **FR-026**: System MUST call OpenAI GPT-4o-mini API and return responses
- **FR-027**: System MUST use OPENAI_API_KEY from .env.backend (never hardcode)
- **FR-028**: System MUST store chat messages in Neon DB

**Data Persistence**:
- **FR-029**: System MUST use Neon PostgreSQL as single source of truth
- **FR-030**: System MUST use SQLModel ORM for all database operations
- **FR-031**: System MUST never hardcode product data, users, or orders (all from DB)

### Key Entities *(include if feature involves data)*

- **User**: Customer account with email, hashed password, name. Gating for all protected endpoints.
- **Category**: Product grouping for filtering (Electronics, Fashion, Home, Books, Toys, Sports, Beauty).
- **Product**: Item for sale with price, description, category, image_url, rating, stock. Source of truth for inventory.
- **Cart**: User's shopping session with user_id. One per logged-in user.
- **CartItem**: Product in cart with quantity. Persisted in Neon DB, not memory.
- **Order**: Completed purchase with user_id, total, stripe_payment_intent_id, status. Immutable historical record.
- **OrderItem**: Product in order with price_at_purchase (historical snapshot).
- **ChatMessage**: AI conversation record with user_id, session_id, role (user/assistant), content.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can complete account creation and login in under 2 minutes
- **SC-002**: Product browsing loads with 50+ products visible (from Neon DB, no hardcoding)
- **SC-003**: Cart operations (add/remove/update) persist immediately in Neon DB
- **SC-004**: Stripe test payment (4242 card) completes successfully and creates order in database
- **SC-005**: AI chat widget responds to user message within 3 seconds (OpenAI API latency)
- **SC-006**: System handles 10+ concurrent users without crashing (local testing minimum)
- **SC-007**: All 4 FastAPI microservices run on intended ports (8001-8004)
- **SC-008**: All backend tests pass (pytest) and E2E tests pass (Playwright)
- **SC-009**: Docker images build successfully for all 5 services
- **SC-010**: Full app runs locally via docker-compose with all features functional

---

## Assumptions

1. **Neon DB credentials** are already configured in `.env.backend` and working
2. **OpenAI API key** is already in `.env.backend` with valid credits
3. **Stripe test keys** are already in `.env.backend`
4. **50 products** will be seeded via browser automation from free public APIs (fakestoreapi.com, dummyjson.com)
5. **Local testing** is sufficient for MVP (no staging/production deployment yet)
6. **Email validation** is basic (RFC5322 format check)
7. **Shipping** is fake (static "Standard Delivery" badge)
8. **User authentication** is stateless (JWT), not session-based

---

## Out of Scope (Not MVP)

- Multi-language support (Urdu/Hindi/English translation)
- Real email notifications
- Product reviews/ratings
- Wishlist feature
- Return/refund management
- Admin dashboard
- Real Stripe integration (using live keys)
- Multi-step checkout
- Payment method options (credit card only)
- Inventory management and stock level changes

---

**Feature Ready for**: `/sp.clarify` (ask clarifying questions) or `/sp.plan` (proceed to architecture planning)
