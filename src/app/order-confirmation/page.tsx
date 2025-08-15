'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Order Placed!</h1>
        <p className="text-stone-600 mb-4">
          Your order has been received. We'll call you at the number provided within 10 minutes.
        </p>
        {orderId && (
          <p className="text-sm text-stone-500 mb-6">
            Order ID: {orderId}
          </p>
        )}
        <Link href="/">
          <Button className="bg-stone-700 hover:bg-stone-800">
            Back to Menu
          </Button>
        </Link>
      </div>
    </div>
  )
}