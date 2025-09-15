"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Save, X, Settings } from "lucide-react"
import { useStatusConfig, StatusConfig } from '@/lib/hooks/use-status-config'
import { DynamicIcon } from '@/lib/utils/icon-mapper'

interface StatusManagerProps {
    statusType: 'order' | 'booking' | 'payment'
    title: string
    description: string
}

const colorOptions = [
    { value: 'bg-gray-100 text-gray-800', label: 'Gray', preview: 'bg-gray-100' },
    { value: 'bg-blue-100 text-blue-800', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-green-100 text-green-800', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-orange-100 text-orange-800', label: 'Orange', preview: 'bg-orange-100' },
    { value: 'bg-red-100 text-red-800', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-emerald-100 text-emerald-800', label: 'Emerald', preview: 'bg-emerald-100' }
]

const iconOptions = [
    'clock', 'check-circle', 'check-circle-2', 'x-circle', 'play-circle', 'pause-circle',
    'calendar', 'package', 'truck', 'credit-card', 'loader', 'rotate-ccw', 'user-x',
    'chef-hat', 'utensils-crossed', 'shopping-bag', 'scissors', 'car', 'home'
]

export function StatusManager({ statusType, title, description }: StatusManagerProps) {
    const { statuses, loading, error, upsertStatus, deleteStatus, reload } = useStatusConfig(statusType)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null)
    const [formData, setFormData] = useState<Partial<StatusConfig>>({
        status_name: '',
        status_value: '',
        color_class: 'bg-blue-100 text-blue-800',
        icon_name: 'circle',
        is_default: false,
        is_final: false,
        display_order: statuses.length + 1,
        description: ''
    })

    const handleOpenDialog = (status?: StatusConfig) => {
        if (status) {
            setEditingStatus(status)
            setFormData(status)
        } else {
            setEditingStatus(null)
            setFormData({
                status_name: '',
                status_value: '',
                color_class: 'bg-blue-100 text-blue-800',
                icon_name: 'circle',
                is_default: false,
                is_final: false,
                display_order: statuses.length + 1,
                description: ''
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingStatus(null)
        setFormData({
            status_name: '',
            status_value: '',
            color_class: 'bg-blue-100 text-blue-800',
            icon_name: 'circle',
            is_default: false,
            is_final: false,
            display_order: statuses.length + 1,
            description: ''
        })
    }

    const handleSave = async () => {
        if (!formData.status_name || !formData.status_value) {
            alert('Please provide both status name and value')
            return
        }

        // Generate status_value from status_name if not provided
        if (!formData.status_value && formData.status_name) {
            formData.status_value = formData.status_name.toLowerCase().replace(/\s+/g, '_')
        }

        const success = await upsertStatus(formData)
        if (success) {
            handleCloseDialog()
        } else {
            alert('Failed to save status. Please try again.')
        }
    }

    const handleDelete = async (status: StatusConfig) => {
        if (status.is_default) {
            alert('Cannot delete default status')
            return
        }

        if (confirm(`Are you sure you want to delete the status "${status.status_name}"?`)) {
            const success = await deleteStatus(status.id)
            if (!success) {
                alert('Failed to delete status. Please try again.')
            }
        }
    }

    const moveStatus = async (status: StatusConfig, direction: 'up' | 'down') => {
        const currentIndex = statuses.findIndex(s => s.id === status.id)
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        
        if (targetIndex < 0 || targetIndex >= statuses.length) return

        const targetStatus = statuses[targetIndex]
        
        // Swap display orders
        await upsertStatus({ 
            ...status, 
            display_order: targetStatus.display_order 
        })
        await upsertStatus({ 
            ...targetStatus, 
            display_order: status.display_order 
        })
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading status configurations...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                        {error && (
                            <div className="text-sm text-amber-600 mt-2">
                                Note: Using default statuses (customization saved locally)
                            </div>
                        )}
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Status
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingStatus ? 'Edit Status' : 'Add New Status'}
                                </DialogTitle>
                                <DialogDescription>
                                    Configure a custom status for your {statusType} workflow.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="status_name">Status Name</Label>
                                    <Input
                                        id="status_name"
                                        value={formData.status_name || ''}
                                        onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            status_name: e.target.value,
                                            status_value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        }))}
                                        placeholder="e.g., In Progress"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="status_value">Status Value (System)</Label>
                                    <Input
                                        id="status_value"
                                        value={formData.status_value || ''}
                                        onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            status_value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        }))}
                                        placeholder="e.g., in_progress"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="color_class">Color</Label>
                                    <Select 
                                        value={formData.color_class} 
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, color_class: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colorOptions.map(color => (
                                                <SelectItem key={color.value} value={color.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded ${color.preview}`} />
                                                        {color.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="icon_name">Icon</Label>
                                    <Select 
                                        value={formData.icon_name} 
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {iconOptions.map(icon => (
                                                <SelectItem key={icon} value={icon}>
                                                    <div className="flex items-center gap-2">
                                                        <DynamicIcon name={icon} className="w-4 h-4" />
                                                        {icon}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe when this status is used..."
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="is_final"
                                            checked={formData.is_final || false}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_final: checked }))}
                                        />
                                        <Label htmlFor="is_final">Final Status</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="is_default"
                                            checked={formData.is_default || false}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                                        />
                                        <Label htmlFor="is_default">Default Status</Label>
                                    </div>
                                </div>

                                {/* Preview */}
                                {formData.status_name && (
                                    <div className="border rounded-lg p-3">
                                        <Label className="text-sm text-gray-600">Preview:</Label>
                                        <div className="mt-1">
                                            <Badge className={`${formData.color_class} flex items-center gap-1 w-fit`}>
                                                <DynamicIcon name={formData.icon_name || 'circle'} className="w-3 h-3" />
                                                {formData.status_name}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseDialog}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Status
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {statuses.map((status, index) => (
                        <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-mono text-gray-500 w-6">
                                    {status.display_order}
                                </div>
                                <Badge className={`${status.color_class} flex items-center gap-1`}>
                                    <DynamicIcon name={status.icon_name} className="w-3 h-3" />
                                    {status.status_name}
                                </Badge>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {status.status_value}
                                </code>
                                {status.is_default && (
                                    <Badge variant="outline" className="text-xs">Default</Badge>
                                )}
                                {status.is_final && (
                                    <Badge variant="outline" className="text-xs">Final</Badge>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveStatus(status, 'up')}
                                    disabled={index === 0}
                                >
                                    ↑
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveStatus(status, 'down')}
                                    disabled={index === statuses.length - 1}
                                >
                                    ↓
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(status)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                {!status.is_default && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(status)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {statuses.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No status configurations found. Add your first status to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}