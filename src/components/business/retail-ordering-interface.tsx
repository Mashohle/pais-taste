"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Minus, Search, ShoppingCart, MapPin, Info, Package, Star, Truck } from "lucide-react"

// Mock products data for retail business
const mockProducts = [
  {
    id: '1',
    name: 'Organic Vegetables Box',
    description: 'Fresh seasonal vegetables from local organic farms',
    price: 120.00,
    original_price: 135.00,
    category: 'Fresh Produce',
    image_url: null,
    in_stock: true,
    stock_quantity: 15,
    rating: 4.7,
    review_count: 23,
    tags: ['Organic', 'Local', 'Fresh'],
    on_sale: true
  },
  {
    id: '2', 
    name: 'Free Range Eggs (12 pack)',
    description: 'Farm fresh free-range eggs from happy hens',
    price: 45.00,
    original_price: 45.00,
    category: 'Fresh Produce',
    image_url: null,
    in_stock: true,
    stock_quantity: 28,
    rating: 4.8,
    review_count: 15,
    tags: ['Free Range', 'Farm Fresh'],
    on_sale: false
  },
  {
    id: '3',
    name: 'Artisan Sourdough Bread',
    description: 'Handcrafted sourdough bread baked fresh daily',
    price: 35.00,
    original_price: 35.00,
    category: 'Bakery',
    image_url: null,
    in_stock: true,
    stock_quantity: 8,
    rating: 4.9,
    review_count: 31,
    tags: ['Artisan', 'Fresh Daily', 'Handmade'],
    on_sale: false
  },
  {
    id: '4',
    name: 'Local Honey (500g)',
    description: 'Pure wildflower honey from local beekeepers',
    price: 85.00,
    original_price: 85.00,
    category: 'Pantry',
    image_url: null,
    in_stock: true,
    stock_quantity: 12,
    rating: 4.6,
    review_count: 8,
    tags: ['Local', 'Pure', 'Wildflower'],
    on_sale: false
  },
  {
    id: '5',
    name: 'Premium Olive Oil (250ml)',
    description: 'Extra virgin olive oil imported from Italy',
    price: 95.00,
    original_price: 110.00,
    category: 'Pantry',
    image_url: null,
    in_stock: false,
    stock_quantity: 0,
    rating: 4.8,
    review_count: 19,
    tags: ['Italian', 'Extra Virgin', 'Premium'],
    on_sale: true
  },
  {
    id: '6',
    name: 'Organic Apples (1kg)',
    description: 'Crisp organic apples perfect for snacking',
    price: 65.00,
    original_price: 65.00,
    category: 'Fresh Produce',
    image_url: null,
    in_stock: true,
    stock_quantity: 25,
    rating: 4.5,
    review_count: 12,
    tags: ['Organic', 'Crisp', '1kg Pack'],
    on_sale: false
  }
]

const categories = ['All', 'Fresh Produce', 'Bakery', 'Pantry', 'Beverages', 'Household']

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price: number
  category: string
  image_url: string | null
  in_stock: boolean
  stock_quantity: number
  rating: number
  review_count: number
  tags: string[]
  on_sale: boolean
}

interface Business {
  id: string
  name: string
  delivery_fee: number
  minimum_order: number
  estimated_delivery_time?: string
}

interface RetailOrderingProps {
  business: Business
}

