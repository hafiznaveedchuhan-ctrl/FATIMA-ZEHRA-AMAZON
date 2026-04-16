'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { productAPI } from '@/lib/api'

interface Category {
  id: number
  name: string
  description?: string
  image_url?: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.listCategories()
        setCategories(response.data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading || categories.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Shop by Category</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Browse through our wide range of categories</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-gray-700 dark:to-gray-800 h-64 flex items-end justify-start p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
