# Fatima Zehra Amazon Shop — Manual Testing & Deployment Guide

**For:** Naveed (you)
**When to use:** Jo kaam Claude is WSL environment mein nahi kar sakta, wo aap step-by-step yahan se kar sakte hain.

---

## Contents

1. [Credential Rotation — DO THIS FIRST](#1-credential-rotation)
2. [Install Docker on WSL](#2-install-docker-on-wsl)
3. [Run the Full Stack Locally](#3-run-the-full-stack-locally)
4. [Smoke-Test Each Service (10 commands)](#4-smoke-test-each-service)
5. [End-to-End Happy-Path Test](#5-end-to-end-happy-path-test)
6. [Push CI Workflow to GitHub](#6-push-ci-workflow-to-github)
7. [Run Playwright E2E Tests](#7-run-playwright-e2e-tests)
8. [Run pytest Backend Tests](#8-run-pytest-backend-tests)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Credential Rotation

⚠️ **KHATRA:** Aap ne previous chat mein OpenAI API key aur Neon DB password share ki thi. Wo exposed ho chuki hain. Inhein **abhi rotate** karein:

### a. Rotate OpenAI API Key
1. https://platform.openai.com/api-keys par jao
2. Current exposed key (jo `sk-proj-PFGOEI...` se shuru hoti hai) → **Revoke** pe click
3. **Create new secret key** → copy it
4. `learnflow-app/.env.backend` aur `learnflow-app/app/backend/chat-service/.env` mein `OPENAI_API_KEY=` update karo naye key se

### b. Rotate Neon DB Password
1. https://console.neon.tech/app/projects par jao
2. Apna project → **Settings → Reset password**
3. Naya connection string copy karo
4. In 5 files mein `DATABASE_URL=` update karo:
   - `learnflow-app/.env.backend`
   - `learnflow-app/app/backend/user-service/.env`
   - `learnflow-app/app/backend/product-service/.env`
   - `learnflow-app/app/backend/order-service/.env`
   - `learnflow-app/app/backend/chat-service/.env`

### c. (Recommended) Rotate GitHub PAT
1. https://github.com/settings/tokens → jo token share ki thi (`ghp_p9HT...`) **revoke** karo
2. Naya token banao with scopes: `repo` + `workflow` (workflow scope chahiye CI file push karne ke liye)

---

## 2. Install Docker on WSL

WSL 2 Ubuntu mein Docker Engine install karo (Docker Desktop ki zaroorat nahi):

```bash
# Step 1: Old versions hatao (agar hain)
sudo apt-get remove docker docker-engine docker.io containerd runc 2>/dev/null

# Step 2: Dependencies install karo
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Step 3: Docker's GPG key add karo
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Step 4: Docker repository add karo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Step 5: Docker install karo
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Step 6: Apne user ko docker group mein add karo (sudo-free usage)
sudo usermod -aG docker $USER
newgrp docker

# Step 7: Docker daemon start karo
sudo service docker start

# Step 8: Verify
docker --version
docker compose version
docker run hello-world
```

**Agar WSL pe `service docker start` fail ho** to kisi aur method use karo:
```bash
sudo dockerd > /tmp/dockerd.log 2>&1 &
```

---

## 3. Run the Full Stack Locally

```bash
cd /mnt/d/FATIMA-ZEHRA-AMAZON/learnflow-app

# Env files verify karo (ye already exist karte hain, gitignored)
ls -la .env.backend app/backend/*/.env

# Build + start all services
docker compose up -d --build

# Status check
docker compose ps

# Logs watch karo (Ctrl+C to exit)
docker compose logs -f
```

**Expected services running:**
- `boutique-postgres` — port 5432 (local Postgres — can ignore; we use Neon)
- `user-service` — port 8001
- `product-service` — port 8002
- `order-service` — port 8003
- `chat-service` — port 8004
- `frontend` — port 3000
- `nginx` — port 80

---

## 4. Smoke-Test Each Service

Run these `curl` commands after `docker compose up`:

```bash
# 1. Health checks (sab services reachable?)
curl http://localhost:8001/health  # user
curl http://localhost:8002/health  # product
curl http://localhost:8003/health  # order
curl http://localhost:8004/health  # chat

# 2. List categories (public)
curl http://localhost:8002/api/categories | jq

# 3. List products (public)
curl "http://localhost:8002/api/products?limit=5" | jq

# 4. Register user
curl -X POST http://localhost:8001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}' | jq

# Copy the returned access_token from above → set it as env var
export JWT="<paste-access-token-here>"

# 5. Login
curl -X POST http://localhost:8001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq

# 6. Get profile (protected)
curl http://localhost:8001/api/users/me \
  -H "Authorization: Bearer $JWT" | jq

# 7. Add to cart (protected)
curl -X POST http://localhost:8003/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{"product_id":1,"quantity":2,"price":999.99}' | jq

# 8. Get cart (protected)
curl http://localhost:8003/api/cart \
  -H "Authorization: Bearer $JWT" | jq

# 9. Chat message (non-streaming alternative check)
curl -X POST http://localhost:8004/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{"user_id":1,"session_id":"test-sess","text":"What electronics do you have?"}'

# 10. Frontend accessible
curl -I http://localhost:3000
```

✅ Agar sab 200/201 dete hain → backend working.

---

## 5. End-to-End Happy-Path Test

Browser mein karein:

1. `http://localhost:3000` khol
2. **Navbar** → "Sign Up" → register form bharo → submit
3. Success message dikhe → **Sign In** → credentials daal ke login
4. Homepage pe 6+ categories aur 10+ featured products visible hon
5. `/products` pe jao → left sidebar se category filter → results update hon
6. Koi product click → detail page → **Add to Cart**
7. Navbar cart icon pe badge count `1` dikhe
8. `/cart` pe jao → product visible, quantity +/- work
9. **Proceed to Checkout** → Stripe form load ho
10. Test card: `4242 4242 4242 4242`, expiry `12/30`, CVC `123`, ZIP `12345`
11. **Pay Now** → success → `/orders` pe order dikhe with status "confirmed"
12. Chat widget (bottom-right) khol → "Suggest a product" type → AI reply aaye

---

## 6. Push CI Workflow to GitHub

CI file abhi local mein hai (`.github/workflows/ci-cd.yml`) — git mein push nahi hui kyunki current PAT mein `workflow` scope nahi tha.

### Option A (Recommended) — New PAT with workflow scope
```bash
# Step 1: Naye token banao (https://github.com/settings/tokens/new)
#         Scopes tick: [x] repo  [x] workflow

# Step 2: Git remote URL update karo (naya token embed)
cd /mnt/d/FATIMA-ZEHRA-AMAZON
git remote set-url origin https://<NEW_TOKEN>@github.com/hafiznaveedchuhan-ctrl/FATIMA-ZEHRA-AMAZON.git

# Step 3: CI file add + commit + push
git add .github/workflows/ci-cd.yml
git commit -m "ci: add GitHub Actions workflow (4-backend matrix + Trivy scan)"
git push origin 001-amazon-shop
```

### Option B — Manual upload via GitHub web UI
1. https://github.com/hafiznaveedchuhan-ctrl/FATIMA-ZEHRA-AMAZON pe jao
2. Branch: `001-amazon-shop`
3. **Add file → Create new file** → path: `.github/workflows/ci-cd.yml`
4. Local file `/mnt/d/FATIMA-ZEHRA-AMAZON/.github/workflows/ci-cd.yml` ka content copy-paste
5. Commit directly to branch

### GitHub Repository Secrets (CI runs ke liye zaroori)
Repository → **Settings → Secrets and variables → Actions → New repository secret**:
- `DATABASE_URL` = tumhara naya Neon URL
- `JWT_SECRET` = `.env.backend` wala secret
- `OPENAI_API_KEY` = naya OpenAI key
- `STRIPE_SECRET_KEY` = `sk_test_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...`

---

## 7. Run Playwright E2E Tests

```bash
cd /mnt/d/FATIMA-ZEHRA-AMAZON/learnflow-app/app/frontend

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Pre-requisite: backend + frontend must be running (via docker compose up -d)

# Run all E2E tests
npx playwright test

# Run one specific test file
npx playwright test tests/e2e/checkout.spec.ts

# View last report
npx playwright show-report
```

---

## 8. Run pytest Backend Tests

```bash
cd /mnt/d/FATIMA-ZEHRA-AMAZON/learnflow-app

# user-service (only service with existing tests today)
cd app/backend/user-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v

# Repeat for other services (tests need to be added — see tasks.md T082-T084)
```

---

## 9. Troubleshooting

### Docker daemon not running
```bash
sudo service docker start
# or
sudo dockerd > /tmp/dockerd.log 2>&1 &
```

### Port already in use
```bash
# Find what's using port 3000
sudo lsof -iTCP:3000 -sTCP:LISTEN
# Kill it
sudo kill -9 <PID>
```

### `uvicorn` import error inside container
```bash
# Rebuild that specific service
docker compose build --no-cache user-service
docker compose up -d user-service
```

### Neon DB connection refused
- `.env.backend` mein `DATABASE_URL` theek hai?
- Neon project **active** hai (free tier auto-suspends)?
- `psql "$DATABASE_URL" -c "SELECT 1"` — locally connect kar ke dekho

### Stripe webhook testing (local)
```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe

# Login (one-time)
stripe login

# Forward webhooks to local order-service
stripe listen --forward-to http://localhost:8003/api/payments/webhook
# Copy the webhook signing secret it prints → update STRIPE_WEBHOOK_SECRET in .env
```

### Frontend build shows TypeScript errors
```bash
cd learnflow-app/app/frontend
npm run type-check   # see errors
npm run lint
```

---

## Final Checklist Before "100% Complete"

- [ ] Credentials rotated (OpenAI, Neon, GitHub PAT)
- [ ] Docker installed and `docker compose up -d` works
- [ ] All 7 services show healthy in `docker compose ps`
- [ ] 10 curl smoke tests all return 2xx
- [ ] Browser happy-path (§5) completes end-to-end
- [ ] Stripe test payment with 4242 card succeeds → order row in DB
- [ ] Chat widget returns OpenAI response
- [ ] CI workflow pushed to GitHub + first green run
- [ ] Playwright E2E green
- [ ] `pytest` green for user-service

Agar koi step fail ho — output / error paste karo aur main debug karunga.
