import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from "@/lib/contexts/auth-context"
import { CartProvider } from '@/lib/contexts/cart-context'
import { NotificationProvider } from '@/lib/contexts/notification-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: "SideHusl",
	description: 'Multi-tenant platform for local businesses to manage orders and operations',
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
						<NotificationProvider>
							<main className="min-h-screen bg-stone-50">
								{children}
							</main>
						</NotificationProvider>
					</CartProvider>
				</AuthProvider>
			</body>
		</html>
	)
}