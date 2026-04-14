# Fatima Zehra Amazon Shop Constitution

A full-stack e-commerce platform using Next.js 16 (frontend) + FastAPI microservices (backend), Neon PostgreSQL, and AI-powered features.

---

## Core Principles

### I. Microservices-First Architecture
Every business domain (users, products, orders, chat) runs as an independent FastAPI microservice on its own port (8001-8004). Microservices communicate via REST APIs + JSON. NO monolithic app — modularity is non-negotiable.

### II. Security-By-Default
- JWT tokens (python-jose) for all protected endpoints
- Bcrypt password hashing (never plain text)
- SSL/TLS via uvicorn[standard] on all backend services
- Environment variables for all secrets (.env.backend, NEVER hardcoded)
- httpOnly cookies for JWT storage in frontend

### III. Data Persistence is King
ALL data persists in Neon PostgreSQL via SQLModel ORM:
- User accounts → `users` table (email, hashed password, profile)
- Products → `products` table (50+ seeded via browser automation)
- Shopping carts → `carts` + `cart_items` tables (NOT in-memory)
- Orders → `orders` + `order_items` tables (Stripe payment_intent_id stored)
- Chat history → `chat_messages` table (session-based)

### IV. Test-First Development (NON-NEGOTIABLE)
- Backend: pytest unit tests + integration tests for all microservices
- Frontend: Playwright E2E tests for critical user flows (signup → login → cart → checkout)
- TDD cycle: Write failing test → User approves → Implement → Green → Refactor
- Every new endpoint/feature requires tests before merge

### V. Amazon-First UI/UX
Frontend MUST match Amazon shopping experience:
- Navbar with search bar, categories, cart icon, sign-in
- Product grid with filters (category, price, rating)
- Add to cart → Cart review → Stripe checkout flow
- Account management (profile, order history)
- AI chat widget (bottom-right, like Amazon Help)
- Mobile-responsive (Tailwind CSS breakpoints)

### VI. Observability & Debugging
- Structured logging for all FastAPI services (level: info/warning/error)
- Request/response logging for API debugging
- GitHub Actions CI/CD with test coverage reports
- Multi-pass code review (Claude Code `-p` flag)

---

## Architecture Standards

### Frontend Stack (Next.js 16)
- **Framework:** Next.js 16 (App Router, Server-Side Rendering enabled)
- **Styling:** Tailwind CSS + shadcn/ui components (NO custom CSS, NO inline styles)
- **UI Patterns:** Radix UI for accessibility (Dialog, Dropdown, etc.)
- **Icons:** Lucide React
- **State:** Zustand for cart/auth state
- **HTTP:** Axios with JWT header injection
- **Auth:** httpOnly cookies for JWT, no localStorage

### Backend Stack (FastAPI × 4 Services)
- **Framework:** FastAPI 0.104+
- **Web Server:** Uvicorn with SSL/TLS support
- **ORM:** SQLModel 0.0.14 (SQLAlchemy + Pydantic)
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** python-jose (JWT) + bcrypt
- **Validation:** Pydantic v2
- **Migrations:** Alembic (for schema versioning)
- **Async:** Native async/await for all I/O

### API Standards
- REST endpoints only (no GraphQL)
- Request/response: JSON
- Error responses: `{"detail": "error message"}` (FastAPI default)
- Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- All protected endpoints require `Authorization: Bearer <JWT>`

### Database Schema (Neon PostgreSQL)
- `users` (id, email, password_hash, name, created_at, updated_at)
- `categories` (id, name, description)
- `products` (id, name, price, description, category_id, image_url, rating, stock)
- `carts` (id, user_id, created_at)
- `cart_items` (id, cart_id, product_id, quantity)
- `orders` (id, user_id, total, stripe_payment_intent_id, status, created_at)
- `order_items` (id, order_id, product_id, quantity, price_at_purchase)
- `chat_messages` (id, user_id, session_id, role, content, metadata, created_at)

### Deployment & Ops
- **Containerization:** Docker (Dockerfile per service)
- **Orchestration:** docker-compose (dev), Kubernetes (optional prod)
- **CI/CD:** GitHub Actions with Claude Code integration
- **Secrets Management:** .env files (development only), GitHub Secrets (production)

---

## Code Quality Standards

### Python Backend
- **Linting:** flake8 (no imports over 100 chars, 4-space indent)
- **Formatting:** black (line length 100)
- **Type Checking:** mypy enabled
- **No Magic Numbers:** All constants named at top of file
- **No Hardcoded Secrets:** Use environment variables

### TypeScript/React Frontend
- **Type Checking:** tsconfig strict mode enforced
- **Linting:** ESLint + Next.js rules
- **Formatting:** Prettier (2-space indent, semicolons)
- **Component Pattern:** Functional components + hooks only
- **Styling:** Tailwind utility classes, NO `<style>` tags

---

## Security & Compliance

### Authentication
- JWT expiration: 24 hours (configurable via env)
- Refresh tokens: Optional (implement if user requests)
- CORS: Only allow frontend origin (localhost:3000 dev, prod domain later)
- HTTPS: Enforced in production (staging can skip)

### Data Protection
- Passwords: Bcrypt with 12-round salt
- API keys: Neon DB URL, OpenAI key → .env.backend (NEVER commited)
- GitHub token: Provided by user, stored in environment (NEVER in code)
- PII: User emails logged only for debugging, NEVER in analytics

### Compliance
- GDPR-ready: User deletion endpoint (cascade delete orders/carts/chat)
- No third-party trackers (no Google Analytics, no Facebook Pixel)
- Data retention: Keep user data until account deletion

---

## Development Workflow

### Git Workflow
1. Branch naming: `step-N-<description>` (e.g., `step-2-amazon-ui`)
2. Commits: Small, atomic commits with descriptive messages
3. GitHub: Push after each step, create PR for review
4. Merges: Squash commits to keep history clean

### Testing Workflow
1. Write test first (red phase)
2. User approves test
3. Implement code (green phase)
4. All tests pass
5. Refactor if needed
6. Commit + push

### Branching Strategy
- `master` = main development branch
- One feature branch per major step
- Merge back to `master` after step completion
- NO long-lived branches (max 1 day)

---

## CI/CD Standards

### GitHub Actions Pipeline
1. **Lint stage:** flake8 (backend) + ESLint (frontend)
2. **Test stage:** pytest (backend) + Playwright E2E (frontend)
3. **Build stage:** Docker build all images
4. **Integration stage:** docker-compose health checks + smoke tests
5. **Review stage:** Claude Code `-p` flag for automated PR comments

### Code Review
- All PRs reviewed by Claude Code
- Multi-pass review: per-file → cross-file → integration
- Auto-comment on violations (security, performance, style)

---

## Project Metrics & KPIs

- **Uptime:** 99.5% (local dev: 100%)
- **Response time:** <200ms (API endpoints)
- **Test coverage:** >80% for critical paths
- **Deployment:** Every step completed = one commit pushed

---

## Governance

This constitution is the source of truth for all development on Fatima Zehra Amazon Shop. Amendments require:
1. User approval (via `/sp.constitution` update)
2. Documentation of rationale
3. Migration plan for existing code

All PRs must verify compliance with this constitution. Violations are caught by CI/CD lint + Claude Code review.

**Version**: 1.0.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-13
