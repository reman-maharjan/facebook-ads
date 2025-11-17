'use client'
import { useState } from 'react'
import { ProductsGrid } from './products-grid'
import { OrderForm } from './order-form'
import { ShoppingCart } from 'lucide-react'

interface ProductsPageProps {
  cartItems: Array<{ id: string; quantity: number }>;
  userId?: string;
}

export function ProductsPage({ cartItems: initialCartItems, userId }: ProductsPageProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'order'>('products')
  const [cart, setCart] = useState<Array<{ id: string; quantity: number }>>(initialCartItems || [])

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
    setActiveTab('order')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <h1 className="text-lg font-semibold text-foreground">ShopHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('order')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'order'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Order ({cart.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'products' ? (
          <ProductsGrid onAddToCart={handleAddToCart} />
        ) : (
          <OrderForm cartItems={cart} />
        )}
      </main>
    </div>
  )
}
