"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Edit2, Eye, Package, Plus, Search, ShoppingBag, Trash2, AlertCircle, TrendingUp } from "lucide-react"
import { useBusiness } from '@/lib/contexts/business-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock data - replace with real data from hooks
const mockProducts = [
    {
        id: '1',
        name: 'Summer Dress - Floral',
        sku: 'SD-001',
        category: 'Clothing',
        price: 299.99,
        cost_price: 150.00,
        stock_quantity: 25,
        low_stock_threshold: 10,
        is_featured: true,
        requires_shipping: true,
        published: true,
        variants: 3,
        image_url: null
    },
    {
        id: '2',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-202',
        category: 'Electronics',
        price: 899.99,
        cost_price: 450.00,
        stock_quantity: 5,
        low_stock_threshold: 10,
        is_featured: false,
        requires_shipping: true,
        published: true,
        variants: 2,
        image_url: null
    },
    {
        id: '3',
        name: 'Organic Green Tea - 100g',
        sku: 'OGT-100',
        category: 'Food & Beverages',
        price: 89.99,
        cost_price: 35.00,
        stock_quantity: 0,
        low_stock_threshold: 5,
        is_featured: false,
        requires_shipping: false,
        published: false,
        variants: 1,
        image_url: null
    }
]

const mockCategories = [
    { id: '1', name: 'Clothing', product_count: 15 },
    { id: '2', name: 'Electronics', product_count: 8 },
    { id: '3', name: 'Food & Beverages', product_count: 12 },
    { id: '4', name: 'Home & Garden', product_count: 6 }
]

export default function ProductsPage() {
    const { currentBusiness } = useBusiness()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [products] = useState(mockProducts)

    // Only show this page for retail businesses
    useEffect(() => {
        if (currentBusiness && currentBusiness.business_categories?.id !== 'retail') {
            router.push('/admin')
        }
    }, [currentBusiness, router])

    if (!currentBusiness || currentBusiness.business_categories?.id !== 'retail') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Retail Products Only</h2>
                    <p className="text-stone-600">This page is only available for retail businesses.</p>
                </div>
            </div>
        )
    }

    // Filter products based on search and filters
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        const matchesStatus = filterStatus === 'all' ||
                            (filterStatus === 'published' && product.published) ||
                            (filterStatus === 'draft' && !product.published) ||
                            (filterStatus === 'low_stock' && product.stock_quantity <= product.low_stock_threshold) ||
                            (filterStatus === 'out_of_stock' && product.stock_quantity === 0)
        
        return matchesSearch && matchesCategory && matchesStatus
    })

    // Calculate stats
    const stats = {
        total: products.length,
        published: products.filter(p => p.published).length,
        low_stock: products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length,
        out_of_stock: products.filter(p => p.stock_quantity === 0).length,
        featured: products.filter(p => p.is_featured).length
    }

    const getStockStatus = (product: typeof mockProducts[0]) => {
        if (product.stock_quantity === 0) {
            return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> }
        } else if (product.stock_quantity <= product.low_stock_threshold) {
            return { status: 'Low Stock', color: 'bg-amber-100 text-amber-800', icon: <AlertTriangle className="w-3 h-3" /> }
        } else {
            return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: <Package className="w-3 h-3" /> }
        }
    }

    const getMarginPercentage = (product: typeof mockProducts[0]) => {
        return ((product.price - product.cost_price) / product.price * 100).toFixed(1)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                                {currentBusiness.name} - Products
                            </h1>
                            <p className="text-stone-600 text-sm">Manage your product catalog and inventory</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-3">
                            <Link href="/admin/products/categories">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Categories
                                </Button>
                            </Link>
                            <Link href="/admin/products/add">
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Package className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Eye className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Published</p>
                                    <p className="text-2xl font-bold">{stats.published}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="h-8 w-8 text-amber-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                    <p className="text-2xl font-bold">{stats.low_stock}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                    <p className="text-2xl font-bold">{stats.out_of_stock}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Featured</p>
                                    <p className="text-2xl font-bold">{stats.featured}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Products</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {mockCategories.map(category => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Products</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Products ({filteredProducts.length})</CardTitle>
                        <CardDescription>
                            Manage your product inventory and catalog
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product)
                                const marginPercentage = getMarginPercentage(product)
                                
                                return (
                                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image Placeholder */}
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                                
                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {product.name}
                                                        </h3>
                                                        {product.is_featured && (
                                                            <Badge variant="secondary">Featured</Badge>
                                                        )}
                                                        {!product.published && (
                                                            <Badge variant="outline">Draft</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>SKU: {product.sku}</span>
                                                        <span>•</span>
                                                        <span>{product.category}</span>
                                                        <span>•</span>
                                                        <span>{product.variants} variant{product.variants !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Stock Status & Actions */}
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold">R{product.price}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {marginPercentage}% margin
                                                    </div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <Badge className={`${stockStatus.color} flex items-center space-x-1`}>
                                                        {stockStatus.icon}
                                                        <span>{product.stock_quantity}</span>
                                                    </Badge>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {stockStatus.status}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || selectedCategory !== 'all' || filterStatus !== 'all'
                                            ? 'Try adjusting your search or filters.'
                                            : 'Get started by creating your first product.'
                                        }
                                    </p>
                                    {(!searchTerm && selectedCategory === 'all' && filterStatus === 'all') && (
                                        <div className="mt-6">
                                            <Link href="/admin/products/add">
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Product
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}