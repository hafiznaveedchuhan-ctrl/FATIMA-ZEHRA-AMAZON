# Setup Guide - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Target**: Local Development & Cloud Deployment

---

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows (WSL 2)
- **RAM**: 4GB
- **Disk**: 2GB free space
- **Internet**: For API keys and database connection

### Required Software

#### Option 1: Docker (Recommended)
- Docker 20.10+
- Docker Compose 2.0+
- [Install Docker](https://docs.docker.com/get-docker/)

#### Option 2: Manual (Python & Node.js)
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+ (or Neon cloud account)
- pip & npm package managers

---

## Quick Start (60 Seconds)

### Step 1: Clone Repository
```bash
git clone https://github.com/hn1693244-source/FATIMA-ZEHRA-BOUTIQUE-APP.git
cd FATIMA-ZEHRA-BOUTIQUE-APP/learnflow-app
```

### Step 2: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# - DATABASE_URL (Neon connection or local PostgreSQL)
# - OPENAI_API_KEY (for chat widget)
# - JWT_SECRET (generate with: openssl rand -hex 16)

nano .env  # or use your favorite editor
```

### Step 3: Start Services

**Option A: Docker Compose (Easiest)**
```bash
docker-compose up -d
```

**Option B: Manual (Python)**
```bash
# Terminal 1: User Service
cd app/backend/user-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload

# Terminal 2: Product Service
cd app/backend/product-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8002 --reload

# Terminal 3: Order Service
cd app/backend/order-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8003 --reload

# Terminal 4: Chat Service
cd app/backend/chat-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8004 --reload

# Terminal 5: Frontend
cd app/frontend
npm install
npm run dev
```

### Step 4: Access Application
```
Frontend:  http://localhost:3000
User API:  http://localhost:8001/docs
Product API: http://localhost:8002/docs
Order API:   http://localhost:8003/docs
Chat API:    http://localhost:8004/docs
```

### Step 5: Seed Database
```bash
chmod +x scripts/seed-database.sh
./scripts/seed-database.sh
```

**Test User Credentials**:
```
Email: test@example.com
Password: test123456
```

---

## Detailed Setup

### 1. Prerequisites Installation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Python
sudo apt install -y python3.10 python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL (optional, if not using Neon)
sudo apt install -y postgresql postgresql-contrib

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### macOS
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.10 node postgresql

# Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop
```

#### Windows (WSL 2)
```bash
# Install WSL 2 first
# https://docs.microsoft.com/en-us/windows/wsl/install

# In WSL 2 terminal:
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip nodejs npm postgresql

# Install Docker
# Use Docker Desktop with WSL 2 integration
```

---

### 2. Environment Configuration

#### Create .env File
```bash
cp .env.example .env
```

#### Fill in Required Values

**Database Configuration**:
```bash
# Option 1: Neon PostgreSQL (Cloud)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Option 2: Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnflow

# Local database info (if using docker-compose postgres)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=learnflow
```

**Get Neon Connection**:
1. Go to https://console.neon.tech
2. Create account/project
3. Click "Connect"
4. Copy connection string
5. Paste into DATABASE_URL

**Authentication**:
```bash
# Generate secure JWT secret
openssl rand -hex 16

# Add to .env
JWT_SECRET=your-generated-32-character-secret-key-here

# Token expiration (hours)
JWT_EXPIRATION=24
```

**AI Configuration**:
```bash
# Get OpenAI API key
# 1. Go to https://platform.openai.com
# 2. Create account
# 3. Go to API keys
# 4. Create new API key
# 5. Add to .env

OPENAI_API_KEY=sk-your-api-key-here
```

---

### 3. Backend Setup

#### Install Dependencies
```bash
# User Service
cd app/backend/user-service
pip install -r requirements.txt

# Product Service
cd ../../product-service
pip install -r requirements.txt

# Order Service
cd ../../order-service
pip install -r requirements.txt

# Chat Service
cd ../../chat-service
pip install -r requirements.txt
```

#### Verify Installation
```bash
# Check Python packages
pip list | grep fastapi
pip list | grep sqlmodel

# Check each service can import dependencies
cd app/backend/user-service
python -c "from app.main import app; print('✅ user-service OK')"
```

---

### 4. Frontend Setup

#### Install Dependencies
```bash
cd app/frontend
npm install --legacy-peer-deps
```

#### Verify Installation
```bash
npm list react next typescript
```

---

### 5. Database Setup

#### Option 1: Using Docker Compose PostgreSQL
```bash
# The docker-compose.yml includes PostgreSQL
docker-compose up -d postgres

# Wait for database to be ready
sleep 10

# Run migrations
docker-compose exec postgres psql -U postgres -d learnflow < database/migrations/001_create_users.sql
```

#### Option 2: Using Neon Cloud
```bash
# Just ensure DATABASE_URL points to Neon
# Tables created automatically on first connection
echo "Testing connection..."
psql $DATABASE_URL -c "SELECT 1"
```

#### Option 3: Local PostgreSQL
```bash
# Create database
createdb learnflow

# Run migrations manually
psql -U postgres -d learnflow < database/migrations/001_create_users.sql
psql -U postgres -d learnflow < database/migrations/002_create_products.sql
```

#### Seed Database
```bash
chmod +x scripts/seed-database.sh
./scripts/seed-database.sh

# Expected output:
# ✅ Database seeding complete!
# Categories: 6
# Products: 17
# Test Users: 1
```

---

### 6. Running Services

#### All at Once (Docker Compose)
```bash
# Start all services
docker-compose up -d

# Verify all running
docker-compose ps

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

#### Individual Services (Manual)

**User Service**:
```bash
cd app/backend/user-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Test: curl http://localhost:8001/docs
```

**Product Service**:
```bash
cd app/backend/product-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# Test: curl http://localhost:8002/docs
```

**Order Service**:
```bash
cd app/backend/order-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

# Test: curl http://localhost:8003/docs
```

**Chat Service**:
```bash
cd app/backend/chat-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload

# Test: curl http://localhost:8004/docs
```

**Frontend**:
```bash
cd app/frontend
npm run dev

# Runs on http://localhost:3000
```

---

### 7. Verify Installation

```bash
# Check all services responding
echo "=== Service Health Check ==="
curl http://localhost:8001/docs && echo "✅ User Service"
curl http://localhost:8002/docs && echo "✅ Product Service"
curl http://localhost:8003/docs && echo "✅ Order Service"
curl http://localhost:8004/docs && echo "✅ Chat Service"
curl http://localhost:3000 && echo "✅ Frontend"

# Test database connection
echo "=== Database Check ==="
psql $DATABASE_URL -c "SELECT COUNT(*) as product_count FROM products;"

# Test API endpoints
echo "=== API Check ==="
curl -X GET http://localhost:8002/api/products | jq .
```

---

## Troubleshooting Setup

### Port Already in Use
```bash
# Find and kill process using port
lsof -ti:8001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Neon status if using cloud
# https://console.neon.tech
```

### Python Dependencies Conflict
```bash
# Create fresh virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### Node.js Module Errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Docker Issues
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Remove all containers
docker-compose down -v

# Start fresh
docker-compose up -d --build
```

---

## Next Steps

1. ✅ Setup complete
2. 👉 Run tests: `./scripts/test.sh`
3. 👉 Read DEPLOYMENT.md for production setup
4. 👉 Check API.md for endpoint documentation
5. 👉 Review AI-MODELS.md for model configuration

---

**Setup Guide Version**: 1.0
**Last Updated**: 2026-01-26

