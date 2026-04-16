'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { orderAPI } from '@/lib/api'
import { auth } from '@/lib/auth'
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
} from 'lucide-react'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: string
}

interface OrderDetail {
  id: number
  user_id: number
  status: string
  total_amount: string
  shipping_address: string
  payment_status: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const orderId = Number(params?.id)

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (typeof window !== 'undefined' && !auth.isAuthenticated()) {
        router.push('/auth/login')
        return
      }
      if (!orderId || Number.isNaN(orderId)) {
        setError('Invalid order id')
        setLoading(false)
        return
      }
      try {
        const rawToken = localStorage.getItem('auth_token') || ''
        const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken
        const data = await orderAPI.getOrderById(orderId, token)
        setOrder(data as OrderDetail)
      } catch (e: any) {
        setError(e?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, router])

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('paid') || s === 'delivered' || s === 'completed')
      return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14} /> }
    if (s === 'processing' || s === 'shipped')
      return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Truck size={14} /> }
    if (s === 'cancelled' || s === 'failed')
      return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle size={14} /> }
    return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14} /> }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 font-serif italic text-slate-500 tracking-widest">Loading Order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-rose-400" size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">Order Not Found</h1>
          <p className="text-slate-500 mb-8 text-sm">{error || 'We could not find this order.'}</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-lg"
          >
            <ShoppingBag size={16} /> View All Orders
          </Link>
        </div>
      </div>
    )
  }

  const orderStatus = getStatusStyle(order.status)
  const paymentStatus = getStatusStyle(order.payment_status)
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back to Orders</span>
        </Link>

        {/* Success banner for freshly-paid orders */}
        {order.payment_status?.toLowerCase() === 'paid' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-5 mb-8 flex items-center gap-4">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={28} />
            <div>
              <p className="font-bold text-emerald-900">Payment Confirmed</p>
              <p className="text-sm text-emerald-700">
                Thank you! Your order has been received and is being prepared.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-black uppercase tracking-tighter bg-slate-900 text-white px-3 py-1 rounded-sm">
              ORD-{String(order.id).padStart(6, '0')}
            </span>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${orderStatus.color}`}
            >
              {orderStatus.icon} {order.status.replace(/_/g, ' ')}
            </span>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${paymentStatus.color}`}
            >
              <CreditCard size={12} /> Payment: {order.payment_status}
            </span>
          </div>

          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight leading-none mb-2">
            Order <span className="text-amber-500 italic font-normal">Summary</span>
          </h1>
          <p className="text-sm text-slate-500">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Items */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8 mb-6">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-6">
            Items ({order.items.length})
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.product_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                      Qty: {item.quantity} × Rs {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-serif font-bold text-slate-900">
                  Rs {(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping + Totals */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.shipping_address}</p>
          </div>

          <div className="bg-slate-900 rounded-sm shadow-lg p-8 text-white">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-4">
              Order Total
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
            </div>
            <div className="h-px bg-slate-700 my-4" />
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[10px] uppercase tracking-widest">
                Grand Total
              </span>
              <span className="text-3xl font-serif font-bold text-amber-500">
                Rs {Number(order.total_amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
          >
            All Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
