#!/bin/bash

# Kubernetes Deployment Verification Script
# Comprehensive checks for boutique-shop deployment
# Usage: ./verify-deployment.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="boutique-shop"
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Kubernetes Deployment Verification - Boutique Shop${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS_COUNT++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL_COUNT++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARN_COUNT++))
}

# 1. Namespace Check
echo -e "${BLUE}1. NAMESPACE${NC}"
if kubectl get namespace "$NAMESPACE" &>/dev/null; then
  check_pass "Namespace '$NAMESPACE' exists"
  ns_status=$(kubectl get ns "$NAMESPACE" -o jsonpath='{.status.phase}')
  if [ "$ns_status" == "Active" ]; then
    check_pass "Namespace is Active"
  else
    check_fail "Namespace status is $ns_status (expected Active)"
  fi
else
  check_fail "Namespace '$NAMESPACE' not found"
fi
echo ""

# 2. RBAC Check
echo -e "${BLUE}2. RBAC (Role-Based Access Control)${NC}"
if kubectl get sa -n "$NAMESPACE" boutique-sa &>/dev/null; then
  check_pass "ServiceAccount 'boutique-sa' exists"
else
  check_fail "ServiceAccount 'boutique-sa' not found"
fi

if kubectl get secret -n "$NAMESPACE" boutique-sa-token &>/dev/null; then
  check_pass "ServiceAccount token secret exists"
  token=$(kubectl get secret -n "$NAMESPACE" boutique-sa-token -o jsonpath='{.data.token}' | base64 -d 2>/dev/null | wc -c)
  if [ "$token" -gt 0 ]; then
    check_pass "ServiceAccount token is valid ($token bytes)"
  else
    check_fail "ServiceAccount token is empty"
  fi
else
  check_fail "ServiceAccount token secret not found"
fi

if kubectl get role -n "$NAMESPACE" boutique-app-role &>/dev/null; then
  check_pass "Role 'boutique-app-role' exists"
else
  check_fail "Role 'boutique-app-role' not found"
fi

if kubectl get rolebinding -n "$NAMESPACE" boutique-app-rolebinding &>/dev/null; then
  check_pass "RoleBinding 'boutique-app-rolebinding' exists"
else
  check_fail "RoleBinding 'boutique-app-rolebinding' not found"
fi

if kubectl get role -n "$NAMESPACE" boutique-devuser-role &>/dev/null; then
  check_pass "DevUser Role 'boutique-devuser-role' exists"
else
  check_fail "DevUser Role 'boutique-devuser-role' not found"
fi
echo ""

# 3. Configuration Check
echo -e "${BLUE}3. CONFIGURATION & SECRETS${NC}"
if kubectl get configmap -n "$NAMESPACE" boutique-config &>/dev/null; then
  check_pass "ConfigMap 'boutique-config' exists"
  cm_keys=$(kubectl get configmap -n "$NAMESPACE" boutique-config -o jsonpath='{.data}' | grep -o '"[^"]*":' | wc -l)
  check_pass "ConfigMap has $cm_keys configuration keys"
else
  check_fail "ConfigMap 'boutique-config' not found"
fi

if kubectl get secret -n "$NAMESPACE" boutique-secrets &>/dev/null; then
  check_pass "Secret 'boutique-secrets' exists"
  secret_keys=$(kubectl get secret -n "$NAMESPACE" boutique-secrets -o jsonpath='{.data}' | grep -o '"[^"]*":' | wc -l)
  if [ "$secret_keys" -ge 3 ]; then
    check_pass "Secret has $secret_keys keys (expected ≥3)"
  else
    check_warn "Secret has $secret_keys keys (expected ≥3 for full config)"
  fi
else
  check_fail "Secret 'boutique-secrets' not found"
fi
echo ""

# 4. Storage Check
echo -e "${BLUE}4. PERSISTENT STORAGE${NC}"
if kubectl get pvc -n "$NAMESPACE" postgres-pvc &>/dev/null; then
  pvc_status=$(kubectl get pvc -n "$NAMESPACE" postgres-pvc -o jsonpath='{.status.phase}')
  if [ "$pvc_status" == "Bound" ]; then
    check_pass "PostgreSQL PVC is Bound (5Gi)"
  else
    check_fail "PostgreSQL PVC status is $pvc_status (expected Bound)"
  fi
else
  check_fail "PostgreSQL PVC not found"
fi

