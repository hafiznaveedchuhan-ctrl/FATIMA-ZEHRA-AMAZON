# API Reference - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Status**: Complete REST API Documentation

---

## Base URLs

| Service | URL | Port | Docs |
|---------|-----|------|------|
| **User Service** | http://localhost:8001 | 8001 | /docs |
| **Product Service** | http://localhost:8002 | 8002 | /docs |
| **Order Service** | http://localhost:8003 | 8003 | /docs |
| **Chat Service** | http://localhost:8004 | 8004 | /docs |

---

## Authentication

### JWT Bearer Token

All protected endpoints require JWT token:

```bash
curl -X GET http://localhost:8001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### How to Get Token

```bash
# Register
curl -X POST http://localhost:8001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'

# Or Login
curl -X POST http://localhost:8001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes token:
# {"token": "eyJ...", "user": {...}}
```

---

## User Service (Port 8001)

### 1. Register User

**Endpoint**: `POST /api/users/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors**:
- `400` - Email already registered
- `422` - Validation error (password < 8 chars)

---

### 2. Login User

**Endpoint**: `POST /api/users/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Errors**:
- `401` - Invalid email/password
- `404` - User not found

---

### 3. Get Current User

**Endpoint**: `GET /api/users/me`

**Auth**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+92 300 1234567",
  "address": "123 Main St",
  "created_at": "2026-01-26T10:00:00Z"
}
```

**Errors**:
- `401` - Missing or invalid token

---

### 4. Update Profile

**Endpoint**: `PUT /api/users/me`

**Auth**: Required

**Request**:
```json
{
  "full_name": "John Updated",
  "phone": "+92 300 1234567",
  "address": "456 New St, City"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Updated",
  "phone": "+92 300 1234567",
  "address": "456 New St, City"
}
```

**Errors**:
- `401` - Unauthorized
- `404` - User not found

---

## Product Service (Port 8002)

### 1. List Products

**Endpoint**: `GET /api/products`

**Query Parameters**:
```
?category_id=1        - Filter by category
?search=evening       - Search by name/description
?featured=true        - Only featured products
?price_min=1000       - Minimum price
?price_max=10000      - Maximum price
?page=1               - Page number (default: 1)
?limit=12             - Items per page (default: 12)
```

**Example**:
```bash
curl "http://localhost:8002/api/products?category_id=1&featured=true&page=1&limit=12"
```

**Response** (200 OK):
```json
{
  "products": [
    {
      "id": 1,
      "name": "Evening Gown",
      "description": "Elegant evening dress",
      "price": 5000,
      "category_id": 1,
      "image_url": "https://...",
      "stock_quantity": 15,
      "featured": true,
      "created_at": "2026-01-26T10:00:00Z"
    }
  ],
  "total": 17,
  "page": 1,
  "limit": 12
}
```

---

### 2. Get Product Detail

**Endpoint**: `GET /api/products/{id}`

**Parameters**:
- `id` (path) - Product ID

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Evening Gown",
  "description": "Elegant evening dress with beautiful embroidery",
  "price": 5000,
  "category": {
    "id": 1,
    "name": "Dresses"
  },
  "image_url": "https://...",
  "stock_quantity": 15,
  "featured": true,
  "created_at": "2026-01-26T10:00:00Z"
}
```

**Errors**:
- `404` - Product not found

---

### 3. List Categories

**Endpoint**: `GET /api/categories`

**Response** (200 OK):
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Dresses",
      "description": "Beautiful dresses for every occasion"
    },
    {
      "id": 2,
      "name": "Tops",
      "description": "Elegant tops and blouses"
    }
  ]
}
```

---

## Order Service (Port 8003)

### 1. Get Shopping Cart

**Endpoint**: `GET /api/cart`

**Auth**: Required

**Response** (200 OK):
```json
{
  "id": 5,
  "user_id": 1,
  "items": [
    {
      "id": 12,
      "product_id": 1,
      "quantity": 2,
      "price": 5000,
      "product": {
        "id": 1,
        "name": "Evening Gown"
      }
    }
  ],
  "total": 10000,
  "created_at": "2026-01-26T10:00:00Z"
}
```

---

### 2. Add to Cart

**Endpoint**: `POST /api/cart/items`

**Auth**: Required

**Request**:
```json
{
  "product_id": 1,
  "quantity": 2,
  "price": 5000
}
```

**Response** (201 Created):
```json
{
  "id": 12,
  "product_id": 1,
  "quantity": 2,
  "price": 5000,
  "message": "Item added to cart"
}
```

