---
id: 0007
title: Step 7 - Docker & CI/CD Pipeline
stage: misc
date: 2026-04-14
surface: agent
model: opus-4.6
feature: 001-amazon-shop
branch: 001-amazon-shop
user: hafiznaveedchuhan-ctrl
command: autonomous-implementation
labels: ["docker", "github-actions", "ci-cd", "deployment"]
links:
  spec: /mnt/d/FATIMA-ZEHRA-AMAZON/specs/001-amazon-shop/spec.md
  ticket: null
  adr: null
  pr: https://github.com/hafiznaveedchuhan-ctrl/FATIMA-ZEHRA-AMAZON/commits/001-amazon-shop
files:
  - .github/workflows/ci-cd.yml (NEW — at repo root)
  - learnflow-app/app/frontend/Dockerfile (rewrite)
tests:
  - GitHub Actions matrix verification (deferred to first push)
---

## Prompt

User: "continue remaining work plz"

Continuing autonomous Step 7: Docker images + CI/CD pipeline.

## Response Summary

### Critical Fixes

**1. CI workflow location bug** — workflow lived at `learnflow-app/.github/workflows/ci-cd.yml`, but GitHub Actions only reads `.github/workflows/` at repo root. Created proper root-level workflow at `.github/workflows/ci-cd.yml`.

**2. Frontend Dockerfile bug** — old Dockerfile ran `serve -s out` (static export), but Step 1 removed `output: 'export'` from `next.config.js` to enable SSR. Old Dockerfile would have served nothing. Rewrote as a proper 3-stage build:
- `deps` stage — `npm ci` only
- `builder` stage — full build
- `runner` stage — non-root user, `npm start` on port 3000

### CI/CD Workflow (root `.github/workflows/ci-cd.yml`)

**Triggers**: push/PR to `main`, `develop`, `001-amazon-shop`

**Jobs**:
1. **test-backend** (matrix: user/product/order/chat) — installs all 4 services' deps so `conftest.py` cross-imports work, runs `pytest tests/unit/test_<svc>.py` with mock env vars
2. **test-frontend** — `npm ci` → lint → `tsc --noEmit` → `npm run build`
3. **build-images** (matrix of 5 contexts) — Buildx with GHA cache, push to GHCR only on `main`
4. **security** — Trivy filesystem scan (CRITICAL/HIGH), uploads SARIF
5. **summary** — fails CI if backend or frontend tests failed

**Why this layout**:
- Matrix parallelism keeps CI under ~5 min
- `if: github.event_name == 'push'` skips Docker build on PRs (saves runner minutes)
- `push: ${{ github.ref == 'refs/heads/main' }}` only publishes images from main
- Old `learnflow-app/.github/workflows/ci-cd.yml` left in place harmlessly (GitHub ignores it)

### Dockerfile Inventory (verified)
- `app/backend/user-service/Dockerfile` — Python 3.11-slim + uvicorn ✓
- `app/backend/product-service/Dockerfile` — same template ✓
- `app/backend/order-service/Dockerfile` — same template ✓
- `app/backend/chat-service/Dockerfile` — same template ✓
- `app/frontend/Dockerfile` — **rewritten** for SSR ✓
- `docker/Dockerfile.nginx` — gateway (legacy, optional) ✓

### Local Build Status
- WSL2 lacks running Docker daemon in this session; build verification deferred to CI
- Once pushed, the `build-images` matrix will exercise all 5 contexts and surface any layer issues

## Outcome

- ✅ Root CI workflow created with 4-way backend matrix + 5-way build matrix
- ✅ Frontend Dockerfile rewritten for SSR (was broken for static-export)
- ✅ Trivy security scan integrated
- ✅ GHCR publishing gated on `main` only
- ⚠️  First push will validate end-to-end — patch failures iteratively

## Verification Checklist (deferred to first push)

- [ ] All 4 backend matrix jobs green
- [ ] Frontend build job green
- [ ] All 5 Docker images build successfully
- [ ] Trivy reports no CRITICAL findings
- [ ] Summary job exits 0
