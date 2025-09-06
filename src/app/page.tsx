"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Star, ChevronRight, Utensils, ShoppingBag, Wrench, Car, Scissors, Home, Filter, Menu, User, Heart, ShoppingCart } from "lucide-react"
import Link from 'next/link'
import { DynamicIcon } from '@/lib/utils/icon-mapper'

// Dynamic Content API Response Interface (to be consumed from super admin portal)
interface DynamicScreenContent {
  screen_id: string
  screen_type: 'home' | 'category' | 'business_detail' | 'custom'
  layout: {
    sections: Array<{
      type: 'hero' | 'carousel' | 'grid' | 'list' | 'featured' | 'banner' | 'search'
      config: any
      content: any
    }>
  }
  metadata: {
    title: string
    description: string
    last_updated: string
  }
}

// Mock business data for the placeholder
const mockBusinesses = [
  {
    id: '1',
    name: "Pai's Taste Food Special",
    category: 'food',
    category_name: 'Food & Dining',
    description: 'Authentic South African traditional cuisine',
    image_url: null,
    rating: 4.8,
    review_count: 127,
    address: 'Johannesburg, South Africa',
    is_open: true,
    estimated_time: '25-30 min',
    delivery_fee: 25.00,
    minimum_order: 80.00,
    featured: true
  },
  {
    id: '2',
    name: 'Elite Car Wash & Detail',
    category: 'car_wash',
    category_name: 'Car Services',
    description: 'Professional car washing and detailing services',
    image_url: null,
    rating: 4.6,
    review_count: 89,
    address: 'Cape Town, South Africa',
    is_open: true,
    estimated_time: '45-60 min',
    delivery_fee: 0,
    minimum_order: 150.00,
    featured: true
  },
  {
    id: '3',
    name: 'Trendy Cuts Salon',
    category: 'salon',
    category_name: 'Beauty & Wellness',
    description: 'Modern hair styling and beauty treatments',
    image_url: null,
    rating: 4.9,
    review_count: 156,
    address: 'Durban, South Africa',
    is_open: false,
    estimated_time: '60-90 min',
    delivery_fee: 0,
    minimum_order: 200.00,
    featured: false
  }
]

const categories = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils', color: 'bg-orange-100 text-orange-700', count: 24 },
  { id: 'retail', name: 'Shopping', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-700', count: 18 },
  { id: 'service', name: 'Services', icon: 'wrench', color: 'bg-green-100 text-green-700', count: 12 },
  { id: 'car_wash', name: 'Car Care', icon: 'car', color: 'bg-purple-100 text-purple-700', count: 8 },
  { id: 'salon', name: 'Beauty', icon: 'scissors', color: 'bg-pink-100 text-pink-700', count: 15 },
  { id: 'home', name: 'Home Services', icon: 'home', color: 'bg-indigo-100 text-indigo-700', count: 9 }
]

export default function CustomerPortalHome() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dynamicContent, setDynamicContent] = useState<DynamicScreenContent | null>(null)
  const [isLoadingDynamicContent, setIsLoadingDynamicContent] = useState(true)

  // Simulate fetching dynamic content from super admin portal
  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        // This will eventually call your super admin API
        // const response = await fetch('/api/dynamic-content/home')
        // const content = await response.json()
        
        // For now, simulate no dynamic content configured
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDynamicContent(null) // No content configured yet
      } catch (error) {
        console.error('Failed to load dynamic content:', error)
        setDynamicContent(null)
      } finally {
        setIsLoadingDynamicContent(false)
      }
    }

    fetchDynamicContent()
  }, [])

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Dynamic Content Renderer (placeholder for super admin built screens)
  const renderDynamicContent = () => {
    if (isLoadingDynamicContent) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-700">Loading personalized experience...</p>
          </div>
        </div>
      )
    }

    if (dynamicContent) {
      // This will render the dynamic content built by super admin
      return (
        <div className="min-h-screen">
          {/* Dynamic screen renderer will go here */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Dynamic Content Screen</h1>
            <p className="text-blue-100">Content ID: {dynamicContent.screen_id}</p>
            <p className="text-blue-100">Built with Super Admin Portal</p>
          </div>
          {/* Dynamic sections will be rendered here based on dynamicContent.layout */}
        </div>
      )
    }

    // Fallback to default static layout when no dynamic content is configured
    return null
  }

  // If dynamic content exists, render it instead of default layout
  const dynamicScreen = renderDynamicContent()
  if (dynamicScreen) {
    return dynamicScreen
  }

  // Default static layout (fallback when no dynamic content configured)
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                LocalHub
              </div>
              <Badge variant="secondary" className="text-xs">
                Customer Portal
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-4">
            Discover Local Businesses
          </h1>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            Order food, book services, shop local products - all in one place
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for businesses, food, services..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'ring-2 ring-stone-400' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3`}>
                    <DynamicIcon name={category.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-1">{category.name}</h3>
                  <p className="text-sm text-stone-600">{category.count} businesses</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Businesses */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone-800">
              {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Businesses` : 'Featured Businesses'}
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-48 bg-gradient-to-r from-stone-200 to-stone-300 rounded-t-lg flex items-center justify-center">
                    <DynamicIcon name={categories.find(c => c.id === business.category)?.icon || 'building'} className="w-12 h-12 text-stone-600" />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-stone-800">{business.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{business.rating}</span>
                        <span className="text-xs text-gray-500">({business.review_count})</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-stone-600 mb-3">{business.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-stone-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{business.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={business.is_open ? "default" : "secondary"}>
                          {business.is_open ? 'Open' : 'Closed'}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-stone-600">
                          <Clock className="w-3 h-3" />
                          <span>{business.estimated_time}</span>
                        </div>
                      </div>
                      
                      <Link href={`/business/${business.id}`}>
                        <Button size="sm">
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    
                    {business.delivery_fee > 0 && (
                      <div className="mt-2 text-xs text-stone-500">
                        Delivery: R{business.delivery_fee} • Min order: R{business.minimum_order}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-800 mb-2">No businesses found</h3>
              <p className="text-stone-600">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or category filter.' 
                  : 'Check back later for new businesses in your area.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Business Application CTA */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-12">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">Join LocalHub as a Business Partner</h3>
            <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
              Ready to grow your business? Join thousands of South African businesses already serving customers through LocalHub. 
              Get access to new customers, manage orders efficiently, and boost your revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Apply as a Business
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/business-info">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-stone-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>5.5% commission only</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Quick 3-day approval</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Free to join</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice for Dynamic Content */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Menu className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Dynamic Content System</h3>
            <p className="text-stone-600 mb-4">
              This page will soon feature dynamic content screens built with our Super Admin Portal. 
              Create custom layouts, carousels, promotions, and business showcases.
            </p>
            <Badge variant="outline" className="bg-white">
              Coming in Phase 4
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}