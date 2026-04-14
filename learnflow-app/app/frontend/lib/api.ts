/**
 * API Client for Fatima Zehra Amazon Shop
 * Communicates with all 4 FastAPI microservices
 */

import axios, { AxiosInstance } from 'axios'

// Service URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8003'
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8001'
const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8002'
const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8004'

// Create axios instances for each service
const createApiClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// User Service API
export const userAPI = {
  client: createApiClient(USER_SERVICE_URL),

  register: async (data: { email: string; password: string; full_name: string }) => {
    try {
      const response = await userAPI.client.post('/api/users/register', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  },

  login: async (data: { email: string; password: string }) => {
    try {
      const response = await userAPI.client.post('/api/users/login', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  },

  getProfile: async (token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await userAPI.client.get('/api/users/me', { headers })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile')
    }
  },

  updateProfile: async (data: any, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await userAPI.client.put('/api/users/me', data, { headers })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update profile')
    }
  },
}

// Product Service API
export const productAPI = {
  client: createApiClient(PRODUCT_SERVICE_URL),

  getProducts: async (filters?: any) => {
    try {
      const response = await productAPI.client.get('/api/products', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch products')
    }
  },

  getProductById: async (id: number) => {
    try {
      const response = await productAPI.client.get(`/api/products/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch product')
    }
  },

  getCategories: async () => {
    try {
      const response = await productAPI.client.get('/api/categories')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch categories')
    }
  },

  // Aliases used by FeaturedProducts/Categories components — return raw axios
  // response so callers can read `.data.products` / `.data.categories`.
  listProducts: async (filters?: any) => {
    return productAPI.client.get('/api/products', { params: filters })
  },

  listCategories: async () => {
    return productAPI.client.get('/api/categories')
  },
}

// Order Service API
export const orderAPI = {
  client: createApiClient(API_BASE_URL),

  getCart: async (token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.get('/api/cart', { headers })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch cart')
    }
  },

  addToCart: async (product_id: number, quantity: number, price: number, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.post(
        '/api/cart/items',
        { product_id, quantity, price },
        { headers }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to add to cart')
    }
  },

  removeFromCart: async (item_id: number, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await orderAPI.client.delete(`/api/cart/items/${item_id}`, { headers })
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to remove from cart')
    }
  },

  clearCart: async (token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await orderAPI.client.delete('/api/cart', { headers })
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to clear cart')
    }
  },

  checkout: async (shipping_address: string, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.post(
        '/api/checkout',
        { shipping_address },
        { headers }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Checkout failed')
    }
  },

  createPaymentIntent: async (
    order_id: number,
    amount: number,
    customer_email: string,
    customer_name: string,
    token?: string
  ) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.post(
        '/api/payments/create-intent',
        { order_id, amount, customer_email, customer_name },
        { headers }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create payment intent')
    }
  },

  getOrders: async (token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.get('/api/orders', { headers })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch orders')
    }
  },

  getOrderById: async (id: number, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await orderAPI.client.get(`/api/orders/${id}`, { headers })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch order')
    }
  },
}

// Chat Service API
export const chatAPI = {
  client: createApiClient(CHAT_SERVICE_URL),

  sendMessage: async (
    user_id: number,
    session_id: string,
    text: string,
    token?: string
  ) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await chatAPI.client.post(
        '/api/chat/messages',
        { user_id, session_id, text },
        { headers }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to send message')
    }
  },

  getChatHistory: async (session_id: string, token?: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await chatAPI.client.get(`/api/chat/history?session_id=${session_id}`, {
        headers,
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch chat history')
    }
  },
}
