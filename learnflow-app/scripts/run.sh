#!/bin/bash

# ============================================================================
# LearnFlow App - Smart Run Script
# ============================================================================
# Auto-detects environment and starts services appropriately
# Usage: ./scripts/run.sh [docker|k8s|manual]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     LearnFlow App - Starting Services                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# 1. Environment Detection
# ============================================================================

ENVIRONMENT=${1:-auto}

if [ "$ENVIRONMENT" = "auto" ]; then
    echo -e "${YELLOW}🔍 Auto-detecting environment...${NC}"

    if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null 2>&1; then
        ENVIRONMENT="k8s"
        echo -e "${GREEN}✅ Kubernetes cluster detected${NC}"
    elif docker ps -a --format '{{.Names}}' | grep -q learnflow; then
        ENVIRONMENT="docker"
        echo -e "${GREEN}✅ Docker environment detected${NC}"
    else
        ENVIRONMENT="docker"
        echo -e "${YELLOW}ℹ️  Using Docker (default)${NC}"
    fi
fi

echo "Environment: $ENVIRONMENT"
echo ""

# ============================================================================
# 2. Check Prerequisites
# ============================================================================

echo -e "${YELLOW}2️⃣  Checking prerequisites...${NC}"

if [ -f "config/.env" ]; then
    echo -e "${GREEN}✅ Environment file found${NC}"
    source config/.env
else
    echo -e "${RED}❌ config/.env not found!${NC}"
    echo "   Run: ./scripts/setup.sh"
    exit 1
fi

# ============================================================================
# 3. Docker Deployment
# ============================================================================

if [ "$ENVIRONMENT" = "docker" ]; then
    echo ""
    echo -e "${YELLOW}🐳 Starting with Docker Compose...${NC}"

    # Check if services are already running
    if docker-compose ps | grep -q "Up"; then
        echo -e "${YELLOW}⚠️  Services already running!${NC}"
        read -p "Restart? (y/n) [default: n]: " RESTART

        if [ "$RESTART" = "y" ]; then
            echo "Stopping services..."
            docker-compose down
            sleep 2
        else
            echo -e "${GREEN}Services already running!${NC}"
            show_urls
            exit 0
        fi
    fi

    # Start services
    echo "Starting services..."
    docker-compose up -d

    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10

    # Check health
    echo ""
    echo -e "${YELLOW}Checking service health...${NC}"

    if docker-compose ps | grep -q "user-service.*Up"; then
        echo -e "${GREEN}✅ User Service running${NC}"
    else
        echo -e "${RED}❌ User Service failed to start${NC}"
        docker-compose logs user-service
        exit 1
    fi

    echo -e "${GREEN}✅ All services running!${NC}"

# ============================================================================
# 4. Kubernetes Deployment
# ============================================================================

elif [ "$ENVIRONMENT" = "k8s" ]; then
    echo ""
    echo -e "${YELLOW}☸️  Starting with Kubernetes...${NC}"

    if [ ! -d "deploy/kubernetes" ]; then
        echo -e "${RED}❌ deploy/kubernetes directory not found!${NC}"
        exit 1
    fi

    echo "Applying Kubernetes manifests..."
    kubectl apply -f deploy/kubernetes/

    echo "Waiting for deployments..."
    kubectl wait --for=condition=available --timeout=300s deployment -l app=learnflow

    echo -e "${GREEN}✅ Services deployed to Kubernetes!${NC}"

    # Get service URLs
    echo ""
    echo -e "${YELLOW}Service URLs:${NC}"
    kubectl get services -l app=learnflow

# ============================================================================
# 5. Manual Deployment
# ============================================================================

elif [ "$ENVIRONMENT" = "manual" ]; then
    echo ""
    echo -e "${YELLOW}🔧 Manual deployment mode${NC}"
    echo ""
    echo "Start services manually:"
    echo ""
    echo "Terminal 1 (User Service):"
    echo "  cd app/backend/user-service"
    echo "  python -m uvicorn app.main:app --reload --port 8001"
    echo ""
    echo "Terminal 2 (Product Service):"
    echo "  cd app/backend/product-service"
    echo "  python -m uvicorn app.main:app --reload --port 8002"
    echo ""
    echo "Terminal 3 (Order Service):"
    echo "  cd app/backend/order-service"
    echo "  python -m uvicorn app.main:app --reload --port 8003"
    echo ""
    echo "Terminal 4 (Chat Service):"
    echo "  cd app/backend/chat-service"
    echo "  python -m uvicorn app.main:app --reload --port 8004"
    echo ""
    echo "Terminal 5 (Frontend):"
    echo "  cd app/frontend"
    echo "  npm run dev"
    echo ""
fi

# ============================================================================
# 6. Show URLs
# ============================================================================

show_urls() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              Services Running! ✅                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Access URLs:${NC}"
    echo ""
    echo "  Frontend:        http://localhost:3000"
    echo "  User Service:    http://localhost:8001"
    echo "  User Docs:       http://localhost:8001/docs"
    echo ""
    echo "  Product Service: http://localhost:8002"
    echo "  Product Docs:    http://localhost:8002/docs"
    echo ""
    echo "  Order Service:   http://localhost:8003"
    echo "  Order Docs:      http://localhost:8003/docs"
    echo ""
    echo "  Chat Service:    http://localhost:8004"
    echo "  Chat Docs:       http://localhost:8004/docs"
    echo ""

    echo -e "${YELLOW}📋 Useful Commands:${NC}"
    echo ""
    echo "  View logs:       docker-compose logs -f"
    echo "  Stop services:   docker-compose down"
    echo "  Restart:         docker-compose restart"
    echo "  Run tests:       ./scripts/test.sh"
    echo "  Run migrations:  ./scripts/migrate-db.sh"
    echo ""

    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo ""
    echo "  README.md        - Quick overview"
    echo "  CLAUDE.md        - Complete reference"
    echo "  docs/SETUP.md    - Detailed setup"
    echo "  docs/API.md      - API documentation"
    echo ""
}

show_urls

echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
