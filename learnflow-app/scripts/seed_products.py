"""
Product Seeding Script - Fatima Zehra Amazon Shop
Fetches products from fakestoreapi.com + dummyjson.com and inserts into Neon PostgreSQL.

Usage:
    python seed_products.py

Requires:
    - DATABASE_URL env var (or .env.backend in parent)
    - requests, psycopg2-binary
"""

import os
import sys
import requests
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path

# Load DATABASE_URL from .env.backend if present
ENV_FILE = Path(__file__).parent.parent / ".env.backend"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line.startswith("DATABASE_URL="):
            os.environ["DATABASE_URL"] = line.split("=", 1)[1]
            break

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set. Add to .env.backend or export.")
    sys.exit(1)


# Target 7 categories for Fatima Zehra Amazon Shop
CATEGORIES = [
    {"name": "Electronics", "description": "Phones, laptops, gadgets and accessories"},
    {"name": "Fashion", "description": "Clothing, shoes and accessories for men and women"},
    {"name": "Home & Kitchen", "description": "Furniture, decor, appliances and kitchen essentials"},
    {"name": "Books", "description": "Books, novels, educational and reference"},
    {"name": "Toys & Games", "description": "Toys, board games and entertainment for all ages"},
    {"name": "Sports & Outdoors", "description": "Sports equipment, outdoor gear and fitness"},
    {"name": "Beauty", "description": "Skincare, makeup, fragrances and personal care"},
]


# Map source-API categories → our 7 target categories
CATEGORY_MAP = {
    # fakestoreapi
    "electronics": "Electronics",
    "jewelery": "Fashion",
    "men's clothing": "Fashion",
    "women's clothing": "Fashion",
    # dummyjson
    "smartphones": "Electronics",
    "laptops": "Electronics",
    "fragrances": "Beauty",
    "skincare": "Beauty",
    "groceries": "Home & Kitchen",
    "home-decoration": "Home & Kitchen",
    "furniture": "Home & Kitchen",
    "tops": "Fashion",
    "womens-dresses": "Fashion",
    "womens-shoes": "Fashion",
    "mens-shirts": "Fashion",
    "mens-shoes": "Fashion",
    "mens-watches": "Fashion",
    "womens-watches": "Fashion",
    "womens-bags": "Fashion",
    "womens-jewellery": "Fashion",
    "sunglasses": "Fashion",
    "automotive": "Sports & Outdoors",
    "motorcycle": "Sports & Outdoors",
    "lighting": "Home & Kitchen",
    "beauty": "Beauty",
    "kitchen-accessories": "Home & Kitchen",
    "sports-accessories": "Sports & Outdoors",
    "tablets": "Electronics",
    "mobile-accessories": "Electronics",
}


def fetch_fakestore():
    """20 products across 4 categories."""
    print("→ Fetching from fakestoreapi.com...")
    r = requests.get("https://fakestoreapi.com/products", timeout=15)
    r.raise_for_status()
    return [
        {
            "name": p["title"][:255],
            "description": p["description"],
            "price": float(p["price"]),
            "category_raw": p["category"],
            "image_url": p["image"][:500],
            "stock_quantity": 50,
            "featured": p.get("rating", {}).get("rate", 0) >= 4.0,
        }
        for p in r.json()
    ]


def fetch_dummyjson(limit=40):
    """30+ products across many categories."""
    print(f"→ Fetching {limit} from dummyjson.com...")
    r = requests.get(f"https://dummyjson.com/products?limit={limit}", timeout=15)
    r.raise_for_status()
    products = []
    for p in r.json().get("products", []):
        products.append({
            "name": p["title"][:255],
            "description": p.get("description", ""),
            "price": float(p["price"]),
            "category_raw": p.get("category", ""),
            "image_url": (p.get("thumbnail") or (p.get("images") or [""])[0])[:500],
            "stock_quantity": int(p.get("stock", 50)),
            "featured": float(p.get("rating", 0)) >= 4.5,
        })
    return products


def seed():
    print(f"→ Connecting to Neon PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # Ensure tables exist (safety; migrations should have run)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            image_url VARCHAR(500)
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            image_url VARCHAR(500),
            stock_quantity INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Insert 7 categories (UPSERT)
    print("→ Inserting categories...")
    cat_ids = {}
    for c in CATEGORIES:
        cur.execute(
            """
            INSERT INTO categories (name, description) VALUES (%s, %s)
            ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
            RETURNING id, name;
            """,
            (c["name"], c["description"]),
        )
        row = cur.fetchone()
        cat_ids[row[1]] = row[0]
    print(f"   ✓ {len(cat_ids)} categories ready: {list(cat_ids.keys())}")

    # Fetch products from both sources
    products = []
    try:
        products += fetch_fakestore()
    except Exception as e:
        print(f"   ⚠ fakestoreapi failed: {e}")
    try:
        products += fetch_dummyjson(limit=40)
    except Exception as e:
        print(f"   ⚠ dummyjson failed: {e}")

    print(f"→ Total fetched: {len(products)} products")

    # Map raw category → our category id (default Electronics if unknown)
    rows = []
    skipped_cats = set()
    for p in products:
        raw = p["category_raw"].lower().strip()
        target_cat = CATEGORY_MAP.get(raw)
        if not target_cat:
            skipped_cats.add(raw)
            target_cat = "Electronics"
        rows.append((
            p["name"],
            p["description"],
            p["price"],
            cat_ids[target_cat],
            p["image_url"],
            p["stock_quantity"],
            True,
            p["featured"],
        ))

    if skipped_cats:
        print(f"   ⚠ Unmapped raw categories (defaulted to Electronics): {skipped_cats}")

    # Clear old seeded data (keep schema)
    print("→ Clearing existing products...")
    cur.execute("TRUNCATE products RESTART IDENTITY CASCADE;")

    # Bulk insert
    print(f"→ Inserting {len(rows)} products...")
    execute_values(
        cur,
        """
        INSERT INTO products
            (name, description, price, category_id, image_url, stock_quantity, is_active, featured)
        VALUES %s
        """,
        rows,
    )

    conn.commit()

    # Verify
    cur.execute("SELECT COUNT(*) FROM products;")
    total = cur.fetchone()[0]
    cur.execute("""
        SELECT c.name, COUNT(p.id) FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.name ORDER BY c.name;
    """)
    breakdown = cur.fetchall()

    cur.close()
    conn.close()

    print("\n" + "=" * 50)
    print(f"✅ SUCCESS — {total} products seeded")
    print("=" * 50)
    for name, count in breakdown:
        print(f"  {name:25s} {count} products")
    print("=" * 50)


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        sys.exit(1)
