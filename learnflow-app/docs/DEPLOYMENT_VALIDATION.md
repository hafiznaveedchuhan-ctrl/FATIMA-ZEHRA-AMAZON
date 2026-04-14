# Production Deployment Validation Guide
## Men's Boutique E-Commerce Platform

**Objective**: Validate production deployment is successful and system is operating correctly
**Timeline**: 2-3 hours for complete validation
**Owner**: DevOps Team + QA Team

---

## Pre-Deployment Validation (Before Going Live)

### 1. Code Quality Checks

- [ ] All tests passing (95%+ pass rate)
  ```bash
  cd learnflow-app/app/backend
  pytest --tb=short
  ```

- [ ] No critical security vulnerabilities
  ```bash
  pip audit
  npm audit --audit-level=moderate
  ```

- [ ] Code coverage meets minimum (70% backend, 60% frontend)
  ```bash
  pytest --cov=. --cov-report=term-out:5
  ```

- [ ] Linting passes (no style violations)
  ```bash
  black --check .
  flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
  ```

- [ ] No hardcoded secrets in code
  ```bash
  grep -r "pk_live\|sk_live\|password.*=" learnflow-app/ --exclude-dir=node_modules
  # Should return ZERO matches
  ```

### 2. Infrastructure Validation

- [ ] All required AWS resources exist
  ```bash
  aws rds describe-db-instances --db-instance-identifier reusable-shop-prod-db
  aws elasticache describe-cache-clusters --cache-cluster-id reusable-shop-session
  aws s3api head-bucket --bucket reusable-shop-assets-${REGION}-${ID}
  ```

- [ ] Terraform state is clean and valid
  ```bash
  terraform validate
  terraform plan -out=plan.tfplan
  # Review plan for any unexpected changes
  ```

- [ ] Database backups configured
  ```bash
  aws rds describe-db-instances --query 'DBInstances[0].BackupRetentionPeriod'
  # Should be >= 30
  ```

- [ ] Security groups properly configured
  ```bash
  aws ec2 describe-security-groups --filters Name=group-name,Values="reusable-shop-*"
  # Verify only required ports are open
  ```

### 3. Environment Configuration

- [ ] All environment variables set in Railway
  ```bash
  railway variables list
  # Should show all required variables (no errors)
  ```

- [ ] Database connection string verified
  ```bash
  psql $DATABASE_URL -c "SELECT version();"
  # Should return PostgreSQL version
  ```

- [ ] Stripe API keys are in LIVE mode
  ```bash
  # Check: pk_live_* and sk_live_*
  # NOT pk_test_* or sk_test_*
  ```

- [ ] OpenAI API key is valid
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.data[0]'
  # Should return list of available models
  ```

### 4. SSL/TLS Verification

- [ ] SSL certificate is valid
  ```bash
  openssl s_client -connect yourdomain.com:443 -servername yourdomain.com </dev/null 2>/dev/null | \
    openssl x509 -noout -dates
  # Check: notBefore and notAfter dates
  ```

- [ ] Certificate covers all domains
  ```bash
  openssl s_client -connect yourdomain.com:443 </dev/null 2>/dev/null | \
    openssl x509 -noout -text | grep "Subject Alternative Name"
  # Should include yourdomain.com and api.yourdomain.com
  ```

- [ ] HTTPS redirect working
  ```bash
  curl -I http://yourdomain.com
  # Should redirect to https://yourdomain.com (307 or 301)
  ```

- [ ] HSTS header present
  ```bash
  curl -I https://yourdomain.com | grep -i "strict-transport-security"
  # Should show: max-age=31536000
  ```

---

## Post-Deployment Validation (After Services Started)

### 1. Health Checks (Wait 5 minutes after deployment)

**User Service** (Port 8001):
```bash
curl https://api.yourdomain.com/api/v1/users/health
# Expected:
# {
#   "status": "ok",
#   "timestamp": "2026-02-08T10:00:00Z",
#   "version": "1.0.0"
# }
```

**Product Service** (Port 8002):
```bash
curl https://api.yourdomain.com/api/v1/products/health
# Expected: Same as above
```

**Order Service** (Port 8003):
```bash
curl https://api.yourdomain.com/api/v1/orders/health
# Expected: Same as above
```

**Chat Service** (Port 8004):
```bash
curl https://api.yourdomain.com/api/v1/chat/health
# Expected: Same as above
```

**API Gateway**:
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok"}
```

### 2. Database Connectivity

```bash
# Check from service container (if possible)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
# Expected: 40+

# Check table structure
psql $DATABASE_URL -c "\dt public.*"
# Should list all tables: users, products, orders, chat_messages

# Verify migrations ran
psql $DATABASE_URL -c "SELECT version FROM alembic_version;"
# Should show latest migration version
```

### 3. API Endpoints

**List Products**:
```bash
curl "https://api.yourdomain.com/api/v1/products?limit=5"
# Expected: 200 OK with product list
# {"total": 40, "items": [{...}, ...]}
```

