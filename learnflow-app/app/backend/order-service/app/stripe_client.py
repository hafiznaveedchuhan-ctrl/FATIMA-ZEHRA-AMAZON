"""
Stripe Payment Integration Client
Handles payment intent creation, verification, and webhook processing
"""

import os
import logging
import stripe
from typing import Dict, Optional, List, Any
from decimal import Decimal

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret")

# Currency configuration
CURRENCY = "pkr"  # Pakistani Rupee
CURRENCY_SYMBOL = "Rs"


class StripePaymentClient:
    """
    Stripe payment processing client
    Handles payment intents, webhooks, and payment verification
    """

    @staticmethod
    def create_payment_intent(
        amount_pkr: float,
        order_id: int,
        customer_email: str,
        customer_name: str,
        description: str = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe PaymentIntent for order payment

        Args:
            amount_pkr: Amount in Pakistani Rupees
            order_id: Order ID for tracking
            customer_email: Customer email address
            customer_name: Customer name
            description: Payment description
            metadata: Additional metadata

        Returns:
            Payment intent details with client secret
        """
        try:
            # Convert PKR to smallest currency unit (paisa)
            # PKR uses 2 decimal places, so multiply by 100
            amount_paisa = int(Decimal(str(amount_pkr)) * 100)

            # Build metadata
            intent_metadata = {
                "order_id": str(order_id),
                "customer_name": customer_name,
            }
            if metadata:
                intent_metadata.update(metadata)

            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount_paisa,
                currency=CURRENCY,
                description=description or f"Order #{order_id}",
                customer_email=customer_email,
                metadata=intent_metadata,
                automatic_payment_methods={"enabled": True},
                receipt_email=customer_email
            )

            logger.info(
                f"Created PaymentIntent {intent.id} for order {order_id}: "
                f"{CURRENCY_SYMBOL} {amount_pkr}"
            )

            return {
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount_pkr,
                "currency": CURRENCY,
                "status": intent.status,
                "created": intent.created,
            }
        except stripe.error.CardError as e:
            logger.error(f"Card error for order {order_id}: {e.user_message}")
            raise Exception(f"Payment card error: {e.user_message}")
        except stripe.error.RateLimitError:
            logger.error("Stripe rate limit exceeded")
            raise Exception("Payment service temporarily unavailable")
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid Stripe request: {e}")
            raise Exception(f"Invalid payment request: {e}")
        except stripe.error.AuthenticationError:
            logger.error("Stripe authentication failed")
            raise Exception("Payment service configuration error")
        except Exception as e:
            logger.error(f"Error creating PaymentIntent: {e}")
            raise

    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Retrieve payment intent details

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Payment intent details
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,  # Convert back to PKR
                "currency": intent.currency,
                "customer_email": intent.receipt_email,
                "created": intent.created,
                "charges": len(intent.charges.data) if intent.charges else 0,
            }
        except Exception as e:
            logger.error(f"Error retrieving PaymentIntent: {e}")
            raise

    @staticmethod
    def verify_payment_succeeded(payment_intent_id: str) -> bool:
        """
        Verify if payment intent succeeded

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            True if payment succeeded, False otherwise
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status == "succeeded"
        except Exception as e:
            logger.error(f"Error verifying payment: {e}")
            return False

    @staticmethod
    def process_webhook_event(
        event_json: Dict[str, Any],
        signature: str
    ) -> Optional[Dict[str, Any]]:
        """
        Process Stripe webhook event

        Args:
            event_json: Raw webhook event JSON
            signature: Stripe-Signature header value

        Returns:
            Processed event data if valid, None otherwise
        """
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload=str(event_json).encode(),
                sig_header=signature,
                secret=STRIPE_WEBHOOK_SECRET
            )

            logger.info(f"Webhook verified: {event['type']}")
            return event

        except stripe.error.SignatureVerificationError:
            logger.error("Invalid webhook signature")
            return None
        except Exception as e:
            logger.error(f"Webhook processing error: {e}")
            return None

    @staticmethod
    def handle_payment_intent_succeeded(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Handle payment_intent.succeeded webhook event

        Args:
            event: Stripe webhook event

        Returns:
            Order data from webhook
        """
        try:
            payment_intent = event["data"]["object"]

            order_data = {
                "order_id": payment_intent["metadata"].get("order_id"),
                "payment_intent_id": payment_intent["id"],
                "amount": payment_intent["amount"] / 100,  # Convert to PKR
                "currency": payment_intent["currency"],
                "status": "confirmed",
                "customer_email": payment_intent.get("receipt_email"),
                "timestamp": payment_intent["created"],
            }

            logger.info(
                f"Payment succeeded for order {order_data['order_id']}: "
                f"{CURRENCY_SYMBOL} {order_data['amount']}"
            )

            return order_data
        except Exception as e:
            logger.error(f"Error handling payment succeeded event: {e}")
            return None

    @staticmethod
    def handle_payment_intent_payment_failed(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Handle payment_intent.payment_failed webhook event

        Args:
            event: Stripe webhook event

        Returns:
            Order data from webhook
        """
        try:
            payment_intent = event["data"]["object"]

            order_data = {
                "order_id": payment_intent["metadata"].get("order_id"),
                "payment_intent_id": payment_intent["id"],
                "status": "payment_failed",
                "error": payment_intent.get("last_payment_error", {}).get("message"),
                "timestamp": payment_intent["created"],
            }

            logger.error(
                f"Payment failed for order {order_data['order_id']}: "
                f"{order_data.get('error')}"
            )

            return order_data
        except Exception as e:
            logger.error(f"Error handling payment failed event: {e}")
            return None

    @staticmethod
    def cancel_payment_intent(payment_intent_id: str) -> bool:
        """
        Cancel a payment intent

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            True if successful, False otherwise
        """
        try:
            stripe.PaymentIntent.cancel(payment_intent_id)
            logger.info(f"Cancelled PaymentIntent: {payment_intent_id}")
            return True
        except Exception as e:
            logger.error(f"Error cancelling PaymentIntent: {e}")
            return False

    @staticmethod
    def create_charge(
        amount_pkr: float,
        currency: str = CURRENCY,
        description: str = None,
        source: str = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a direct charge (legacy method, use PaymentIntent for new implementations)

        Args:
            amount_pkr: Amount in PKR
            currency: Currency code
            description: Charge description
            source: Token from Stripe Elements
            metadata: Metadata dictionary

        Returns:
            Charge details
        """
        try:
            amount_paisa = int(Decimal(str(amount_pkr)) * 100)

            charge = stripe.Charge.create(
                amount=amount_paisa,
                currency=currency,
                description=description,
                source=source,
                metadata=metadata or {}
            )

            logger.info(f"Created charge: {charge.id}")

            return {
                "charge_id": charge.id,
                "amount": charge.amount / 100,
                "status": charge.status,
                "balance_transaction": charge.balance_transaction,
            }
        except Exception as e:
            logger.error(f"Error creating charge: {e}")
            raise


# Webhook event handlers map
WEBHOOK_HANDLERS = {
    "payment_intent.succeeded": StripePaymentClient.handle_payment_intent_succeeded,
    "payment_intent.payment_failed": StripePaymentClient.handle_payment_intent_payment_failed,
}


def process_stripe_webhook(
    event_json: Dict[str, Any],
    signature: str
) -> Optional[Dict[str, Any]]:
    """
    Process Stripe webhook and route to appropriate handler

    Args:
        event_json: Webhook event data
        signature: Webhook signature

    Returns:
        Processed event result
    """
    # Verify and construct event
    event = StripePaymentClient.process_webhook_event(event_json, signature)

    if not event:
        return None

    # Route to handler
    event_type = event.get("type")
    handler = WEBHOOK_HANDLERS.get(event_type)

    if handler:
        return handler(event)
    else:
        logger.warning(f"No handler for webhook event: {event_type}")
        return None
