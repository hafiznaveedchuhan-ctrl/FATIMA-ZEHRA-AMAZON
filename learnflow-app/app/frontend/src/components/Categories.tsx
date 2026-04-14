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
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-12 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-lg bg-gray-200 h-64 flex items-end justify-start p-4 hover:opacity-75 transition"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-100 text-sm">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
