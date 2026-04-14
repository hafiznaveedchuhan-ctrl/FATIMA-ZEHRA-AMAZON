"""OpenAI Client - Chat Completion Integration"""

import os
from openai import AsyncOpenAI, OpenAI

# Initialize clients
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Sync client for regular operations
client = OpenAI(api_key=api_key)

# Async client for streaming
async_client = AsyncOpenAI(api_key=api_key)


async def generate_chat_response(messages: list[dict], model: str = "gpt-4o") -> str:
    """
    Generate chat response using OpenAI API

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model to use (default: gpt-4o)

    Returns:
        Assistant response text
    """
    try:
        response = await async_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating response: {str(e)}"


async def stream_chat_response(messages: list[dict], model: str = "gpt-4o"):
    """
    Stream chat response using OpenAI API

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model to use (default: gpt-4o)

    Yields:
        Response chunks
    """
    try:
        stream = await async_client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=1000,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"Error: {str(e)}"


def get_system_prompt() -> str:
    """Get system prompt for Fatima Zehra Boutique assistant"""
    return """You are a helpful shopping assistant for Fatima Zehra Boutique, an elegant fashion boutique.

Your role is to:
1. Help customers find and learn about products
2. Provide fashion advice and recommendations
3. Answer questions about products, categories, and services
4. Guide customers through their shopping experience
5. Be friendly, professional, and helpful

When customers ask about products, provide helpful suggestions based on what they're looking for.
Keep responses concise and engaging.
Focus on helping customers find what they need."""
