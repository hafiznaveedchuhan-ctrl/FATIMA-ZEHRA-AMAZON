'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'

const CATEGORIES = [
  { name: 'Electronics', href: '/products?category=Electronics' },
  { name: 'Fashion', href: '/products?category=Fashion' },
  { name: 'Home & Kitchen', href: '/products?category=Home+%26+Kitchen' },
  { name: 'Books', href: '/products?category=Books' },
  { name: 'Toys & Games', href: '/products?category=Toys+%26+Games' },
  { name: 'Sports & Outdoors', href: '/products?category=Sports+%26+Outdoors' },
  { name: 'Beauty', href: '/products?category=Beauty' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    // Subscribe to cart store after mount to avoid hydration mismatch
    const update = () => setCartCount(useCartStore.getState().getItemCount())
    update()
    const unsub = useCartStore.subscribe(update)
    return () => unsub()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-[100] bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-800 dark:to-red-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="text-white font-bold text-2xl">
              FZ<span className="text-yellow-300">❤️</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight">
                Fatima Zehra
              </div>
              <div className="text-yellow-200 text-xs font-semibold">Amazon Shop</div>
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on md and up */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-6">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-r-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-white hover:text-yellow-200 transition"
            >
              <Search size={20} />
            </button>

            {/* Account */}
            <Link
              href={mounted && user ? '/profile' : '/auth/login'}
              className="hidden sm:flex items-center gap-1 text-white hover:text-yellow-200 transition"
            >
              <User size={20} />
              <span className="text-xs md:text-sm font-semibold">
                {mounted && user ? 'Account' : 'Sign In'}
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-white hover:text-yellow-200 transition">
              <ShoppingCart size={24} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white hover:text-yellow-200 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-l text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-2 rounded-r font-semibold transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Categories Bar - Hidden on mobile, shown on md and up */}
        <div className="hidden md:flex items-center gap-2 py-2 border-t border-orange-700/50">
          <div className="relative group">
            <button className="flex items-center gap-2 text-white hover:text-yellow-200 transition font-semibold text-sm py-2 px-3 hover:bg-orange-700/50 rounded">
              <Menu size={18} />
              All Categories
              <ChevronDown size={16} />
            </button>
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full bg-white dark:bg-gray-800 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 py-2 z-50">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-orange-100 dark:hover:bg-orange-900/50 text-sm transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <Link href="/products" className="text-white hover:text-yellow-200 transition font-semibold text-sm py-2 px-3 hover:bg-orange-700/50 rounded">
            Today's Deals
          </Link>
          <Link href="/products" className="text-white hover:text-yellow-200 transition font-semibold text-sm py-2 px-3 hover:bg-orange-700/50 rounded">
            New Arrivals
          </Link>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-orange-700/50 pb-4 space-y-2">
            {/* Mobile Categories */}
            <details className="group">
              <summary className="flex items-center gap-2 text-white hover:text-yellow-200 cursor-pointer font-semibold py-2 px-3 hover:bg-orange-700/50 rounded">
                <Menu size={18} />
                All Categories
                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="bg-orange-700/30 pl-6 space-y-1 py-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-white hover:text-yellow-200 text-sm py-1 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </details>

            {/* Mobile Quick Links */}
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:text-yellow-200 font-semibold py-2 px-3 hover:bg-orange-700/50 rounded"
            >
              Today's Deals
            </Link>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:text-yellow-200 font-semibold py-2 px-3 hover:bg-orange-700/50 rounded"
            >
              New Arrivals
            </Link>
            {mounted && !user && (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block text-white hover:text-yellow-200 font-semibold py-2 px-3 hover:bg-orange-700/50 rounded"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
