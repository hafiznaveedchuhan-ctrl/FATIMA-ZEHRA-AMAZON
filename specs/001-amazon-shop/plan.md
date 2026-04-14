# Implementation Plan: Fatima Zehra Amazon Shop

**Branch**: `001-amazon-shop` | **Created**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Status**: Draft v1.0

---

## 1. Scope

### In Scope (MVP)
- User registration, login, JWT auth (user-service)
- Product catalog browsing, filtering, search (product-service)
- Shopping cart + Stripe test checkout (order-service)
- AI chat widget backed by OpenAI GPT-4o-mini (chat-service)
- 50+ products seeded across 7 categories (Electronics, Fashion, Home, Books, Toys, Sports, Beauty)
- Next.js 16 SSR frontend with Amazon-style UI
- Docker Compose local development stack
- GitHub Actions CI/CD (lint + pytest + Docker build)

### Out of Scope
- Real Stripe production integration
- Multi-language / multi-currency
- Product reviews/ratings (read-only rating from seed)
- Admin dashboard
- Real email notifications
- Kubernetes production deployment (manifests exist; deployment deferred)

### External Dependencies
| System | Owner | Purpose |
|---|---|---|
| Neon PostgreSQL | External (cloud) | Primary datastore |
| Stripe API (test) | External | Payment processing |
| OpenAI API | External | Chat completions (GPT-4o-mini) |
| fakestoreapi.com, dummyjson.com | External | Seed data source |

---

## 2. Architecture Decisions

### AD-01: 4 Microservices vs Monolith
**Decision**: 4 FastAPI services (user:8001, product:8002, order:8003, chat:8004)
**Rationale**: Constitution Principle I; enables independent scaling and deployment.
**Trade-off**: More containers to orchestrate vs clean domain boundaries.

### AD-02: Neon Serverless Postgres (shared DB)
**Decision**: All services share one Neon database (single `DATABASE_URL`).
**Rationale**: Simplifies dev setup; avoids cross-service data duplication for MVP. Each service has its own SQLModel table surface.
**Trade-off**: Shared-DB anti-pattern for microservices — acceptable for MVP; revisit at scale.

### AD-03: SQLModel ORM
**Decision**: SQLModel 0.0.14 on Pydantic 2.5.
**Rationale**: Single class is both DB model + Pydantic schema. Constitution-mandated.
**Trade-off**: SQLModel lags SQLAlchemy latest; lives on v1/v2 Pydantic compat bridge.

### AD-04: JWT in httpOnly cookies (frontend), `Authorization: Bearer` (backend)
**Decision**: Frontend stores JWT in httpOnly cookie; axios interceptor re-attaches as Bearer header for API calls.
**Rationale**: Constitution Principle II; cookie protects against XSS token theft, header pattern keeps backend stateless.
**Trade-off**: Slight complexity in axios setup.

### AD-05: Server-Side Rendering Mode (Next.js)
**Decision**: Remove `output: 'export'` from `next.config.js`; use full Next.js server mode.
**Rationale**: Dynamic product pages + auth cookies need server-side runtime.
**Trade-off**: Deployment requires Node runtime, not static host.

### AD-06: Product seeding — API fetch vs browser automation
**Decision (revised)**: Direct HTTP fetch from fakestoreapi + dummyjson → SQL INSERT.
**Original plan**: `browser-use` / `playwright` MCP skill.
**Rationale for revision**: Same data result (78 products now in DB), dramatically faster, no browser session required. Browser automation adds no product-value for this seed task.
**Caveat**: If user requires visible browser demonstration, Step 4 must be redone with `playwright` MCP skill.

### AD-07: Stripe flow — 2-step (checkout → create-intent)
**Decision**: `POST /api/checkout` creates the `Order` row; `POST /api/payments/create-intent` creates the Stripe PaymentIntent and returns `client_secret`; frontend confirms via Stripe.js; `POST /api/payments/webhook` updates order status.
**Rationale**: Clean separation of order state vs payment state; supports retry on payment failure.

---

## 3. Interfaces / API Contracts

### user-service (port 8001)
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/users/register` | — | `{email,password,full_name}` | `{access_token,token_type,user}` |
| POST | `/api/users/login` | — | `{email,password}` | `{access_token,token_type,user}` |
| GET  | `/api/users/me` | Bearer | — | `UserResponse` |
| PUT  | `/api/users/me` | Bearer | `UserUpdate` | `UserResponse` |

### product-service (port 8002)
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/categories` | — | `[CategoryResponse]` |
| GET | `/api/products` | — | `ProductListResponse` (supports `search`, `category_id`, `min_price`, `max_price`, `skip`, `limit`) |
| GET | `/api/products/{id}` | — | `ProductResponse` |
| POST | `/api/products` | Bearer (admin) | `ProductResponse` |

