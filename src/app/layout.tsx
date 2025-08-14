import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/context/cart-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Pai's Taste Food Special",
  description: 'Order traditional South African food for pickup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <main className="min-h-screen bg-stone-50">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}