export default function RetailOrderingInterface({ business }: RetailOrderingProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
      default:
        filtered.sort((a, b) => b.review_count - a.review_count)
        break
    }

    return filtered
  }, [selectedCategory, searchTerm, sortBy])

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = orderType === 'delivery' ? business.delivery_fee : 0
  const orderTotal = cartTotal + deliveryFee

  const addToCart = (product: Product) => {
    if (!product.in_stock) return

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, item) => {
        if (item.id === productId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 })
          }
          // If quantity is 1, don't add it back (remove completely)
        } else {
          acc.push(item)
        }
        return acc
      }, [] as CartItem[])
    })
  }

  const getItemQuantity = (productId: string) => {
    const cartItem = cart.find(item => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  const handleCheckout = () => {
    if (cartTotal < business.minimum_order) {
      alert(`Minimum order amount is R${business.minimum_order}`)
      return
    }
    setShowCheckout(true)
  }

  const handlePlaceOrder = () => {
    // TODO: Integrate with actual ordering system
    console.log('Order placed:', {
      business: business.id,
      items: cart,
      orderType,
      deliveryAddress,
      total: orderTotal
    })
    alert('Order placed successfully! You will receive a confirmation shortly.')
    setCart([])
    setShowCheckout(false)
  }

  const getSavingsAmount = (product: Product) => {
    return product.on_sale ? product.original_price - product.price : 0
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-stone-800">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h3>
            <div className="text-sm text-stone-600">
              {filteredProducts.length} products found
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className={`overflow-hidden hover:shadow-md transition-shadow ${!product.in_stock ? 'opacity-60' : ''}`}>
                <CardContent className="p-0">
                  <div>
                    {/* Product Image */}
                    <div className="h-40 bg-gradient-to-r from-green-200 to-green-300 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-green-600" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.on_sale && (
                          <Badge className="text-xs bg-red-500 text-white">
                            Save R{getSavingsAmount(product).toFixed(0)}
                          </Badge>
                        )}
                        {!product.in_stock && (
                          <Badge className="text-xs bg-gray-500 text-white">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Stock indicator */}
                      {product.in_stock && product.stock_quantity <= 5 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="text-xs bg-white">
                            {product.stock_quantity} left
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4">
                      <h4 className="font-semibold text-stone-800 mb-1">{product.name}</h4>
                      <p className="text-sm text-stone-600 mb-2 line-clamp-2">{product.description}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-stone-600">{product.rating}</span>
                        <span className="text-xs text-stone-500">({product.review_count})</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-stone-800">
                              R{product.price.toFixed(2)}
                            </span>
                            {product.on_sale && (
                              <span className="text-sm text-stone-500 line-through">
                                R{product.original_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Add to Cart Controls */}
                        <div className="flex items-center gap-2">
                          {!product.in_stock ? (
                            <Button size="sm" disabled>
                              Out of Stock
                            </Button>
                          ) : getItemQuantity(product.id) === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(product.id)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-medium min-w-[2rem] text-center">
                                {getItemQuantity(product.id)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(product)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </Card>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Shopping Cart
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Order Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 block mb-2">
                      Order Type
                    </label>
                    <Select value={orderType} onValueChange={(value: 'delivery' | 'pickup') => setOrderType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Delivery
                          </div>
                        </SelectItem>
                        <SelectItem value="pickup">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Pickup
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm border-b pb-2">
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <div className="text-xs text-stone-500">
                            R{item.price.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="font-medium min-w-[4rem] text-right">
                            R{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>R{cartTotal.toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>R{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>R{orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Minimum Order Warning */}
                  {cartTotal < business.minimum_order && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-800">
                          Add R{(business.minimum_order - cartTotal).toFixed(2)} more for minimum order
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Delivery Time */}
                  {business.estimated_delivery_time && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-800">
                          {orderType === 'delivery'
                            ? `Estimated delivery: ${business.estimated_delivery_time}`
                            : `Ready for pickup: ${business.estimated_delivery_time}`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleCheckout}
                    disabled={cartTotal < business.minimum_order}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Review your order and provide delivery details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Type */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">
                Order Type
              </label>
              <Select value={orderType} onValueChange={(value: 'delivery' | 'pickup') => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </div>
                  </SelectItem>
                  <SelectItem value="pickup">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Pickup
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-2">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Enter your full address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Order Summary</h4>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>R{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Total</span>
                  <span>R{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={orderType === 'delivery' && !deliveryAddress.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}