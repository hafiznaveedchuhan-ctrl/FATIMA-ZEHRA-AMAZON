"""
Stripe Payment Client Unit Tests
Fatima Zehra Boutique - Phase 5 Testing

Tests cover:
- Payment intent creation (mocked Stripe API)
- Payment verification
- Webhook event processing
- Payment success handler
- Payment failure handler
- Cancellation handling
- Currency conversion (PKR to paisa)
- Error handling for various Stripe errors

All Stripe API calls are mocked. No real charges.
"""

import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

os.environ["JWT_SECRET"] = "test-secret-key-for-unit-tests-minimum-32-chars-long"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENAI_API_KEY"] = "sk-test-placeholder"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_mock_key_for_unit_tests"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_secret"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "app", "backend", "order-service"))

from app.stripe_client import (
    StripePaymentClient,
    process_stripe_webhook,
    WEBHOOK_HANDLERS,
    CURRENCY,
    CURRENCY_SYMBOL
)


# ---------------------------------------------------------------------------
# Configuration Tests
# ---------------------------------------------------------------------------

class TestStripeConfiguration:
    """Test Stripe client configuration."""

    @pytest.mark.unit
    def test_currency_is_pkr(self):
        """Test that default currency is PKR."""
        assert CURRENCY == "pkr"

    @pytest.mark.unit
    def test_currency_symbol_is_rs(self):
        """Test that currency symbol is Rs."""
        assert CURRENCY_SYMBOL == "Rs"

    @pytest.mark.unit
    def test_webhook_handlers_registered(self):
        """Test that webhook handlers are properly registered."""
        assert "payment_intent.succeeded" in WEBHOOK_HANDLERS
        assert "payment_intent.payment_failed" in WEBHOOK_HANDLERS
        assert len(WEBHOOK_HANDLERS) == 2


# ---------------------------------------------------------------------------
# Payment Intent Creation Tests (Mocked)
# ---------------------------------------------------------------------------

class TestCreatePaymentIntent:
    """Test payment intent creation with mocked Stripe."""

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.create")
    def test_create_payment_intent_success(self, mock_create):
        """Test successful payment intent creation."""
        # Setup mock
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.client_secret = "pi_test_123_secret_xyz"
        mock_intent.status = "requires_payment_method"
        mock_intent.created = 1706000000
        mock_create.return_value = mock_intent

        result = StripePaymentClient.create_payment_intent(
            amount_pkr=8500.0,
            order_id=1,
            customer_email="buyer@fatimazehra.com",
            customer_name="Test Buyer"
        )

        assert result["payment_intent_id"] == "pi_test_123"
        assert result["client_secret"] == "pi_test_123_secret_xyz"
        assert result["amount"] == 8500.0
        assert result["currency"] == "pkr"

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.create")
    def test_create_payment_intent_amount_conversion(self, mock_create):
        """Test that PKR amount is converted to paisa (x100)."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_456"
        mock_intent.client_secret = "secret"
        mock_intent.status = "requires_payment_method"
        mock_intent.created = 1706000000
        mock_create.return_value = mock_intent

        StripePaymentClient.create_payment_intent(
            amount_pkr=1000.0,
            order_id=1,
            customer_email="test@test.com",
            customer_name="Test"
        )

        # Verify amount passed to Stripe is in paisa
        call_kwargs = mock_create.call_args[1]
        assert call_kwargs["amount"] == 100000  # 1000 PKR * 100

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.create")
    def test_create_payment_intent_metadata(self, mock_create):
        """Test that metadata includes order_id and customer_name."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_meta"
        mock_intent.client_secret = "secret"
        mock_intent.status = "requires_payment_method"
        mock_intent.created = 1706000000
        mock_create.return_value = mock_intent

        StripePaymentClient.create_payment_intent(
            amount_pkr=5000.0,
            order_id=42,
            customer_email="meta@test.com",
            customer_name="Meta User"
        )

        call_kwargs = mock_create.call_args[1]
        assert call_kwargs["metadata"]["order_id"] == "42"
        assert call_kwargs["metadata"]["customer_name"] == "Meta User"

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.create")
    def test_create_payment_intent_custom_metadata(self, mock_create):
        """Test that custom metadata is merged."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_custom"
        mock_intent.client_secret = "secret"
        mock_intent.status = "requires_payment_method"
        mock_intent.created = 1706000000
        mock_create.return_value = mock_intent

        StripePaymentClient.create_payment_intent(
            amount_pkr=2000.0,
            order_id=1,
            customer_email="test@test.com",
            customer_name="Test",
            metadata={"promo_code": "SALE20"}
        )

        call_kwargs = mock_create.call_args[1]
        assert "promo_code" in call_kwargs["metadata"]
        assert call_kwargs["metadata"]["promo_code"] == "SALE20"

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.create")
    def test_create_payment_intent_decimal_amount(self, mock_create):
        """Test amount with decimal places."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_dec"
        mock_intent.client_secret = "secret"
        mock_intent.status = "requires_payment_method"
        mock_intent.created = 1706000000
        mock_create.return_value = mock_intent

        StripePaymentClient.create_payment_intent(
            amount_pkr=8500.50,
            order_id=1,
            customer_email="test@test.com",
            customer_name="Test"
        )

        call_kwargs = mock_create.call_args[1]
        assert call_kwargs["amount"] == 850050  # 8500.50 * 100


