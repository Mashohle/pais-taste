"use client"

import { MenuGrid } from '@/components/menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { User, Package, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
	const { user, signOut, getDisplayName } = useAuth()
	const router = useRouter()
	const isLoggedIn = !!user

	const handleSignOut = async () => {
		await signOut()
		router.push('/')
	}

	const handleSignIn = () => {
		router.push('/auth')
	}

	return (
		<div className="min-h-screen bg-stone-50">
			{/* Navigation Bar */}
			<nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-14">
						{/* Logo/Brand - smaller for nav */}
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-stone-200/50">
								<Image
									src="/logo.svg"
									alt="Pai's Taste Food Special"
									width={120}
									height={87}
									className="scale-75"
								/>
							</div>
							{isLoggedIn && 
								<Link href="/account" className="hidden sm:block">
									<h2 className="text-lg font-bold text-stone-800">Pai's Taste</h2>
									<p className="text-xs text-stone-600">Welcome, {getDisplayName()}</p>
								</Link>
							}
						</div>

						{/* Navigation Items */}
						<div className="flex items-center space-x-3">
							{isLoggedIn ? (
								<>
									{/* Quick access to orders */}
									<Link href="/account/orders">
										<Button variant="ghost" size="sm" className="flex items-center gap-2">
											<Package className="w-4 h-4" />
											<span className="hidden sm:inline">My Orders</span>
										</Button>
									</Link>

									{/* Account dropdown trigger */}
									<Link href="/account">
										<Button variant="ghost" size="sm" className="flex items-center gap-2">
											<User className="w-4 h-4" />
										</Button>
									</Link>

									{/* Sign out */}
									<Button
										onClick={handleSignOut}
										variant="outline"
										size="sm"
										className="flex items-center gap-2"
									>
										<LogOut className="w-4 h-4" />
										<span className="hidden sm:inline">Sign Out</span>
									</Button>
								</>
							) : (
								<Button
									onClick={handleSignIn}
									variant="default"
									size="sm"
									className="flex items-center gap-2 bg-stone-700 hover:bg-stone-800"
								>
									<User className="w-4 h-4" />
									<span>Sign In</span>
								</Button>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<header className="text-center mb-8">
					<Image
						src="/logo.svg"
						alt="Pai's Taste Food Special"
						width={300}
						height={215}
						className="mx-auto mb-4"
					/>
					<p className="text-stone-600">
						Traditional South African cuisine for pickup
					</p>
					<p className="text-stone-500 mt-2">
						📍 Montana, Sinoville & Annlin | 📞 +27 81 454 1020
					</p>
				</header>
				<MenuGrid />
			</div>
		</div>
	)
}