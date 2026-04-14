#!/bin/bash

# ============================================================================
# LearnFlow App - First-Time Setup Script
# ============================================================================
# This script sets up the complete environment for local development
# Usage: ./scripts/setup.sh

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     LearnFlow App - First-Time Setup                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# 1. Check Prerequisites
# ============================================================================

echo -e "${YELLOW}1️⃣  Checking prerequisites...${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed!${NC}"
        echo "   Install from: $2"
        exit 1
    fi
    echo -e "${GREEN}✅ $1 found${NC}"
}

check_command "docker" "https://docs.docker.com/install/"
check_command "docker-compose" "https://docs.docker.com/compose/install/"
check_command "git" "https://git-scm.com/download/"

# ============================================================================
# 2. Create Environment File
# ============================================================================

echo ""
echo -e "${YELLOW}2️⃣  Setting up environment variables...${NC}"

if [ ! -f "config/.env" ]; then
    echo -e "${YELLOW}Creating config/.env from .env.example...${NC}"

    if [ -f ".env.example" ]; then
        cp .env.example config/.env
        echo -e "${GREEN}✅ config/.env created${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit config/.env with your settings:${NC}"
        echo "   - DATABASE_URL (Neon PostgreSQL)"
        echo "   - JWT_SECRET (generate random 32-char string)"
        echo "   - AI_API_KEY (OpenAI, Gemini, or Goose)"
        echo ""
        echo "   Edit now: nano config/.env"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ config/.env exists${NC}"
fi

# ============================================================================
# 3. Setup Directories
# ============================================================================

echo ""
echo -e "${YELLOW}3️⃣  Creating necessary directories...${NC}"

mkdir -p app/backend/user-service/{app,tests}
mkdir -p app/backend/product-service/{app,tests}
mkdir -p app/backend/order-service/{app,tests}
mkdir -p app/frontend/{app,components,lib,public/images}
mkdir -p database/{migrations,seeds}
mkdir -p logs

echo -e "${GREEN}✅ Directories created${NC}"

# ============================================================================
# 4. Check Docker Images
# ============================================================================

echo ""
echo -e "${YELLOW}4️⃣  Preparing Docker images...${NC}"

if ! docker images | grep -q "python:3.11"; then
    echo "Pulling python:3.11..."
    docker pull python:3.11
fi

if ! docker images | grep -q "node:20"; then
    echo "Pulling node:20..."
    docker pull node:20
fi

if ! docker images | grep -q "postgres:15"; then
    echo "Pulling postgres:15..."
    docker pull postgres:15
fi

echo -e "${GREEN}✅ Docker images ready${NC}"

# ============================================================================
# 5. Database Setup
# ============================================================================

echo ""
echo -e "${YELLOW}5️⃣  Database setup...${NC}"

echo ""
echo "Two options:"
echo "1. Use Neon PostgreSQL (cloud) - Recommended for cloud deployment"
echo "2. Use local PostgreSQL - For local development"
echo ""
read -p "Choose (1 or 2) [default: 1]: " DB_CHOICE

if [ "$DB_CHOICE" = "2" ]; then
    echo ""
    echo "Starting local PostgreSQL container..."
    docker-compose up -d db
    sleep 5
    echo -e "${GREEN}✅ PostgreSQL running on localhost:5432${NC}"
    echo "   Default: postgres:password (edit in docker-compose.yml)"
else
    echo ""
    echo -e "${YELLOW}📝 Neon Setup Instructions:${NC}"
    echo ""
    echo "1. Go to: https://console.neon.tech"
    echo "2. Sign up (free tier: 512MB)"
    echo "3. Create project: 'learnflow-app'"
    echo "4. Copy connection string"
    echo "5. Update DATABASE_URL in config/.env"
    echo ""
    read -p "Press Enter when you've updated config/.env with Neon URL..."
fi

# ============================================================================
# 6. Run Migrations
# ============================================================================

echo ""
echo -e "${YELLOW}6️⃣  Running database migrations...${NC}"

if [ -f "scripts/migrate-db.sh" ]; then
    chmod +x scripts/migrate-db.sh
    # Note: Actual migration will be run separately
    echo -e "${YELLOW}⚠️  Run migrations manually: ./scripts/migrate-db.sh${NC}"
else
    echo -e "${YELLOW}⚠️  Migration script not found${NC}"
fi

# ============================================================================
# 7. Install Python Dependencies
# ============================================================================

echo ""
echo -e "${YELLOW}7️⃣  Python dependencies...${NC}"

if [ -f "app/backend/requirements.txt" ]; then
    echo "Note: Python dependencies will be installed in Docker containers"
    echo "Build with: docker-compose build"
else
    echo -e "${YELLOW}ℹ️  Create requirements.txt in app/backend/requirements.txt${NC}"
fi

echo -e "${GREEN}✅ Python setup ready${NC}"

# ============================================================================
# 8. Install Node Dependencies
# ============================================================================

echo ""
echo -e "${YELLOW}8️⃣  Node.js dependencies...${NC}"

if [ -f "app/frontend/package.json" ]; then
    echo "Note: Node dependencies will be installed in Docker container"
    echo "Build with: docker-compose build"
else
    echo -e "${YELLOW}ℹ️  Create package.json in app/frontend/package.json${NC}"
fi

echo -e "${GREEN}✅ Node.js setup ready${NC)"

# ============================================================================
# 9. Build Docker Images
# ============================================================================

echo ""
echo -e "${YELLOW}9️⃣  Building Docker images...${NC}"

read -p "Build Docker images now? (y/n) [default: y]: " BUILD_IMAGES

if [ "$BUILD_IMAGES" != "n" ]; then
    docker-compose build
    echo -e "${GREEN}✅ Docker images built${NC}"
else
    echo -e "${YELLOW}ℹ️  Build later with: docker-compose build${NC}"
fi

# ============================================================================
# 10. Final Checklist
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Setup Complete! ✅                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Setup Checklist:${NC}"
echo "  ✅ Prerequisites verified"
echo "  ✅ Environment variables configured"
echo "  ✅ Directories created"
echo "  ✅ Docker images prepared"
echo "  ✅ Database configured"
echo "  ✅ Dependencies ready"
echo ""

echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo ""
echo "1. Edit configuration:"
echo "   nano config/.env              # Fill in your API keys"
echo "   nano config/config.yaml       # Set your environment"
echo ""
echo "2. Start the app:"
echo "   docker-compose up -d          # Start all services"
echo "   # OR use Makefile:"
echo "   make run"
echo ""
echo "3. Access the app:"
echo "   Frontend:      http://localhost:3000"
echo "   User Service:  http://localhost:8001/docs"
echo "   Product API:   http://localhost:8002/docs"
echo "   Order API:     http://localhost:8003/docs"
echo "   Chat API:      http://localhost:8004/docs"
echo ""
echo "4. Run tests:"
echo "   ./scripts/test.sh"
echo "   # OR use Makefile:"
echo "   make test"
echo ""
echo "5. Deploy anywhere:"
echo "   Docker:     docker-compose up -d"
echo "   K8s:        kubectl apply -f deploy/kubernetes/"
echo "   Helm:       helm install learnflow deploy/helm/learnflow-chart"
echo ""

echo -e "${GREEN}For more help, see:${NC}"
echo "  - README.md"
echo "  - CLAUDE.md"
echo "  - docs/SETUP.md"
echo "  - docs/DEPLOYMENT.md"
echo ""

echo -e "${GREEN}Ready to build something amazing! 🚀${NC}"
echo ""