# ---------------------------------------------------------------------------
# Payment Retrieval Tests
# ---------------------------------------------------------------------------

class TestRetrievePaymentIntent:
    """Test payment intent retrieval."""

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.retrieve")
    def test_retrieve_payment_intent(self, mock_retrieve):
        """Test retrieving payment intent details."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.status = "succeeded"
        mock_intent.amount = 850000
        mock_intent.currency = "pkr"
        mock_intent.receipt_email = "buyer@test.com"
        mock_intent.created = 1706000000
        mock_intent.charges = MagicMock()
        mock_intent.charges.data = [MagicMock()]
        mock_retrieve.return_value = mock_intent

        result = StripePaymentClient.retrieve_payment_intent("pi_test_123")

        assert result["payment_intent_id"] == "pi_test_123"
        assert result["status"] == "succeeded"
        assert result["amount"] == 8500.0  # 850000 / 100
        assert result["currency"] == "pkr"

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.retrieve")
    def test_verify_payment_succeeded(self, mock_retrieve):
        """Test payment verification for successful payment."""
        mock_intent = MagicMock()
        mock_intent.status = "succeeded"
        mock_retrieve.return_value = mock_intent

        assert StripePaymentClient.verify_payment_succeeded("pi_ok") is True

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.retrieve")
    def test_verify_payment_not_succeeded(self, mock_retrieve):
        """Test payment verification for pending payment."""
        mock_intent = MagicMock()
        mock_intent.status = "requires_payment_method"
        mock_retrieve.return_value = mock_intent

        assert StripePaymentClient.verify_payment_succeeded("pi_pending") is False

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.retrieve")
    def test_verify_payment_error_returns_false(self, mock_retrieve):
        """Test that verification returns False on error."""
        mock_retrieve.side_effect = Exception("Network error")
        assert StripePaymentClient.verify_payment_succeeded("pi_error") is False


# ---------------------------------------------------------------------------
# Webhook Handler Tests
# ---------------------------------------------------------------------------

class TestWebhookHandlers:
    """Test individual webhook event handlers."""

    @pytest.mark.unit
    def test_handle_succeeded_event(self):
        """Test handling payment_intent.succeeded event."""
        event = {
            "data": {
                "object": {
                    "id": "pi_success",
                    "amount": 1000000,
                    "currency": "pkr",
                    "receipt_email": "success@test.com",
                    "metadata": {"order_id": "10", "customer_name": "Success User"},
                    "created": 1706000000,
                }
            }
        }
        result = StripePaymentClient.handle_payment_intent_succeeded(event)

        assert result is not None
        assert result["order_id"] == "10"
        assert result["payment_intent_id"] == "pi_success"
        assert result["status"] == "confirmed"
        assert result["amount"] == 10000.0
        assert result["customer_email"] == "success@test.com"

    @pytest.mark.unit
    def test_handle_failed_event(self):
        """Test handling payment_intent.payment_failed event."""
        event = {
            "data": {
                "object": {
                    "id": "pi_fail",
                    "metadata": {"order_id": "11"},
                    "last_payment_error": {"message": "Insufficient funds"},
                    "created": 1706000000,
                }
            }
        }
        result = StripePaymentClient.handle_payment_intent_payment_failed(event)

        assert result is not None
        assert result["order_id"] == "11"
        assert result["status"] == "payment_failed"
        assert result["error"] == "Insufficient funds"

    @pytest.mark.unit
    def test_handle_failed_event_no_error(self):
        """Test handling failed event without error details."""
        event = {
            "data": {
                "object": {
                    "id": "pi_fail_no_err",
                    "metadata": {"order_id": "12"},
                    "last_payment_error": {},
                    "created": 1706000000,
                }
            }
        }
        result = StripePaymentClient.handle_payment_intent_payment_failed(event)
        assert result is not None
        assert result["error"] is None

    @pytest.mark.unit
    def test_handle_succeeded_invalid_event(self):
        """Test handler with malformed event returns None."""
        result = StripePaymentClient.handle_payment_intent_succeeded({})
        assert result is None

    @pytest.mark.unit
    def test_handle_failed_invalid_event(self):
        """Test handler with malformed event returns None."""
        result = StripePaymentClient.handle_payment_intent_payment_failed({})
        assert result is None


# ---------------------------------------------------------------------------
# Cancellation Tests
# ---------------------------------------------------------------------------

class TestCancelPaymentIntent:
    """Test payment intent cancellation."""

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.cancel")
    def test_cancel_payment_intent_success(self, mock_cancel):
        """Test successful cancellation."""
        mock_cancel.return_value = None
        assert StripePaymentClient.cancel_payment_intent("pi_cancel") is True

    @pytest.mark.unit
    @patch("app.stripe_client.stripe.PaymentIntent.cancel")
    def test_cancel_payment_intent_failure(self, mock_cancel):
        """Test cancellation failure returns False."""
        mock_cancel.side_effect = Exception("Cannot cancel")
        assert StripePaymentClient.cancel_payment_intent("pi_no_cancel") is False


# ---------------------------------------------------------------------------
# Process Webhook Tests
# ---------------------------------------------------------------------------

class TestProcessStripeWebhook:
    """Test the main webhook processing function."""

    @pytest.mark.unit
    @patch.object(StripePaymentClient, "process_webhook_event")
    def test_process_webhook_succeeded(self, mock_verify):
        """Test processing a succeeded webhook."""
        mock_verify.return_value = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_webhook_ok",
                    "amount": 500000,
                    "currency": "pkr",
                    "receipt_email": "webhook@test.com",
                    "metadata": {"order_id": "20", "customer_name": "Webhook Test"},
                    "created": 1706000000,
                }
            }
        }

        result = process_stripe_webhook({"type": "payment_intent.succeeded"}, "sig_test")
        assert result is not None
        assert result["status"] == "confirmed"
        assert result["order_id"] == "20"

    @pytest.mark.unit
    @patch.object(StripePaymentClient, "process_webhook_event")
    def test_process_webhook_failed(self, mock_verify):
        """Test processing a failed webhook."""
        mock_verify.return_value = {
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_webhook_fail",
                    "metadata": {"order_id": "21"},
                    "last_payment_error": {"message": "Card declined"},
                    "created": 1706000000,
                }
            }
        }

        result = process_stripe_webhook({"type": "payment_intent.payment_failed"}, "sig_test")
        assert result is not None
        assert result["status"] == "payment_failed"

    @pytest.mark.unit
    @patch.object(StripePaymentClient, "process_webhook_event")
    def test_process_webhook_invalid_signature(self, mock_verify):
        """Test processing webhook with invalid signature."""
        mock_verify.return_value = None  # Signature verification failed

        result = process_stripe_webhook({"type": "test"}, "invalid_sig")
        assert result is None

    @pytest.mark.unit
    @patch.object(StripePaymentClient, "process_webhook_event")
    def test_process_webhook_unknown_event_type(self, mock_verify):
        """Test processing an unknown webhook event type."""
        mock_verify.return_value = {
            "type": "charge.dispute.created",
            "data": {"object": {}}
        }

        result = process_stripe_webhook({"type": "charge.dispute.created"}, "sig_test")
        assert result is None  # No handler registered for this type
