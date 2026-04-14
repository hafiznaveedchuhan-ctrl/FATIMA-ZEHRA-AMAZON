'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { orderAPI } from '@/lib/api'
import { auth } from '@/lib/auth'

interface Product {
  id: number
  name: string
  description?: string
  price: number | string
  image_url?: string
  stock_quantity: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const handleAddToCart = async () => {
    if (!auth.isAuthenticated()) {
      window.location.href = '/auth/login'
      return
    }

    setIsAdding(true)
    try {
      const price = parseFloat(String(product.price))
      await orderAPI.addToCart(product.id, 1, price)
      addItem({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price,
        image: product.image_url || '',
        category: '',
        material: '',
        rating: 5,
        reviews: 0,
        inStock: product.stock_quantity > 0,
      }, 1)
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Image */}
      <div className="relative h-64 bg-gray-200">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-bold mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-pink-600">
            Rs. {parseFloat(String(product.price)).toFixed(0)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAdding}
            className={`px-4 py-2 rounded font-semibold transition ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {showMessage && (
          <div className="mt-2 text-sm text-green-600 font-semibold">
            ✓ Added to cart
          </div>
        )}
      </div>

      {/* View Details Link */}
      <Link
        href={`/products/${product.id}`}
        className="block text-center py-2 border-t text-sm text-gray-600 hover:text-pink-600 transition"
      >
        View Details
      </Link>
    </div>
  )
}
