"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Trash2, ShoppingCart as CartIcon } from "lucide-react"
import { useCart } from '@/lib/context/cart-context'
import { useRouter } from 'next/navigation'
import { CustomerLayout } from '@/components/layout/customer-layout'
import { MobileCartHeader } from '@/components/cart/mobile-cart-header'
import Image from 'next/image'

export default function CartPage() {
    const { cart, updateQuantity, removeItem, clearCart, subtotal, total, hasItems, itemCount } = useCart()
    const router = useRouter()

    const handleCheckout = () => {
        if (!hasItems) return
        router.push('/checkout')
    }

    return (
        <CustomerLayout>
            {/* Mobile View */}
            <div className="md:hidden min-h-screen bg-stone-50">
                <MobileCartHeader
                    itemCount={itemCount}
                    hasItems={hasItems}
                    onClearCart={clearCart}
                />
                <div className="bg-stone-50 rounded-t-[2.5rem] -mt-24 relative z-10 min-h-screen pb-24" style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
                    <div className="px-5 pt-6">
                    {!hasItems ? (
                        // Empty State
                        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                            <div className="bg-stone-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <CartIcon className="w-12 h-12 text-stone-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-800 mb-3">Your cart is empty</h2>
                            <p className="text-stone-600 mb-6">Add items from your favorite businesses to get started!</p>
                            <Button
                                onClick={() => router.push('/')}
                                className="bg-stone-700 hover:bg-stone-800 text-white"
                            >
                                Browse Businesses
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Business Info */}
                            {cart.business && (
                                <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-stone-700">
                                    <div className="flex items-center space-x-3">
                                        {cart.business.logo_url && (
                                            <Image
                                                src={cart.business.logo_url}
                                                alt={cart.business.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-stone-800">{cart.business.name}</h3>
                                            <Badge variant="secondary" className="text-xs mt-1">
                                                {cart.business.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className="space-y-3">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl shadow-lg p-4 border border-stone-100 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-stone-800 text-base mb-1 line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                {item.description && (
                                                    <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-stone-500 italic mb-2">
                                                        Note: {item.notes}
                                                    </p>
                                                )}
                                                <p className="text-lg font-bold text-stone-800">
                                                    R{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    R{item.price.toFixed(2)} each
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className="flex items-center space-x-2 bg-stone-100 rounded-full p-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                        className="h-8 w-8 rounded-full hover:bg-stone-200"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-sm font-semibold text-stone-800 min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-8 w-8 rounded-full hover:bg-stone-200"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gradient-to-br from-stone-100 to-white rounded-2xl shadow-lg p-6 border border-stone-200">
                                <h3 className="text-lg font-bold text-stone-800 mb-4">Order Summary</h3>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-stone-700">
                                        <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                                        <span className="font-semibold">R{subtotal.toFixed(2)}</span>
                                    </div>

                                    {cart.business?.delivery_fee && (
                                        <div className="flex justify-between text-stone-700">
                                            <span>Delivery Fee</span>
                                            <span className="font-semibold">R{cart.business.delivery_fee.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-stone-300 pt-3 flex justify-between text-lg font-bold text-stone-800">
                                        <span>Total</span>
                                        <span>R{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-stone-700 hover:bg-stone-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>

                                <p className="text-xs text-stone-500 text-center mt-4">
                                    You&apos;ll be able to review your order before placing it
                                </p>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block min-h-screen bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Desktop Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-stone-800">Your Cart</h1>
                            {itemCount > 0 && (
                                <p className="text-stone-600 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                            )}
                        </div>
                        {hasItems && (
                            <Button
                                onClick={() => clearCart()}
                                variant="outline"
                                size="sm"
                                className="text-stone-600 hover:text-stone-800"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>

                    {!hasItems ? (
                        // Empty State
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="bg-stone-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <CartIcon className="w-12 h-12 text-stone-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-800 mb-3">Your cart is empty</h2>
                            <p className="text-stone-600 mb-6">Add items from your favorite businesses to get started!</p>
                            <Button
                                onClick={() => router.push('/')}
                                className="bg-stone-700 hover:bg-stone-800 text-white"
                            >
                                Browse Businesses
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Business Info */}
                            {cart.business && (
                                <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-stone-700">
                                    <div className="flex items-center space-x-3">
                                        {cart.business.logo_url && (
                                            <Image
                                                src={cart.business.logo_url}
                                                alt={cart.business.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-stone-800">{cart.business.name}</h3>
                                            <Badge variant="secondary" className="text-xs mt-1">
                                                {cart.business.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className="space-y-3">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl shadow-lg p-4 border border-stone-100 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-stone-800 text-base mb-1 line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                {item.description && (
                                                    <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-stone-500 italic mb-2">
                                                        Note: {item.notes}
                                                    </p>
                                                )}
                                                <p className="text-lg font-bold text-stone-800">
                                                    R{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    R{item.price.toFixed(2)} each
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className="flex items-center space-x-2 bg-stone-100 rounded-full p-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                        className="h-8 w-8 rounded-full hover:bg-stone-200"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-sm font-semibold text-stone-800 min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-8 w-8 rounded-full hover:bg-stone-200"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gradient-to-br from-stone-100 to-white rounded-2xl shadow-lg p-6 border border-stone-200">
                                <h3 className="text-lg font-bold text-stone-800 mb-4">Order Summary</h3>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-stone-700">
                                        <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                                        <span className="font-semibold">R{subtotal.toFixed(2)}</span>
                                    </div>

                                    {cart.business?.delivery_fee && (
                                        <div className="flex justify-between text-stone-700">
                                            <span>Delivery Fee</span>
                                            <span className="font-semibold">R{cart.business.delivery_fee.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-stone-300 pt-3 flex justify-between text-lg font-bold text-stone-800">
                                        <span>Total</span>
                                        <span>R{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-stone-700 hover:bg-stone-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>

                                <p className="text-xs text-stone-500 text-center mt-4">
                                    You&apos;ll be able to review your order before placing it
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    )
}
