import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'

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
				<AppProviders>
					<main className="min-h-screen bg-stone-50">
						{children}
					</main>
				</AppProviders>
			</body>
		</html>
	)
}