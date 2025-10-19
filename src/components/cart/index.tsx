"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Minus, Trash2, ShoppingCartIcon as CartIcon } from "lucide-react"
import { useCart } from '@/lib/contexts/cart-context'
import { useRouter } from 'next/navigation'

export function ShoppingCart() {
    const { state, updateQuantity, removeItem, clearCart, subtotal, total, hasItems, setCartOpen } = useCart()
    const router = useRouter()

    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

    // Don't render if cart is hidden
    if (!state.isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setCartOpen(false)}
            />

            {/* Sidebar */}
            <div
                className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-b from-stone-50/95 via-stone-25/90 to-stone-50/95 backdrop-blur-xl border-l border-stone-200/60 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0"
            >
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="absolute top-20 left-8 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
                    </svg>
                    <svg className="absolute top-64 right-12 w-12 h-12 text-stone-500" viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                        <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
                    </svg>
                </div>

                <div className="relative h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200/50 bg-white/40 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <CartIcon className="w-6 h-6 text-stone-700" />
                            <h2 className="text-xl font-bold text-stone-800">Your Order</h2>
                            {totalItems > 0 && <Badge className="bg-stone-700 text-white">{totalItems}</Badge>}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCartOpen(false)}
                            className="text-stone-600 hover:text-stone-800 hover:bg-stone-100/50"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto">
                        {state.items.length === 0 ? (
                            // Empty State - keep existing
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="w-24 h-24 rounded-full bg-stone-100/80 backdrop-blur-sm flex items-center justify-center mb-4 border border-stone-200/50">
                                    <CartIcon className="w-12 h-12 text-stone-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-stone-700 mb-2">Your cart is empty</h3>
                                <p className="text-stone-500 text-sm mb-6 max-w-xs">
                                    Add some delicious items to get started!
                                </p>
                                <Button onClick={() => setCartOpen(false)} className="bg-stone-700 hover:bg-stone-800 text-white">
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            // Cart Items
                            <div className="p-4 sm:p-6 space-y-4">
                                {state.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative bg-white/85 backdrop-blur-sm rounded-xl p-4 border border-stone-200/60 shadow-lg overflow-hidden"
                                    >
                                        {/* Glassmorphism overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-xl"></div>

                                        <div className="relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-stone-800 text-sm sm:text-base">{item.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs text-stone-600 border-stone-400 bg-stone-50/90"
                                                        >
                                                            {item.item_type === "menu_item" ? "Menu Item" :
                                                             item.item_type === "product" ? "Product" : "Service"}
                                                        </Badge>
                                                        <span className="text-stone-600 font-medium text-sm">R{item.price}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-stone-400 hover:text-red-600 hover:bg-red-50/50 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 bg-stone-100/80 backdrop-blur-sm rounded-lg p-1 border border-stone-200/50">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 p-0 text-stone-600 hover:text-stone-800 hover:bg-stone-200/50"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-8 text-center font-medium text-stone-800 text-sm">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 p-0 text-stone-600 hover:text-stone-800 hover:bg-stone-200/50"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-stone-800">R{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Clear Cart Button */}
                                {state.items.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearCart}
                                        className="w-full text-stone-500 hover:text-red-600 hover:bg-red-50/50 mt-4"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear Cart
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer with Subtotal and Checkout */}
                    {hasItems && (
                        <div className="border-t border-stone-200/50 bg-white/40 backdrop-blur-sm p-4 sm:p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-stone-600">Subtotal:</span>
                                    <span className="text-sm font-semibold text-stone-800">R{subtotal.toFixed(2)}</span>
                                </div>
                                {state.business?.delivery_fee && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-stone-600">Delivery:</span>
                                        <span className="text-sm font-semibold text-stone-800">R{state.business.delivery_fee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                                    <span className="text-lg font-semibold text-stone-700">Total:</span>
                                    <span className="text-xl font-bold text-stone-800">R{total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    setCartOpen(false)
                                    router.push('/checkout')
                                }}
                                className="w-full bg-stone-700 hover:bg-stone-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
                                size="lg"
                            >
                                Proceed to Checkout
                            </Button>
                            {state.business && (
                                <p className="text-xs text-stone-500 text-center">
                                    {state.business.name}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}