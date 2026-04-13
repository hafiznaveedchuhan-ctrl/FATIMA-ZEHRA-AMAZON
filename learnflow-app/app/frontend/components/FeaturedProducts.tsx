'use client'

import { useState, useEffect } from 'react'
import { productAPI } from '@/lib/api'
import ProductCard from './ProductCard'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  image_url?: string
  stock_quantity: number
  featured: boolean
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.listProducts({ featured: true, limit: 6 })
        setProducts(response.data.products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Featured Products</h2>
          <div className="text-center text-gray-500">Loading products...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Featured Products</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Check out our best-selling items</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
