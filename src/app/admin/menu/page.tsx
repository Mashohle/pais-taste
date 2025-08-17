// app/admin/menu/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Edit, Trash2, Plus, Eye, EyeOff, ChevronDown, ArrowLeft, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useMenuItems } from '@/lib/hooks/use-menu-items'
import Link from "next/link"

export default function MenuManagement() {
  // Use forAdmin=true to show all items in admin
  const { items: menuItems, loading, error, updateMenuItem, deleteMenuItem } = useMenuItems(true)
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading menu items...</p>
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
    <div className="relative min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative background - matching dashboard style */}
      <div className="fixed right-0 top-0 h-full w-48 sm:w-64 lg:w-96 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <svg className="absolute top-10 right-8 w-16 h-16 text-stone-600" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4" />
          </svg>
          <svg className="absolute top-48 right-16 w-14 h-14 text-stone-500" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,30 70,70 30,70" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header - matching dashboard style */}
        <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-2xl"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <Link 
                    href="/admin" 
                    className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 drop-shadow-sm">Menu Management</h1>
                <p className="text-stone-600 mt-1">
                  Manage your traditional South African dishes • {menuItems.length} total items
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
          </div>
        </div>

        {/* Search and Filter - stone theme */}
        <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-4 shadow-xl border border-stone-200/50 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-xl"></div>
          <div className="relative flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-stone-300/50 focus:border-stone-500"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-white/80 backdrop-blur-sm border-stone-300/50 hover:bg-white/90"
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

        {/* Stats - stone theme matching dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-stone-200/50">
            <div className="relative text-center">
              <div className="text-2xl font-bold text-stone-800">{menuItems.length}</div>
              <div className="text-stone-600 text-sm">Total Items</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-100/95 via-green-50/60 to-green-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-green-200/50">
            <div className="relative text-center">
              <div className="text-2xl font-bold text-green-800">{menuItems.filter(item => item.published).length}</div>
              <div className="text-green-700 text-sm">Published</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100/95 via-blue-50/60 to-blue-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-200/50">
            <div className="relative text-center">
              <div className="text-2xl font-bold text-blue-800">{menuItems.filter(item => item.published && item.available).length}</div>
              <div className="text-blue-700 text-sm">In Stock</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-100/95 via-red-50/60 to-red-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-red-200/50">
            <div className="relative text-center">
              <div className="text-2xl font-bold text-red-800">{menuItems.filter(item => item.published && !item.available).length}</div>
              <div className="text-red-700 text-sm">Out of Stock</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-100/95 via-amber-50/60 to-amber-25/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200/50">
            <div className="relative text-center">
              <div className="text-2xl font-bold text-amber-800">{availableCategories.length - 1}</div>
              <div className="text-amber-700 text-sm">Categories</div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid - stone theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="relative bg-gradient-to-br from-stone-100/95 via-stone-50/80 to-stone-100/60 backdrop-blur-xl border border-stone-200/50 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>

              <CardHeader className="relative pb-3">
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
                    <Badge className="bg-stone-700 text-white">R{item.price}</Badge>
                    {item.combo_price && (
                      <Badge className="bg-blue-700 text-white">R{item.combo_price}</Badge>
                    )}
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

              <CardContent className="relative">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/90 shadow-lg flex-shrink-0 bg-stone-50">
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-stone-300/50 hover:bg-white/90"
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State - stone theme */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="relative bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-xl p-8 shadow-xl border border-stone-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-xl"></div>
              <div className="relative">
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
          </div>
        )}
      </div>
    </div>
  )
}