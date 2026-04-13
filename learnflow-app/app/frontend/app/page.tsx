'use client'

import Hero from '@/components/Hero'
import Categories from '@/components/Categories'
import FeaturedProducts from '@/components/FeaturedProducts'
import { Truck, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Trust Badges - Amazon Style */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-8">
          {[
            { icon: <Truck className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders above Rs. 2000' },
            { icon: <Shield className="w-6 h-6" />, title: 'Secure Payment', desc: '100% Buyer Protection' },
            { icon: <Zap className="w-6 h-6" />, title: 'Fast Delivery', desc: '24-48 hours in major cities' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-orange-500">{item.icon}</div>
              <div>
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <Categories />

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Don't Miss Our Latest Deals!</h2>
          <p className="text-lg mb-8 text-white/90">Shop now and get exclusive discounts on thousands of products</p>
          <a
            href="/products"
            className="inline-block bg-white text-orange-600 px-10 py-4 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Browse All Products →
          </a>
        </div>
      </section>
    </main>
  )
}
