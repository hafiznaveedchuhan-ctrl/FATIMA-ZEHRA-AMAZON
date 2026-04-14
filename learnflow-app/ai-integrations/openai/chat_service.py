# OpenAI Chat Service Integration
# Compatible with LearnFlow App

"""
OpenAI Chat Service
Integrates GPT-4o for product recommendations and customer support
"""

import os
import json
from typing import Optional, List, Dict, AsyncGenerator
from openai import AsyncOpenAI

class OpenAIChatService:
    """
    Chat service using OpenAI API
    Supports: GPT-4o, GPT-4, GPT-3.5-turbo
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 2048
    ):
        """
        Initialize OpenAI Chat Service

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: Model to use (gpt-4o, gpt-4, gpt-3.5-turbo)
            temperature: Creativity (0-1, default 0.7)
            max_tokens: Max response length
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.client = AsyncOpenAI(api_key=self.api_key)

        self.system_prompt = """You are a helpful customer service AI for Fatima Zehra Boutique,
an elegant fashion e-commerce store. Help customers find products, answer questions, and provide
excellent service. When recommending products, include price and category information."""

    async def send_message(
        self,
        user_message: str,
        chat_history: Optional[List[Dict]] = None,
        session_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Send message and get streaming response

        Args:
            user_message: User's message
            chat_history: Previous messages in conversation
            session_id: Session identifier for context

        Yields:
            Streamed response text chunks
        """
        messages = [{"role": "system", "content": self.system_prompt}]

        if chat_history:
            messages.extend(chat_history)

        messages.append({"role": "user", "content": user_message})

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                stream=True
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"Error: {str(e)}"

    async def get_product_recommendations(
        self,
        query: str,
        products: List[Dict]
    ) -> str:
        """
        Get AI recommendations based on product catalog

        Args:
            query: User's search query
            products: List of available products

        Returns:
            Formatted recommendations
        """
        product_text = json.dumps(products, indent=2)

        prompt = f"""
        User is looking for: {query}

        Available products:
        {product_text}

        Recommend the best 3-5 products from the list.
        Include product name, price, and brief explanation why it matches the request.
        Format as a numbered list.
        """

        response = ""
        async for chunk in self.send_message(prompt):
            response += chunk

        return response

    async def search_products_via_ai(
        self,
        query: str,
        products: List[Dict]
    ) -> List[Dict]:
        """
        Use AI to semantically search products

        Args:
            query: Search query
            products: Product catalog

        Returns:
            Ranked list of matching products
        """
        prompt = f"""
        User search: {query}

        Products catalog:
        {json.dumps(products, indent=2)}

        Return JSON array of top 5 matching products.
        Return ONLY valid JSON, no other text.
        Format: [{{"id": 1, "name": "...", "match_score": 0.95}}, ...]
        """

        response = ""
        async for chunk in self.send_message(prompt):
            response += chunk

        try:
            results = json.loads(response)
            return results[:5]
        except:
            return []

    async def generate_product_description(
        self,
        product_name: str,
        category: str
    ) -> str:
        """
        Generate elegant product description

        Args:
            product_name: Product name
            category: Product category

        Returns:
            Generated description
        """
        prompt = f"""
        Generate a short, elegant description for:
        Product: {product_name}
        Category: {category}

        Keep it under 100 words. Focus on elegance and quality.
        """

        description = ""
        async for chunk in self.send_message(prompt):
            description += chunk

        return description

    async def detect_sentiment(
        self,
        text: str
    ) -> Dict[str, float]:
        """
        Analyze sentiment of customer message

        Args:
            text: Customer message

        Returns:
            Sentiment scores (positive, negative, neutral)
        """
        prompt = f"""
        Analyze sentiment of: {text}

        Return JSON: {{"positive": 0.0, "negative": 0.0, "neutral": 0.0}}
        Only JSON, no other text.
        """

        response = ""
        async for chunk in self.send_message(prompt):
            response += chunk

        try:
            return json.loads(response)
        except:
            return {"positive": 0.5, "negative": 0, "neutral": 0.5}

# ============================================================================
# Usage Example
# ============================================================================

async def example():
    """Example usage"""
    service = OpenAIChatService()

    # Simple chat
    print("User: Show me evening dresses")
    response = ""
    async for chunk in service.send_message("Show me evening dresses"):
        print(chunk, end="", flush=True)
        response += chunk
    print("\n")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example())
