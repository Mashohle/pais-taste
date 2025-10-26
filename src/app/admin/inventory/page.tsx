"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Package, TrendingUp, TrendingDown, Plus, Search, Edit2, History, RefreshCw, FileText } from "lucide-react"
import { useBusiness } from '@/lib/contexts/business-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock data - replace with real data from hooks
const mockInventory = [
    {
        id: '1',
        product_id: '1',
        product_name: 'Summer Dress - Floral',
        sku: 'SD-001',
        variant: 'Size M, Blue',
        current_stock: 25,
        reserved_stock: 3,
        available_stock: 22,
        low_stock_threshold: 10,
        reorder_point: 15,
        reorder_quantity: 50,
        unit_cost: 150.00,
        total_value: 3750.00,
        last_restock: '2024-01-10',
        last_updated: '2024-01-14T14:30:00Z',
        location: 'Warehouse A - Shelf 12',
        supplier: 'Fashion Wholesale Co',
        status: 'in_stock'
    },
    {
        id: '2',
        product_id: '2',
        product_name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-202',
        variant: 'Black',
        current_stock: 5,
        reserved_stock: 2,
        available_stock: 3,
        low_stock_threshold: 10,
        reorder_point: 8,
        reorder_quantity: 25,
        unit_cost: 450.00,
        total_value: 2250.00,
        last_restock: '2024-01-05',
        last_updated: '2024-01-14T16:45:00Z',
        location: 'Electronics Section',
        supplier: 'Tech Distributors Ltd',
        status: 'low_stock'
    },
    {
        id: '3',
        product_id: '3',
        product_name: 'Organic Green Tea - 100g',
        sku: 'OGT-100',
        variant: 'Original',
        current_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
        low_stock_threshold: 5,
        reorder_point: 10,
        reorder_quantity: 100,
        unit_cost: 35.00,
        total_value: 0.00,
        last_restock: '2023-12-20',
        last_updated: '2024-01-12T09:15:00Z',
        location: 'Food & Beverage - Row 3',
        supplier: 'Organic Suppliers SA',
        status: 'out_of_stock'
    }
]

const mockStockMovements = [
    {
        id: '1',
        inventory_id: '1',
        product_name: 'Summer Dress - Floral',
        movement_type: 'sale',
        quantity: -2,
        reason: 'Customer purchase',
        reference: 'ORD-001',
        created_at: '2024-01-14T14:30:00Z',
        staff_name: 'Admin User'
    },
    {
        id: '2',
        inventory_id: '2',
        product_name: 'Wireless Bluetooth Headphones',
        movement_type: 'restock',
        quantity: 15,
        reason: 'Supplier delivery',
        reference: 'PO-123',
        created_at: '2024-01-12T11:20:00Z',
        staff_name: 'Admin User'
    },
    {
        id: '3',
        inventory_id: '1',
        product_name: 'Summer Dress - Floral',
        movement_type: 'adjustment',
        quantity: -1,
        reason: 'Damaged item',
        reference: 'ADJ-001',
        created_at: '2024-01-11T16:45:00Z',
        staff_name: 'Staff User'
    }
]

const mockAlerts = [
    {
        id: '1',
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: 'Wireless Bluetooth Headphones (WBH-202) is running low on stock',
        severity: 'warning',
        created_at: '2024-01-14T16:45:00Z',
        acknowledged: false,
        inventory_id: '2'
    },
    {
        id: '2',
        type: 'out_of_stock',
        title: 'Out of Stock',
        message: 'Organic Green Tea - 100g (OGT-100) is out of stock',
        severity: 'critical',
        created_at: '2024-01-12T09:15:00Z',
        acknowledged: false,
        inventory_id: '3'
    }
]