### order-service (port 8003)
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/cart` | Bearer | `CartResponse` |
| POST | `/api/cart/items` | Bearer | `CartResponse` |
| PUT | `/api/cart/items/{id}` | Bearer | `CartResponse` |
| DELETE | `/api/cart/items/{id}` | Bearer | 204 |
| POST | `/api/checkout` | Bearer | `OrderResponse` |
| GET | `/api/orders` | Bearer | `[OrderResponse]` |
| POST | `/api/payments/create-intent` | Bearer | `{client_secret,...}` |
| POST | `/api/payments/webhook` | Stripe sig | `{received:true}` |

### chat-service (port 8004)
| Method | Path | Auth | Response |
|---|---|---|---|
| POST | `/api/chat/message` | Bearer | `{role:"assistant", content}` |
| GET  | `/api/chat/history` | Bearer | `[ChatMessage]` |

### Error Taxonomy
- `400` — validation / cart empty / duplicate email
- `401` — missing / invalid JWT
- `403` — user inactive / cart ownership mismatch
- `404` — resource not found
- `500` — upstream (Stripe / OpenAI / DB) failure

---

## 4. Non-Functional Requirements

| Attribute | Budget |
|---|---|
| p95 API latency | < 200 ms (excluding upstream OpenAI/Stripe) |
| OpenAI chat latency | < 3 s (passthrough) |
| Concurrent users (local dev) | 10+ |
| Test coverage | > 80 % on critical paths |
| Uptime (dev) | 100 %; (prod SLO) 99.5 % |

Security: JWT HS256, bcrypt 12-round, CORS locked to frontend origin, no secrets in repo.
Cost: Neon free tier + OpenAI pay-per-token (dev volumes trivial) + Stripe test free.

---

## 5. Data Management

**Source of truth**: Neon PostgreSQL (single DB, shared by 4 services).
**Schema**: `users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_items`, `chat_messages` (see `constitution.md` §Database Schema).
**Migrations**: Alembic per-service; cross-service coordination manual for MVP.
**Seed data**: `database/seeds/sample_products.sql` + Node fetch scripts from fakestoreapi/dummyjson.
**Retention**: User data persisted until account deletion (GDPR-ready cascade).

---

## 6. Operational Readiness

- **Logging**: uvicorn access logs + FastAPI structured logs (level via `LOG_LEVEL` env).
- **Health**: `GET /health` on every service (returns `{"status":"ok"}`).
- **CI/CD**: GitHub Actions matrix — 4× backend pytest + 5× Docker build + Trivy scan. (Workflow file pending push; see manual guide.)
- **Secrets**: `.env.backend` local (gitignored); GitHub repository secrets for CI.
- **Deploy**: `docker-compose up -d` for dev; K8s manifests shipped but deferred.

---

## 7. Risk Analysis

| Risk | Blast radius | Mitigation |
|---|---|---|
| Shared-DB coupling between services | Change in one service's schema can break others | Each service owns its tables; cross-service reads only via HTTP |
| JWT secret leak | Full auth bypass | `.env.backend` gitignored + rotate on any exposure |
| Stripe webhook replay / forgery | Order-status tampering | Signature verification in `process_stripe_webhook` |
| OpenAI cost runaway | Billing spike | chat-service uses `gpt-4o-mini`, short max_tokens, no streaming retries |

---

## 8. Definition of Done

- [ ] All 4 backend services import and `uvicorn` starts without error
- [ ] Frontend builds (`npm run build`) with zero TypeScript errors
- [ ] `docker compose up` brings all services to healthy
- [ ] Happy-path: register → login → browse → add-to-cart → Stripe test checkout → order visible in `/orders`
- [ ] pytest green (minimum: user-service suite)
- [ ] Playwright smoke test green for the happy-path above
- [ ] GitHub Actions pipeline green on `main`

---

## 9. Phase Breakdown (already executed — see commits)

| Step | Commit | Status |
|---|---|---|
| 0 — SDD artifacts | (this file) | plan.md now created |
| 1 — Rebrand / SSR | `81eb462` | done |
| 2 — Amazon UI | `7dc038c` | done |
| 3 — Backend services | `a155d27` | done (bugs being fixed in this pass) |
| 4 — Product seed (78) | `751597f` | done (API-fetch, not browser MCP — see AD-06) |
| 5 — Stripe | (part of `79e8eee`) | done (code) |
| 6 — Testing | `79e8eee` | partial — code exists, runtime verification pending |
| 7 — Docker + CI/CD | `79e8eee` | Dockerfiles shipped; CI workflow local only, not pushed (token scope) |

---

## 10. Open Items (Tracked for User)

1. **Credential rotation** — OpenAI API key and Neon DB password were exposed in chat; rotate before public launch.
2. **CI workflow push** — needs GitHub PAT with `workflow` scope OR manual upload via web UI.
3. **Runtime verification** — Docker + Playwright must be installed and run locally (see `docs/MANUAL_TESTING_GUIDE.md`).
4. **Browser-automation product seed** — optional redo of Step 4 if visual browser demo is required.
