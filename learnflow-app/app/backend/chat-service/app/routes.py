"""Chat Service Routes - AI Chat Endpoints with RAG Integration"""

import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func

from .models import ChatMessage, ChatMessageRequest, ChatHistoryResponse, ChatMessageResponse
from .database import get_session
from .ai_client import generate_chat_response, stream_chat_response, get_system_prompt
from .rag_client import ProductRAGClient, format_rag_context

logger = logging.getLogger(__name__)

# Initialize RAG client
rag_client = None

def get_rag_client():
    """Get or initialize RAG client."""
    global rag_client
    if rag_client is None:
        try:
            qdrant_host = os.getenv("QDRANT_HOST", "localhost")
            qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))
            openai_api_key = os.getenv("OPENAI_API_KEY")

            rag_client = ProductRAGClient(
                qdrant_host=qdrant_host,
                qdrant_port=qdrant_port,
                openai_api_key=openai_api_key
            )
            logger.info("RAG client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAG client: {e}")
            rag_client = None
    return rag_client

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/messages")
async def send_message(
    message_data: ChatMessageRequest,
    session: Session = Depends(get_session)
):
    """
    Send chat message and get streaming response with RAG context

    Returns: Server-Sent Events (SSE) stream with product recommendations
    """
    # Save user message
    user_msg = ChatMessage(
        user_id=message_data.user_id,
        session_id=message_data.session_id,
        role="user",
        content=message_data.text
    )
    session.add(user_msg)
    session.commit()

    # Get chat history
    history = session.exec(
        select(ChatMessage).where(
            ChatMessage.session_id == message_data.session_id
        ).order_by(ChatMessage.created_at)
    ).all()

    # Initialize RAG context
    rag_context = ""
    rag_client = get_rag_client()

    if rag_client:
        try:
            # Search for relevant products using RAG
            relevant_products = rag_client.search_products(
                query=message_data.text,
                limit=5,
                score_threshold=0.5
            )

            # Format products into context
            rag_context = format_rag_context(relevant_products)
            logger.info(f"Found {len(relevant_products)} relevant products for query")
        except Exception as e:
            logger.warning(f"RAG search failed: {e}. Continuing without context.")
            rag_context = ""

    # Build messages for OpenAI with RAG context
    system_prompt = get_system_prompt()
    if rag_context:
        system_prompt += f"\n\nContext from product database:\n{rag_context}"

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    # Generate response
    async def response_generator():
        full_response = ""
        async for chunk in stream_chat_response(messages):
            full_response += chunk
            yield f"data: {chunk}\n\n"

        # Save assistant message
        assistant_msg = ChatMessage(
            user_id=message_data.user_id,
            session_id=message_data.session_id,
            role="assistant",
            content=full_response
        )
        session.add(assistant_msg)
        session.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        response_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session)
):
    """Get chat history for a session"""
    # Get total count
    total = session.exec(
        select(func.count(ChatMessage.id)).where(
            ChatMessage.session_id == session_id
        )
    ).one()

    # Get messages
    messages = session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    # Reverse to get chronological order
    messages = list(reversed(messages))

    return ChatHistoryResponse(
        messages=[ChatMessageResponse.from_orm(m) for m in messages],
        total=total,
        session_id=session_id
    )


@router.delete("/history")
async def clear_chat_history(
    session_id: str,
    session: Session = Depends(get_session)
):
    """Clear chat history for a session"""
    messages = session.exec(
        select(ChatMessage).where(
            ChatMessage.session_id == session_id
        )
    ).all()

    for msg in messages:
        session.delete(msg)

    session.commit()

    return {"message": "Chat history cleared", "session_id": session_id}


@router.post("/search-products")
async def search_products(
    query: str,
    limit: int = 5,
    score_threshold: float = 0.5
):
    """
    Search for products using RAG semantic search

    Args:
        query: Search query (natural language)
        limit: Maximum number of results
        score_threshold: Minimum relevance score (0-1)

    Returns:
        List of relevant products with metadata
    """
    rag_client = get_rag_client()

    if not rag_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG service not available"
        )

    try:
        products = rag_client.search_products(
            query=query,
            limit=limit,
            score_threshold=score_threshold
        )

        return {
            "query": query,
            "results": products,
            "count": len(products)
        }
    except Exception as e:
        logger.error(f"Product search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Product search failed"
        )


@router.get("/recommendations")
async def get_recommendations(
    user_id: int,
    limit: int = 5,
    session: Session = Depends(get_session)
):
    """
    Get personalized product recommendations based on chat history

    Args:
        user_id: User ID
        limit: Number of recommendations

    Returns:
        List of recommended products
    """
    rag_client = get_rag_client()

    if not rag_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG service not available"
        )

    try:
        # Get user's recent chat messages
        recent_messages = session.exec(
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
        ).all()

        if not recent_messages:
            # No history, return empty recommendations
            return {"user_id": user_id, "recommendations": []}

        # Build query from recent messages
        user_queries = [msg.content for msg in recent_messages if msg.role == "user"]
        combined_query = " ".join(user_queries[:5])  # Last 5 user messages

        # Search for products
        products = rag_client.search_products(
            query=combined_query,
            limit=limit,
            score_threshold=0.4
        )

        return {
            "user_id": user_id,
            "recommendations": products,
            "count": len(products)
        }
    except Exception as e:
        logger.error(f"Recommendation generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Recommendation generation failed"
        )


@router.get("/rag-status")
async def get_rag_status():
    """Get RAG system status and collection info"""
    rag_client = get_rag_client()

    if not rag_client:
        return {
            "status": "offline",
            "message": "RAG client not initialized"
        }

    try:
        collection_info = rag_client.get_collection_info()
        return {
            "status": "online",
            "collection_info": collection_info
        }
    except Exception as e:
        logger.error(f"Error getting RAG status: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
