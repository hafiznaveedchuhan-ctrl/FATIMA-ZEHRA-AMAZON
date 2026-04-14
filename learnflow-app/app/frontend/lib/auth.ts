/**
 * Authentication Helper for Fatima Zehra Amazon Shop
 * Handles JWT token storage and retrieval
 */

export const auth = {
  /**
   * Store JWT token in localStorage and httpOnly cookie simulation
   */
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      // In production, this would be an httpOnly cookie
      localStorage.setItem('user_authenticated', 'true')
    }
  },

  /**
   * Retrieve JWT token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_authenticated') === 'true'
    }
    return false
  },

  /**
   * Convenience: persist token + user in one call (used by login flow)
   */
  login: (token: string, user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_authenticated', 'true')
      localStorage.setItem('user_data', JSON.stringify(user))
    }
  },

  /**
   * Clear authentication data on logout
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_authenticated')
      localStorage.removeItem('user_data')
    }
  },

  /**
   * Store user data in localStorage
   */
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user))
    }
  },

  /**
   * Retrieve user data from localStorage
   */
  getUser: (): any => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    }
    return null
  },
}