if kubectl get pvc -n "$NAMESPACE" qdrant-pvc &>/dev/null; then
  pvc_status=$(kubectl get pvc -n "$NAMESPACE" qdrant-pvc -o jsonpath='{.status.phase}')
  if [ "$pvc_status" == "Bound" ]; then
    check_pass "Qdrant PVC is Bound (3Gi)"
  else
    check_fail "Qdrant PVC status is $pvc_status (expected Bound)"
  fi
else
  check_fail "Qdrant PVC not found"
fi
echo ""

# 5. Stateful Services Check
echo -e "${BLUE}5. STATEFUL SERVICES (PostgreSQL & Qdrant)${NC}"
if kubectl get statefulset -n "$NAMESPACE" postgres &>/dev/null; then
  pg_ready=$(kubectl get statefulset -n "$NAMESPACE" postgres -o jsonpath='{.status.readyReplicas}')
  pg_desired=$(kubectl get statefulset -n "$NAMESPACE" postgres -o jsonpath='{.spec.replicas}')
  if [ "$pg_ready" == "$pg_desired" ] && [ "$pg_desired" == "1" ]; then
    check_pass "PostgreSQL StatefulSet: 1/1 Ready"
  else
    check_fail "PostgreSQL StatefulSet: $pg_ready/$pg_desired Ready (expected 1/1)"
  fi

  # Check postgres pod is running
  if kubectl get pod -n "$NAMESPACE" postgres-0 &>/dev/null; then
    pg_status=$(kubectl get pod -n "$NAMESPACE" postgres-0 -o jsonpath='{.status.phase}')
    if [ "$pg_status" == "Running" ]; then
      check_pass "PostgreSQL pod 'postgres-0' is Running"
    else
      check_fail "PostgreSQL pod status is $pg_status (expected Running)"
    fi
  fi
else
  check_fail "PostgreSQL StatefulSet not found"
fi

if kubectl get statefulset -n "$NAMESPACE" qdrant &>/dev/null; then
  qd_ready=$(kubectl get statefulset -n "$NAMESPACE" qdrant -o jsonpath='{.status.readyReplicas}')
  qd_desired=$(kubectl get statefulset -n "$NAMESPACE" qdrant -o jsonpath='{.spec.replicas}')
  if [ "$qd_ready" == "$qd_desired" ] && [ "$qd_desired" == "1" ]; then
    check_pass "Qdrant StatefulSet: 1/1 Ready"
  else
    check_fail "Qdrant StatefulSet: $qd_ready/$qd_desired Ready (expected 1/1)"
  fi

  # Check qdrant pod is running
  if kubectl get pod -n "$NAMESPACE" qdrant-0 &>/dev/null; then
    qd_status=$(kubectl get pod -n "$NAMESPACE" qdrant-0 -o jsonpath='{.status.phase}')
    if [ "$qd_status" == "Running" ]; then
      check_pass "Qdrant pod 'qdrant-0' is Running"
    else
      check_fail "Qdrant pod status is $qd_status (expected Running)"
    fi
  fi
else
  check_fail "Qdrant StatefulSet not found"
fi
echo ""

# 6. Microservices Check
echo -e "${BLUE}6. MICROSERVICES${NC}"
services=("user-service" "product-service" "order-service" "chat-service")
for svc in "${services[@]}"; do
  if kubectl get deployment -n "$NAMESPACE" "$svc" &>/dev/null; then
    ready=$(kubectl get deployment -n "$NAMESPACE" "$svc" -o jsonpath='{.status.readyReplicas}')
    desired=$(kubectl get deployment -n "$NAMESPACE" "$svc" -o jsonpath='{.spec.replicas}')
    if [ "$ready" == "$desired" ] && [ "$desired" == "2" ]; then
      check_pass "$svc: 2/2 Ready"
    else
      check_fail "$svc: $ready/$desired Ready (expected 2/2)"
    fi
  else
    check_fail "$svc Deployment not found"
  fi
done
echo ""

# 7. Frontend & Gateway Check
echo -e "${BLUE}7. FRONTEND & GATEWAY${NC}"
if kubectl get deployment -n "$NAMESPACE" frontend &>/dev/null; then
  ready=$(kubectl get deployment -n "$NAMESPACE" frontend -o jsonpath='{.status.readyReplicas}')
  desired=$(kubectl get deployment -n "$NAMESPACE" frontend -o jsonpath='{.spec.replicas}')
  if [ "$ready" == "$desired" ] && [ "$desired" == "2" ]; then
    check_pass "Frontend: 2/2 Ready"
  else
    check_fail "Frontend: $ready/$desired Ready (expected 2/2)"
  fi
