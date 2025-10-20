"use client"

import type React from "react"
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { useCheckout } from '@/lib/hooks'
import { useCart } from '@/lib/contexts/cart-context'
import { BusinessErrorDisplay } from '@/components/business/business-error-boundary'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, MapPin, Phone, User, FileText, CreditCard, Banknote, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'

export default function CheckoutPage() {
    const { user, profile } = useAuth()
    const router = useRouter()
    
    // Use checkout hook for all business and cart data
    const {
        business,
        cartItems,
        subtotal,
        total,
        hasItems,
        isLoading,
        hasError,
        error,
        businessId,
        isEmpty
    } = useCheckout()

    // Import clearCart from cart context
    const { clearCart } = useCart()

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        pickupLocation: "",
        specialInstructions: "",
        paymentMethod: "cash_on_pickup", // Default to cash
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Auto-fill form with user data when component mounts
    useEffect(() => {
        if (user && profile) {
            setFormData(prev => ({
                ...prev,
                fullName: profile.full_name || prev.fullName,
                phoneNumber: profile.phone || prev.phoneNumber,
                pickupLocation: profile.preferred_pickup_location || prev.pickupLocation,
            }))
        }
    }, [user, profile])

    // Handle loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
                    <p className="text-stone-700">Loading checkout...</p>
                </div>
            </div>
        )
    }

    // Handle error state
    if (hasError && error) {
        return <BusinessErrorDisplay error={error} />
    }

    // Early return for empty cart
    if (isEmpty) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-stone-600 mb-4">Your cart is empty</p>
                    <Link href="/" className="text-stone-700 hover:text-stone-900">Return to menu</Link>
                </div>
            </div>
        )
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required"
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required"
        } else if (!/^\+27\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
            newErrors.phoneNumber = "Please enter a valid South African phone number (+27xxxxxxxxx)"
        }

        if (!formData.pickupLocation) {
            newErrors.pickupLocation = "Please select a pickup location"
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = "Please select a payment method"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            try {
                setIsSubmitting(true)

                if (!businessId) {
                    alert('No business selected. Please return to the menu and try again.')
                    setIsSubmitting(false)
                    return
                }

                // Call API endpoint to create order (bypasses RLS)
                const response = await fetch('/api/customer/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customer_name: formData.fullName,
                        customer_phone: formData.phoneNumber,
                        pickup_location: formData.pickupLocation,
                        special_instructions: formData.specialInstructions,
                        total_amount: total,
                        items: cartItems,
                        payment_method: formData.paymentMethod as 'online' | 'cash_on_pickup',
                        user_id: user?.id,
                        business_id: businessId
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to create order')
                }

                const { order } = await response.json()

                // Store order ID in session storage for immediate access
                const accessibleOrders = JSON.parse(sessionStorage.getItem('accessibleOrders') || '[]')
                accessibleOrders.push(order.id)
                sessionStorage.setItem('accessibleOrders', JSON.stringify(accessibleOrders))

                // Clear cart
                clearCart()

                // Wait a moment for the order to be saved
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Navigate to confirmation page
                router.push(`/order/${order.id}/confirmation`)

            } catch (error) {
                console.error('Order submission failed:', error)
                setIsSubmitting(false)
                alert('Failed to place order. Please try again.')
            }
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    // Check if we should show auto-fill message
    const showAutoFillMessage = user && profile && (
        profile.full_name || profile.phone || profile.preferred_pickup_location
    )

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Decorative background pattern */}
            <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                    <svg className="absolute top-10 right-4 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
                    </svg>
                    <svg className="absolute top-48 right-8 w-14 h-14 text-stone-500" viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                        <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
                    </svg>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <Link href="/" className="inline-flex items-center text-stone-600 hover:text-stone-800 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Menu
                    </Link>
                    <div className="text-center">
                        {business ? (
                            <>
                                <div className="w-48 h-32 mx-auto mb-4 bg-gradient-to-r from-stone-200 to-stone-300 rounded-2xl flex items-center justify-center">
                                    {business.logo_url ? (
                                        <Image
                                            src={business.logo_url}
                                            alt={business.name}
                                            width={200}
                                            height={128}
                                            className="max-w-full max-h-full object-contain rounded-2xl"
                                        />
                                    ) : (
                                        <div className="text-stone-600 text-2xl font-bold">
                                            {business.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-xl font-bold text-stone-800 mb-2">{business.name}</h1>
                                <p className="text-stone-600 text-sm sm:text-base">
                                    Complete your order for {business.description || business.business_categories?.name}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-48 h-32 mx-auto mb-4 bg-gradient-to-r from-stone-200 to-stone-300 rounded-2xl flex items-center justify-center">
                                    <div className="text-stone-600 text-2xl font-bold">?</div>
                                </div>
                                <p className="text-stone-600 text-sm sm:text-base">
                                    Complete your order
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Auto-fill message */}
                {showAutoFillMessage && (
                    <div className="mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 text-sm">
                                ✓ We've pre-filled your details from your account. Please review and update if needed.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Customer Details Form */}
                    <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-stone-200/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

                        <div className="relative">
                            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Customer Details
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-stone-700 font-medium">
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.fullName ? "border-red-500" : ""}`}
                                        placeholder="Enter your full name"
                                        disabled={isSubmitting}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-stone-700 font-medium flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.phoneNumber ? "border-red-500" : ""}`}
                                        placeholder="+27 81 454 1020"
                                        disabled={isSubmitting}
                                    />
                                    {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pickupLocation" className="text-stone-700 font-medium flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        Pickup Location *
                                    </Label>
                                    <Select
                                        value={formData.pickupLocation}
                                        onValueChange={(value) => handleInputChange("pickupLocation", value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.pickupLocation ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Select pickup location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {business ? (
                                                <>
                                                    {/* Primary business location */}
                                                    {business.city && (
                                                        <SelectItem value={business.city}>
                                                            {[business.city, business.province].filter(Boolean).join(', ')}
                                                        </SelectItem>
                                                    )}
                                                    
                                                    {/* Additional locations if available in settings */}
                                                    {business.settings?.food?.locations?.map((location: any, index: number) => (
                                                        <SelectItem key={index} value={location.name}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            ) : (
                                                <SelectItem value="" disabled>Loading locations...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.pickupLocation && <p className="text-red-500 text-sm">{errors.pickupLocation}</p>}
                                </div>

                                {/* Payment Method Section */}
                                <div className="space-y-3">
                                    <Label className="text-stone-700 font-medium flex items-center">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Payment Method *
                                    </Label>
                                    <RadioGroup
                                        value={formData.paymentMethod}
                                        onValueChange={(value: string) => handleInputChange("paymentMethod", value)}
                                        className="space-y-3"
                                        disabled={isSubmitting}
                                    >
                                        {/* Cash on Pickup Option */}
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-stone-200 bg-white/60 hover:bg-white/80 transition-colors">
                                            <RadioGroupItem value="cash_on_pickup" id="cash_on_pickup" />
                                            <div className="flex items-center flex-1">
                                                <Banknote className="w-5 h-5 text-green-600 mr-3" />
                                                <div className="flex-1">
                                                    <Label htmlFor="cash_on_pickup" className="text-stone-800 font-medium cursor-pointer">
                                                        Cash on Pickup
                                                    </Label>
                                                    <p className="text-sm text-stone-600">Pay when you collect your order</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Online Payment Option (Disabled) */}
                                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-stone-200 bg-stone-100/50 opacity-60">
                                            <RadioGroupItem value="online" id="online" disabled />
                                            <div className="flex items-center flex-1">
                                                <CreditCard className="w-5 h-5 text-stone-400 mr-3" />
                                                <div className="flex-1">
                                                    <Label htmlFor="online" className="text-stone-500 font-medium cursor-not-allowed">
                                                        Online Payment
                                                        <span className="ml-2 text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded-full">
                                                            Coming Soon
                                                        </span>
                                                    </Label>
                                                    <p className="text-sm text-stone-400">Pay online with card or EFT</p>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                    {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialInstructions" className="text-stone-700 font-medium flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        Special Instructions (Optional)
                                    </Label>
                                    <Textarea
                                        id="specialInstructions"
                                        value={formData.specialInstructions}
                                        onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                                        className="bg-white/90 border-stone-300 focus:border-stone-500 min-h-[80px]"
                                        placeholder="Any special requests or dietary requirements..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-stone-200/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>

                        <div className="relative">
                            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative bg-white/85 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-stone-200/60 shadow-lg"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-xl"></div>
                                        <div className="relative flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-stone-800 text-sm sm:text-base">{item.name}</h4>
                                                <p className="text-stone-600 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-stone-800">R{item.price * item.quantity}</p>
                                                <p className="text-xs text-stone-600">R{item.price} each</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-stone-300 pt-4 space-y-3">
                                <div className="flex justify-between text-stone-700">
                                    <span>Subtotal:</span>
                                    <span>R{subtotal}</span>
                                </div>

                                {formData.pickupLocation && (
                                    <div className="flex justify-between text-stone-700 text-sm">
                                        <span className="flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            Pickup Location:
                                        </span>
                                        <span className="capitalize">{formData.pickupLocation}</span>
                                    </div>
                                )}

                                {formData.paymentMethod && (
                                    <div className="flex justify-between text-stone-700 text-sm">
                                        <span className="flex items-center">
                                            {formData.paymentMethod === 'cash_on_pickup' ? (
                                                <Banknote className="w-3 h-3 mr-1" />
                                            ) : (
                                                <CreditCard className="w-3 h-3 mr-1" />
                                            )}
                                            Payment:
                                        </span>
                                        <span className="capitalize">
                                            {formData.paymentMethod === 'cash_on_pickup' ? 'Cash on Pickup' : 'Online Payment'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg sm:text-xl font-bold text-stone-800 pt-2 border-t border-stone-300">
                                    <span>Total:</span>
                                    <span>R{total}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-stone-700 hover:bg-stone-800 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing Order...
                                    </div>
                                ) : (
                                    `Place Order - R${total}`
                                )}
                            </Button>

                            <p className="text-xs text-stone-600 text-center mt-3">
                                {formData.paymentMethod === 'cash_on_pickup'
                                    ? 'You will receive a confirmation call within 10 minutes. Payment due on pickup.'
                                    : 'You will receive a confirmation call within 10 minutes'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}