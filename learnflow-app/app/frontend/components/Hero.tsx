'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// SVG Icons as components for better performance
const SparkleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
)

const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const PlayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-orange-950/30 dark:to-gray-900">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-orange-300/30 dark:bg-orange-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-300/30 dark:bg-yellow-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-orange-500 rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border border-yellow-500 rounded-full" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 border border-amber-500 rounded-full" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-soft border border-orange-100 dark:border-orange-900/30">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Deals Daily 🎉</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-gray-900 dark:text-white">Everything You Need</span>
                <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  In One Place
                </span>
                <span className="block text-gray-900 dark:text-white">at Best Prices</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Shop from <span className="text-orange-600 dark:text-orange-400 font-medium">Electronics</span>, <span className="text-red-600 dark:text-red-400 font-medium">Fashion</span>, <span className="text-yellow-600 dark:text-yellow-400 font-medium">Home</span>, and more.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:from-orange-600 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Shop Now</span>
                <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/50 transform hover:-translate-y-1 transition-all duration-300"
              >
                <PlayIcon className="w-5 h-5 text-orange-500" />
                <span>Learn More</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">50+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product Categories</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">24/7</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Support</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">⚡</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fast Checkout</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image Area */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Main Image Container */}
            <div className="relative">
              {/* Decorative Background Shape */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200 via-red-200 to-yellow-200 dark:from-orange-900/30 dark:via-red-900/30 dark:to-yellow-900/30 rounded-3xl transform rotate-3 opacity-50" />

              {/* Image Placeholder - Amazon-style */}
              <div className="relative bg-gradient-to-br from-orange-100 via-white to-yellow-100 dark:from-gray-800 dark:via-gray-900 dark:to-orange-900/30 rounded-2xl overflow-hidden aspect-[3/4] shadow-elegant">
                {/* Gradient Overlay for elegance */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                {/* Content Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    {/* Amazon-style Cart Icon */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 p-1 animate-pulse-glow">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">Best Deals Today</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Limited Time Offers</p>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-orange-600 dark:text-orange-400">Fast Shipping</span>
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-red-600 dark:text-red-400">Secure Checkout</span>
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-yellow-600 dark:text-yellow-400">Great Prices</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center transform rotate-12 animate-float">
                <div className="text-center text-white">
                  <p className="text-xs font-medium">Up to</p>
                  <p className="text-2xl font-bold">70%</p>
                  <p className="text-xs font-medium">OFF</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl">
                    🚚
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Free Shipping</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">On orders Rs. 2000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave/Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 fill-white dark:fill-gray-900" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C150,80 350,0 500,40 C650,80 750,20 900,40 C1050,60 1200,10 1440,40 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  )
}
