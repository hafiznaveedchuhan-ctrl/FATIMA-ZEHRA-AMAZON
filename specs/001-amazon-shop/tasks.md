# Tasks: Fatima Zehra Amazon Shop

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Convention**: `[P]` = parallelizable. Tasks are ordered by dependency.

---

## Phase 1 — Setup ✅ (done in commits `81eb462`, `7dc038c`)

- [x] **T001** Next.js 16 SSR mode — remove `output: 'export'` from `learnflow-app/app/frontend/next.config.js`
- [x] **T002** Consolidate duplicate components (`app/frontend/src/components` → `app/frontend/components`)
- [x] **T003** Rebrand strings: "LearnFlow" / "Boutique" → "Fatima Zehra Amazon Shop"
- [x] **T004** Amazon-style theme (orange/red palette) in `tailwind.config.js` + `globals.css`

---

## Phase 2 — Foundational (US1 blocker) ✅

- [x] **T010** `users` table SQLModel in `app/backend/user-service/app/models.py`
- [x] **T011** `categories` + `products` tables in `product-service/app/models.py`
- [x] **T012** `carts`, `cart_items`, `orders`, `order_items` in `order-service/app/models.py`
- [x] **T013** `chat_messages` table in `chat-service/app/models.py`
- [x] **T014** `database.py` with `get_session()` dependency for each service
- [x] **T015** `.env.backend` + per-service `.env` with Neon `DATABASE_URL`, JWT secret, OpenAI key

---

## Phase 3 — User Story 1: Registration & Login (P1) ✅

- [x] **T020 [P]** `POST /api/users/register` with bcrypt hashing (`user-service/app/routes.py:17`)
- [x] **T021 [P]** `POST /api/users/login` returning JWT (`user-service/app/routes.py:60`)
- [x] **T022 [P]** `GET /api/users/me` JWT-protected (`user-service/app/routes.py:96`)
- [x] **T023** Frontend register page (`app/frontend/app/auth/register/page.tsx`)
- [x] **T024** Frontend login page (`app/frontend/app/auth/login/page.tsx`)
- [x] **T025** Zustand auth store (`app/frontend/lib/auth.ts`)
- [x] **T026** Axios client with JWT header injection (`app/frontend/lib/api.ts`)

**US1 test**: user can register → see success → login → hit `/api/users/me` with bearer. *Runtime test pending — see manual guide.*

---

## Phase 4 — User Story 2: Browse Products (P1) ✅

- [x] **T030 [P]** `GET /api/categories` (`product-service/app/routes.py:20`)
- [x] **T031 [P]** `GET /api/products` with `search`, `category_id`, `min_price`, `max_price`, `skip`, `limit`
- [x] **T032 [P]** `GET /api/products/{id}`
- [x] **T033** Seed 78 products across 7 categories (`database/seeds/sample_products.sql`)
- [x] **T034** Homepage featured-products grid (`app/frontend/components/FeaturedProducts.tsx`)
- [x] **T035** `/products` listing page with sidebar filters
- [x] **T036** `/products/[id]` detail page
- [x] **T037 🔧 BUGFIX** — Fixed `list_products` total count ignoring filters (this pass)

---

## Phase 5 — User Story 3: Cart + Stripe Checkout (P1) ✅

- [x] **T040** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE`
- [x] **T041** `POST /api/checkout` creates `Order` + `OrderItem` rows from cart
- [x] **T042** `POST /api/payments/create-intent` creates Stripe PaymentIntent
- [x] **T043** `POST /api/payments/webhook` verifies Stripe signature, updates order status
- [x] **T044** `app/frontend/components/StripeCheckoutForm.tsx` (bug: missing `LinkAuthenticationElement` import — fixed)
- [x] **T045** `/cart` page + `/orders` history page
- [x] **T046 🔧 BUGFIX** — `get_user_id_from_header` now properly decodes JWT (this pass)
- [x] **T047 🔧 BUGFIX** — checkout now looks up real `product_name` from product-service (this pass)

---

## Phase 6 — User Story 4: AI Chat (P2) ✅

- [x] **T050** `POST /api/chat/message` calls OpenAI GPT-4o-mini
- [x] **T051** `chat_messages` persistence
- [x] **T052** `app/frontend/components/ChatWidget.tsx` floating button + window

---

## Phase 7 — User Story 5: Order History (P2) ✅

- [x] **T060** `GET /api/orders` returns user's orders
- [x] **T061** `GET /api/orders/{id}` returns order + items
- [x] **T062** `/orders` history page
- [x] **T063** `/profile` page

---

## Phase 8 — Containerization ⚠️ (code ready, not runtime-verified)

- [x] **T070 [P]** Dockerfile per backend service (multi-stage Python slim)
- [x] **T071** Dockerfile for frontend (3-stage Node → Next.js standalone)
- [x] **T072** `docker-compose.yml` wires 4 backends + frontend + nginx
- [ ] **T073** `docker compose up -d` verified locally → *manual step (Docker not installed in this env)*
- [ ] **T074** Smoke test: `curl http://localhost:80/api/products` returns JSON → *manual step*

---

## Phase 9 — Testing ⚠️

- [x] **T080** pytest config (`pytest.ini`)
- [x] **T081** user-service test_routes.py (register/login happy path)
- [ ] **T082** product-service pytest suite → *to be added*
- [ ] **T083** order-service pytest suite → *to be added*
- [ ] **T084** chat-service pytest suite → *to be added*
- [ ] **T085** Playwright E2E: signup → browse → cart → Stripe test checkout → *manual step*

---

## Phase 10 — CI/CD ⚠️

- [x] **T090** `.github/workflows/ci-cd.yml` drafted locally (4× backend matrix + 5× docker build + Trivy)
- [ ] **T091** Push workflow to GitHub → *blocked: current PAT lacks `workflow` scope*
- [ ] **T092** First green pipeline run → *depends on T091*

---

## Open Issues (Tracked for Manual Follow-up)

| ID | Issue | Owner | Priority |
|---|---|---|---|
| OI-01 | Docker + Playwright install in WSL → runtime E2E test | User | P1 |
| OI-02 | GitHub PAT with `workflow` scope to push CI file | User | P2 |
| OI-03 | Rotate exposed OpenAI key + Neon DB password | User | P1 |
| OI-04 | (Optional) Redo Step 4 seed via `playwright` MCP skill if visual demo wanted | User/Assistant | P3 |

---

## Parallel-Execution Tips

- **US1 endpoints** (T020, T021, T022) — independent routes; run parallel.
- **Product GETs** (T030, T031, T032) — independent queries; run parallel.
- **Backend Dockerfiles** (T070) — independent services; build parallel.

---

## Checkpoints

- ✅ **After Phase 3** → registration/login works end-to-end (smoke: `curl register → login → /me`)
- ✅ **After Phase 5** → full shopping flow works (Stripe test card 4242 4242 4242 4242)
- ⏳ **After Phase 8** → local `docker compose up` gives working app on `localhost:80`
- ⏳ **After Phase 10** → green CI pipeline on every push