export default function InventoryPage() {
    const { currentBusiness } = useBusiness()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedSupplier, setSelectedSupplier] = useState('all')
    const [inventory] = useState(mockInventory)
    const [stockMovements] = useState(mockStockMovements)
    const [alerts] = useState(mockAlerts)
    const [activeTab, setActiveTab] = useState('inventory')
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<typeof mockInventory[0] | null>(null)

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
                    <h2 className="text-xl font-bold text-stone-800 mb-4">Inventory for Retail Only</h2>
                    <p className="text-stone-600">This page is only available for retail businesses.</p>
                </div>
            </div>
        )
    }

    // Filter inventory based on search and filters
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.variant.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
        const matchesSupplier = selectedSupplier === 'all' || item.supplier === selectedSupplier
        
        return matchesSearch && matchesStatus && matchesSupplier
    })

    // Calculate stats
    const stats = {
        total_items: inventory.length,
        low_stock_items: inventory.filter(i => i.current_stock <= i.low_stock_threshold && i.current_stock > 0).length,
        out_of_stock_items: inventory.filter(i => i.current_stock === 0).length,
        total_value: inventory.reduce((sum, i) => sum + i.total_value, 0),
        pending_alerts: alerts.filter(a => !a.acknowledged).length
    }

    const getStockStatus = (item: typeof mockInventory[0]) => {
        if (item.current_stock === 0) {
            return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> }
        } else if (item.current_stock <= item.low_stock_threshold) {
            return { status: 'Low Stock', color: 'bg-amber-100 text-amber-800', icon: <AlertTriangle className="w-3 h-3" /> }
        } else if (item.current_stock <= item.reorder_point) {
            return { status: 'Reorder Soon', color: 'bg-yellow-100 text-yellow-800', icon: <RefreshCw className="w-3 h-3" /> }
        } else {
            return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: <Package className="w-3 h-3" /> }
        }
    }

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'sale':
                return <TrendingDown className="w-4 h-4 text-red-600" />
            case 'restock':
                return <TrendingUp className="w-4 h-4 text-green-600" />
            case 'adjustment':
                return <Edit2 className="w-4 h-4 text-blue-600" />
            default:
                return <Package className="w-4 h-4 text-gray-600" />
        }
    }

    const getAlertSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'warning':
                return 'bg-amber-100 text-amber-800 border-amber-200'
            case 'info':
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }

    const handleStockAdjustment = (item: typeof mockInventory[0]) => {
        setSelectedItem(item)
        setIsAdjustmentOpen(true)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const suppliers = Array.from(new Set(inventory.map(i => i.supplier)))

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-stone-200/50 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                                {currentBusiness.name} - Inventory Management
                            </h1>
                            <p className="text-stone-600 text-sm">Track stock levels, movements, and manage inventory alerts</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-3">
                            <Link href="/admin/inventory/reports">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Reports
                                </Button>
                            </Link>
                            <Button className="flex items-center gap-2" onClick={() => setSelectedItem(null)}>
                                <Plus className="w-4 h-4" />
                                Add Item
                            </Button>
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
                                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                                    <p className="text-2xl font-bold">{stats.total_items}</p>
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
                                    <p className="text-2xl font-bold">{stats.low_stock_items}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                    <p className="text-2xl font-bold">{stats.out_of_stock_items}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                                    <p className="text-2xl font-bold">R{stats.total_value.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Alerts</p>
                                    <p className="text-2xl font-bold">{stats.pending_alerts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts ({stats.pending_alerts})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="inventory" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Search Inventory</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                id="search"
                                                placeholder="Search by product name, SKU, or variant..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="supplier">Supplier</Label>
                                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Suppliers</SelectItem>
                                                {suppliers.map(supplier => (
                                                    <SelectItem key={supplier} value={supplier}>
                                                        {supplier}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="in_stock">In Stock</SelectItem>
                                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
                                <CardDescription>
                                    Monitor stock levels and manage inventory
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredInventory.map((item) => {
                                        const stockStatus = getStockStatus(item)
                                        
                                        return (
                                            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {item.product_name}
                                                                </h3>
                                                                <Badge className={`${stockStatus.color} flex items-center space-x-1`}>
                                                                    {stockStatus.icon}
                                                                    <span>{stockStatus.status}</span>
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                SKU: {item.sku} • Variant: {item.variant}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Location: {item.location} • Supplier: {item.supplier}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Last restocked: {new Date(item.last_restock).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-center">
                                                            <div className="text-lg font-semibold">{item.available_stock}</div>
                                                            <div className="text-xs text-gray-500">Available</div>
                                                            {item.reserved_stock > 0 && (
                                                                <div className="text-xs text-amber-600">({item.reserved_stock} reserved)</div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <div className="text-lg font-semibold">R{item.total_value.toFixed(2)}</div>
                                                            <div className="text-xs text-gray-500">Value</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleStockAdjustment(item)}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Link href={`/admin/inventory/${item.id}/history`}>
                                                                <Button variant="outline" size="sm">
                                                                    <History className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    
                                    {filteredInventory.length === 0 && (
                                        <div className="text-center py-12">
                                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || selectedStatus !== 'all' || selectedSupplier !== 'all'
                                                    ? 'Try adjusting your search or filters.'
                                                    : 'Get started by adding your first inventory item.'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="movements" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Stock Movements</CardTitle>
                                <CardDescription>
                                    Track all inventory changes and movements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stockMovements.map((movement) => (
                                        <div key={movement.id} className="flex items-center justify-between border rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                {getMovementIcon(movement.movement_type)}
                                                <div>
                                                    <h3 className="font-semibold">{movement.product_name}</h3>
                                                    <p className="text-sm text-gray-600">{movement.reason}</p>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(movement.created_at)} • {movement.staff_name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                                </div>
                                                {movement.reference && (
                                                    <div className="text-xs text-gray-500">
                                                        Ref: {movement.reference}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Alerts</CardTitle>
                                <CardDescription>
                                    Manage low stock and inventory alerts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className={`border rounded-lg p-4 ${getAlertSeverityColor(alert.severity)}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{alert.title}</h3>
                                                    <p className="text-sm">{alert.message}</p>
                                                    <div className="text-xs mt-1">
                                                        {formatDate(alert.created_at)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                                        {alert.severity}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {alerts.length === 0 && (
                                        <div className="text-center py-8">
                                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                                            <p className="mt-1 text-sm text-gray-500">All inventory levels are within normal thresholds.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Stock Adjustment Dialog */}
                <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Stock Adjustment</DialogTitle>
                            <DialogDescription>
                                Adjust inventory levels for {selectedItem?.product_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Current Stock: {selectedItem?.current_stock}</Label>
                            </div>
                            <div>
                                <Label htmlFor="adjustment">Adjustment Quantity</Label>
                                <Input
                                    id="adjustment"
                                    type="number"
                                    placeholder="Enter +/- quantity"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Explain the reason for this adjustment..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)}>
                                Cancel
                            </Button>
                            <Button>
                                Apply Adjustment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}