else
  check_fail "Frontend Deployment not found"
fi

if kubectl get deployment -n "$NAMESPACE" nginx &>/dev/null; then
  ready=$(kubectl get deployment -n "$NAMESPACE" nginx -o jsonpath='{.status.readyReplicas}')
  desired=$(kubectl get deployment -n "$NAMESPACE" nginx -o jsonpath='{.spec.replicas}')
  if [ "$ready" == "$desired" ] && [ "$desired" == "2" ]; then
    check_pass "NGINX Gateway: 2/2 Ready"
  else
    check_fail "NGINX Gateway: $ready/$desired Ready (expected 2/2)"
  fi
else
  check_fail "NGINX Gateway Deployment not found"
fi
echo ""

# 8. Services & Networking Check
echo -e "${BLUE}8. SERVICES & NETWORKING${NC}"
services_list=("postgres-service" "qdrant-service" "user-service" "product-service" "order-service" "chat-service" "frontend" "nginx-service")
for svc in "${services_list[@]}"; do
  if kubectl get svc -n "$NAMESPACE" "$svc" &>/dev/null; then
    check_pass "Service '$svc' exists"
  else
    check_fail "Service '$svc' not found"
  fi
done

# Check NGINX NodePort
if kubectl get svc -n "$NAMESPACE" nginx-service &>/dev/null; then
  nodeport=$(kubectl get svc -n "$NAMESPACE" nginx-service -o jsonpath='{.spec.ports[0].nodePort}')
  if [ "$nodeport" == "30080" ]; then
    check_pass "NGINX service exposed on NodePort 30080"
  else
    check_warn "NGINX service exposed on NodePort $nodeport (expected 30080)"
  fi
fi

# Check endpoints
endpoints=$(kubectl get endpoints -n "$NAMESPACE" --no-headers | wc -l)
if [ "$endpoints" -ge 8 ]; then
  check_pass "All service endpoints configured ($endpoints found)"
else
  check_warn "Found $endpoints endpoints (expected ≥8)"
fi
echo ""

# 9. Pod Status Check
echo -e "${BLUE}9. POD STATUS${NC}"
total_pods=$(kubectl get pods -n "$NAMESPACE" --no-headers | wc -l)
running_pods=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' | wc -w)

if [ "$total_pods" -eq "$running_pods" ] && [ "$total_pods" -gt 0 ]; then
  check_pass "All $total_pods pods are Running"
else
  check_fail "$running_pods/$total_pods pods are Running"
fi

# Check for pods in error state
error_pods=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[?(@.status.phase!="Running")].metadata.name}')
if [ -z "$error_pods" ]; then
  check_pass "No pods in error state"
else
  check_fail "Pods in error state: $error_pods"
fi
echo ""

# 10. Health Checks
echo -e "${BLUE}10. HEALTH CHECKS${NC}"
# Check if we can reach postgres
if kubectl exec -n "$NAMESPACE" postgres-0 -- pg_isready -U postgres &>/dev/null; then
  check_pass "PostgreSQL is accepting connections"
else
  check_fail "PostgreSQL is not accepting connections"
fi

# Check NGINX health endpoint (if port-forwarded)
if command -v curl &>/dev/null; then
  # Try to get NGINX service and check if we can port-forward
  check_warn "Health endpoint check skipped (requires port-forwarding setup)"
else
  check_warn "curl not found, skipping health endpoint checks"
fi
echo ""

# 11. Summary
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Passed:${NC}  $PASS_COUNT"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARN_COUNT"
echo -e "${RED}✗ Failed:${NC}  $FAIL_COUNT"
echo ""

# Overall status
if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ Deployment verification PASSED${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Get node IP: kubectl get nodes -o wide"
  echo "2. Access application: http://<NODE_IP>:30080"
  echo "3. Or port-forward: kubectl port-forward -n boutique-shop svc/nginx-service 8080:80"
  exit 0
else
  echo -e "${RED}✗ Deployment verification FAILED${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check pod logs: kubectl logs -n $NAMESPACE <pod-name>"
  echo "2. Describe pod: kubectl describe pod -n $NAMESPACE <pod-name>"
  echo "3. Check events: kubectl get events -n $NAMESPACE -w"
  echo "4. Check resource availability: kubectl top nodes"
  exit 1
fi