**Search Products**:
```bash
curl "https://api.yourdomain.com/api/v1/products/search?q=shirt"
# Expected: 200 OK with filtered results
```

**User Registration**:
```bash
curl -X POST https://api.yourdomain.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
# Expected: 201 Created with user ID
```

**User Login**:
```bash
curl -X POST https://api.yourdomain.com/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
# Expected: 200 OK with JWT token
```

**Chat Message**:
```bash
curl -X POST https://api.yourdomain.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "message": "formal wedding suit"
  }'
# Expected: 200 OK with AI response and product recommendations
```

### 4. Frontend Validation

**Homepage Loads**:
```bash
curl https://yourdomain.com/ | head -20
# Should contain: <!DOCTYPE html> and Next.js content
```

**Product Page Loads**:
```bash
curl "https://yourdomain.com/products/1" | grep -c "Product Details"
# Expected: Non-zero (page contains product content)
```

**Check Performance** (Lighthouse):
1. Open: https://yourdomain.com in browser
2. Open DevTools → Lighthouse
3. Run audit (Desktop)
4. Expected scores:
   - Performance: 75+
   - Accessibility: 95+
   - Best Practices: 90+
   - SEO: 90+

### 5. Database Verification

**Check Data Integrity**:
```bash
psql $DATABASE_URL << EOF
-- Verify product count
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION
SELECT 'users', COUNT(*) FROM users
UNION
SELECT 'orders', COUNT(*) FROM orders;
EOF
```

**Check Replication** (if multi-region):
```bash
# Verify read replica is in sync
aws rds describe-db-instances \
  --db-instance-identifier reusable-shop-prod-db-replica \
  --query 'DBInstances[0].DBInstanceStatus'
# Expected: "available"
```

### 6. Monitoring & Logging

**Sentry Error Tracking**:
1. Go to: https://sentry.io/organizations/your-org/issues/
2. Filter: environment=production
3. Expected: 0 unresolved errors (or only expected ones)

**CloudWatch Logs**:
```bash
aws logs tail /ecs/reusable-shop-prod --follow --since 1m
# Should show normal application logs, no errors
```

**Metrics** (CloudWatch):
1. Go to: https://console.aws.amazon.com/cloudwatch/
2. Metrics → ECS
3. Expected:
   - CPU: 10-30%
   - Memory: 20-40%
   - Network In: < 100 Mbps

### 7. Stripe Integration

**Webhook Delivery**:
1. Go to: https://dashboard.stripe.com → Webhooks
2. Click endpoint: https://api.yourdomain.com/api/v1/webhooks/stripe
3. View recent events
4. Expected: Status = "Sent" (green checkmark)

**Test Payment** (requires test card):
```bash
# Use test card: 4242 4242 4242 4242
# Steps:
# 1. Browse to https://yourdomain.com
# 2. Add product to cart
# 3. Proceed to checkout
# 4. Enter test card
# 5. Submit payment
# 6. Expected: Order confirmation page shows

# Verify in database
psql $DATABASE_URL -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;"
# Should show new order with status='payment_pending' or 'completed'

# Verify in Stripe
# https://dashboard.stripe.com → Payments
# Should show successful payment intent
```

### 8. Email Service

**Verify SendGrid Integration**:
```bash
# Check if email was sent
curl -X GET "https://api.sendgrid.com/v3/mail_settings/bounce_purge" \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json"
# Should return 200 OK

# Check email log in SendGrid
# https://app.sendgrid.com → Analytics → Overview
```

**Test Order Confirmation Email**:
1. Place test order (see Stripe Integration above)
2. Check email inbox
3. Expected: Email received within 5 minutes with order details

### 9. Chat & RAG System

**Test Chat Recommendations**:
```bash
# Query chat service
curl -X POST https://api.yourdomain.com/api/v1/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a formal wedding suit"}'

# Expected response:
# {
#   "response": "Here are some formal wedding suits...",
#   "recommendations": [
#     {"id": 1, "name": "Premium Wedding Suit", "price": 299},
#     ...
#   ]
# }
```

**Verify Qdrant**:
```bash
# Check Qdrant collection
curl http://qdrant-host:6333/collections/products
# Expected: 200 OK with collection info

# Check vector count
curl http://qdrant-host:6333/collections/products/points | jq '.result.points_count'
# Expected: 40+ (one vector per product)
```

### 10. Performance Testing

**Response Time (API)**:
```bash
# Measure product listing response time
time curl "https://api.yourdomain.com/api/v1/products?limit=50"
# Expected: < 200ms total time
```

**Concurrent Load Test**:
```bash
# Load test with 10 concurrent users
ab -n 100 -c 10 https://api.yourdomain.com/api/v1/products
# Expected:
# - Requests per second: > 100
# - Failed requests: 0
# - Time per request: < 100ms
```

