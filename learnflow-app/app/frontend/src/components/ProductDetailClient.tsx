'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'
import { useCartStore } from '@/lib/store'
import { orderAPI } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Star, ChevronLeft, ShoppingCart } from 'lucide-react'

interface ProductDetailClientProps {
  params: {
    id: string
  }
}

export default function ProductDetailClient({ params }: ProductDetailClientProps) {
  const productId = parseInt(params.id)
  const product = PRODUCTS.find((p) => p.id === productId)
  const addItem = useCartStore((state) => state.addItem)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="container-wide py-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6"
          >
            <ChevronLeft size={20} />
            Back to Products
          </Link>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Product Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleAddToCart = async () => {
    if (!auth.isAuthenticated()) {
      window.location.href = '/auth/login'
      return
    }

    setIsAdding(true)
    try {
      await orderAPI.addToCart(product.id, quantity, product.price)
      addItem(product, quantity)
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
      setQuantity(1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container-wide py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6"
        >
          <ChevronLeft size={20} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {product.rating}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-pink-600">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Stock: {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {product.description}
            </p>

            {/* Material */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Material & Details
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Material:</strong> {product.material}
                </p>
                {product.details && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Details:</strong> {product.details}
                  </p>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition font-semibold ${
                        selectedSize === size
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-pink-600'
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
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Select Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition font-semibold ${
                        selectedColor === color
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-pink-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-pink-600"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-pink-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-lg font-bold text-lg transition mb-4 ${
                product.inStock
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={24} />
              {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
            </button>

            {showMessage && (
              <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg text-green-700 font-semibold">
                ✓ {product.name} added to your cart!
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 pt-12 border-t-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            More from {product.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.filter(
              (p) => p.category === product.category && p.id !== product.id
            )
              .slice(0, 4)
              .map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-pink-600 font-bold">
                      Rs. {relatedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  )
}
