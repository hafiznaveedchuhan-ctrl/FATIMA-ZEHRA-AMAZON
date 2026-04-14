# Kubernetes Production Deployment - Boutique Shop

Complete Kubernetes manifests for deploying the Men's Boutique E-Commerce Platform to production with full RBAC, persistent storage, and production-grade configurations.

## 📋 Overview

This directory contains all Kubernetes manifests needed to deploy the complete boutique shop application:

| Component | Type | Replicas | Port |
|-----------|------|----------|------|
| PostgreSQL | StatefulSet | 1 | 5432 |
| Qdrant Vector DB | StatefulSet | 1 | 6333 |
| User Service | Deployment | 2 | 8000 |
| Product Service | Deployment | 2 | 8000 |
| Order Service | Deployment | 2 | 8000 |
| Chat Service | Deployment | 2 | 8000 |
| Frontend (Next.js) | Deployment | 2 | 3000 |
| NGINX Gateway | Deployment | 2 | 80/30080 |

## 📂 Directory Structure

```
k8s/
├── 00-namespace.yaml              # boutique-shop namespace
├── rbac/
│   ├── 01-serviceaccount.yaml      # ServiceAccount + Token Secret
│   ├── 02-role.yaml                # App Role
│   ├── 03-rolebinding.yaml         # App RoleBinding
│   ├── 04-devuser-role.yaml        # Dev team read-only Role
│   └── 05-devuser-rolebinding.yaml # Dev team RoleBinding
├── config/
│   ├── 06-configmap.yaml           # Non-sensitive configuration
│   └── 07-secrets.yaml             # Sensitive secrets (update required)
├── storage/
│   ├── 08-postgres-pvc.yaml        # 5Gi PostgreSQL storage
│   └── 09-qdrant-pvc.yaml          # 3Gi Qdrant storage
├── workloads/
│   ├── 10-postgres-statefulset.yaml    # PostgreSQL DB
│   ├── 11-qdrant-statefulset.yaml      # Vector database
│   ├── 12-user-service.yaml            # User authentication service
│   ├── 13-product-service.yaml         # Product catalog service
│   ├── 14-order-service.yaml           # Orders + Stripe payments
│   ├── 15-chat-service.yaml            # Chat + RAG system
│   ├── 16-frontend.yaml                # Next.js frontend
│   └── 17-nginx.yaml                   # API Gateway + reverse proxy
├── kustomization.yaml              # Kustomize configuration
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (1.24+) — local (minikube/kubeadm) or cloud (GKE/AKS/DOKS)
- `kubectl` configured with cluster access
- Docker images built and available:
  - `boutique-user-service:latest`
  - `boutique-product-service:latest`
  - `boutique-order-service:latest`
  - `boutique-chat-service:latest`
  - `boutique-frontend:latest`
  - `nginx:alpine` (public)
  - `postgres:15-alpine` (public)
  - `qdrant/qdrant:latest` (public)

### Step 1: Build Docker Images

```bash
cd learnflow-app

# Build all microservice images
docker build -t boutique-user-service:latest ./app/backend/user-service
docker build -t boutique-product-service:latest ./app/backend/product-service
docker build -t boutique-order-service:latest ./app/backend/order-service
docker build -t boutique-chat-service:latest ./app/backend/chat-service
docker build -t boutique-frontend:latest ./app/frontend
```

**For Minikube**: Load images into minikube
```bash
minikube image load boutique-user-service:latest
minikube image load boutique-product-service:latest
minikube image load boutique-order-service:latest
minikube image load boutique-chat-service:latest
minikube image load boutique-frontend:latest
```

### Step 2: Update Secrets

Edit `k8s/config/07-secrets.yaml` and replace placeholders:

```bash
# Get your actual API keys
export OPENAI_API_KEY="sk-your-actual-key"
export STRIPE_SECRET_KEY="sk_live_your-key"
export STRIPE_WEBHOOK_SECRET="whsec_your-secret"

# Create/update the secret (after applying initial manifests)
kubectl create secret generic boutique-secrets -n boutique-shop \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --from-literal=STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  --from-literal=STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 3: Deploy Everything

