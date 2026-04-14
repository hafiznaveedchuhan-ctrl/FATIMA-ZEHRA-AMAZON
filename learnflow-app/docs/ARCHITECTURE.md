# System Architecture - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Status**: Production Ready

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      User (Browser)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
            ┌────────────────────────────────────┐
            │   Frontend (Next.js 16)             │
            │   http://localhost:3000             │
            │   Static Export to GitHub Pages     │
            └────────────┬───────────────────────┘
                         │ REST API Calls
                         ▼
        ┌──────────────────────────────────────────────┐
        │      Microservices (FastAPI)                 │
        ├──────────────────────────────────────────────┤
        │ • User Service (Port 8001)                   │
        │   - Registration, Login, Profiles            │
        │   - JWT Authentication                       │
        │ • Product Service (Port 8002)                │
        │   - Catalog, Categories                      │
        │   - Search, Filtering                        │
        │ • Order Service (Port 8003)                  │
        │   - Cart Management                          │
        │   - Checkout, Orders                         │
        │ • Chat Service (Port 8004)                   │
        │   - OpenAI Integration                       │
        │   - Chat History                             │
        └──────────────┬──────────────────────────────┘
                       │ SQL Queries
                       ▼
        ┌──────────────────────────────────────┐
        │    Database (PostgreSQL)              │
        │    - Neon (Cloud) or Local            │
        │    - 8 Tables (users, products, etc)  │
        │    - Connection Pooling               │
        └──────────────┬───────────────────────┘
                       │
        ┌──────────────▼───────────────────────┐
        │    AI Model (Pluggable)               │
        ├───────────────────────────────────────┤
        │ • OpenAI (default)                    │
        │ • Google Gemini                       │
        │ • Goose                               │
        │ • Custom Models                       │
        └───────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend (Next.js 16)

**Technology**: React 18 + TypeScript + Tailwind CSS

**Pages**:
- `/` - Homepage with featured products
- `/products` - Product listing with filters
- `/products/[id]` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/auth/login` - User login
- `/auth/register` - User registration
- `/profile` - User profile management
- `/orders` - Order history
- `/about` - Company information
- `404` - Not found page

**State Management**:
- **Zustand**: Client-side state (cart, chat session)
- **localStorage**: Session persistence
- **Cookies**: JWT token storage

**Key Features**:
- Responsive design (mobile, tablet, desktop)
- Static export for GitHub Pages
- Server-side rendering disabled (for static export)
- Built-in image optimization

---

### 2. Backend Services (FastAPI)

#### User Service (8001)

**Purpose**: Authentication & User Management

**Endpoints**:
```
POST   /api/users/register       - Create account
POST   /api/users/login          - User login
GET    /api/users/me             - Get current user (auth required)
PUT    /api/users/me             - Update profile (auth required)
GET    /api/users/{user_id}      - Get user by ID (admin)
```

**Models**:
- `User` - Database model with password hash
- `UserCreate` - Registration request
- `UserLogin` - Login request
- `UserUpdate` - Profile update request
- `UserResponse` - Public user data

**Security**:
- JWT tokens (24-hour expiration)
- Bcrypt password hashing (12 rounds)
- HTTPOnly cookies (optional)
- CORS configured for frontend

#### Product Service (8002)

**Purpose**: Product Catalog & Search

**Endpoints**:
```
GET    /api/products            - List products (with filters)
GET    /api/products/{id}       - Get product details
POST   /api/products            - Create product (admin)
PUT    /api/products/{id}       - Update product (admin)
DELETE /api/products/{id}       - Delete product (admin)
GET    /api/categories          - List categories
POST   /api/categories          - Create category (admin)
```

**Query Parameters**:
```
?category_id=1       - Filter by category
?search=evening      - Search by name/description
?featured=true       - Only featured products
?price_min=1000      - Minimum price
?price_max=10000     - Maximum price
?page=1              - Pagination
?limit=12            - Items per page
```

**Models**:
- `Category` - Product category
- `Product` - Product details with relationships
- `ProductCreate`, `ProductUpdate` - Request schemas

---

#### Order Service (8003)

**Purpose**: Shopping Cart & Order Management

**Endpoints**:
```
GET    /api/cart                 - Get user cart
POST   /api/cart/items           - Add to cart
PUT    /api/cart/items/{id}      - Update quantity
DELETE /api/cart/items/{id}      - Remove from cart
POST   /api/checkout             - Create order
GET    /api/orders               - List user orders
GET    /api/orders/{id}          - Get order details
PUT    /api/orders/{id}          - Update order status (admin)
```

**Models**:
- `Cart` - User shopping cart
- `CartItem` - Individual cart item
- `Order` - Customer order
- `OrderItem` - Order line item

**Flow**:
1. User adds products to cart
2. Cart items stored in database
3. User proceeds to checkout
4. System creates Order from cart items
5. Cart cleared after successful order
6. Order visible in order history

---

#### Chat Service (8004)

**Purpose**: AI-Powered Chat Widget

**Endpoints**:
```
POST   /api/chat/messages        - Send message (streaming)
GET    /api/chat/history         - Get chat history
DELETE /api/chat/history         - Clear history
```

**Integration**:
- OpenAI GPT-4o API
- Server-Sent Events (SSE) for streaming
- Session-based conversations
- Database storage for history

**Features**:
- Real-time streaming responses
- Context-aware recommendations
- Product search capability
- Multi-turn conversations

---

### 3. Database (PostgreSQL)

**Provider**: Neon (Cloud) or Local PostgreSQL

**Tables**:

```sql
users              - User accounts
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── full_name
├── phone
├── address
└── created_at

