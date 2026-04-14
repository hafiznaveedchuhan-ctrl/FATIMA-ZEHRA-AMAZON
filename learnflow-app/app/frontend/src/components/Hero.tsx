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
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-purple-950/30 dark:to-gray-900">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-pink-300/30 dark:bg-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-300/30 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-pink-500 rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border border-purple-500 rounded-full" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 border border-amber-500 rounded-full" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-soft border border-pink-100 dark:border-pink-900/30">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Collection 2026</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-gray-900 dark:text-white">Discover</span>
                <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                  Fatima Zehra
                </span>
                <span className="block text-gray-900 dark:text-white">Boutique</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Elegant fashion for every occasion. Where <span className="text-pink-600 dark:text-pink-400 font-medium">luxury</span> meets <span className="text-purple-600 dark:text-purple-400 font-medium">style</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:from-pink-600 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Shop Now</span>
                <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/50 transform hover:-translate-y-1 transition-all duration-300"
              >
                <PlayIcon className="w-5 h-5 text-pink-500" />
                <span>Our Story</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Designs</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">10K+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Happy Customers</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">4.9</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image Area */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Main Image Container */}
            <div className="relative">
              {/* Decorative Background Shape */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-pink-200 via-purple-200 to-amber-200 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-amber-900/30 rounded-3xl transform rotate-3 opacity-50" />

              {/* Image Placeholder - Premium Fashion Display */}
              <div className="relative bg-gradient-to-br from-pink-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/30 rounded-2xl overflow-hidden aspect-[3/4] shadow-elegant">
                {/* Gradient Overlay for elegance */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                {/* Fashion Display Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    {/* Brand Logo/Icon */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-amber-500 p-1 animate-pulse-glow">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                        <SparkleIcon className="w-10 h-10 text-pink-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-serif font-bold text-gray-800 dark:text-white">Premium Collection</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spring/Summer 2026</p>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-pink-600 dark:text-pink-400">Handcrafted</span>
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-purple-600 dark:text-purple-400">Premium Fabrics</span>
                      <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-medium text-amber-600 dark:text-amber-400">Exclusive</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center transform rotate-12 animate-float">
                <div className="text-center text-white">
                  <p className="text-xs font-medium">Up to</p>
                  <p className="text-2xl font-bold">50%</p>
                  <p className="text-xs font-medium">OFF</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    <SparkleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Free Shipping</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">On orders Rs. 5000+</p>
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
