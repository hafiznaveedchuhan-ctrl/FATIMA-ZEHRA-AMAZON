"""
Seed products for Books, Toys & Games, Sports & Outdoors categories.
(fakestoreapi + dummyjson do NOT cover these categories,
so we hand-curate 6-8 products per category using real product images from Unsplash.)
"""
import os
import sys
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values

ENV_FILE = Path(__file__).parent.parent / ".env.backend"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line.startswith("DATABASE_URL="):
            os.environ["DATABASE_URL"] = line.split("=", 1)[1]
            break

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)


BOOKS = [
    ("Atomic Habits by James Clear", "An easy & proven way to build good habits & break bad ones. International bestseller.", 1899, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600", 45, True),
    ("The Alchemist by Paulo Coelho", "A magical story of a shepherd's journey in search of a worldly treasure.", 899, "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600", 60, True),
    ("Rich Dad Poor Dad", "What the rich teach their kids about money that the poor and middle class do not.", 1499, "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600", 30, False),
    ("Sapiens: A Brief History of Humankind", "Yuval Noah Harari's groundbreaking narrative of humanity's creation and evolution.", 2299, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", 25, True),
    ("Think and Grow Rich", "Napoleon Hill's classic on personal development and self-improvement.", 1199, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600", 40, False),
    ("The Psychology of Money", "Timeless lessons on wealth, greed, and happiness by Morgan Housel.", 1799, "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600", 55, True),
    ("Harry Potter and the Sorcerer's Stone", "J.K. Rowling's classic first book in the magical Harry Potter series.", 1299, "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=600", 70, True),
    ("Deep Work by Cal Newport", "Rules for focused success in a distracted world.", 1599, "https://images.unsplash.com/photo-1555116505-38ab61800975?w=600", 20, False),
]

TOYS = [
    ("LEGO Classic Creative Bricks Set", "484-piece LEGO set for creative building. Ages 4+. Endless play possibilities.", 4499, "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600", 35, True),
    ("Rubik's Cube 3x3 Original", "Classic 3x3 speed cube puzzle. Smooth turning, perfect for beginners and pros.", 799, "https://images.unsplash.com/photo-1591991564021-0662a1472986?w=600", 100, True),
    ("Monopoly Classic Board Game", "The fast-dealing property trading game. Hours of family fun.", 2499, "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600", 25, False),
    ("Remote Control Race Car", "High-speed RC car with 2.4GHz controller. Rechargeable battery, 4WD drift.", 3999, "https://images.unsplash.com/photo-1607893378714-007fd47c8719?w=600", 40, True),
    ("Stuffed Teddy Bear - Large", "Soft plush teddy bear, 24 inches tall. Perfect gift for kids and loved ones.", 1299, "https://images.unsplash.com/photo-1599751450264-18958cd2efa1?w=600", 60, False),
    ("UNO Card Game", "The classic family card game. Match colors and numbers to win!", 499, "https://images.unsplash.com/photo-1635236066449-5135f7093d84?w=600", 120, True),
    ("Barbie Dreamhouse Playset", "Barbie's iconic 3-story dollhouse with pool, slide, and 70+ accessories.", 8999, "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600", 15, True),
    ("Puzzle 1000 Pieces - World Map", "Beautiful 1000-piece jigsaw puzzle of the world map. Ages 10+.", 1499, "https://images.unsplash.com/photo-1590990315152-8f8f4f4a3d8a?w=600", 30, False),
]

SPORTS = [
    ("Yonex Badminton Racket Set", "Professional graphite badminton racket with 3 shuttlecocks and cover.", 3499, "https://images.unsplash.com/photo-1626224583764-f87db24ac1f9?w=600", 40, True),
    ("Nike Football Size 5", "Official match-quality football for outdoor and indoor play.", 2199, "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600", 55, True),
    ("Yoga Mat 6mm Thick", "Non-slip yoga mat with carrying strap. Perfect for home workouts.", 1799, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600", 80, True),
    ("Dumbbell Set 10kg Pair", "Neoprene coated adjustable dumbbells. Great for home gym strength training.", 4999, "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", 25, False),
    ("Cricket Bat - English Willow", "Professional grade English willow cricket bat. Size SH (Senior).", 7999, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600", 20, True),
    ("Running Shoes - Men's", "Lightweight running shoes with cushioned sole. Breathable mesh upper.", 5499, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", 45, True),
    ("Camping Tent 4 Person", "Waterproof family camping tent with easy setup. Perfect for outdoor adventures.", 8499, "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600", 15, False),
    ("Bicycle Helmet Adult", "CPSC certified bike helmet with adjustable fit and ventilation.", 1999, "https://images.unsplash.com/photo-1545231097-cbd1d4e19b2c?w=600", 60, False),
]


def seed():
    print("→ Connecting to Neon PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # Fetch category IDs
    cur.execute("SELECT id, name FROM categories WHERE name IN ('Books', 'Toys & Games', 'Sports & Outdoors');")
    cat_map = {name: cid for cid, name in cur.fetchall()}
    print(f"  → Category IDs: {cat_map}")

    if len(cat_map) != 3:
        print(f"ERROR: Expected 3 categories, got {len(cat_map)}: {cat_map}")
        sys.exit(1)

    all_rows = []
    now = datetime.utcnow()
    for cat_name, products in [("Books", BOOKS), ("Toys & Games", TOYS), ("Sports & Outdoors", SPORTS)]:
        cid = cat_map[cat_name]
        for (name, desc, price, img, stock, featured) in products:
            all_rows.append((name, desc, price, cid, img, stock, True, featured, now, now))

    # Delete existing products for these three categories only (avoid dups on re-run)
    cur.execute(
        "DELETE FROM products WHERE category_id = ANY(%s);",
        (list(cat_map.values()),),
    )
    deleted = cur.rowcount
    print(f"  → Cleared {deleted} existing products in these categories")

    execute_values(
        cur,
        """
        INSERT INTO products
            (name, description, price, category_id, image_url, stock_quantity, is_active, featured, created_at, updated_at)
        VALUES %s
        """,
        all_rows,
    )
    conn.commit()
    print(f"  → Inserted {len(all_rows)} products across Books, Toys & Games, Sports & Outdoors")

    # Verify
    cur.execute("""
        SELECT c.name, COUNT(p.id) FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.name ORDER BY c.name;
    """)
    print("\n" + "=" * 50)
    for name, count in cur.fetchall():
        print(f"  {name:25s} {count} products")
    print("=" * 50)

    cur.close()
    conn.close()


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"❌ FAILED: {e}")
        sys.exit(1)
