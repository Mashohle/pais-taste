// app/admin/menu/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Edit, Trash2, Plus, Eye, EyeOff, ChevronDown, Package } from "lucide-react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useMenuApi } from '@/lib/hooks'
import { usePageLoading } from '@/lib/hooks'

export default function MenuManagement() {
  // Use forAdmin=true to show all items in admin
  const { items: menuItems, loading, error, updateMenuItem, deleteMenuItem } = useMenuApi(true)
  // Coordinate loading with minimum duration
  const coordinatedLoading = usePageLoading(loading, 'menu')

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  const togglePublishedStatus = async (id: string, currentStatus: boolean) => {
    const success = await updateMenuItem(id, { published: !currentStatus })
    if (!success) {
      alert('Failed to update item published status. Please try again.')
    }
  }

  const toggleAvailableStatus = async (id: string, currentStatus: boolean) => {
    const success = await updateMenuItem(id, { available: !currentStatus })
    if (!success) {
      alert('Failed to update item availability. Please try again.')
    }
  }

  const handleDeleteItem = async (id: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      const success = await deleteMenuItem(id)
      if (!success) {
        alert('Failed to delete item. Please try again.')
      }
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories from the database
  const availableCategories = ["All Categories", ...Array.from(new Set(menuItems.map(item => item.category)))]

  // Show loading state with skeleton
  if (coordinatedLoading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Search and Filter Skeleton */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Menu Items Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white border border-stone-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Error loading menu items</div>
          <p className="text-stone-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Menu Management</h1>
            <p className="text-stone-600 mt-1">
              Manage your menu items • {menuItems.length} total items
            </p>
          </div>
          <Button
            className="bg-stone-700 hover:bg-stone-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => router.push('/admin/menu/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-stone-300 focus:border-stone-500"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border-stone-300 hover:bg-stone-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                {selectedCategory}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-stone-200/50 py-2 min-w-48 z-10">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category)
                        setIsFilterOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-100/80 text-stone-700 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-800">{menuItems.length}</div>
              <div className="text-stone-600 text-sm">Total Items</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{menuItems.filter(item => item.published).length}</div>
              <div className="text-green-600 text-sm">Published</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{menuItems.filter(item => item.published && item.available).length}</div>
              <div className="text-blue-600 text-sm">In Stock</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{menuItems.filter(item => item.published && !item.available).length}</div>
              <div className="text-red-600 text-sm">Out of Stock</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700">{availableCategories.length - 1}</div>
              <div className="text-amber-600 text-sm">Categories</div>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200"
            >

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-stone-800 mb-1">{item.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs text-stone-600 border-stone-400 bg-stone-50/80">
                        {item.category}
                      </Badge>
                      {item.combo_with && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-400 bg-blue-50/80">
                          Combo Available
                        </Badge>
                      )}
                      {item.published && !item.available && (
                        <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                          <Package className="w-3 h-3 mr-1" />
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-stone-300 hover:bg-stone-50"
                      onClick={() => router.push(`/admin/menu/edit/${item.id}`)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="bg-white/80 backdrop-blur-sm border-red-300/50 hover:bg-red-50/90 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <button
                      onClick={() => togglePublishedStatus(item.id, item.published)}
                      className={`p-1 rounded-full transition-colors ${
                        item.published
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                      }`}
                      title={item.published ? "Click to unpublish (hide from customers)" : "Click to publish (show to customers)"}
                    >
                      {item.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-600 line-clamp-3">
                      {item.description || "No description available"}
                    </p>
                    {item.combo_with && (
                      <p className="text-xs text-blue-600 mt-1">
                        Combo with: {item.combo_with}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={item.published ? "default" : "secondary"}
                      className={item.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}
                    >
                      {item.published ? "Published" : "Unpublished"}
                    </Badge>
                    {item.published && (
                      <button
                        onClick={() => toggleAvailableStatus(item.id, item.available)}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          item.available
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title={item.available ? "Click to mark out of stock" : "Click to mark in stock"}
                      >
                        {item.available ? "In Stock" : "Out of Stock"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-stone-700 text-white">R{item.price}</Badge>
                    {item.combo_price && (
                      <Badge className="bg-blue-700 text-white">R{item.combo_price}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
              <p className="text-stone-600 text-lg">No menu items found matching your criteria.</p>
              <p className="text-stone-500 text-sm mt-2">Try adjusting your search or filter settings.</p>
              {menuItems.length === 0 && (
                <Button
                  className="mt-4 bg-stone-700 hover:bg-stone-800 text-white"
                  onClick={() => router.push('/admin/menu/add')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Menu Item
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}