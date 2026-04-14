#!/usr/bin/env python3
"""
Generate and store product embeddings in Qdrant vector database.
This script retrieves all products from PostgreSQL and generates semantic embeddings.
"""

import asyncio
import sys
import os
import logging
from datetime import datetime

# Setup path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app', 'backend', 'chat-service'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def generate_embeddings():
    """Generate embeddings for all products and store in Qdrant."""

    try:
        # Import after path setup
        from app.rag_client import ProductRAGClient
        import psycopg2
        from psycopg2.extras import RealDictCursor

        logger.info("Starting embedding generation...")
        logger.info(f"Timestamp: {datetime.now().isoformat()}")

        # Initialize RAG client
        logger.info("Initializing RAG client...")
        rag_client = ProductRAGClient(
            qdrant_host=os.getenv("QDRANT_HOST", "localhost"),
            qdrant_port=int(os.getenv("QDRANT_PORT", 6333)),
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        # Connect to PostgreSQL
        logger.info("Connecting to PostgreSQL...")
        db_conn = psycopg2.connect(
            host=os.getenv("DATABASE_HOST", "postgres"),
            port=os.getenv("DATABASE_PORT", "5432"),
            database=os.getenv("DATABASE_NAME", "boutique_shop"),
            user=os.getenv("DATABASE_USER", "postgres"),
            password=os.getenv("DATABASE_PASSWORD", "postgres")
        )

        cursor = db_conn.cursor(cursor_factory=RealDictCursor)

        # Fetch all products
        logger.info("Fetching products from database...")
        cursor.execute("""
            SELECT
                p.id,
                p.name,
                p.description,
                c.name as category,
                p.price,
                p.image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id
        """)

        products = cursor.fetchall()
        logger.info(f"Found {len(products)} products to embed")

        if not products:
            logger.warning("No products found in database!")
            return False

        # Get collection info
        collection_info = rag_client.get_collection_info()
        logger.info(f"Collection info before: {collection_info}")

        # Generate embeddings for each product
        success_count = 0
        failed_count = 0

        for idx, product in enumerate(products, 1):
            try:
                logger.info(f"[{idx}/{len(products)}] Processing: {product['name']}")

                success = rag_client.add_product(
                    product_id=product['id'],
                    name=product['name'],
                    description=product['description'] or "",
                    category=product['category'] or "Uncategorized",
                    price=float(product['price']) if product['price'] else 0.0,
                    image_url=product['image_url']
                )

                if success:
                    success_count += 1
                    logger.info(f"✓ Embedded: {product['name']} (ID: {product['id']})")
                else:
                    failed_count += 1
                    logger.error(f"✗ Failed to embed: {product['name']} (ID: {product['id']})")

            except Exception as e:
                failed_count += 1
                logger.error(f"✗ Error embedding product {product['id']}: {str(e)}")
                continue

        # Get final collection info
        collection_info = rag_client.get_collection_info()
        logger.info(f"Collection info after: {collection_info}")

        # Cleanup
        cursor.close()
        db_conn.close()

        # Summary
        logger.info("\n" + "="*60)
        logger.info(f"EMBEDDING GENERATION COMPLETE!")
        logger.info(f"✓ Success: {success_count}/{len(products)}")
        logger.info(f"✗ Failed: {failed_count}/{len(products)}")
        logger.info(f"Total vectors in Qdrant: {collection_info.get('vectors_count', 'N/A')}")
        logger.info("="*60 + "\n")

        return failed_count == 0

    except ImportError as e:
        logger.error(f"Import error: {e}")
        logger.error("Make sure you're running this from the learnflow-app directory")
        return False
    except Exception as e:
        logger.error(f"Critical error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(generate_embeddings())
    sys.exit(0 if success else 1)