**Errors**:
- `400` - Invalid quantity or product not found
- `401` - Unauthorized

---

### 3. Update Cart Item

**Endpoint**: `PUT /api/cart/items/{id}`

**Auth**: Required

**Request**:
```json
{
  "quantity": 5
}
```

**Response** (200 OK):
```json
{
  "id": 12,
  "product_id": 1,
  "quantity": 5,
  "price": 5000
}
```

---

### 4. Remove from Cart

**Endpoint**: `DELETE /api/cart/items/{id}`

**Auth**: Required

**Response** (200 OK):
```json
{
  "message": "Item removed from cart"
}
```

---

### 5. Checkout (Create Order)

**Endpoint**: `POST /api/checkout`

**Auth**: Required

**Request**:
```json
{
  "shipping_address": "123 Main Street, Karachi, Pakistan"
}
```

**Response** (201 Created):
```json
{
  "id": 42,
  "user_id": 1,
  "status": "pending",
  "total_amount": 10000,
  "shipping_address": "123 Main Street, Karachi, Pakistan",
  "payment_status": "pending",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Evening Gown",
      "quantity": 2,
      "price": 5000
    }
  ],
  "created_at": "2026-01-26T10:00:00Z"
}
```

**Errors**:
- `400` - Empty cart or invalid address
- `401` - Unauthorized

---

### 6. List Orders

**Endpoint**: `GET /api/orders`

**Auth**: Required

**Query Parameters**:
```
?page=1      - Page number
?limit=10    - Items per page
```

**Response** (200 OK):
```json
{
  "orders": [
    {
      "id": 42,
      "status": "pending",
      "total_amount": 10000,
      "created_at": "2026-01-26T10:00:00Z",
      "items_count": 2
    }
  ],
  "total": 1
}
```

---

### 7. Get Order Details

**Endpoint**: `GET /api/orders/{id}`

**Auth**: Required

**Response** (200 OK):
```json
{
  "id": 42,
  "user_id": 1,
  "status": "pending",
  "total_amount": 10000,
  "shipping_address": "123 Main Street",
  "payment_status": "pending",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Evening Gown",
      "quantity": 2,
      "price": 5000
    }
  ],
  "created_at": "2026-01-26T10:00:00Z"
}
```

---

## Chat Service (Port 8004)

### 1. Send Chat Message

**Endpoint**: `POST /api/chat/messages`

**Content-Type**: `text/event-stream` (streaming response)

**Request**:
```json
{
  "text": "Show me evening dresses",
  "session_id": "session-user-123"
}
```

**Response** (200 OK - Streaming):
```
data: The

data:  evening

data:  gown

data: ...
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:8004/api/chat/messages', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    text: "Show me evening dresses",
    session_id: "session-123"
  })
});

const reader = response.body.getReader();
while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

---

### 2. Get Chat History

**Endpoint**: `GET /api/chat/history`

**Query Parameters**:
```
?session_id=session-123   - Session ID
?limit=50                 - Number of messages
```

**Response** (200 OK):
```json
{
  "messages": [
    {
      "id": 1,
      "session_id": "session-123",
      "role": "user",
      "content": "Show me evening dresses",
      "created_at": "2026-01-26T10:00:00Z"
    },
    {
      "id": 2,
      "session_id": "session-123",
      "role": "assistant",
      "content": "We have beautiful evening gowns...",
      "created_at": "2026-01-26T10:00:01Z"
    }
  ]
}
```

---

### 3. Clear Chat History

**Endpoint**: `DELETE /api/chat/history`

**Query Parameters**:
```
?session_id=session-123   - Session ID to clear
```

**Response** (200 OK):
```json
{
  "message": "Chat history cleared",
  "session_id": "session-123"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "error": "Invalid input",
  "details": ["Email is required", "Password must be at least 8 characters"]
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server issue |

---

## Rate Limiting

```
10 requests per minute per IP
429 Too Many Requests - if exceeded
```

**Headers**:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1234567890
```

---

## CORS Headers

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","full_name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:8001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Get Products
```bash
curl http://localhost:8002/api/products?page=1&limit=12
```

### Search Products
```bash
curl "http://localhost:8002/api/products?search=evening&category_id=1"
```

---

## Testing with Postman

1. Import `postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:8001
   - `token`: (after login)
3. Run requests

---

**API Reference Version**: 1.0
**Last Updated**: 2026-01-26
**Maintained By**: Fatima Zehra Boutique Team

