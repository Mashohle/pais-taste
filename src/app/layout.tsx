import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from "@/lib/contexts/auth-context"
import { BusinessProvider } from '@/lib/contexts/business-context'
import { CartProvider } from '@/lib/contexts/cart-context'
import { NotificationProvider } from '@/lib/contexts/notification-context'

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
					<BusinessProvider>
						<CartProvider>
							<NotificationProvider>
								<main className="min-h-screen bg-stone-50">
									{children}
								</main>
							</NotificationProvider>
						</CartProvider>
					</BusinessProvider>
				</AuthProvider>
			</body>
		</html>
	)
}