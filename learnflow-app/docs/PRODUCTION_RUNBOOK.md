# Production Operations Runbook
## Men's Boutique E-Commerce Platform

**Last Updated**: 2026-02-08
**Status**: Production Ready
**On-Call**: See escalation policy below

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Health Checks & Monitoring](#health-checks--monitoring)
3. [Common Incidents & Resolutions](#common-incidents--resolutions)
4. [Scaling & Performance](#scaling--performance)
5. [Database Management](#database-management)
6. [Payment Processing](#payment-processing)
7. [Deployment & Rollback](#deployment--rollback)
8. [Escalation & Communication](#escalation--communication)

---

## System Architecture

### Production Deployment Stack

```
Users (Frontend)
      ↓
Vercel CDN (yourdomain.com)
      ↓
Nginx API Gateway (Railway)
      ↓
┌─────────────────────────────────────┐
│ Railway Microservices               │
├─────────────────────────────────────┤
│ • User Service (Port 8001)          │
│ • Product Service (Port 8002)       │
│ • Order Service (Port 8003)         │
│ • Chat Service (Port 8004)          │
│ • Notification Service              │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Data & AI                           │
├─────────────────────────────────────┤
│ • Neon PostgreSQL                   │
│ • Qdrant Vector DB                  │
│ • Redis Cache (Optional)            │
└─────────────────────────────────────┘
      ↓
External Services
│ • Stripe Payments
│ • SendGrid Email
│ • OpenAI API
│ • Sentry Error Tracking
└─ Cloudflare DDoS Protection
```

### Service Responsibilities

| Service | Purpose | Port | DB | Health Check |
|---------|---------|------|----|----|
| User Service | Authentication, user management | 8001 | ✓ | `/health` |
| Product Service | Product catalog, search, images | 8002 | ✓ | `/health` |
| Order Service | Order management, Stripe webhooks | 8003 | ✓ | `/health` |
| Chat Service | AI chat, RAG recommendations | 8004 | ✓ | `/health` |
| API Gateway | Request routing, rate limiting | 80,443 | ✗ | `/health` |

---

## Health Checks & Monitoring

### Quick Health Check

```bash
# Frontend
curl https://yourdomain.com/ -I
# Expected: 200 OK

# User Service
curl https://api.yourdomain.com/api/v1/users/health
# Expected: {"status":"ok"}

# Products
curl https://api.yourdomain.com/api/v1/products/health
# Expected: {"status":"ok"}

# Orders
curl https://api.yourdomain.com/api/v1/orders/health
# Expected: {"status":"ok"}

# Chat
curl https://api.yourdomain.com/api/v1/chat/health
# Expected: {"status":"ok"}
```

### Critical Metrics to Monitor

**Every 5 minutes**:
- [ ] Error rate < 1%
- [ ] API latency p95 < 500ms
- [ ] Database connections < 20
- [ ] API Gateway response time < 100ms

**Every 1 hour**:
- [ ] Payment success rate > 99%
- [ ] Chat response time < 3s
- [ ] Product search < 200ms
- [ ] No 5xx errors in past hour

**Every 4 hours**:
- [ ] Database disk usage < 80%
- [ ] Vector DB (Qdrant) healthy
- [ ] Stripe webhook failures = 0
- [ ] Email service healthy

### Viewing Logs

**Sentry Dashboard** (errors only):
```
https://sentry.io/organizations/your-org/issues/
Filter: env:production
```

**Railway Logs** (all services):
```
https://railway.app → Project → Services → Logs
Filter by service name and date range
```

**Backend Logs** (JSON structured):
```bash
# SSH to service container (if available)
docker logs boutique-{service-name} | jq '.error,.timestamp,.level'
```

### Alert Severity Levels

| Severity | Response Time | Actions |
|----------|---------------|---------|
| SEV1 (Critical) | 5 min | Page on-call immediately, engage team |
| SEV2 (High) | 15 min | Notify team, begin investigation |
| SEV3 (Medium) | 1 hour | Track, schedule fix, monitor |
| SEV4 (Low) | 24 hours | Add to backlog |

---

## Common Incidents & Resolutions

### Incident 1: High Error Rate (>5%)

**Symptoms**:
- Sentry showing spike in errors
- Users report 500 errors
- Error rate alert triggered

**Diagnosis**:
```bash
# Check which service is failing
curl https://api.yourdomain.com/api/v1/products
# vs
curl https://api.yourdomain.com/api/v1/orders

# Check Sentry for error pattern
# https://sentry.io/organizations/your-org/issues/

# Check recent deployments
# Railway dashboard → Activity
```

**Resolution**:

1. **If recent deployment** (< 30 min):
   ```bash
   # Rollback to previous version
   # Railway Dashboard → Service → Deployments → Previous → Redeploy
   # Wait 5 minutes for traffic to stabilize
   ```

2. **If database issue**:
   ```bash
   # Check connection pool
   psql $NEON_DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
   # If > 20 connections, there's a leak

   # Restart service
   # Railway Dashboard → Service → Restart
   ```

3. **If external service** (Stripe, OpenAI):
   ```bash
   # Check service status
   # Stripe: https://status.stripe.com/
   # OpenAI: https://status.openai.com/

   # If degraded, enable fallback logic
   # Scale down chat service
   # Disable RAG temporarily
   ```

4. **If unknown**:
   ```bash
   # Gather data
   - Check top 5 error types (Sentry)
   - Check error timeline (what changed?)
   - Check recent code changes (GitHub commits)
   - Check infra health (Railway dashboard)

   # Decide: Fix forward or rollback?
   # If simple fix → code push
   # If complex → rollback first, then fix
   ```

### Incident 2: Payment Processing Failure

**Symptoms**:
- Users cannot checkout
- Stripe webhook failures in Sentry
- Order service logs show payment errors

**Diagnosis**:
```bash
# Check Stripe webhook logs
# https://dashboard.stripe.com → Webhooks

# Check order service logs
# Railway → order-service → Logs
# Search: "payment" OR "stripe" OR "error"

# Check Stripe API status
# https://status.stripe.com/

# Check webhook endpoint connectivity
curl -X POST https://api.yourdomain.com/api/v1/webhooks/stripe \
  -H "Stripe-Signature: test" \
  -d '{"type":"payment_intent.created"}'
# Should return 200
```

**Resolution**:

1. **If webhook endpoint unreachable**:
   ```bash
   # Restart order service
   # Railway Dashboard → order-service → Restart

   # Verify webhook URL in Stripe is correct
   # https://dashboard.stripe.com → Webhooks
   # Should be: https://api.yourdomain.com/api/v1/webhooks/stripe
   ```

2. **If Stripe API is degraded**:
   ```bash
   # Check Stripe status: https://status.stripe.com/
   # If degraded: Enable manual order processing
   # Notify customers via chat widget
   # Retry failed payments after service recovers
   ```

3. **If webhook signature mismatch**:
   ```bash
   # Check STRIPE_WEBHOOK_SECRET is correct
   # Railway Dashboard → order-service → Variables
   # Verify against: https://dashboard.stripe.com → Webhooks → Signing Secret

   # If wrong, update and restart service
   ```

4. **If payment intents failing**:
   ```bash
   # Check order service logs for payment errors
   # Common causes: invalid card, insufficient funds, rate limiting

   # Verify STRIPE_SECRET_KEY is in live mode (not test mode)
   # pk_live_* for keys (not pk_test_*)

   # Check Stripe account balance and capabilities
   ```

### Incident 3: Database Connection Exhaustion

**Symptoms**:
- Services unable to connect to database
- "Too many connections" errors
- API requests timing out

**Diagnosis**:
```bash
# Check active connections
psql $NEON_DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
# If close to 20 (default pool size), we have exhaustion

# See who's connected
psql $NEON_DATABASE_URL -c "SELECT usename, application_name, state, count(*) FROM pg_stat_activity GROUP BY usename, application_name, state;"

# Check for idle transactions
psql $NEON_DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';"
```

**Resolution**:

1. **Restart service to reset connections**:
   ```bash
   # Identify culprit service (check which logs have DB errors)
   # Railway Dashboard → {Service} → Restart

   # Stagger restarts to avoid cascading failures
   # Restart one service every 30 seconds
   ```

2. **Increase connection pool** (if persistent):
   ```bash
   # Edit Railway environment variables
   # DATABASE_POOL_SIZE=30 (increase from 20)
   # Note: Neon free tier limited to 20 connections
   # May need to upgrade Neon plan
   ```

3. **Check for connection leaks** (permanent fix):
   ```bash
   # Code review: Are we closing connections?
   # Search: "async with", "with get_db()"

   # Check for long-running queries
   psql $NEON_DATABASE_URL -c "SELECT query, query_start FROM pg_stat_activity WHERE state != 'idle' ORDER BY query_start;"

   # If found, optimize or add timeout
   ```

### Incident 4: Chat Service Slow/Timeout

**Symptoms**:
- Chat responses taking >10 seconds
- Users seeing "chat unavailable"
- Chat service logs show timeout errors

**Diagnosis**:
```bash
# Check Qdrant vector DB health
curl http://qdrant-host:6333/health
# Should return 200

# Check OpenAI API latency
# OpenAI Dashboard → Usage → Latency metrics

# Check chat service logs
# Railway → chat-service → Logs
# Search: "timeout" OR "error" OR "latency"

# Check vector search timing
# Look for: "qdrant_search_time_ms"
```

**Resolution**:

1. **If Qdrant is slow**:
   ```bash
   # Check Qdrant memory/CPU
   # Railway Dashboard → qdrant → Resources

   # If near limits, restart Qdrant
   # Railway Dashboard → qdrant → Restart

   # If persistent, scale up
   # Railway → qdrant → Scale → Memory +1GB
   ```

2. **If OpenAI is slow**:
   ```bash
   # Check OpenAI status: https://status.openai.com/
   # If healthy, we're using too many tokens

   # Reduce chat context length
   # Edit: chat-service/app/config.py
   # CHAT_CONTEXT_WINDOW=5 (reduce from 10)
   ```

3. **If network latency**:
   ```bash
   # Check if services are in same region
   # Railway Dashboard → Services → Region
   # All should be same region

   # If not, recreate services in same region
   ```

4. **If database is bottleneck**:
   ```bash
   # Check query performance
   # Look for slow queries in logs

   # Add indexes on frequently searched fields
   # chat-service/migrations/add_indexes.sql
   # Run: Railway → chat-service → Deploy (triggers migration)
   ```

### Incident 5: Payment Webhook Delivery Failure

**Symptoms**:
- Stripe webhook shows "Resend" option
- Order statuses not updating
- Payment complete but order not created

**Diagnosis**:
```bash
# Check Stripe webhook delivery logs
# https://dashboard.stripe.com → Webhooks → Click endpoint → Events

# Check order service webhook handler logs
# Railway → order-service → Logs
# Search: "webhook" OR "payment_intent"

# Verify STRIPE_WEBHOOK_SECRET
# Railway → order-service → Variables → STRIPE_WEBHOOK_SECRET
```

**Resolution**:

1. **If webhook endpoint returns 500**:
   ```bash
   # Check order service logs for errors
   # Check database connection
   # Check STRIPE_WEBHOOK_SECRET validity

   # Restart service and retry
   # Railway Dashboard → order-service → Restart
   # https://dashboard.stripe.com → Webhooks → Click event → Resend
   ```

2. **If endpoint unreachable**:
   ```bash
   # Verify DNS resolves
   nslookup api.yourdomain.com

   # Verify SSL certificate valid
   openssl s_client -connect api.yourdomain.com:443

   # Check Stripe webhook URL config
   # https://dashboard.stripe.com → Webhooks → Update endpoint
   # Should be: https://api.yourdomain.com/api/v1/webhooks/stripe
   ```

3. **If idempotency issue** (payment processed twice):
   ```bash
   # Check for duplicate orders
   psql $NEON_DATABASE_URL -c "
   SELECT payment_intent_id, count(*) FROM orders
   GROUP BY payment_intent_id HAVING count(*) > 1;
   "

   # Manually mark duplicates as cancelled
   # Or implement idempotency key check in code
   ```

---

## Scaling & Performance

### When to Scale Up

**Trigger**: Error rate > 1% OR API latency p95 > 500ms

**Auto-scaling** (enabled in Railway):
- CPU > 70% → add instance
- Memory > 80% → add instance
- Max 5 instances per service

**Manual scaling**:

```bash
# Increase resources for specific service
# Railway Dashboard → {Service} → Scale
# Increase Memory to 1024MB
# Increase CPU to 0.5 vCPU

# Or scale replicas (add more instances)
# Railway Dashboard → {Service} → Replicas
# Change from 2 to 4
```

### Performance Optimization Checklist

1. **Database Query Optimization**:
   ```bash
   # Find slow queries
   # PostgreSQL slow query log: Set log_min_duration_statement=1000

   # Add indexes
   CREATE INDEX idx_products_category ON products(category);
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

2. **Caching Strategy**:
   ```bash
   # Cache product list (TTL 1 hour)
   # Cache search results (TTL 5 minutes)
   # Cache user profiles (TTL 10 minutes)
   # DO NOT cache: cart, payments, orders
   ```

3. **API Response Optimization**:
   ```bash
   # Reduce payload size
   - Return only required fields
   - Paginate large result sets (limit 50 items)
   - Use gzip compression (enabled in Nginx)

   # Add CORS caching
   Access-Control-Max-Age: 3600
   ```

4. **Chat Service Optimization**:
   ```bash
   # Reduce RAG search from top 10 to top 5 results
   # Cache embedding vectors
   # Limit context window to 5 messages
   # Use faster LLM model for simple queries
   ```

---

## Database Management

### Daily Tasks

```bash
# Check database size
psql $NEON_DATABASE_URL -c "
SELECT
  schemaname,
  sum(pg_total_relation_size(schemaname||'.'||tablename))/1024/1024 AS size_mb
FROM pg_tables
GROUP BY schemaname
ORDER BY size_mb DESC;
"

# Verify backups completed
# Neon Dashboard → Branches → main → Backups
# Should show daily backup from today

# Monitor slow queries
psql $NEON_DATABASE_URL -c "
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
"
```

### Weekly Tasks

```bash
# Run VACUUM to reclaim space
psql $NEON_DATABASE_URL -c "VACUUM ANALYZE;"

# Check table bloat
psql $NEON_DATABASE_URL -c "
SELECT schemaname, tablename,
  round(100 * pg_total_relation_size(schemaname||'.'||tablename) /
    pg_database_size(current_database()), 2) AS pct_total
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Review and optimize indexes
psql $NEON_DATABASE_URL -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_size DESC;
" # These unused indexes should be dropped
```

### Database Backup/Recovery

```bash
# View available backups (Neon)
# https://console.neon.tech → Branches → main → Backups

# Restore from backup (point-in-time recovery)
# 1. Create new branch from backup point
# 2. Test the data
# 3. Promote to main (switches production traffic)
# 4. Delete old main branch

# Manual backup to S3
pg_dump $NEON_DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
aws s3 cp backup-*.sql.gz s3://reusable-shop-backups/

# Restore from S3 backup
aws s3 cp s3://reusable-shop-backups/backup-YYYYMMDD.sql.gz - | gunzip | psql $NEON_DATABASE_URL
```

### Database Migrations

```bash
# Check pending migrations
alembic current

# Apply pending migrations
alembic upgrade head

# Rollback migrations (if needed)
alembic downgrade -1

# Create new migration
alembic revision --autogenerate -m "description"
```

---

## Payment Processing

### Stripe Webhook Events Monitored

1. `payment_intent.succeeded` → Create order
2. `payment_intent.payment_failed` → Send failure email
3. `charge.refunded` → Update order status
4. `customer.created` → Store customer metadata

### Stripe Testing

```bash
# Test successful payment (use test mode)
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

# Test payment failure
Card: 4000 0000 0000 0002

# Test rate limiting
Card: 4000 0000 0000 0341

# Manually trigger webhook (for testing)
curl -X POST https://api.yourdomain.com/api/v1/webhooks/stripe \
  -H "Stripe-Signature: $(stripe listen --print-secret)" \
  -d @webhook_payload.json
```

### Payment Issues Troubleshooting

```bash
# Check payment intent status
# https://dashboard.stripe.com → Payments → Filter by date

# Check webhook delivery
# https://dashboard.stripe.com → Webhooks → Click endpoint

# Check customer records
# https://dashboard.stripe.com → Customers

# If payment stuck in "processing"
# Wait 24-48 hours or contact Stripe support
```

---

## Deployment & Rollback

### Safe Deployment Process

1. **Pre-deployment checks** (automated by CI/CD):
   - [ ] All tests passing
   - [ ] Security scan passed
   - [ ] No database migrations (if possible)

2. **Create blue-green environment**:
   ```bash
   # Proposed version runs alongside current production
   # New instances created, old instances keep running
   ```

3. **Run smoke tests on green**:
   ```bash
   # Verify key endpoints
   - Homepage loads
   - Product page works
   - Add to cart functions
   - Checkout form submits
   - API health checks pass
   ```

4. **Switch traffic**:
   ```bash
   # Load balancer routes to green (new version)
   # Monitor metrics for 10 minutes
   ```

5. **Verify and finalize**:
   ```bash
   # If all good: Decommission blue (old version)
   # If issues: Switch back to blue, investigate green
   ```

### Rapid Rollback

```bash
# If deployment goes wrong
# Railway Dashboard → Services → {Service} → Deployments
# Click "Previous" deployment
# Click "Redeploy"
# Wait 30-60 seconds for traffic to switch back

# Verify rollback
curl https://api.yourdomain.com/api/health
# Should show previous version in response
```

### Database Migration Strategy

```bash
# For backward-compatible migrations:
1. Deploy code that handles new schema
2. Run migration
3. No rollback needed (backward compatible)

# For breaking migrations:
1. Create new column/table alongside old
2. Deploy code using new column
3. Once stable, remove old column in next release
```

---

## Escalation & Communication

### On-Call Rotation

```
Week 1: Alice (alice@company.com)
Week 2: Bob (bob@company.com)
Week 3: Charlie (charlie@company.com)
Week 4: David (david@company.com)

Escalation:
Primary: On-call engineer (immediate page)
Level 2: Tech lead (after 15 min no response)
Level 3: Engineering manager (after 30 min no response)
```

### Alerting Channels

| Severity | Channels | Response Time |
|----------|----------|---|
| SEV1 (Critical) | PagerDuty (SMS) + Slack + Email | 5 minutes |
| SEV2 (High) | Slack + Email | 15 minutes |
| SEV3 (Medium) | Slack | 1 hour |
| SEV4 (Low) | Ticket | 24 hours |

### Communication Template

```
🚨 INCIDENT: {Title}
SEVERITY: {SEV1/2/3/4}
IMPACT: {# users affected, business impact}

SYMPTOMS:
- {Symptom 1}
- {Symptom 2}

ROOT CAUSE: {To be determined or known}

STATUS: {Investigating/Working/Resolved}
ETA: {Expected resolution time}

NEXT UPDATE: {Time}
INCIDENT COMMANDER: {Name}
```

### Post-Incident Review (Postmortem)

Schedule within 48 hours of incident resolution.

**Questions to answer**:
1. What was the timeline?
2. What was the root cause?
3. Why did we not detect it sooner?
4. What systems failed?
5. What should we change?

**Output**: Create action items with owners and deadlines.

---

## Contact Information

**Engineering Team**:
- Tech Lead: tech-lead@company.com
- DevOps: devops@company.com
- Database: database-team@company.com

**External Contacts**:
- Stripe Support: support@stripe.com
- Neon Support: support@neon.tech
- Railway Support: support@railway.app
- Sentry Support: support@sentry.io

**Emergency Contacts**:
- CTO: cto@company.com (for escalation)
- VP Engineering: vp-eng@company.com (for escalation)

---

## Appendix: Common Commands

```bash
# View all logs in real-time
railway logs -f

# Check service metrics
railway status

# SSH into service
railway shell

# View environment variables
railway env

# Restart all services
railway down && railway up

# Deploy specific service
railway deploy {service-name}

# View deployment history
railway deploy --history
```

---

**Last Updated**: 2026-02-08
**Next Review**: 2026-03-08 (monthly)
**Created By**: DevOps Team
