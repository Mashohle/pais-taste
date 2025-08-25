"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingCartIcon, Package } from "lucide-react"
import { useMenuItems } from '@/lib/hooks/use-menu-items'
import { ShoppingCart } from "@/components/cart"
import { useCart } from '@/lib/contexts/cart-context'
import { useState, useEffect, useMemo } from 'react'

interface ProcessedGroup {
	id: string
	name: string
	description: string
	image: string
	traditional: {
		name: string
		price: number
		description: string
		image_url?: string
		available: boolean
		published: boolean
	}
	combo: {
		name: string
		price: number
		description: string
		image_url?: string
		available: boolean
		published: boolean
	}
}

export function MenuGrid() {
	const { items, loading, error } = useMenuItems()
	const { state, addItem, setCartOpen } = useCart()
	const [processedGroups, setProcessedGroups] = useState<ProcessedGroup[]>([])

	// Process menu items into groups whenever items change
	useEffect(() => {
		if (items.length === 0) {
			setProcessedGroups([])
			return
		}

		const newProcessedGroups: ProcessedGroup[] = items
			.filter(item => item.category === 'Traditional Dishes' && item.published)
			.map(item => {
				const comboItem = items.find(combo =>
					combo.category === 'Combo Meals' &&
					combo.name.toLowerCase().includes(item.name.toLowerCase()) &&
					combo.published
				)

				return {
					id: item.name.toLowerCase().replace(/\s+/g, '-'),
					name: item.name.toUpperCase(),
					description: item.description || 'Traditional South African dish',
					image: item.image_url || `/south-african-${item.name.toLowerCase().replace(/\s+/g, '-')}.png`,
					traditional: {
						name: item.name,
						price: item.price,
						description: item.description || 'Traditional preparation',
						image_url: item.image_url || undefined, // Convert null to undefined
						available: item.available,
						published: item.published
					},
					combo: {
						name: comboItem?.name || `${item.name} & Pap`,
						price: comboItem?.price || item.combo_price || 100,
						description: comboItem?.description || `${item.name} with pap`,
						image_url: comboItem?.image_url || undefined, // Convert null to undefined
						available: comboItem?.available ?? true,
						published: comboItem?.published ?? true
					}
				}
			})

		setProcessedGroups(newProcessedGroups)
	}, [items])

	// Memoized counts for performance
	const itemCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		state.items.forEach(item => {
			counts[item.id] = (counts[item.id] || 0) + item.quantity
		})
		return counts
	}, [state.items])

	const totalItems = useMemo(() =>
		state.items.reduce((sum, item) => sum + item.quantity, 0)
		, [state.items])

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-stone-300 rounded w-1/4 mx-auto"></div>
					<div className="text-stone-600">Loading delicious menu...</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center py-8 text-red-600">
				<div className="space-y-2">
					<div>❌ Error loading menu</div>
					<div className="text-sm">{error}</div>
					<Button
						onClick={() => window.location.reload()}
						variant="outline"
						size="sm"
					>
						Try Again
					</Button>
				</div>
			</div>
		)
	}

	if (processedGroups.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="space-y-4">
					<Package className="w-16 h-16 text-stone-400 mx-auto" />
					<div className="text-stone-600 text-lg">No menu items available</div>
					<div className="text-stone-500 text-sm">Please check back later</div>
				</div>
			</div>
		)
	}

	const handleAddToCart = (group: ProcessedGroup, type: "traditional" | "combo") => {
		const item = type === "traditional" ? group.traditional : group.combo

		// Check if item is available
		if (!item.available) {
			alert(`Sorry, ${item.name} is currently out of stock.`)
			return
		}

		addItem({
			id: `${group.id}-${type}`,
			name: item.name,
			price: item.price,
			type: type
		})
	}

	const getItemCount = (groupId: string, type: "traditional" | "combo") => {
		return itemCounts[`${groupId}-${type}`] || 0
	}

	const isItemAvailable = (item: ProcessedGroup['traditional'] | ProcessedGroup['combo']) => {
		return item.available && item.published
	}

	return (
		<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 opacity-20">
					{/* Traditional African geometric patterns - Extended coverage */}
					<svg
						className="absolute top-10 right-4 sm:right-8 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-stone-600 opacity-50"
						viewBox="0 0 100 100"
					>
						<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
						<circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
						<circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
						<path d="M20 50 L80 50 M50 20 L50 80" stroke="currentColor" strokeWidth="1" opacity="0.6" />
					</svg>

					<svg
						className="absolute top-48 right-8 sm:right-16 w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 text-stone-500 opacity-45"
						viewBox="0 0 100 100"
					>
						<polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
						<polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
					</svg>

					<svg
						className="absolute top-24 right-12 sm:right-24 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 text-stone-600 opacity-40"
						viewBox="0 0 100 100"
					>
						<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
						<rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
						<circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.5" />
					</svg>

					<svg
						className="absolute top-80 right-2 sm:right-4 w-14 sm:w-16 lg:w-18 h-14 sm:h-16 lg:h-18 text-stone-500 opacity-35"
						viewBox="0 0 100 100"
					>
						<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
						<circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
						<circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.3" />
						<path d="M20 50 L80 50 M50 20 L50 80" stroke="currentColor" strokeWidth="1" opacity="0.5" />
					</svg>

					{/* Traditional pottery/vessel silhouettes - More coverage */}
					<svg
						className="absolute top-120 right-3 sm:right-6 w-14 sm:w-16 lg:w-18 h-18 sm:h-20 lg:h-24 text-stone-600 opacity-30"
						viewBox="0 0 60 80"
					>
						<path
							d="M15 20 Q15 10 30 10 Q45 10 45 20 L45 60 Q45 70 30 70 Q15 70 15 60 Z"
							fill="currentColor"
							opacity="0.4"
						/>
						<ellipse cx="30" cy="15" rx="12" ry="3" fill="none" stroke="currentColor" strokeWidth="1" />
					</svg>

					<svg
						className="absolute top-160 right-10 sm:right-20 w-12 sm:w-14 h-14 sm:h-18 text-stone-500 opacity-35"
						viewBox="0 0 50 70"
					>
						<path
							d="M10 15 Q10 5 25 5 Q40 5 40 15 L38 50 Q38 60 25 60 Q12 60 12 50 Z"
							fill="currentColor"
							opacity="0.3"
						/>
						<line x1="10" y1="15" x2="40" y2="15" stroke="currentColor" strokeWidth="1" />
					</svg>

					<svg
						className="absolute top-200 right-4 sm:right-8 w-12 sm:w-14 lg:w-16 h-16 sm:h-18 lg:h-20 text-stone-600 opacity-40"
						viewBox="0 0 60 80"
					>
						<path
							d="M15 20 Q15 10 30 10 Q45 10 45 20 L45 60 Q45 70 30 70 Q15 70 15 60 Z"
							fill="currentColor"
							opacity="0.3"
						/>
						<ellipse cx="30" cy="15" rx="12" ry="3" fill="none" stroke="currentColor" strokeWidth="1" />
					</svg>

					{/* Grain/seed patterns - Extended */}
					<div className="absolute top-64 right-14 sm:right-28 space-y-1">
						<div className="w-1 h-4 bg-stone-600 opacity-45 rounded-full"></div>
						<div className="w-1 h-3 bg-stone-500 opacity-40 rounded-full ml-1"></div>
						<div className="w-1 h-5 bg-stone-600 opacity-35 rounded-full"></div>
					</div>

					<div className="absolute top-96 right-16 sm:right-32 space-y-1">
						<div className="w-1 h-3 bg-stone-500 opacity-40 rounded-full"></div>
						<div className="w-1 h-4 bg-stone-600 opacity-45 rounded-full ml-1"></div>
						<div className="w-1 h-3 bg-stone-600 opacity-45 rounded-full ml-0.5"></div>
					</div>

					<div className="absolute top-144 right-12 sm:right-24 space-y-1">
						<div className="w-1 h-2 bg-stone-600 opacity-40 rounded-full"></div>
						<div className="w-1 h-4 bg-stone-500 opacity-35 rounded-full ml-1"></div>
						<div className="w-1 h-3 bg-stone-600 opacity-45 rounded-full"></div>
					</div>

					{/* Traditional weaving pattern lines - Extended coverage */}
					<div className="absolute top-16 right-0 w-24 sm:w-32 lg:w-48 h-0.5 bg-gradient-to-l from-stone-600/50 to-transparent"></div>
					<div className="absolute top-32 right-4 sm:right-8 w-20 sm:w-28 lg:w-40 h-0.5 bg-gradient-to-l from-stone-500/40 to-transparent"></div>
					<div className="absolute top-56 right-6 sm:right-12 w-28 sm:w-40 lg:w-56 h-0.5 bg-gradient-to-l from-stone-600/45 to-transparent"></div>
					<div className="absolute top-72 right-2 sm:right-4 w-16 sm:w-24 lg:w-32 h-0.5 bg-gradient-to-l from-stone-500/35 to-transparent"></div>
					<div className="absolute top-104 right-8 sm:right-16 w-22 sm:w-32 lg:w-44 h-0.5 bg-gradient-to-l from-stone-600/40 to-transparent"></div>
					<div className="absolute top-128 right-1 sm:right-2 w-18 sm:w-26 lg:w-36 h-0.5 bg-gradient-to-l from-stone-500/45 to-transparent"></div>
					<div className="absolute top-152 right-10 sm:right-20 w-26 sm:w-38 lg:w-52 h-0.5 bg-gradient-to-l from-stone-600/35 to-transparent"></div>
					<div className="absolute top-176 right-3 sm:right-6 w-14 sm:w-20 lg:w-28 h-0.5 bg-gradient-to-l from-stone-500/40 to-transparent"></div>
					<div className="absolute top-192 right-7 sm:right-14 w-24 sm:w-36 lg:w-48 h-0.5 bg-gradient-to-l from-stone-600/45 to-transparent"></div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
				{processedGroups.map((group, index) => (
					<div key={group.id} className="relative">
						<div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-stone-200/50 overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 to-transparent rounded-t-2xl"></div>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 rounded-2xl"></div>

							<div className="relative flex flex-col items-center text-center space-y-4">
								<div className="flex-shrink-0">
									<div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl backdrop-blur-sm relative">
										<div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/5 rounded-full z-10"></div>
										<img
											src={group.image || "/placeholder.svg"}
											alt={group.name}
											className="w-full h-full object-cover scale-110 hover:scale-115 transition-transform duration-300"
										/>
										<div className="absolute inset-0 ring-1 ring-stone-300/30 rounded-full"></div>
									</div>
								</div>

								<div className="space-y-2">
									<h3 className="text-xl sm:text-2xl font-bold text-stone-800 drop-shadow-sm">{group.name}</h3>
									<p className="text-stone-700 text-xs sm:text-sm leading-relaxed max-w-sm">{group.description}</p>
								</div>

								<div className="w-full space-y-3">
									{/* Traditional Item Card with Image */}
									{/* Traditional Item Card with Enhanced Layout */}
									<div className={`relative backdrop-blur-sm rounded-xl p-3 sm:p-4 border shadow-lg overflow-hidden transition-all duration-200 ${isItemAvailable(group.traditional)
											? 'bg-white/85 border-stone-200/60 hover:shadow-xl'
											: 'bg-stone-100/60 border-stone-300/40'
										}`}>
										<div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-xl"></div>
										<div className="relative">
											<div className="flex space-x-4">
												{/* Item Image - 25% */}
												<div className={`w-1/4 aspect-square rounded-lg overflow-hidden border-2 shadow-md flex-shrink-0 ${isItemAvailable(group.traditional)
														? 'border-white/90 bg-stone-50'
														: 'border-stone-300/60 bg-stone-200/60'
													}`}>
													{group.traditional.image_url ? (
														<img
															src={group.traditional.image_url}
															alt={group.traditional.name}
															className={`w-full h-full object-cover transition-all duration-200 ${!isItemAvailable(group.traditional) ? 'grayscale opacity-60' : ''
																}`}
															onError={(e) => {
																(e.target as HTMLImageElement).src = "/placeholder.svg"
															}}
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-stone-400">
															<Package className="w-6 h-6" />
														</div>
													)}
												</div>

												{/* Item Content - 75% */}
												<div className="flex-1 flex flex-col justify-between min-h-0">
													{/* Title Section */}
													<div className="mb-3">
														<div className="flex items-start justify-between mb-1">
															<h4 className={`font-bold text-base sm:text-lg leading-tight ${isItemAvailable(group.traditional) ? 'text-stone-800' : 'text-stone-500'
																}`}>
																{group.traditional.name}
															</h4>
															{/* Out of stock badge in top right */}
															{!isItemAvailable(group.traditional) && (
																<span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md border border-red-200 ml-2 whitespace-nowrap">
																	Out of Stock
																</span>
															)}
														</div>

														{/* Description */}
														<p className={`text-sm leading-relaxed text-left ${isItemAvailable(group.traditional) ? 'text-stone-600' : 'text-stone-400'
															}`}>
															{group.traditional.description}
														</p>
													</div>

													{/* Price Section */}
													<div className="mb-3">
														<div className="flex items-center gap-2">
															<span className={`font-bold text-lg ${isItemAvailable(group.traditional) ? 'text-stone-800' : 'text-stone-500'
																}`}>
																R{group.traditional.price}
															</span>
														</div>
													</div>

													{/* Button */}
													<Button
														onClick={() => handleAddToCart(group, "traditional")}
														size="sm"
														disabled={!isItemAvailable(group.traditional)}
														className={`w-full text-sm font-medium shadow-lg transition-all duration-200 ${isItemAvailable(group.traditional)
																? 'bg-stone-700 hover:bg-stone-800 text-white hover:shadow-xl hover:scale-[1.02]'
																: 'bg-stone-300 text-stone-500 cursor-not-allowed'
															}`}
													>
														<Plus className="w-4 h-4 mr-2" />
														{isItemAvailable(group.traditional) ? 'Add to Cart' : 'Out of Stock'}
														{getItemCount(group.id, "traditional") > 0 && (
															<Badge className="ml-2 bg-stone-100 text-stone-800 text-xs font-bold">
																{getItemCount(group.id, "traditional")}
															</Badge>
														)}
													</Button>
												</div>
											</div>
										</div>
									</div>

									{/* Combo Item Card with Enhanced Layout */}
									<div className={`relative backdrop-blur-sm rounded-xl p-3 sm:p-4 border shadow-lg overflow-hidden transition-all duration-200 ${isItemAvailable(group.combo)
											? 'bg-white/85 border-stone-200/60 hover:shadow-xl'
											: 'bg-stone-100/60 border-stone-300/40'
										}`}>
										<div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-xl"></div>
										<div className="relative">
											<div className="flex space-x-4">
												{/* Item Image - 25% */}
												<div className={`w-1/4 aspect-square rounded-lg overflow-hidden border-2 shadow-md flex-shrink-0 ${isItemAvailable(group.combo)
														? 'border-white/90 bg-stone-50'
														: 'border-stone-300/60 bg-stone-200/60'
													}`}>
													{group.combo.image_url ? (
														<img
															src={group.combo.image_url}
															alt={group.combo.name}
															className={`w-full h-full object-cover transition-all duration-200 ${!isItemAvailable(group.combo) ? 'grayscale opacity-60' : ''
																}`}
															onError={(e) => {
																(e.target as HTMLImageElement).src = "/placeholder.svg"
															}}
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-stone-400">
															<Package className="w-6 h-6" />
														</div>
													)}
												</div>

												{/* Item Content - 75% */}
												<div className="flex-1 flex flex-col justify-between min-h-0">
													{/* Title Section */}
													<div className="mb-1">
														<div className="flex items-start justify-between">
															<h4 className={`font-bold text-base sm:text-lg leading-tight ${isItemAvailable(group.combo) ? 'text-stone-800' : 'text-stone-500'
																}`}>
																{group.combo.name}
															</h4>
															{/* Sale Badge - Future feature */}
															{/* {group.combo.onSale && (
																<Badge className="ml-2 bg-red-500 text-white text-xs animate-pulse">
																	SALE
																</Badge>
															)} */}
														</div>
														{!isItemAvailable(group.combo) && (
															<span className="text-xs text-red-600 font-medium">Out of Stock</span>
														)}
													</div>

													{/* Description */}
													<p className={`text-sm leading-relaxed mb-3 text-left ${isItemAvailable(group.combo) ? 'text-stone-600' : 'text-stone-400'
														}`}>
														{group.combo.description}
													</p>

													{/* Price Section with Sale Support */}
													<div className="mb-3">
														<div className="flex items-center gap-2">
															{/* Regular Price or Sale Price */}
															<span className={`font-bold text-lg ${isItemAvailable(group.combo) ? 'text-stone-800' : 'text-stone-500'
																}`}>
																R{group.combo.price}
															</span>

															{/* Original Price (crossed out during sale) - Future feature */}
															{/* {group.combo.originalPrice && group.combo.originalPrice > group.combo.price && (
																<span className="text-sm text-stone-400 line-through">
																	R{group.combo.originalPrice}
																</span>
															)} */}

															{/* Discount Percentage - Future feature */}
															{/* {group.combo.discountPercent && (
																<Badge className="bg-green-500 text-white text-xs">
																	{group.combo.discountPercent}% OFF
																</Badge>
															)} */}
														</div>
													</div>

													{/* Button */}
													<Button
														onClick={() => handleAddToCart(group, "combo")}
														size="sm"
														disabled={!isItemAvailable(group.combo)}
														className={`w-full text-sm font-medium shadow-lg transition-all duration-200 ${isItemAvailable(group.combo)
																? 'bg-stone-700 hover:bg-stone-800 text-white hover:shadow-xl hover:scale-[1.02]'
																: 'bg-stone-300 text-stone-500 cursor-not-allowed'
															}`}
													>
														<Plus className="w-4 h-4 mr-2" />
														{isItemAvailable(group.combo) ? 'Add to Cart' : 'Out of Stock'}
														{getItemCount(group.id, "combo") > 0 && (
															<Badge className="ml-2 bg-stone-100 text-stone-800 text-xs font-bold">
																{getItemCount(group.id, "combo")}
															</Badge>
														)}
													</Button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div >

			{/* Cart Button */}
			{
				totalItems > 0 && (
					<div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-stone-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-white backdrop-blur-sm z-50">
						<button
							onClick={() => setCartOpen(true)}
							className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
						>
							<ShoppingCartIcon className="w-4 h-4" />
							<span className="font-semibold text-sm sm:text-base">Cart: {totalItems} items</span>
						</button>
					</div>
				)
			}

			<ShoppingCart isOpen={state.isOpen} onClose={() => setCartOpen(false)} />
		</div >
	)
}