categories         - Product categories
├── id (PK)
├── name (UNIQUE)
└── description

products           - Product catalog
├── id (PK)
├── name
├── description
├── price
├── category_id (FK)
├── image_url
├── stock_quantity
├── featured
└── created_at

carts              - Shopping carts
├── id (PK)
├── user_id (FK, UNIQUE)
└── created_at

cart_items         - Individual cart items
├── id (PK)
├── cart_id (FK)
├── product_id (FK)
├── quantity
└── price

orders             - Customer orders
├── id (PK)
├── user_id (FK)
├── status
├── total_amount
├── shipping_address
├── payment_status
└── created_at

order_items        - Order line items
├── id (PK)
├── order_id (FK)
├── product_id (FK)
├── product_name
├── quantity
└── price

chat_messages      - Chat history
├── id (PK)
├── user_id (FK, nullable)
├── session_id
├── role (user/assistant)
├── content
└── created_at
```

**Indexes**:
- `users(email)` - Fast email lookups
- `products(category_id)` - Filter by category
- `products(featured)` - Featured products query
- `carts(user_id)` - User cart lookup
- `orders(user_id)` - User orders lookup
- `chat_messages(session_id)` - Session history

---

### 4. Authentication & Security

**JWT Flow**:
1. User registers/logs in
2. System generates JWT token (24h expiry)
3. Token stored in cookie or localStorage
4. Token included in API requests (Authorization header)
5. Backend validates token on each protected endpoint

**Token Structure**:
```json
{
  "sub": "user@example.com",
  "id": 123,
  "exp": 1700000000,
  "iat": 1600000000
}
```

**Password Security**:
- Bcrypt hashing (12 rounds, ~0.3s per hash)
- Salt generated per password
- Never stored in plaintext
- Minimum 8 characters enforced

**API Security**:
- CORS configured (frontend origins)
- Rate limiting (via cloud provider)
- SQL injection prevention (ORM/parameterized queries)
- XSS prevention (React auto-escaping)
- CSRF tokens (if cookies used)

---

## Data Flow Examples

### User Registration
```
1. User fills registration form
   ↓
2. Frontend validates input
   ↓
3. POST /api/users/register
   ├── Check email not already registered
   ├── Hash password with bcrypt
   ├── Create user in database
   └── Generate JWT token
   ↓
4. Return token to frontend
   ↓
5. Store token and redirect to dashboard
```

### Product Search & Filter
```
1. User enters search term "evening dresses"
   ↓
