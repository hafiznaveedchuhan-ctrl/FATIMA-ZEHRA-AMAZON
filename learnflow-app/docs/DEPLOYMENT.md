# Deployment Guide - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Status**: Production Ready

---

## Deployment Options

### Option 1: Docker Compose (Local/Self-Hosted)

**Best For**: Development, small teams, on-premises

**Setup**:
```bash
# Copy .env and fill with production values
cp .env.example .env

# Start all services
docker-compose -f docker-compose.yml up -d

# Verify running
docker-compose ps

# View logs
docker-compose logs -f
```

**Services**:
- PostgreSQL (port 5432)
- User Service (port 8001)
- Product Service (port 8002)
- Order Service (port 8003)
- Chat Service (port 8004)
- Frontend (port 3000 via nginx)

**Environment Variables**:
```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret
```

---

### Option 2: Kubernetes (Production Cloud)

**Best For**: Enterprise, high availability, auto-scaling

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Create cluster (choose one)
# - GKE: gcloud container clusters create learnflow
# - EKS: eksctl create cluster --name learnflow
# - AKS: az aks create --resource-group mygroup --name learnflow
# - Minikube (local): minikube start
```

#### Deploy
```bash
# Create namespace
kubectl create namespace learnflow

# Create secrets
kubectl create secret generic learnflow-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=OPENAI_API_KEY="sk-..." \
  --from-literal=JWT_SECRET="your-secret" \
  -n learnflow

# Deploy services
kubectl apply -f deploy/kubernetes/ -n learnflow

# Verify deployment
kubectl get pods -n learnflow
kubectl get svc -n learnflow
```

#### Manifests in `deploy/kubernetes/`:
- `namespace.yaml` - Namespace isolation
- `secrets.yaml` - Environment variables
- `user-service.yaml` - User service deployment
- `product-service.yaml` - Product service deployment
- `order-service.yaml` - Order service deployment
- `chat-service.yaml` - Chat service deployment
- `frontend.yaml` - Frontend deployment
- `database.yaml` - PostgreSQL StatefulSet (optional)
- `ingress.yaml` - Ingress routing

#### Scaling
```bash
# Scale user service to 3 replicas
kubectl scale deployment user-service --replicas=3 -n learnflow

# Auto-scaling
kubectl autoscale deployment user-service --min=2 --max=10 -n learnflow
```

---

### Option 3: Helm (Package Management)

**Best For**: Repeatable deployments, multiple environments

#### Install Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Deploy
```bash
# Create values file
cp deploy/helm/values.yaml deploy/helm/values-prod.yaml

# Edit with production values
vim deploy/helm/values-prod.yaml

# Install chart
helm install learnflow deploy/helm/learnflow-chart \
  -f deploy/helm/values-prod.yaml \
  -n learnflow --create-namespace

# Verify
helm list -n learnflow

# Upgrade later
helm upgrade learnflow deploy/helm/learnflow-chart \
  -f deploy/helm/values-prod.yaml \
  -n learnflow
```

---

### Option 4: Netlify (Frontend + Serverless Backend)

**Best For**: Fast setup, low cost, static frontend

#### Frontend Deployment

**Configure Next.js Static Export**:
```javascript
// next.config.js
module.exports = {
  output: 'export',
  basePath: '/fatima-zehra-boutique',
  images: {
    unoptimized: true
  }
}
```

**Deploy to GitHub Pages**:
```bash
# Build static export
cd app/frontend
npm run build

# Deploy to gh-pages branch
npm run deploy
```

**Or use Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
netlify deploy --prod
```

#### Backend Deployment (Netlify Functions)

**Wrap FastAPI with Mangum**:
```python
# netlify/functions/user-service.py
from mangum import Mangum
from app.main import app

handler = Mangum(app)
```

**Configure**:
```toml
# netlify.toml
[build]
  command = "pip install -r requirements.txt"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

**Deploy**:
```bash
netlify deploy --prod
```

---

### Option 5: Docker Hub / Private Registry

**Best For**: Container orchestration

#### Build Images
```bash
# Build all services
./scripts/build.sh docker

