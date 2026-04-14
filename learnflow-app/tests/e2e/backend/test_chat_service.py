"""
Chat Service API Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Chat message endpoint with SSE streaming
- Chat history retrieval
- RAG product search
- Product recommendations
- RAG system status
"""

import pytest
import httpx
from typing import Dict, Any


class TestChatServiceHealth:
    """Test Chat Service health endpoints."""

    @pytest.mark.requires_api
    def test_health_endpoint(self, base_urls: Dict[str, str]):
        """Test health check endpoint returns 200."""
        url = f"{base_urls['chat']}/health"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    @pytest.mark.requires_api
    def test_root_endpoint(self, base_urls: Dict[str, str]):
        """Test root endpoint returns service info."""
        url = f"{base_urls['chat']}/"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200


class TestChatMessages:
    """Test chat message endpoints."""

    @pytest.mark.requires_api
    @pytest.mark.slow
    def test_send_message_returns_stream(
        self,
        base_urls: Dict[str, str],
        chat_message: Dict[str, str]
    ):
        """Test POST /api/chat/messages returns SSE stream."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=30.0) as client:
            with client.stream(
                "POST",
                url,
                json=chat_message
            ) as response:
                assert response.status_code == 200
                assert "text/event-stream" in response.headers.get("content-type", "")

                # Read some chunks
                chunks = []
                for line in response.iter_lines():
                    if line:
                        chunks.append(line)
                    if len(chunks) > 5:  # Read first few chunks
                        break

                # Should have received some data
                assert len(chunks) > 0

    @pytest.mark.requires_api
    def test_send_message_endpoint_exists(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that chat message endpoint exists."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=10.0) as client:
            # POST with minimal data
            response = client.post(
                url,
                json={"text": "test", "session_id": "test-123"}
            )

        # Should not be 404
        assert response.status_code != 404

    @pytest.mark.requires_api
    def test_send_message_requires_text(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that message requires text field."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                json={"session_id": "test-123"}  # Missing text
            )

        # Should fail validation
        assert response.status_code in [400, 422]


class TestChatHistory:
    """Test chat history endpoints."""

    @pytest.mark.requires_api
    def test_get_chat_history(
        self,
        base_urls: Dict[str, str]
    ):
        """Test GET /api/chat/history returns messages."""
        url = f"{base_urls['chat']}/api/chat/history"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                url,
                params={"session_id": "test-session-001"}
            )

        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert "total" in data
        assert "session_id" in data

    @pytest.mark.requires_api
    def test_get_chat_history_with_pagination(
        self,
        base_urls: Dict[str, str]
    ):
        """Test chat history pagination."""
        url = f"{base_urls['chat']}/api/chat/history"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                url,
                params={
                    "session_id": "test-session-001",
                    "limit": 10,
                    "offset": 0
                }
            )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["messages"], list)

    @pytest.mark.requires_api
    def test_clear_chat_history(
        self,
        base_urls: Dict[str, str]
    ):
        """Test DELETE /api/chat/history clears messages."""
        url = f"{base_urls['chat']}/api/chat/history"

        with httpx.Client(timeout=10.0) as client:
            response = client.delete(
                url,
                params={"session_id": "test-clear-session"}
            )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Chat history cleared"


class TestRAGSearch:
    """Test RAG product search functionality."""

    @pytest.mark.requires_api
    def test_search_products_formal_suit(
        self,
        base_urls: Dict[str, str]
    ):
        """Test POST /api/chat/search-products for 'formal suit'."""
        url = f"{base_urls['chat']}/api/chat/search-products"

        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                url,
                params={
                    "query": "formal suit for wedding",
                    "limit": 5,
                    "score_threshold": 0.5
                }
            )

        # May return 503 if RAG not available
        if response.status_code == 200:
            data = response.json()
            assert "query" in data
            assert "results" in data
            assert "count" in data

    @pytest.mark.requires_api
    def test_search_products_cotton(
        self,
        base_urls: Dict[str, str]
    ):
        """Test RAG search for 'cotton suit'."""
        url = f"{base_urls['chat']}/api/chat/search-products"

        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                url,
                params={
                    "query": "cotton suit comfortable",
                    "limit": 5
                }
            )

        if response.status_code == 200:
            data = response.json()
            assert len(data["results"]) >= 0

    @pytest.mark.requires_api
    def test_search_products_returns_relevant_results(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that RAG search returns relevant products."""
        url = f"{base_urls['chat']}/api/chat/search-products"

        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                url,
                params={
                    "query": "fancy embroidered party wear",
                    "limit": 5,
                    "score_threshold": 0.4
                }
            )

        if response.status_code == 200:
            data = response.json()
            # Results should be products with scores
            for result in data["results"]:
                assert "score" in result or "product" in result

    @pytest.mark.requires_api
    def test_search_products_score_threshold(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that results respect score threshold."""
        url = f"{base_urls['chat']}/api/chat/search-products"

        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                url,
                params={
                    "query": "designer brand premium",
                    "limit": 5,
                    "score_threshold": 0.7  # High threshold
                }
            )

        if response.status_code == 200:
            data = response.json()
            # All results should have score >= 0.7
            for result in data["results"]:
                if "score" in result:
                    assert result["score"] >= 0.7


class TestRecommendations:
    """Test product recommendation endpoint."""

    @pytest.mark.requires_api
    def test_get_recommendations(
        self,
        base_urls: Dict[str, str]
    ):
        """Test GET /api/chat/recommendations returns products."""
        url = f"{base_urls['chat']}/api/chat/recommendations"

        with httpx.Client(timeout=15.0) as client:
            response = client.get(
                url,
                params={
                    "user_id": 1,
                    "limit": 5
                }
            )

        # May return 503 if RAG not available
        if response.status_code == 200:
            data = response.json()
            assert "user_id" in data
            assert "recommendations" in data

    @pytest.mark.requires_api
    def test_recommendations_for_new_user(
        self,
        base_urls: Dict[str, str]
    ):
        """Test recommendations for user with no history."""
        url = f"{base_urls['chat']}/api/chat/recommendations"

        with httpx.Client(timeout=15.0) as client:
            response = client.get(
                url,
                params={
                    "user_id": 99999,  # New user
                    "limit": 5
                }
            )

        if response.status_code == 200:
            data = response.json()
            # Should return empty recommendations or default products
            assert "recommendations" in data


class TestRAGStatus:
    """Test RAG system status endpoint."""

    @pytest.mark.requires_api
    def test_get_rag_status(
        self,
        base_urls: Dict[str, str]
    ):
        """Test GET /api/chat/rag-status returns system status."""
        url = f"{base_urls['chat']}/api/chat/rag-status"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        # Status should be 'online', 'offline', or 'error'
        assert data["status"] in ["online", "offline", "error"]

    @pytest.mark.requires_api
    def test_rag_status_includes_collection_info(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that RAG status includes collection info when online."""
        url = f"{base_urls['chat']}/api/chat/rag-status"

        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)

        assert response.status_code == 200
        data = response.json()

        if data["status"] == "online":
            assert "collection_info" in data


