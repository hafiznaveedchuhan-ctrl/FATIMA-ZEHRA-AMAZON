'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { orderAPI } from '@/lib/api'
import { auth } from '@/lib/auth'
import { 
  Package, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ShoppingBag,
  ArrowLeft
} from 'lucide-react'

// Interfaces
interface OrderItem {
  productId: number
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string | number
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Auth Protection & Data Fetching
  useEffect(() => {
    const fetchOrders = async () => {
      // Check if user is logged in
      if (typeof window !== 'undefined' && !auth.isAuthenticated()) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await orderAPI.getOrders()
        // Ensure response.orders is an array to avoid .map errors
        setOrders(Array.isArray(response?.orders) ? response.orders : [])
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        setOrders([]) // Fallback to empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  // Helper for Status Styling
  const getStatusDetails = (status: string) => {
    const s = status?.toLowerCase() || 'pending'
    switch (s) {
      case 'delivered':
        return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14} /> }
      case 'pending':
        return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14} /> }
      case 'processing':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Truck size={14} /> }
      case 'cancelled':
        return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle size={14} /> }
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Package size={14} /> }
    }
  }

  // Safe Date Formatting to avoid Hydration Error
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch (e) {
      return 'Date N/A'
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 font-serif italic text-slate-500 tracking-widest">Loading Your History...</p>
      </div>
    )
  }

  // Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-slate-300" size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 tracking-tight">No Orders Yet</h1>
          <p className="text-slate-500 mb-8 text-sm">Aapne abhi tak koi order nahi diya. Hamari nayi collection check karein!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-lg"
          >
            <ShoppingBag size={16} /> Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors mb-4 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back to Amazon Shop</span>
            </Link>
            <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight leading-none">
              Order <span className="text-amber-500 italic font-normal">History</span>
            </h1>
          </div>
          <div className="bg-white px-6 py-4 border border-slate-200 rounded-sm shadow-sm hidden md:block">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Account Summary</p>
            <p className="text-xl font-serif font-bold text-slate-900">{orders.length} Total Orders</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getStatusDetails(order.status)
            const isExpanded = expandedOrder === String(order.id)

            return (
              <div 
                key={order.id} 
                className={`bg-white border transition-all duration-300 ${
                  isExpanded ? "border-amber-500 ring-4 ring-amber-500/5 shadow-xl" : "border-slate-200 shadow-sm"
                }`}
              >
                {/* Order Summary Row */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : String(order.id))}
                  className="w-full text-left p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-xs font-black uppercase tracking-tighter bg-slate-900 text-white px-3 py-1 rounded-sm">
                        ORD-{String(order.id).slice(-6).toUpperCase()}
                      </span>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.color}`}>
                        {status.icon} {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Grand Total</p>
                        <p className="text-sm font-bold text-amber-600">Rs {Number(order.total).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {isExpanded ? "Close" : "Details"}
                    </span>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? "rotate-180 bg-amber-50 text-amber-600" : "bg-slate-50"}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </button>

                {/* Expanded Items Section */}
                {isExpanded && (
                  <div className="px-6 pb-8 md:px-8 md:pb-10 bg-white">
                    <div className="h-px bg-slate-100 mb-8" />
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-6">Product Details</h4>
                    
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm hover:border-amber-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                              <Package size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Qty: {item.quantity} × Rs {item.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="font-serif font-bold text-slate-900">
                            Rs {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Info */}
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Shipping Address</p>
                        <p className="text-sm text-slate-600 italic">Registered address on file</p>
                      </div>
                      <div className="bg-slate-900 px-8 py-5 rounded-sm text-white min-w-[200px] text-center md:text-right">
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Final Amount</p>
                        <p className="text-3xl font-serif font-bold text-amber-500">Rs {Number(order.total).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}