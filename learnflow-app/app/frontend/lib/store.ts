/**
 * Zustand Store for Fatima Zehra Amazon Shop
 * Manages global state: auth, cart, products
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description?: string
  rating?: number
  inStock?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  address?: string
}

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  setUser: (user: User) => set({ user, isAuthenticated: true }),
  setToken: (token: string) => set({ token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
}))

// Cart Store
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity: number) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        }),

      removeItem: (productId: number) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Products Store
interface ProductsState {
  products: Product[]
  selectedProduct: Product | null
  setProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  selectedProduct: null,
  setProducts: (products: Product[]) => set({ products }),
  setSelectedProduct: (product: Product | null) => set({ selectedProduct: product }),
}))
