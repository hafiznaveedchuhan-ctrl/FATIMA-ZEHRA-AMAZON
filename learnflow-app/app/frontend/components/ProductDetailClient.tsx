'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Star, Heart, ShoppingCart, MessageCircle } from 'lucide-react'
import { WhatsAppButton } from './WhatsAppButton'

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  const [paymentData, setPaymentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params || !params.id) {
          setLoading(false)
          return
        }

        const productId = params.id
        const apiUrl = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8002'

        const response = await fetch(`${apiUrl}/api/products/${productId}`)

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch product')
        }

        const data = await response.json()
        setProduct(data)

        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0])
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0])
        }
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params])

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('لطفاً سائز منتخب کریں!')
      return
    }

    setAddingToCart(true)
    try {
      const orderServiceUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8003'
      const userId = localStorage.getItem('user_id') || '1'
      const token = `Bearer ${userId}-test`

      const response = await fetch(`${orderServiceUrl}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `کارٹ میں شامل کرنے میں خرابی (${response.status})`)
      }

      const cartItem = await response.json()
      console.log('Item added to cart:', cartItem)
      alert(`✅ "${product.name}" کارٹ میں شامل ہو گیا!`)
      setShowPaymentForm(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(`❌ خرابی: ${error instanceof Error ? error.message : 'کوئی مسئلہ پیش آیا'}`)
    } finally {
      setAddingToCart(false)
    }
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentData.fullName || !paymentData.email || !paymentData.phone ||
        !paymentData.address || !paymentData.city || !paymentData.zipCode ||
        !paymentData.cardNumber || !paymentData.cardExpiry || !paymentData.cardCVV) {
      alert('تمام معلومات درج کریں')
      return
    }

    setPlacingOrder(true)
    try {
      const orderServiceUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8003'
      const userId = localStorage.getItem('user_id') || '1'
      const token = `Bearer ${userId}-test`

      // Create checkout/order
      const response = await fetch(`${orderServiceUrl}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          shipping_address: `${paymentData.address}, ${paymentData.city} ${paymentData.zipCode}`,
          payment_method: 'card',
          customer_email: paymentData.email,
          customer_phone: paymentData.phone,
          customer_name: paymentData.fullName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `آرڈر مکمل کرنے میں خرابی (${response.status})`)
      }

      const order = await response.json()
      setOrderPlaced(true)

      setTimeout(() => {
        const orderId = order.order_id || order.id || 'UNKNOWN'
        alert(`✅ آپ کا آرڈر #${orderId} کامیاب ہو گیا!`)
        router.push('/products')
      }, 2000)
    } catch (error) {
      console.error('Error placing order:', error)
      alert(`❌ خرابی: ${error instanceof Error ? error.message : 'آرڈر مکمل نہ ہو سکا'}`)
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 text-xl">لوڈ ہو رہا ہے...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">❌ پروڈکٹ نہیں ملا</h1>
          <p className="text-gray-600 mb-6">معافی چاہتے ہیں، یہ پروڈکٹ دستیاب نہیں ہے</p>
          <Link href="/products" className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
            ← واپس جائیں
          </Link>
        </div>
      </div>
    )
  }

  const totalPrice = product.price * quantity

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">ہوم</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-600">پروڈکٹس</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Product Image */}
          <div>
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="text-center text-gray-500 mt-4 text-sm">📸 پروڈکٹ کی تصویر</p>
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <div>
              <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews} رائے)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  Rs {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    Rs {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <div className="text-lg text-green-600 font-bold">
                  ✅ {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% ڈسکاؤنٹ
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-3">📝 تفصیل</h3>
              <p className="text-gray-700 leading-relaxed mb-3 text-lg">{product.description}</p>
              <p className="text-gray-700 leading-relaxed text-lg">{product.details}</p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">📦 مواد</p>
                <p className="font-bold text-gray-900 text-lg">{product.material}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">✅ دستیابی</p>
                <p className="font-bold text-gray-900 text-lg">
                  {product.inStock ? '✅ اسٹاک میں' : '❌ اسٹاک سے باہر'}
                </p>
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">📏 سائز منتخب کریں</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border-2 rounded-lg font-bold transition text-lg ${
                        selectedSize === size
                          ? 'border-orange-600 bg-orange-50 text-orange-600'
                          : 'border-gray-300 text-gray-700 hover:border-orange-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">🎨 رنگ منتخب کریں</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border-2 rounded-lg font-bold transition text-lg ${
                        selectedColor === color
                          ? 'border-orange-600 bg-orange-50 text-orange-600'
                          : 'border-gray-300 text-gray-700 hover:border-orange-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-6 py-3 text-2xl text-gray-600 hover:text-gray-900 font-bold"
                >
                  −
                </button>
                <span className="px-8 py-3 border-l border-r border-gray-300 font-bold text-2xl">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-6 py-3 text-2xl text-gray-600 hover:text-gray-900 font-bold"
                >
                  +
                </button>
              </div>
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-600 mb-1">کل قیمت</p>
                <p className="text-3xl font-bold text-orange-600">Rs {totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Add to Cart & Wishlist & WhatsApp */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-white transition text-xl ${
                    product.inStock && !addingToCart
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-pink-800 shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin">⏳</div>
                      شامل کیا جا رہا ہے...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={28} />
                      کارٹ میں شامل کریں
                    </>
                  )}
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`px-8 py-4 border-2 rounded-lg transition font-bold text-2xl ${
                    wishlist
                      ? 'bg-orange-50 border-orange-600 text-orange-600'
                      : 'border-gray-300 text-gray-600 hover:border-orange-400'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart size={28} fill={wishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* WhatsApp Button */}
              <div className="w-full">
                <WhatsAppButton
                  productName={product.name}
                  productPrice={product.price}
                  productId={product.id}
                  productCategory={product.category}
                  buttonText="📱 WhatsApp پر پوچھیں"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <p className="text-xl font-bold text-gray-900">🚚 مفت ڈیلیوری</p>
                <p className="text-sm text-gray-600 mt-1">Rs 3000+ آرڈر</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">✅ محفوظ</p>
                <p className="text-sm text-gray-600 mt-1">100% محفوظ ادائیگی</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">💳 چیک آؤٹ</h2>
              <button
                onClick={() => !orderPlaced && setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ✕
              </button>
            </div>

            {orderPlaced ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">آرڈر کامیاب!</h3>
                <p className="text-gray-600 mb-2 text-lg">شکریہ آپ کے آرڈر کے لیے</p>
                <p className="text-gray-600 text-lg">جلد ہی آپ کو تصدیقی ای میل موصول ہوگی</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-6">

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-200">
                  <h3 className="font-bold text-gray-900 mb-4 text-xl">📦 آرڈر کا خلاصہ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b-2">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{product.name}</p>
                        <p className="text-sm text-gray-600">سائز: {selectedSize} | رنگ: {selectedColor}</p>
                      </div>
                      <span className="font-bold text-gray-900">Rs {product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 text-lg">
                      <span className="text-gray-600">مقدار:</span>
                      <span className="font-bold text-gray-900">{quantity}x</span>
                    </div>
                    <div className="flex justify-between items-center text-3xl font-bold">
                      <span className="text-gray-900">کل:</span>
                      <span className="text-orange-600">Rs {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-xl">📍 ڈیلیوری کی معلومات</h3>

                  <input
                    type="text"
                    name="fullName"
                    placeholder="مکمل نام *"
                    value={paymentData.fullName}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="ای میل *"
                      value={paymentData.email}
                      onChange={handlePaymentChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="فون نمبر *"
                      value={paymentData.phone}
                      onChange={handlePaymentChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="address"
                    placeholder="پتہ *"
                    value={paymentData.address}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="شہر *"
                      value={paymentData.city}
                      onChange={handlePaymentChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                      required
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="زپ کوڈ *"
                      value={paymentData.zipCode}
                      onChange={handlePaymentChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-xl">💳 پیمنٹ کی معلومات</h3>

                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="کریڈٹ کارڈ نمبر (16 ہندسے) *"
                    value={paymentData.cardNumber}
                    onChange={handlePaymentChange}
                    maxLength={16}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-mono"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY *"
                      value={paymentData.cardExpiry}
                      onChange={handlePaymentChange}
                      maxLength={5}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-mono"
                      required
                    />
                    <input
                      type="text"
                      name="cardCVV"
                      placeholder="CVV (3 ہندسے) *"
                      value={paymentData.cardCVV}
                      onChange={handlePaymentChange}
                      maxLength={3}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition text-xl"
                  >
                    منسوخ کریں
                  </button>
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className={`flex-1 px-6 py-4 text-white rounded-lg font-bold transition text-xl shadow-lg ${
                      placingOrder
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-pink-800'
                    }`}
                  >
                    {placingOrder ? '⏳ مکمل کیا جا رہا ہے...' : '✅ آرڈر مکمل کریں'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