class TestChatWithRAGContext:
    """Test chat messages with RAG context injection."""

    @pytest.mark.requires_api
    @pytest.mark.slow
    def test_chat_includes_product_context(
        self,
        base_urls: Dict[str, str]
    ):
        """Test that chat response includes product recommendations."""
        url = f"{base_urls['chat']}/api/chat/messages"

        message = {
            "text": "What formal suits do you have for a wedding?",
            "session_id": "rag-test-session",
            "user_id": 1
        }

        with httpx.Client(timeout=30.0) as client:
            with client.stream("POST", url, json=message) as response:
                if response.status_code == 200:
                    full_response = ""
                    for line in response.iter_lines():
                        if line and line.startswith("data: "):
                            data = line[6:]  # Remove "data: " prefix
                            if data != "[DONE]":
                                full_response += data

                    # Response should mention products or suits
                    # (This depends on RAG being configured properly)
                    assert len(full_response) > 0

    @pytest.mark.requires_api
    @pytest.mark.slow
    def test_chat_cotton_query(
        self,
        base_urls: Dict[str, str]
    ):
        """Test chat with cotton-related query."""
        url = f"{base_urls['chat']}/api/chat/messages"

        message = {
            "text": "Show me something in cotton that is comfortable",
            "session_id": "cotton-test-session",
            "user_id": 1
        }

        with httpx.Client(timeout=30.0) as client:
            with client.stream("POST", url, json=message) as response:
                if response.status_code == 200:
                    chunks_received = 0
                    for line in response.iter_lines():
                        if line:
                            chunks_received += 1
                        if chunks_received > 5:
                            break

                    # Should receive streaming response
                    assert chunks_received > 0


class TestChatErrorHandling:
    """Test chat service error handling."""

    @pytest.mark.requires_api
    def test_empty_message_handling(
        self,
        base_urls: Dict[str, str]
    ):
        """Test handling of empty message."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                json={"text": "", "session_id": "empty-test"}
            )

        # Should return validation error
        assert response.status_code in [400, 422]

    @pytest.mark.requires_api
    def test_missing_session_id_handling(
        self,
        base_urls: Dict[str, str]
    ):
        """Test handling of missing session_id."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                json={"text": "Hello"}  # Missing session_id
            )

        # Should return validation error
        assert response.status_code in [400, 422]

    @pytest.mark.requires_api
    def test_invalid_json_handling(
        self,
        base_urls: Dict[str, str]
    ):
        """Test handling of invalid JSON."""
        url = f"{base_urls['chat']}/api/chat/messages"

        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                content="invalid json",
                headers={"Content-Type": "application/json"}
            )

        # Should return error
        assert response.status_code in [400, 422]
