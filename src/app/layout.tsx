import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from "@/lib/contexts/auth-context"
import { CartProvider } from '@/lib/contexts/cart-context'

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
				<AuthProvider>
					<CartProvider>
						<main className="min-h-screen bg-stone-50">
							{children}
						</main>
					</CartProvider>
				</AuthProvider>
			</body>
		</html>
	)
}