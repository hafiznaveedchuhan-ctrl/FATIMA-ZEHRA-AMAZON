# Database Management

Database structure and scripts:

- **migrations/** - SQL migration files
  - 001_create_users.sql
  - 002_create_categories.sql
  - 003_create_products.sql
  - 004_create_carts.sql
  - 005_create_orders.sql
  - 006_create_chat_messages.sql

- **seeds/** - Sample data for testing

Connection:
- Local: postgresql://postgres:postgres@localhost:5432/learnflow
- Cloud: Use Neon PostgreSQL

Migrations run automatically on startup.
