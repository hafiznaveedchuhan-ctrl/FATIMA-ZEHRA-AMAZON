"""
RAG (Retrieval Augmented Generation) Client for Qdrant Vector Database
Provides semantic product search and context retrieval for chat responses
"""

import os
from typing import List, Dict, Any
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import OpenAI
import openai

logger = logging.getLogger(__name__)

class ProductRAGClient:
    """
    RAG client for semantic product search using Qdrant vector database.
    Integrates with OpenAI embeddings for intelligent product recommendations.
    """

    def __init__(
        self,
        qdrant_host: str = "localhost",
        qdrant_port: int = 6333,
        openai_api_key: str = None,
        collection_name: str = "products",
        embedding_model: str = "text-embedding-ada-002",
        embedding_dimension: int = 1536
    ):
        """
        Initialize RAG client.

        Args:
            qdrant_host: Qdrant server hostname
            qdrant_port: Qdrant server port
            openai_api_key: OpenAI API key for embeddings
            collection_name: Qdrant collection name
            embedding_model: OpenAI embedding model
            embedding_dimension: Embedding vector dimension (1536 for ada-002)
        """
        self.qdrant_host = qdrant_host
        self.qdrant_port = qdrant_port
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        self.embedding_dimension = embedding_dimension

        # Initialize Qdrant client
        try:
            self.client = QdrantClient(host=qdrant_host, port=qdrant_port)
            logger.info(f"Connected to Qdrant at {qdrant_host}:{qdrant_port}")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")
            raise

        # Initialize OpenAI client (v1.x API)
        self.openai_client = OpenAI(
            api_key=openai_api_key or os.getenv("OPENAI_API_KEY")
        )

        # Create or verify collection
        self._ensure_collection()

    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        try:
            collections = self.client.get_collections()
            collection_names = [c.name for c in collections.collections]

            if self.collection_name not in collection_names:
                logger.info(f"Creating collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dimension,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Collection {self.collection_name} created successfully")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
        except Exception as e:
            logger.error(f"Error ensuring collection: {e}")
            raise

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using OpenAI.

        Args:
            text: Text to embed

        Returns:
            Embedding vector (1536 dimensions)
        """
        try:
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding for: {text[:50]}...")
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    def add_product(
        self,
        product_id: int,
        name: str,
        description: str,
        category: str,
        price: float,
        image_url: str = None
    ) -> bool:
        """
        Add product to vector database with semantic embeddings.

        Args:
            product_id: Unique product ID
            name: Product name
            description: Product description
            category: Product category
            price: Product price
            image_url: Product image URL

        Returns:
            True if successful
        """
        try:
            # Create rich text representation for embedding
            embedding_text = f"{name}. {description}. Category: {category}. Price: {price}"

            # Generate embedding
            embedding = self.get_embedding(embedding_text)

            # Create payload with metadata
            payload = {
                "id": product_id,
                "name": name,
                "description": description,
                "category": category,
                "price": price,
                "image_url": image_url or "",
                "embedding_text": embedding_text
            }

            # Upsert to Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    PointStruct(
                        id=product_id,
                        vector=embedding,
                        payload=payload
                    )
                ]
            )

            logger.info(f"Added product {product_id}: {name}")
            return True
        except Exception as e:
            logger.error(f"Error adding product {product_id}: {e}")
            return False

    def search_products(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Semantic search for products based on user query.

        Args:
            query: User search query or question
            limit: Maximum number of results
            score_threshold: Minimum similarity score (0-1)

        Returns:
            List of relevant products with metadata
        """
        try:
            # Generate embedding for query
            query_embedding = self.get_embedding(query)

            # Search in Qdrant
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold
            )

            # Format results
            products = []
            for result in search_results:
                product = {
                    "id": result.payload["id"],
                    "name": result.payload["name"],
                    "description": result.payload["description"],
                    "category": result.payload["category"],
                    "price": result.payload["price"],
                    "image_url": result.payload.get("image_url", ""),
                    "relevance_score": result.score
                }
                products.append(product)

            logger.info(f"Found {len(products)} products for query: {query}")
            return products
        except Exception as e:
            logger.error(f"Error searching products: {e}")
            return []

    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the products collection."""
        try:
            info = self.client.get_collection(self.collection_name)
            return {
                "name": info.name,
                "points_count": info.points_count,
                "vectors_count": info.vectors_count,
                "config": str(info.config)
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {}

    def delete_collection(self) -> bool:
        """Delete the entire collection (use with caution)."""
        try:
            self.client.delete_collection(self.collection_name)
            logger.warning(f"Deleted collection: {self.collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            return False


def format_rag_context(products: List[Dict[str, Any]]) -> str:
    """
    Format retrieved products into context string for LLM.

    Args:
        products: List of products from RAG search

    Returns:
        Formatted context string
    """
    if not products:
        return "No relevant products found."

    context = "Relevant products:\n"
    for i, product in enumerate(products, 1):
        score_percent = int(product.get("relevance_score", 0) * 100)
        context += (
            f"{i}. {product['name']}\n"
            f"   Category: {product['category']} | Price: Rs {product['price']}\n"
            f"   Description: {product['description']}\n"
            f"   Relevance: {score_percent}%\n"
        )
    return context
