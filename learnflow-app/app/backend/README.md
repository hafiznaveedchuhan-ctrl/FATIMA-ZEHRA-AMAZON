# Backend Services

FastAPI microservices:

- **user-service/** - Authentication & User Management
  - JWT authentication
  - User registration & login
  - Profile management

- **product-service/** - Product Catalog
  - Product listing & filtering
  - Category management
  - Product search

- **order-service/** - Shopping & Orders
  - Shopping cart management
  - Order creation & tracking
  - Order history

- **chat-service/** - AI Chat Integration
  - OpenAI/Gemini/Goose support
  - Product recommendations
  - Chat history

Each service:
- Uses SQLModel for ORM
- Connects to Neon PostgreSQL
- Deployed as Netlify Function