```bash
# Deploy all manifests in order using kustomize
kubectl apply -k learnflow-app/k8s/

# Watch deployment progress
kubectl get all -n boutique-shop -w
```

### Step 4: Verify Deployment

```bash
# Check all resources are created
kubectl get all -n boutique-shop

# Check specific components
kubectl get statefulsets -n boutique-shop
kubectl get deployments -n boutique-shop
kubectl get services -n boutique-shop

# Check pod logs
kubectl logs -n boutique-shop deploy/user-service
kubectl logs -n boutique-shop statefulset/postgres
```

### Step 5: Access the Application

```bash
# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
# If ExternalIP not available, use:
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

# Access via NGINX NodePort
echo "Application: http://${NODE_IP}:30080"
```

**For Local Testing (Port Forward)**:
```bash
# Forward NGINX port
kubectl port-forward -n boutique-shop svc/nginx-service 8080:80

# Access at http://localhost:8080
```

## 🔐 RBAC (Role-Based Access Control)

### Application Service Account

**Name**: `boutique-sa`
**Role**: `boutique-app-role`
**Permissions**:
- Read configmaps
- Read secrets
- Get/list/watch pods, services, endpoints, events

### Development Team Access

**User**: `dev-user`
**Role**: `boutique-devuser-role`
**Permissions** (read-only):
- Get/list/watch pods, deployments, statefulsets
- View pod logs
- View events and services
- **No secret access** (enforced)

### Verify RBAC

```bash
# Check service account
kubectl get sa -n boutique-shop

# Check roles
kubectl get role -n boutique-shop

# Verify permissions
kubectl auth can-i get secrets --as=system:serviceaccount:boutique-shop:boutique-sa -n boutique-shop
# Should return: yes

kubectl auth can-i delete pods --as=dev-user -n boutique-shop
# Should return: no (RBAC enforced)
```

## 💾 Persistent Storage

### PostgreSQL

- **PVC**: `postgres-pvc` (5Gi)
- **Mount Path**: `/var/lib/postgresql/data`
- **Storage Class**: `standard`
- **Access Mode**: ReadWriteOnce

### Qdrant

- **PVC**: `qdrant-pvc` (3Gi)
- **Mount Path**: `/qdrant/storage`
- **Storage Class**: `standard`
- **Access Mode**: ReadWriteOnce

### Check PVCs

```bash
kubectl get pvc -n boutique-shop

# Watch volume binding
kubectl get pvc -n boutique-shop -w
```

## 🛠️ Configuration Management

### ConfigMap (`boutique-config`)

Non-sensitive environment variables:
- Database connection info (host, port, name)
- Service URLs (internal DNS)
- Qdrant configuration
- Application environment (production)

### Secrets (`boutique-secrets`)

Sensitive values (base64-encoded):
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Update Configuration

```bash
# Update ConfigMap
kubectl patch configmap boutique-config -n boutique-shop --type merge \
  -p '{"data":{"LOG_LEVEL":"debug"}}'

# Update Secrets
kubectl patch secret boutique-secrets -n boutique-shop --type merge \
  -p '{"stringData":{"OPENAI_API_KEY":"sk-new-key"}}'
```

## 📊 Monitoring & Observability

### Health Checks

All deployments include:
- **Liveness Probe**: Checks if pod should be restarted
- **Readiness Probe**: Checks if pod can accept traffic

```bash
# Check probe status
kubectl describe pod -n boutique-shop <pod-name>
kubectl get event -n boutique-shop
```

### View Logs

```bash
# Single pod
kubectl logs -n boutique-shop pod/<pod-name>

# Deployment (all replicas)
kubectl logs -n boutique-shop deploy/<deployment-name>

# Follow logs
kubectl logs -f -n boutique-shop deploy/user-service

# Previous logs (if pod crashed)
kubectl logs -n boutique-shop pod/<pod-name> --previous
```

### Resource Usage

```bash
# Check resource consumption
kubectl top nodes
kubectl top pods -n boutique-shop

# Watch in real-time
kubectl top pods -n boutique-shop -w
```

## 🔄 Rolling Updates