2. GET /api/products?search=evening&category_id=1
   ├── Query database with filters
   ├── Apply pagination (limit, offset)
   └── Return results
   ↓
3. Frontend displays filtered products
```

### Shopping Cart Checkout
```
1. User clicks "Checkout"
   ↓
2. GET /api/cart (retrieve user's cart)
   ↓
3. Display order summary
   ↓
4. User enters shipping address
   ↓
5. POST /api/checkout
   ├── Validate shipping address
   ├── Create Order record
   ├── Create OrderItems from CartItems
   ├── Update product stock
   └── Clear user's cart
   ↓
6. Return order confirmation
   ↓
7. Redirect to orders page
```

### Chat Message Processing
```
1. User types message in chat widget
   ↓
2. POST /api/chat/messages {text, session_id}
   ├── Save user message to database
   ├── Call OpenAI API
   └── Stream response via SSE
   ↓
3. Frontend displays chunks as they arrive
   ↓
4. Save full assistant response to database
```

---

## API Communication

**Request Format**:
```json
{
  "method": "POST",
  "url": "http://localhost:8001/api/users/login",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJ..."
  },
  "body": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Response Format**:
```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "token": "eyJ..."
  },
  "message": "Success"
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "error": "Invalid input",
  "details": ["Email already registered"]
}
```

---

## Deployment Architecture

### Local Development
```
Docker Compose
├── PostgreSQL (local)
├── User Service
├── Product Service
├── Order Service
├── Chat Service
└── Frontend (npm dev server)
```

### Production Deployment

**Option 1: Docker Container**
```
Docker Hub / Private Registry
├── backend (all 4 services in single container or separate)
├── frontend (static files on nginx)
└── PostgreSQL (managed service)
```

**Option 2: Kubernetes**
```
Kubernetes Cluster
├── user-service deployment
├── product-service deployment
├── order-service deployment
├── chat-service deployment
├── frontend service (nginx)
├── PostgreSQL (StatefulSet or managed)
└── Ingress (routing)
```

**Option 3: Serverless (Netlify/AWS Lambda)**
```
Netlify Functions
├── /user-service (FastAPI wrapped with Mangum)
├── /product-service
├── /order-service
├── /chat-service
└── Static Frontend (GitHub Pages / Netlify static)
```

---

## Performance Considerations

**Database**:
- Connection pooling (5-10 connections)
- Indexes on frequently queried fields
- Query optimization
- N+1 query prevention (eager loading)

**Frontend**:
- Code splitting
- Image optimization
- Lazy loading
- CSS/JS minification
- CDN for static assets

**Backend**:
- Response caching
- Request validation
- Error handling
- Async operations

**Target Metrics**:
- Page load time: < 3 seconds
- API response: < 200ms (p95)
- Database query: < 50ms (p95)

---

## Scaling Strategy

**Horizontal Scaling**:
- Deploy multiple instances of each service
- Load balancer distributes requests
- Database read replicas

**Vertical Scaling**:
- Increase server resources
- Optimize code
- Database tuning

**Caching**:
- Redis for session/cache
- Browser caching headers
- CDN for static content

---

## Monitoring & Observability

**Logging**:
- Centralized log collection
- Structured logging (JSON)
- Log levels: DEBUG, INFO, WARN, ERROR

**Metrics**:
- Request count
- Response times
- Error rates
- Database performance

**Tracing**:
- Request IDs
- Service call chains
- Performance profiling

---

## Security Best Practices

✅ **Authentication**: JWT with short expiration
✅ **Authorization**: Role-based access control ready
✅ **Encryption**: HTTPS in production
✅ **Secrets**: Environment variables for sensitive data
✅ **Validation**: Input validation on all endpoints
✅ **Rate Limiting**: Configured per environment
✅ **CORS**: Properly configured origins
✅ **Logging**: No sensitive data in logs

---

**Architecture Version**: 1.0
**Last Updated**: 2026-01-26
**Maintained By**: Fatima Zehra Boutique Team