**Frontend Page Load**:
1. Open DevTools → Network
2. Load https://yourdomain.com
3. Expected:
   - Fully loaded: < 2.5 seconds
   - First Contentful Paint: < 1.5 seconds
   - Largest Contentful Paint: < 2.5 seconds

---

## Critical User Journey Testing (Manual)

### Journey 1: Browse & Purchase

1. **Visit homepage**:
   - [ ] Page loads in < 3 seconds
   - [ ] Navigation menu visible
   - [ ] Featured products displayed

2. **Search for product**:
   - [ ] Enter "cotton shirt" in search
   - [ ] Results load in < 2 seconds
   - [ ] 5+ products returned

3. **View product details**:
   - [ ] Click first product
   - [ ] Images load correctly
   - [ ] Price and description visible
   - [ ] "Add to Cart" button works

4. **Add to cart**:
   - [ ] Click "Add to Cart"
   - [ ] Cart count updates
   - [ ] Toast notification shows

5. **Checkout**:
   - [ ] Click "Go to Cart"
   - [ ] Product shows in cart
   - [ ] Click "Checkout"
   - [ ] Checkout form appears

6. **Enter payment details**:
   - [ ] Shipping address form
   - [ ] Enter test address: "123 Main St, New York, NY 10001"
   - [ ] Stripe payment form appears
   - [ ] Enter card: 4242 4242 4242 4242
   - [ ] Click "Pay Now"

7. **Verify payment**:
   - [ ] Redirect to confirmation page
   - [ ] Order ID displayed
   - [ ] "Order confirmed" message visible
   - [ ] Estimated delivery date shown

8. **Verify email**:
   - [ ] Check email inbox
   - [ ] Order confirmation email received
   - [ ] Email contains order ID and items

### Journey 2: WhatsApp Integration

1. **View product page**:
   - [ ] Click product in catalog
   - [ ] Product details visible

2. **Find WhatsApp button**:
   - [ ] Scroll to bottom of product card
   - [ ] WhatsApp button visible
   - [ ] Button has WhatsApp logo

3. **Click WhatsApp**:
   - [ ] Click button
   - [ ] Browser opens WhatsApp Web or app
   - [ ] Message pre-filled with product name
   - [ ] Example: "Hi, I'm interested in Cotton Shirt (Premium) - https://yourdomain.com/products/1"

4. **Send message**:
   - [ ] Complete conversation in WhatsApp
   - [ ] Verify conversation recorded

### Journey 3: Chat & Recommendations

1. **Open chat widget**:
   - [ ] Look for chat icon (bottom right)
   - [ ] Click to open chat
   - [ ] Chat window appears

2. **Ask question**:
   - [ ] Type: "What's your best formal suit?"
   - [ ] Click send

3. **Receive recommendations**:
   - [ ] Chat responds with suggestions
   - [ ] Product links included
   - [ ] Click product link
   - [ ] Navigate to product page

4. **Follow-up**:
   - [ ] Ask: "What's available in black?"
   - [ ] Chat remembers context
   - [ ] Returns filtered results

---

## Issue Resolution Guide

### If Health Checks Fail

1. **Check service logs**:
   ```bash
   railway logs -f --service user-service
   # Look for error messages
   ```

2. **Restart service**:
   ```bash
   railway service select user-service
   railway restart
   # Wait 2 minutes for service to start
   ```

3. **Check dependencies**:
   - Is database accessible?
   - Is external API (Stripe, OpenAI) responding?
   - Is network connection working?

4. **Rollback if critical**:
   ```bash
   railway deploy --previous
   # Redeploy previous working version
   ```

### If Payment Fails

1. **Check Stripe dashboard**:
   - Is API key correct?
   - Is webhook registered?
   - Are API limits exceeded?

2. **Verify webhook secret**:
   ```bash
   # Check stored secret
   railway variables get STRIPE_WEBHOOK_SECRET
   # Compare with Stripe dashboard
   ```

3. **Test webhook manually**:
   ```bash
   curl -X POST https://api.yourdomain.com/api/v1/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"payment_intent.created"}'
   # Should return 200
   ```

### If Chat Responds Slowly

1. **Check Qdrant health**:
   ```bash
   curl http://qdrant-host:6333/health
   # Should return 200 in < 500ms
   ```

2. **Check OpenAI API**:
   - Visit: https://status.openai.com/
   - Look for service disruptions

3. **Review logs**:
   ```bash
   railway logs --service chat-service | grep -i latency
   ```

---

## Sign-Off

Once all validations pass, obtain sign-offs:

| Role | Name | Date | Status |
|------|------|------|--------|
| DevOps Lead | _____________ | _________ | Approve / Reject |
| QA Lead | _____________ | _________ | Approve / Reject |
| Engineering Manager | _____________ | _________ | Approve / Reject |
| Product Manager | _____________ | _________ | Approve / Reject |

---

**Validation Complete**: All tests passed ✓
**Deployment Status**: READY FOR PRODUCTION ✓
**Date**: 2026-02-08
**Validated By**: ________________________
**Time Spent**: ~2.5 hours