All deployments use **RollingUpdate** strategy:
- `maxSurge: 1` — One extra pod during update
- `maxUnavailable: 0` — Zero downtime

```bash
# Update image
kubectl set image deployment/user-service \
  user-service=boutique-user-service:v2 \
  -n boutique-shop

# Check rollout status
kubectl rollout status deployment/user-service -n boutique-shop

# Rollback if needed
kubectl rollout undo deployment/user-service -n boutique-shop
```

## 🧪 Scaling

```bash
# Scale specific deployment
kubectl scale deployment/user-service --replicas=3 -n boutique-shop

# Watch scaling progress
kubectl get deployment/user-service -n boutique-shop -w
```

## 🔍 Troubleshooting

### Pods not starting?

```bash
# Describe pod to see events
kubectl describe pod -n boutique-shop <pod-name>

# Check pod logs for errors
kubectl logs -n boutique-shop <pod-name>

# Check resource limits
kubectl describe node <node-name>
```

### Service connectivity issues?

```bash
# Test DNS from within cluster
kubectl exec -it -n boutique-shop pod/<pod-name> -- nslookup postgres-service

# Check service endpoints
kubectl get endpoints -n boutique-shop

# Test service connectivity
kubectl exec -it -n boutique-shop pod/<pod-name> -- curl http://postgres-service:5432
```

### Database connection failed?

```bash
# Check postgres pod logs
kubectl logs -n boutique-shop statefulset/postgres

# Check if PVC is bound
kubectl get pvc -n boutique-shop

# Connect to postgres container
kubectl exec -it -n boutique-shop postgres-0 -- psql -U postgres
```

### Secret not found?

```bash
# Verify secret exists
kubectl get secret -n boutique-shop boutique-secrets

# Check secret contents (base64 encoded)
kubectl get secret boutique-secrets -n boutique-shop -o yaml
```

## 📝 Deployment Checklist

- [ ] Kubernetes cluster running (1.24+)
- [ ] Docker images built and available
- [ ] Secrets updated with real API keys
- [ ] `kubectl` configured and cluster access verified
- [ ] Run `kubectl apply -k learnflow-app/k8s/`
- [ ] All pods in `Running` state: `kubectl get pods -n boutique-shop`
- [ ] All services have endpoints: `kubectl get endpoints -n boutique-shop`
- [ ] Test frontend: `curl http://NODE_IP:30080`
- [ ] Test API: `curl http://NODE_IP:30080/health`
- [ ] Test database: `kubectl exec -it postgres-0 -- psql -U postgres -c "SELECT 1"`
- [ ] Check logs for errors: `kubectl logs -n boutique-shop -l app.kubernetes.io/name=boutique-shop`

## 🚨 Production Considerations

### Storage

For production, use:
- **Cloud-managed**: Managed PostgreSQL (Cloud SQL, RDS, Aurora)
- **HA Setup**: Primary/replica PostgreSQL on K8s with CloudNativePG operator
- **Backup**: Enable automated backups (daily)

### Networking

- **Ingress Controller**: Use NGINX Ingress or cloud provider
- **TLS/HTTPS**: Configure cert-manager for SSL certificates
- **Network Policy**: Restrict traffic between pods

### Security

- **Image Registry**: Use private registry for custom images
- **Secrets Management**: Use external secret manager (Vault, AWS Secrets Manager)
- **Pod Security Policy**: Enforce security policies
- **Network Policy**: Implement network segmentation

### Scalability

- **Horizontal Pod Autoscaler (HPA)**: Auto-scale based on CPU/memory
- **Vertical Pod Autoscaler (VPA)**: Right-size resource requests
- **Service Mesh**: Implement Istio/Linkerd for advanced traffic management

## 📚 References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Guide](https://kustomize.io/)
- [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review pod logs: `kubectl logs -n boutique-shop <pod>`
3. Check events: `kubectl get events -n boutique-shop --sort-by='.lastTimestamp'`
4. Inspect manifests: `kubectl describe <resource-type> -n boutique-shop <name>`

---

**Version**: 1.0.0
**Updated**: 2026-03-14
**Maintainer**: DevOps Team
