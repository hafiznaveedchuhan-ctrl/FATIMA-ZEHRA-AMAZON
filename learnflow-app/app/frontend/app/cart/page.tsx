'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripeCheckoutForm from '@/components/StripeCheckoutForm'
import axios from 'axios'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setError(null)
    setIsCreatingOrder(true)

    try {
      // Validate required fields
      if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
        throw new Error('Please fill in all fields')
      }

      const base = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || ''
      const apiUrl = `${base}/api`
      const rawToken = localStorage.getItem('auth_token') || ''
      const token = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`
      const authHeader = { Authorization: token }

      // Sync local Zustand cart to backend DB (backend checkout reads DB cart)
      // Clear existing backend cart first to avoid stale duplicates
      await axios.delete(`${apiUrl}/cart`, { headers: authHeader }).catch(() => {})
      for (const item of items) {
        await axios.post(
          `${apiUrl}/cart/items`,
          {
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          },
          { headers: authHeader }
        )
      }

      // Create order via checkout endpoint
      const checkoutResponse = await axios.post(
        `${apiUrl}/checkout`,
        {
          shipping_address: shippingAddress,
        },
        {
          headers: authHeader,
        }
      )

      const createdOrder = checkoutResponse.data
      setOrderId(createdOrder.id)

      // Create payment intent
      const paymentResponse = await axios.post(
        `${apiUrl}/payments/create-intent`,
        {
          order_id: createdOrder.id,
          amount: getTotal(),
          customer_email: customerEmail,
          customer_name: customerName,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )

      if (!paymentResponse.data.client_secret) {
        throw new Error('Failed to create payment intent')
      }

      setClientSecret(paymentResponse.data.client_secret)
      setShowPaymentForm(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate checkout'
      setError(errorMsg)
    } finally {
      setIsCreatingOrder(false)
      setIsCheckingOut(false)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    alert('Payment successful! Thank you for shopping with Fatima Zehra Amazon Shop.')
    clearCart()
    setShowPaymentForm(false)
    setCustomerEmail('')
    setCustomerName('')
    setShippingAddress('')
    // Redirect to order confirmation
    window.location.href = `/orders/${orderId}`
  }

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="container-wide py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto text-gray-400 mb-6" size={80} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container-wide py-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.product.category}
                  </p>
                  <p className="text-orange-600 font-bold mt-1">
                    Rs {item.product.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-semibold text-sm"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary / Checkout Form */}
          <div>
            {!showPaymentForm ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {isCheckingOut ? 'Checkout Details' : 'Order Summary'}
                </h2>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {!isCheckingOut ? (
                  <>
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal ({items.length} items)</span>
                        <span>Rs {getTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white mb-6">
                      <span>Total</span>
                      <span className="text-orange-600">Rs {getTotal().toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      Proceed to Checkout
                    </button>

                    <Link
                      href="/products"
                      className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Continue Shopping
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Checkout Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleCheckout()
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Shipping Address
                        </label>
                        <textarea
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Enter your complete shipping address"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-3 mb-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal ({items.length} items)</span>
                          <span>Rs {getTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                          <span>Total Amount</span>
                          <span className="text-orange-600">Rs {getTotal().toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingOrder}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition"
                      >
                        {isCreatingOrder ? 'Processing...' : 'Continue to Payment'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCheckingOut(false)
                          setError(null)
                        }}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        Back to Cart
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : clientSecret ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#ea580c',
                        colorBackground: '#f3f4f6',
                        colorText: '#111827',
                        borderRadius: '8px',
                        fontFamily: 'ui-rounded, system-ui, sans-serif',
                      },
                    },
                  }}
                >
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    amount={getTotal()}
                    orderId={orderId || 0}
                    email={customerEmail}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>

                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="w-full mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back to Checkout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
