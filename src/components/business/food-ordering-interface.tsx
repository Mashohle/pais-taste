"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// Removed problematic Select component
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Minus, Search, ShoppingCart, MapPin, Clock, Info, Utensils } from "lucide-react"
import { useCart } from '@/lib/contexts/cart-context'
import { supabase } from '@/lib/supabase'
// import { toast } from "sonner" // Removed - dependency not installed

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
  const [showCheckout, setShowCheckout] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const { 
    state: cartState, 
    addItem, 
    updateQuantity, 
    validateBusinessCompatibility,
    setBusiness,
    getBusinessContext,
    clearCart
  } = useCart()

  // Use menu items from business prop or fallback to mock data
  useEffect(() => {
    if (business?.menu_items && business.menu_items.length > 0) {
      setMenuItems(business.menu_items)
    } else {
      setMenuItems(mockMenu) // Fallback to mock data
    }
    setLoading(false)
  }, [business?.menu_items])

  // Set business context in cart
  useEffect(() => {
    if (business?.id && business?.name) {
      setBusiness(business.id, business.name)
    }
  }, [business?.id, business?.name])

  // Filter menu items
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch && (item.is_available !== false)
    })
  }, [menuItems, selectedCategory, searchTerm])

  // Cart calculations using global cart state
  const cartTotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = orderType === 'delivery' ? business.delivery_fee : 0
  const orderTotal = cartTotal + deliveryFee

  const handleAddToCart = (menuItem: any) => {
    try {
      // Check business compatibility before adding
      if (!validateBusinessCompatibility(business.id)) {
        // toast.error("Cannot mix items from different businesses. Please clear your cart first.")
        return
      }

      const cartItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        type: 'traditional' as const,
        business_id: business.id,
        menu_item_id: menuItem.id
      }
      
      addItem(cartItem)
      // toast.success(`${menuItem.name} added to cart`)
    } catch (error: any) {
      // toast.error(error.message)
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    try {
      updateQuantity(itemId, newQuantity)
      if (newQuantity === 0) {
        // toast.success("Item removed from cart")
      }
    } catch (error: any) {
      // toast.error(error.message)
    }
  }

  const getCartItemQuantity = (menuItemId: string): number => {
    const cartItem = cartState.items.find(item => item.id === menuItemId)
    return cartItem?.quantity || 0
  }

  const handleCheckout = () => {
    if (cartState.items.length === 0) {
      // toast.error("Your cart is empty")
      return
    }
    
    if (cartTotal < (business.minimum_order || 0)) {
      // toast.error(`Minimum order amount is R${business.minimum_order}`)
      return
    }
    
    // Redirect to checkout page with business context
    window.location.href = '/checkout'
  }

  const handlePlaceOrder = () => {
    // TODO: Integrate with actual ordering system
    console.log('Order placed:', {
      business: business.id,
      items: cartState.items,
      orderType,
      deliveryAddress,
      total: orderTotal
    })
    alert('Order placed successfully! You will receive a confirmation shortly.')
    clearCart()
    setShowCheckout(false)
  }

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-[200px] h-12 text-lg border border-gray-200 rounded-md px-3 bg-white focus:border-blue-500 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Menu Items - Takes up more space */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'Our Menu' : selectedCategory}
            </h3>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {filteredMenu.length} items
            </Badge>
          </div>

          {/* Grid Layout for Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map(item => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  {/* Item Image */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Utensils className="w-16 h-16 text-orange-400" />
                    )}
                    {item.popular && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1">
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>

                    {/* Price and Prep Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        R{item.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {item.prep_time}
                      </div>
                    </div>

                    {/* Dietary Info */}
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.dietary_info.map((info: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1 border-green-200 text-green-700">
                            {info}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Controls */}
                    <div className="flex items-center justify-center">
                      {getCartItemQuantity(item.id) === 0 ? (
                        <Button
                          size="lg"
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, getCartItemQuantity(item.id) - 1)}
                            className="flex-1 h-12 border-blue-200 hover:bg-blue-50"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {getCartItemQuantity(item.id)}
                            </span>
                          </div>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 h-12 border-blue-200 hover:bg-blue-50"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No items found</h3>
                <p className="text-gray-600 text-lg">Try adjusting your search or category filter.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="xl:col-span-1">
          <Card className="sticky top-24 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                Your Order
              </h3>

              {cartState.items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mt-1">Add items from the menu to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Type Selection */}
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-3">
                      Order Type
                    </label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'delivery' | 'pickup')}
                      className="w-full h-12 border border-gray-200 rounded-md px-3 bg-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="delivery">🚚 Delivery</option>
                      <option value="pickup">🏪 Pickup</option>
                    </select>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Items in your cart</h4>
                    {cartState.items.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <span className="font-bold text-gray-900">R{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>R{cartTotal.toFixed(2)}</span>
                      </div>
                      {orderType === 'delivery' && (
                        <div className="flex justify-between text-gray-700">
                          <span>Delivery Fee</span>
                          <span>R{deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>R{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Order Warning */}
                  {cartTotal < business.minimum_order && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Minimum order required</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Add R{(business.minimum_order - cartTotal).toFixed(2)} more to place your order
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estimated Time */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          {orderType === 'delivery' ? 'Estimated delivery' : 'Ready for pickup'}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">{business.estimated_delivery_time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium"
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
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'delivery' | 'pickup')}
                className="w-full h-12 border border-gray-200 rounded-md px-3 bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
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
                {cartState.items.map(item => (
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