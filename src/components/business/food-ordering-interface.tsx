"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Minus, Search, ShoppingCart, MapPin, Clock, Info, Utensils } from "lucide-react"

// Mock menu data for the food business
const mockMenu = [
  {
    id: '1',
    name: 'Traditional Potjiekos',
    description: 'Slow-cooked traditional stew with tender beef, vegetables and aromatic spices',
    price: 165.00,
    category: 'Main Dishes',
    image_url: null,
    available: true,
    prep_time: '20-25 min',
    dietary_info: ['Gluten-Free Available'],
    popular: true
  },
  {
    id: '2', 
    name: 'Pap and Vleis',
    description: 'Traditional maize meal with grilled meat and homemade tomato relish',
    price: 135.00,
    category: 'Main Dishes',
    image_url: null,
    available: true,
    prep_time: '15-20 min',
    dietary_info: ['High Protein'],
    popular: false
  },
  {
    id: '3',
    name: 'Boerewors Roll',
    description: 'Authentic farmer\'s sausage in fresh bread with traditional sides',
    price: 85.00,
    category: 'Quick Meals',
    image_url: null,
    available: true,
    prep_time: '10-15 min',
    dietary_info: [],
    popular: true
  },
  {
    id: '4',
    name: 'Malva Pudding',
    description: 'Traditional sweet pudding with custard and caramel sauce',
    price: 65.00,
    category: 'Desserts',
    image_url: null,
    available: true,
    prep_time: '5 min',
    dietary_info: ['Vegetarian'],
    popular: false
  },
  {
    id: '5',
    name: 'Vetkoek with Mince',
    description: 'Deep-fried bread filled with spiced mince and curry sauce',
    price: 75.00,
    category: 'Quick Meals',
    image_url: null,
    available: false,
    prep_time: '12-18 min',
    dietary_info: [],
    popular: false
  },
  {
    id: '6',
    name: 'Rooibos Tea',
    description: 'Traditional South African red bush tea, caffeine-free',
    price: 25.00,
    category: 'Beverages',
    image_url: null,
    available: true,
    prep_time: '2 min',
    dietary_info: ['Caffeine-Free', 'Vegan'],
    popular: false
  }
]

const categories = ['All', 'Main Dishes', 'Quick Meals', 'Desserts', 'Beverages']

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  special_instructions?: string
}

interface FoodOrderingProps {
  business: any
}

export default function FoodOrderingInterface({ business }: FoodOrderingProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')

  // Filter menu items
  const filteredMenu = useMemo(() => {
    return mockMenu.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch && item.available
    })
  }, [selectedCategory, searchTerm])

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = orderType === 'delivery' ? business.delivery_fee : 0
  const orderTotal = cartTotal + deliveryFee

  const addToCart = (menuItem: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === menuItem.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, item) => {
        if (item.id === itemId) {
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

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId)
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

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-stone-800">
            {selectedCategory === 'All' ? 'Menu' : selectedCategory}
          </h3>
          
          {filteredMenu.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Item Image Placeholder */}
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-200 to-orange-300 flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-orange-600" />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-stone-800 flex items-center gap-2">
                          {item.name}
                          {item.popular && (
                            <Badge className="text-xs bg-orange-500 text-white">Popular</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-stone-800">
                          R{item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.prep_time}
                        </div>
                        {item.dietary_info.length > 0 && (
                          <div className="flex gap-1">
                            {item.dietary_info.map((info, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {info}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Add to Cart Controls */}
                      <div className="flex items-center gap-2">
                        {getItemQuantity(item.id) === 0 ? (
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-medium min-w-[2rem] text-center">
                              {getItemQuantity(item.id)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item)}
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

          {filteredMenu.length === 0 && (
            <Card className="p-8 text-center">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No items found</h3>
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
                Your Order
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
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                        </div>
                        <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
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
                          Minimum order: R{business.minimum_order}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Estimated Time */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-800">
                        {orderType === 'delivery' ? 'Estimated delivery' : 'Ready for pickup'}: {business.estimated_delivery_time}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
              Review your order details and provide delivery information.
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
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
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
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}