# Tag images
docker tag learnflow-user-service myregistry/learnflow-user-service:1.0
docker tag learnflow-product-service myregistry/learnflow-product-service:1.0
docker tag learnflow-order-service myregistry/learnflow-order-service:1.0
docker tag learnflow-chat-service myregistry/learnflow-chat-service:1.0
```

#### Push to Registry
```bash
# Login
docker login

# Push
docker push myregistry/learnflow-user-service:1.0
docker push myregistry/learnflow-product-service:1.0
docker push myregistry/learnflow-order-service:1.0
docker push myregistry/learnflow-chat-service:1.0
```

---

## Database Deployment

### Neon PostgreSQL (Recommended)

**Setup**:
1. Go to https://console.neon.tech
2. Create account
3. Create project
4. Copy connection string
5. Add to environment: `DATABASE_URL=...`

**Advantages**:
- Serverless (no management)
- Auto-scaling
- 512MB free tier
- Connection pooling included
- Backups automatic

### Self-Hosted PostgreSQL

**AWS RDS**:
```bash
# Create instance
aws rds create-db-instance \
  --db-instance-identifier learnflow-db \
  --engine postgres \
  --db-instance-class db.t3.micro \
  --allocated-storage 20

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier learnflow-db
```

**DigitalOcean Managed Databases**:
- https://www.digitalocean.com/products/managed-databases

**Azure Database for PostgreSQL**:
- https://azure.microsoft.com/en-us/services/postgresql/

---

## Domain & SSL

### Custom Domain
```bash
# Point domain to deployment
# For GitHub Pages: Add CNAME file
echo "yourdomain.com" > CNAME

# For Netlify: Add in Site settings
# For K8s Ingress: Update DNS records

# For Docker: Use reverse proxy (nginx/Traefik)
```

### SSL Certificate
```bash
# Let's Encrypt (free)
# For Kubernetes: cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# For Docker: Traefik with Let's Encrypt
# For Netlify: Automatic
# For GitHub Pages: Automatic
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run Tests
        run: ./scripts/test.sh

      - name: Build
        run: ./scripts/build.sh

      - name: Deploy to Kubernetes
        run: kubectl apply -f deploy/kubernetes/
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

---

## Monitoring & Logging

### Logging
```bash
# Docker Compose
docker-compose logs -f user-service

# Kubernetes
kubectl logs -f deployment/user-service -n learnflow

# Centralized (ELK Stack)
# Ship logs to Elasticsearch
```

### Metrics
```bash
# Kubernetes built-in
kubectl top nodes
kubectl top pods -n learnflow

# Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack

# Datadog / New Relic / etc
# Configure in app
```

### Health Checks
```bash
# Each service has health check endpoint
curl http://localhost:8001/health
```

---

## Backup & Recovery

### Database Backups
```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Automated (Neon)
# Automatic daily backups included
```

### Application Backups
```bash
# Docker volumes
docker run --rm \
  -v learnflow_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  busybox tar czf /backup/db-backup.tar.gz /data
```

---

## Production Checklist

- [ ] Environment variables set (no hardcoded secrets)
- [ ] Database connection tested
- [ ] All services health checks passing
- [ ] SSL/TLS configured
- [ ] Domain configured
- [ ] Monitoring/logging setup
- [ ] Backups configured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Load balancer configured (if needed)
- [ ] CDN configured (if needed)
- [ ] Alerting setup
- [ ] Runbooks prepared
- [ ] Team trained
- [ ] Smoke tests passing

---

## Scaling Guide

### Vertical Scaling (Increase resources)
```bash
# Kubernetes
kubectl set resources deployment user-service \
  --limits=cpu=500m,memory=512Mi \
  --requests=cpu=250m,memory=256Mi

# Docker Compose
# Increase in docker-compose.yml: cpus, mem_limit
```

### Horizontal Scaling (More instances)
```bash
# Kubernetes
kubectl scale deployment user-service --replicas=5

# Docker Compose
# Add more service definitions
```

---

## Rollback Procedure

```bash
# Kubernetes
kubectl rollout undo deployment/user-service

# Helm
helm rollback learnflow

# Docker Compose
# Manual: revert image tags and restart
```

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2026-01-26

