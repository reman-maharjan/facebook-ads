'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Search } from 'lucide-react'

const PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 129.99,
    image: '/wireless-headphones.png',
    description: 'Premium sound quality with noise cancellation',
  },
  {
    id: '2',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 249.99,
    image: '/smartwatch-lifestyle.png',
    description: 'Track your fitness and stay connected',
  },
  {
    id: '3',
    name: 'Laptop Stand',
    category: 'Accessories',
    price: 49.99,
    image: '/laptop-stand.png',
    description: 'Ergonomic design for better posture',
  },
  {
    id: '4',
    name: 'USB-C Hub',
    category: 'Accessories',
    price: 79.99,
    image: '/usb-c-hub.png',
    description: 'Connect all your devices with ease',
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 159.99,
    image: '/mechanical-keyboard.png',
    description: 'Professional-grade typing experience',
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 59.99,
    image: '/wireless-mouse.png',
    description: 'Precision tracking with long battery life',
  },
]

const CATEGORIES = ['All', 'Electronics', 'Accessories']

interface ProductsGridProps {
  onAddToCart: (productId: string) => void
}

export function ProductsGrid({ onAddToCart }: ProductsGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Discover Our Products</h2>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of premium products and accessories
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-2 pl-10 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <h3 className="mt-1 font-semibold text-foreground">{product.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold text-foreground">${product.price}</p>
                  <Button
                    onClick={() => onAddToCart(product.id)}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
