"use client"

import type React from "react"
import { useCart } from '@/lib/context/cart-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { createOrder } from '@/lib/orders'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, MapPin, Phone, User, FileText, CreditCard, Banknote } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
    const { state, clearCart } = useCart() //todo: The clearCart function should be called after successfully placing an order to empty the cart
    const router = useRouter()

    // Redirect if cart is empty
    useEffect(() => {
        if (state.items.length === 0) {
            router.push('/')
        }
    }, [state.items.length, router])

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        pickupLocation: "",
        specialInstructions: "",
        paymentMethod: "cash_on_pickup", // Default to cash
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const orderItems = state.items
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal

    // Early return for empty cart
    if (state.items.length === 0) {
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
                // Create order in Supabase
                const order = await createOrder({
                    customer_name: formData.fullName,
                    customer_phone: formData.phoneNumber,
                    pickup_location: formData.pickupLocation,
                    special_instructions: formData.specialInstructions,
                    total_amount: total,
                    items: orderItems,
                    payment_method: formData.paymentMethod as 'online' | 'cash_on_pickup'
                })

                // Navigate FIRST, then clear cart
                router.push(`/order-confirmation?id=${order.id}`)

                // Clear cart after navigation starts
                setTimeout(() => clearCart(), 100)

            } catch (error) {
                console.error('Order submission failed:', error)
                // Show error message to user
                // todo: use toastify maybe
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
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 mb-2">Pai's Taste Food Special</h1>
                        <p className="text-stone-600 text-sm sm:text-base">
                            Complete your order for traditional South African cuisine
                        </p>
                    </div>
                </div>

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
                                        className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.fullName ? "border-red-500" : ""
                                            }`}
                                        placeholder="Enter your full name"
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
                                        className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.phoneNumber ? "border-red-500" : ""
                                            }`}
                                        placeholder="+27 81 454 1020"
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
                                    >
                                        <SelectTrigger
                                            className={`bg-white/90 border-stone-300 focus:border-stone-500 ${errors.pickupLocation ? "border-red-500" : ""
                                                }`}
                                        >
                                            <SelectValue placeholder="Select pickup location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="montana">Montana</SelectItem>
                                            <SelectItem value="sinoville">Sinoville</SelectItem>
                                            <SelectItem value="annlin">Annlin</SelectItem>
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
                                {orderItems.map((item) => (
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
                                className="w-full mt-6 bg-stone-700 hover:bg-stone-800 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                size="lg"
                            >
                                Place Order - R{total}
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