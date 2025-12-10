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
					<main className="min-h-screen bg-stone-50 relative">
						{/* Decorative background pattern - Desktop only */}
						<div className="hidden md:block fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden z-0">
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
						<div className="relative z-10">
							{children}
						</div>
					</main>
				</AppProviders>
			</body>
		</html>
	)
}