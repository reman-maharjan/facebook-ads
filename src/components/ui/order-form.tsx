'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

const PRODUCTS_MAP: Record<string, { name: string; price: number }> = {
  '1': { name: 'Wireless Headphones', price: 129.99 },
  '2': { name: 'Smart Watch', price: 249.99 },
  '3': { name: 'Laptop Stand', price: 49.99 },
  '4': { name: 'USB-C Hub', price: 79.99 },
  '5': { name: 'Mechanical Keyboard', price: 159.99 },
  '6': { name: 'Wireless Mouse', price: 59.99 },
}

interface OrderFormProps {
  cartItems: Array<{ id: string; quantity: number }>
  userId?: string // Facebook user ID from Messenger
}

export function OrderForm({ cartItems, userId }: OrderFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch order data from API when component mounts and poll for updates
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!userId) return

      try {
        const response = await fetch(`/api/orders?userId=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.order) {
            const hasNewData = 
              data.order.name !== formData.fullName ||
              data.order.email !== formData.email ||
              data.order.phone !== formData.phone ||
              data.order.address !== formData.address;

            if (hasNewData) {
              setFormData({
                fullName: data.order.name || formData.fullName,
                email: data.order.email || formData.email,
                phone: data.order.phone || formData.phone,
                address: data.order.address || formData.address,
              })
              
              if (data.order.orderId) {
                setOrderId(data.order.orderId)
              }

              if (data.order.name || data.order.email || data.order.phone || data.order.address) {
                setAutoFilled(true)
                setLastUpdate(new Date())
                
                // Hide auto-fill notification after 5 seconds
                setTimeout(() => setAutoFilled(false), 5000)
              }
              
              console.log('[OrderForm] Auto-filled data:', data.order)
            }
          }
        }
      } catch (error) {
        console.error('[OrderForm] Error fetching order data:', error)
      }
    }

    // Initial fetch
    if (userId) {
      setLoading(true)
      fetchOrderData().finally(() => setLoading(false))
    }

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchOrderData, 3000)
    
    return () => clearInterval(interval)
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.address) {
      alert('Please fill in all required fields (Name, Email, Address)')
      return
    }

    setLoading(true)
    
    try {
      // Save the final order
      if (userId) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            status: 'submitted',
            cartItems,
            total: total.toFixed(2),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.orderId) {
            setOrderId(data.orderId)
          }
        }
      }

      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('[OrderForm] Error submitting order:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartItems.reduce((total, item) => {
    const product = PRODUCTS_MAP[item.id]
    return total + (product?.price || 0) * item.quantity
  }, 0)

  const tax = subtotal * 0.08
  const total = subtotal + tax

  const isFormComplete = formData.fullName && formData.email && formData.address

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Complete Your Order</h2>
        <p className="mt-2 text-muted-foreground">
          Provide your details to finalize your purchase
          {userId && " - or send them via Messenger"}
        </p>
        {orderId && (
          <p className="mt-1 text-sm text-muted-foreground">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {loading && !autoFilled && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-blue-700 border border-blue-200">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your information from Messenger...</span>
            </div>
          )}

          {autoFilled && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>✨ Your information has been auto-filled from Messenger!</span>
            </div>
          )}

          {userId && !isFormComplete && (
            <div className="rounded-lg bg-purple-50 p-4 text-purple-700 border border-purple-200">
              <p className="font-semibold mb-2">💬 Send your details via Messenger!</p>
              <p className="text-sm">
                Message format: <br />
                <code className="bg-purple-100 px-2 py-1 rounded text-xs mt-1 inline-block">
                  My name is John Doe, email john@email.com, phone 555-1234, address 123 Main St
                </code>
              </p>
            </div>
          )}

          {/* Shipping Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Shipping Information</h3>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <input
                type="text"
                name="address"
                placeholder="Delivery Address *"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {submitted && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>🎉 Order placed successfully! We'll send a confirmation to Messenger.</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={loading || !isFormComplete}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>

          {!isFormComplete && (
            <p className="text-sm text-center text-muted-foreground">
              Please fill in all required fields to continue
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-lg border border-border bg-card p-6 sticky top-20">
          <h3 className="text-lg font-semibold text-foreground">Order Summary</h3>
          <div className="mt-6 space-y-3">
            {cartItems.length > 0 ? (
              <>
                {cartItems.map((item) => {
                  const product = PRODUCTS_MAP[item.id]
                  if (!product) return null
                  return (
                    <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {product.name} x{item.quantity}
                      </span>
                      <span className="font-medium text-foreground">${(product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No items in cart</p>
            )}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-base font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}