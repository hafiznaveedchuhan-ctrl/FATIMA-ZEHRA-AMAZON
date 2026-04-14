# Troubleshooting Guide - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Status**: Common Issues & Solutions

---

## Quick Diagnostics

### Run Full Health Check
```bash
./scripts/test.sh api

# Expected output:
# Testing user-service (port 8001)... ✅ OK
# Testing product-service (port 8002)... ✅ OK
# Testing order-service (port 8003)... ✅ OK
# Testing chat-service (port 8004)... ✅ OK
```

### Check System Status
```bash
# Docker Compose
docker-compose ps

# All running? Should show 6 services: postgres, 4 backends, frontend

# Manual services
ps aux | grep uvicorn
ps aux | grep node
```

---

## Common Issues & Solutions

### 1. Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:8001 | xargs kill -9

# Or for all ports at once
for port in 8001 8002 8003 8004 3000 5432; do
  lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# Then restart services
docker-compose up -d
```

---

### 2. Database Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:

**Step 1**: Verify DATABASE_URL
```bash
echo $DATABASE_URL
# Should show: postgresql://user:pass@host/dbname
```

**Step 2**: Test connection
```bash
# Install psql if needed
sudo apt install postgresql-client

# Test
psql $DATABASE_URL -c "SELECT 1"
```

**Step 3**: Check if using Neon
```bash
# For Neon, ensure sslmode=require
DATABASE_URL="postgresql://...?sslmode=require"

# Restart service
docker-compose restart user-service
```

**Step 4**: Check if local PostgreSQL running
```bash
# If using local DB
docker-compose exec postgres pg_isready

# If not running
docker-compose up -d postgres
sleep 10
```

---

### 3. Services Not Starting

**Error**: `Container exited with code 1`

**Solution**:

```bash
# Check logs
docker-compose logs user-service

# Common causes:
# 1. Missing dependencies
pip install -r requirements.txt

# 2. Wrong Python version
python --version  # Should be 3.9+

# 3. Port conflict
lsof -ti:8001

# 4. Missing environment variables
cat .env | grep DATABASE_URL
```

---

### 4. API Returning 500 Error

**Error**: `Internal Server Error`

**Solution**:

```bash
# Check service logs
docker-compose logs -f user-service

# Look for:
# - Import errors
# - Missing dependencies
# - Database connection issues
# - Unhandled exceptions

# Restart service
docker-compose restart user-service

# Or run with verbose logging
DEBUG=1 python -m uvicorn app.main:app --port 8001
```

---

### 5. Frontend Not Loading

**Error**: `Cannot GET http://localhost:3000`

**Solution**:

**If using Docker**:
```bash
# Check if frontend container running
docker-compose ps frontend

# Check logs
docker-compose logs frontend

# Restart
docker-compose restart frontend
```

**If using npm dev**:
```bash
cd app/frontend

# Check if running
npm run dev

# If error, clear cache
rm -rf node_modules
npm install --legacy-peer-deps
npm run dev
```

---

### 6. Authentication Not Working

**Error**: `401 Unauthorized` or `Invalid token`

**Solution**:

```bash
# 1. Check JWT_SECRET is set
echo $JWT_SECRET

# 2. If empty, generate and set
JWT_SECRET=$(openssl rand -hex 16)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# 3. Restart all services
docker-compose down
docker-compose up -d

# 4. Test login
curl -X POST http://localhost:8001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'

# Should return JWT token
```

---

### 7. Chat Not Working

**Error**: `OpenAI API key invalid` or `Chat returns error`

**Solution**:

```bash
# 1. Check API key
echo $OPENAI_API_KEY

# 2. Verify format (should start with sk-)
if ! [[ $OPENAI_API_KEY =~ ^sk- ]]; then
  echo "Invalid API key format"
fi

# 3. Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 4. Check service logs
docker-compose logs chat-service

# 5. Update .env and restart
docker-compose restart chat-service
```

---

### 8. Database Not Seeded

**Error**: No products showing, or seed script fails

**Solution**:

