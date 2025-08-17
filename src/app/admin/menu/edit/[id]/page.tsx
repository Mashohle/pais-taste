// app/admin/menu/edit/[id]/page.tsx
"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useMenuItems } from '@/lib/hooks/use-menu-items'

interface FormData {
  name: string
  description: string
  price: string
  category: string
  newCategory: string
  combo_with: string
  combo_price: string
  published: boolean
  available: boolean
  image: File | null
  currentImageUrl: string | null
}

interface EditMenuItemProps {
  params: Promise<{
    id: string
  }>
}

export default function EditMenuItem({ params }: EditMenuItemProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { items: existingItems, updateMenuItem, uploadMenuItemImage, deleteMenuItemImage } = useMenuItems(true)
  const resolvedParams = use(params)
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    newCategory: "",
    combo_with: "",
    combo_price: "",
    published: true,
    available: true,
    image: null,
    currentImageUrl: null,
  })
  
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [itemNotFound, setItemNotFound] = useState(false)
  const [loadingItem, setLoadingItem] = useState(true)

  // Get existing categories from database
  const existingCategories = Array.from(new Set(existingItems.map(item => item.category)))
  const defaultCategories = ["Traditional Dishes", "Combo Meals", "Beverages", "Sides"]
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]))

  // Find the current item
  const currentItem = existingItems.find(item => item.id === resolvedParams.id)

  useEffect(() => {
    const session = localStorage.getItem('admin-session')
    if (session === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
  }, [router])

  // Load item data when items are fetched
  useEffect(() => {
    if (existingItems.length > 0) {
      setLoadingItem(false)
      
      if (currentItem) {
        // Pre-populate form with existing data
        setFormData({
          name: currentItem.name,
          description: currentItem.description || "",
          price: currentItem.price.toString(),
          category: currentItem.category,
          newCategory: "",
          combo_with: currentItem.combo_with || "",
          combo_price: currentItem.combo_price?.toString() || "",
          published: currentItem.published,
          available: currentItem.available,
          image: null,
          currentImageUrl: currentItem.image_url || null,
        })

        // Set current image as preview if it exists
        if (currentItem.image_url) {
          setImagePreview(currentItem.image_url)
        }
      } else {
        setItemNotFound(true)
      }
    }
  }, [existingItems, currentItem, resolvedParams.id])

  if (!isAuthenticated) {
    return <div>Checking access...</div>
  }

  if (loadingItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-700">Loading menu item...</p>
        </div>
      </div>
    )
  }

  if (itemNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Menu Item Not Found</h1>
          <p className="text-stone-600 mb-6">The menu item you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/menu')}>
            Back to Menu Management
          </Button>
        </div>
      </div>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image must be less than 5MB" }))
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select a valid image file" }))
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))
      setErrors(prev => ({ ...prev, image: "" }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(formData.currentImageUrl) // Revert to original image if exists
    setErrors(prev => ({ ...prev, image: "" }))
  }

  const deleteCurrentImage = async () => {
    if (!formData.currentImageUrl) return

    if (!confirm("Are you sure you want to delete the current image? This action cannot be undone.")) {
      return
    }

    setDeletingImage(true)
    
    try {
      // Delete from storage
      const success = await deleteMenuItemImage(formData.currentImageUrl)
      
      if (success) {
        // Update database to remove image URL
        await updateMenuItem(resolvedParams.id, { image_url: null })
        
        // Update form state
        setFormData(prev => ({ ...prev, currentImageUrl: null }))
        setImagePreview(null)
      } else {
        setErrors(prev => ({ ...prev, image: "Failed to delete image. Please try again." }))
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      setErrors(prev => ({ ...prev, image: "Error deleting image. Please try again." }))
    } finally {
      setDeletingImage(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required"
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required"
    }

    if (!formData.category && !formData.newCategory) {
      newErrors.category = "Category is required"
    }

    if (formData.combo_price && !formData.combo_with.trim()) {
      newErrors.combo_with = "Combo item is required when combo price is set"
    }

    if (formData.combo_with.trim() && !formData.combo_price) {
      newErrors.combo_price = "Combo price is required when combo item is set"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare the updated menu item data
      const finalCategory = showNewCategory ? formData.newCategory : formData.category
      
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: finalCategory,
        combo_with: formData.combo_with.trim() || null,
        combo_price: formData.combo_price ? parseFloat(formData.combo_price) : null,
        published: formData.published,
        available: formData.available,
        image_url: formData.currentImageUrl, // Keep current image URL for now
      }

      // Handle image upload if a new image was selected
      if (formData.image) {
        setUploadingImage(true)
        
        // Delete old image if it exists
        if (formData.currentImageUrl) {
          await deleteMenuItemImage(formData.currentImageUrl)
        }
        
        // Upload new image
        const imageUrl = await uploadMenuItemImage(formData.image, resolvedParams.id)
        setUploadingImage(false)
        
        if (imageUrl) {
          updateData.image_url = imageUrl
        } else {
          setErrors({ image: "Failed to upload new image." })
          setIsLoading(false)
          return
        }
      }

      // Update the menu item
      const success = await updateMenuItem(resolvedParams.id, updateData)

      if (success) {
        // Success! Redirect to menu management
        router.push("/admin/menu")
      } else {
        setErrors({ submit: "Failed to update menu item. Please try again." })
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      setErrors({ submit: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
      setUploadingImage(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === "add-new") {
      setShowNewCategory(true)
      setFormData((prev) => ({ ...prev, category: "" }))
    } else {
      setShowNewCategory(false)
      setFormData((prev) => ({ ...prev, category: value, newCategory: "" }))
    }
    setErrors(prev => ({ ...prev, category: "" }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 right-10 w-32 h-32 border-2 border-stone-400 rounded-full"></div>
        <div className="absolute top-40 right-32 w-16 h-16 border border-stone-400 rotate-45"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 border border-stone-400 rounded-lg rotate-12"></div>
        <div className="absolute top-60 right-8 w-8 h-8 bg-stone-400 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-stone-100/95 via-stone-50/80 to-stone-100/60 backdrop-blur-xl border-stone-200/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-stone-800">Edit Menu Item</CardTitle>
            <p className="text-stone-600 mt-2">Update "{currentItem?.name}" for Pai's Taste menu</p>
          </CardHeader>

          <CardContent>
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-stone-700 font-medium">
                  Dish Image
                </Label>
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center bg-stone-50/50 relative">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {formData.image && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-6 h-6 rounded-full p-0"
                            onClick={removeImage}
                            disabled={isLoading}
                            title="Remove new image"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                        {formData.currentImageUrl && !formData.image && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-6 h-6 rounded-full p-0"
                            onClick={deleteCurrentImage}
                            disabled={isLoading || deletingImage}
                            title="Delete current image"
                          >
                            {deletingImage ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      {formData.image && (
                        <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs">
                          New Image
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        {uploadingImage ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-stone-500">Uploading...</span>
                          </div>
                        ) : (
                          <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                        )}
                      </div>
                      {!uploadingImage && (
                        <>
                          <p className="text-stone-500">Click to upload new dish image</p>
                          <p className="text-xs text-stone-400">Max 5MB • JPG, PNG, WebP</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading || uploadingImage || deletingImage}
                  />
                </div>
                {errors.image && <p className="text-red-600 text-sm">{errors.image}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-700 font-medium">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  placeholder="e.g., Traditional Skop"
                  required
                  disabled={isLoading}
                  className={`bg-stone-50/50 border-stone-300 focus:border-stone-500 focus:ring-stone-500/20 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-stone-700 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the dish, ingredients, and preparation style..."
                  rows={3}
                  disabled={isLoading}
                  className="bg-stone-50/50 border-stone-300 focus:border-stone-500 focus:ring-stone-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-stone-700 font-medium">
                    Price (ZAR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">R</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, price: e.target.value }))
                        setErrors(prev => ({ ...prev, price: "" }))
                      }}
                      placeholder="85"
                      required
                      min="0"
                      step="5"
                      disabled={isLoading}
                      className={`pl-8 bg-stone-50/50 border-stone-300 focus:border-stone-500 focus:ring-stone-500/20 ${
                        errors.price ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-stone-700 font-medium">
                    Category *
                  </Label>
                  <Select onValueChange={handleCategoryChange} value={formData.category} required disabled={isLoading}>
                    <SelectTrigger className={`bg-stone-50/50 border-stone-300 focus:border-stone-500 focus:ring-stone-500/20 ${
                      errors.category ? "border-red-500" : ""
                    }`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add New Category
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
                </div>
              </div>

              {showNewCategory && (
                <div className="space-y-2">
                  <Label htmlFor="newCategory" className="text-stone-700 font-medium">
                    New Category Name *
                  </Label>
                  <Input
                    id="newCategory"
                    value={formData.newCategory}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, newCategory: e.target.value }))
                      setErrors(prev => ({ ...prev, category: "" }))
                    }}
                    placeholder="Enter new category name"
                    required
                    disabled={isLoading}
                    className="bg-stone-50/50 border-stone-300 focus:border-stone-500 focus:ring-stone-500/20"
                  />
                </div>
              )}

              {/* Combo Options */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                <Label className="text-stone-700 font-medium">Combo Options (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="combo_with" className="text-stone-700 text-sm">
                      Combo With
                    </Label>
                    <Input
                      id="combo_with"
                      value={formData.combo_with}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, combo_with: e.target.value }))
                        setErrors(prev => ({ ...prev, combo_with: "" }))
                      }}
                      placeholder="e.g., Pap, Rice, etc."
                      disabled={isLoading}
                      className={`bg-white/50 border-blue-300 focus:border-blue-500 ${
                        errors.combo_with ? "border-red-500" : ""
                      }`}
                    />
                    {errors.combo_with && <p className="text-red-600 text-sm">{errors.combo_with}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combo_price" className="text-stone-700 text-sm">
                      Combo Price (ZAR)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">R</span>
                      <Input
                        id="combo_price"
                        type="number"
                        value={formData.combo_price}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, combo_price: e.target.value }))
                          setErrors(prev => ({ ...prev, combo_price: "" }))
                        }}
                        placeholder="100"
                        min="0"
                        step="5"
                        disabled={isLoading}
                        className={`pl-8 bg-white/50 border-blue-300 focus:border-blue-500 ${
                          errors.combo_price ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {errors.combo_price && <p className="text-red-600 text-sm">{errors.combo_price}</p>}
                  </div>
                </div>
              </div>

              {/* Published Status */}
              <div className="flex items-center justify-between p-4 bg-stone-50/50 rounded-lg border border-stone-200">
                <div className="space-y-1">
                  <Label htmlFor="published" className="text-stone-700 font-medium">
                    Published Status
                  </Label>
                  <p className="text-sm text-stone-500">
                    {formData.published ? "Item will be visible to customers" : "Item will be hidden from menu"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={formData.published ? "default" : "secondary"} className="text-xs">
                    {formData.published ? "Published" : "Unpublished"}
                  </Badge>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: checked }))}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>

              {/* Available Status */}
              <div className="flex items-center justify-between p-4 bg-stone-50/50 rounded-lg border border-stone-200">
                <div className="space-y-1">
                  <Label htmlFor="available" className="text-stone-700 font-medium">
                    Stock Status
                  </Label>
                  <p className="text-sm text-stone-500">
                    {formData.available ? "Item is in stock and can be ordered" : "Item is out of stock"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={formData.available ? "default" : "secondary"} className="text-xs">
                    {formData.available ? "In Stock" : "Out of Stock"}
                  </Badge>
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || uploadingImage || deletingImage}
                  className="w-full bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {uploadingImage ? "Uploading Image..." : "Updating Menu Item..."}
                    </div>
                  ) : (
                    "Update Menu Item"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}