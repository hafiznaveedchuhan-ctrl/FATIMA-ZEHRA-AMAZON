# Kubernetes Manifests

Production deployment manifests:

- **deployments/** - Service deployments
- **services/** - Service exposure
- **configmaps/** - Configuration management
- ***.yaml** - Complete K8s setup

Deploy with:
```bash
kubectl apply -f .
```

Requires: Kubernetes cluster (GKE, EKS, AKS, etc.)
