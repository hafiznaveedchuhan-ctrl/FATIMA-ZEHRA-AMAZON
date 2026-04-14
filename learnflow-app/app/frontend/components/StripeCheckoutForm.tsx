/**
 * Stripe Checkout Form Component
 * Handles payment processing with Stripe Elements
 */

'use client'

import React, { useState } from 'react'
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface StripeCheckoutFormProps {
  /**
   * Client secret from payment intent
   */
  clientSecret: string

  /**
   * Total amount in PKR
   */
  amount: number

  /**
   * Order ID
   */
  orderId: number

  /**
   * Customer email
   */
  email?: string

  /**
   * Callback on payment success
   */
  onSuccess: (paymentIntentId: string) => void

  /**
   * Callback on payment error
   */
  onError: (error: string) => void

  /**
   * Callback when form is loading
   */
  onLoading?: (loading: boolean) => void
}

/**
 * Stripe Checkout Form Component
 * Displays Stripe Payment Elements and handles payment submission
 */
export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  clientSecret,
  amount,
  orderId,
  email = '',
  onSuccess,
  onError,
  onLoading,
}) => {
  const stripe = useStripe()
  const elements = useElements()

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState(email)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please refresh the page.')
      return
    }

    setLoading(true)
    onLoading?.(true)

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/orders/success`,
          receipt_email: emailInput,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Error occurred
        setErrorMessage(error.message || 'Payment failed. Please try again.')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        setErrorMessage(null)
        onSuccess(paymentIntent.id)
      } else {
        setErrorMessage(`Payment status: ${paymentIntent.status}`)
        onError(`Payment status: ${paymentIntent.status}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(errorMsg)
      onError(errorMsg)
    } finally {
      setLoading(false)
      onLoading?.(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
      <p className="text-gray-600 mb-6">Order #{orderId}</p>

      {/* Amount Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            Rs {amount.toLocaleString('en-PK')}
          </span>
        </div>
      </div>

      {/* Stripe Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* Link Authentication Element */}
        <LinkAuthenticationElement
          id="link-authentication"
          onChange={(e) => {
            if (e.value?.email) {
              setEmailInput(e.value.email)
            }
          }}
        />

        {/* Payment Element */}
        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
          }}
        />

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Payment Error</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className={`
            w-full py-3 px-4 rounded-lg font-bold text-white transition
            ${
              loading || !stripe || !elements
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Processing...
            </span>
          ) : (
            `Pay Rs ${amount.toLocaleString('en-PK')}`
          )}
        </button>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your payment information is secure and encrypted
        </p>
      </form>
    </div>
  )
}

/**
 * Stripe Checkout Wrapper Component
 * Includes Elements provider and checkout logic
 */
interface StripeCheckoutWrapperProps {
  clientSecret: string
  amount: number
  orderId: number
  email?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export const StripeCheckoutWrapper: React.FC<StripeCheckoutWrapperProps> = ({
  clientSecret,
  amount,
  orderId,
  email,
  onSuccess = () => {},
  onError = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your payment to confirm your order</p>
        </div>

        {/* Checkout Form */}
        <StripeCheckoutForm
          clientSecret={clientSecret}
          amount={amount}
          orderId={orderId}
          email={email}
          onSuccess={onSuccess}
          onError={onError}
          onLoading={setIsLoading}
        />

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Verified Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span>Trusted Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StripeCheckoutForm