```bash
# 1. Check seed script permissions
ls -la scripts/seed-database.sh

# 2. Make executable
chmod +x scripts/seed-database.sh

# 3. Run manually
./scripts/seed-database.sh

# 4. If still fails, check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"

# 5. Seed manually
psql $DATABASE_URL < database/seeds/sample_products.sql
```

---

### 9. Frontend API Calls Failing

**Error**: `Failed to fetch` or `CORS error`

**Solution**:

**Check browser console** (F12):
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**:
```python
# app/backend/user-service/app/main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Verify CORS configured**:
```bash
curl -i -X OPTIONS http://localhost:8001/api/users/login \
  -H "Origin: http://localhost:3000"

# Should see:
# Access-Control-Allow-Origin: http://localhost:3000
```

---

### 10. Memory/Performance Issues

**Error**: App slow, services crash, memory full

**Solution**:

```bash
# Check resource usage
docker-compose stats

# If high CPU/Memory:
# 1. Reduce concurrent connections
max_connections = 5

# 2. Increase timeout for slow queries
timeout = 300

# 3. Enable connection pooling
pool_size = 10
max_overflow = 0

# 4. Scale horizontally
docker-compose up -d --scale user-service=3
```

---

## Debugging Techniques

### Enable Debug Logging

```bash
# Set environment variable
DEBUG=1

# Run service
DEBUG=1 python -m uvicorn app.main:app --port 8001

# Or in docker-compose.yml
environment:
  - DEBUG=1
```

### Check API Response Headers

```bash
# Inspect request/response
curl -v http://localhost:8001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Shows:
# - Status code
# - Headers
# - Response body
```

### Database Query Logging

```python
# Add to database.py
import logging

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Browser DevTools

```
F12 → Network Tab
- Check API calls
- View response status
- Check request headers

F12 → Console Tab
- Check JavaScript errors
- View log messages

F12 → Application Tab
- Check localStorage
- Check cookies
```

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user ON orders(user_id);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;
```

### Caching

```python
# Cache product list
from functools import lru_cache

@lru_cache(maxsize=100)
def get_products():
    # Cached for 1 hour
    return db.query(Product).all()
```

### Query Optimization

```python
# Bad: N+1 queries
products = db.query(Product).all()
for product in products:
    print(product.category.name)  # Extra query per product

# Good: Join query
products = db.query(Product).join(Category).all()
```

---

## Logs & Monitoring

### View Logs

```bash
# All services
docker-compose logs

# Single service
docker-compose logs user-service

# Follow logs
docker-compose logs -f

# Last N lines
docker-compose logs --tail=50

# Timestamps
docker-compose logs -t
```

### Save Logs

```bash
# Save to file
docker-compose logs > logs.txt

# For single service
docker-compose logs user-service > user-service.log
```

---

## Reset Everything

### If All Else Fails

```bash
# DANGER: This deletes all data!

# Stop services
docker-compose down -v

# Clean cache
./scripts/cleanup.sh all

# Rebuild
docker-compose build

# Start fresh
docker-compose up -d

# Seed database
./scripts/seed-database.sh
```

---

## Get Help

### Check Logs First
```bash
docker-compose logs | grep -i error
```

### Enable Verbose Mode
```bash
# Python
DEBUG=True python -m uvicorn app.main:app

# Docker
docker-compose up --verbose
```

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | Service not running | Start service |
| `CORS error` | CORS not configured | Add CORS middleware |
| `401 Unauthorized` | Invalid token | Re-login |
| `400 Bad Request` | Invalid input | Check request format |
| `500 Internal Error` | Server error | Check logs |
| `Database connection failed` | DB not running | Start database |

---

## Performance Metrics

### Load Times
```
Homepage:  < 2 seconds
API:       < 200ms
Database:  < 50ms
Chat:      < 1 second (with streaming)
```

### Targets
```
LCP (Largest Contentful Paint):  < 2.5s
FCP (First Contentful Paint):    < 1.5s
CLS (Cumulative Layout Shift):   < 0.1
```

---

## Contact Support

If issues persist:
1. Check this guide
2. Review logs
3. Check GitHub issues
4. Contact development team

---

**Troubleshooting Guide Version**: 1.0
**Last Updated**: 2026-01-26
**Maintained By**: Fatima Zehra Boutique Team

