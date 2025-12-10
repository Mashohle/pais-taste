"use client"

import { useState } from 'react'
import { useBusinessApplication, BusinessApplicationProvider } from '@/lib/context/business-application-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Building2,
  User,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Utensils,
  ShoppingBag,
  Wrench
} from "lucide-react"
import Link from "next/link"
import { MobileApplicationWrapper } from '@/components/business/mobile-application-wrapper'

function BusinessApplicationForm() {
  const {
    formData,
    currentStep,
    isSubmitting,
    submitSuccess,
    submitError,
    validationErrors,
    updateFormData,
    nextStep,
    prevStep,
    submitApplication,
    addLocation,
    updateLocation,
    removeLocation
  } = useBusinessApplication()

  // State for Step 5 (Locations)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<string | null>(null)
  const [locationForm, setLocationForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    isPrimary: false
  })

  const businessCategories = [
    { 
      value: 'food', 
      label: 'Food & Restaurant', 
      icon: Utensils,
      types: ['Restaurant', 'Fast Food', 'Cafe', 'Bakery', 'Catering', 'Food Truck'] 
    },
    { 
      value: 'retail', 
      label: 'Retail & Shopping', 
      icon: ShoppingBag,
      types: ['Clothing Store', 'Electronics', 'Home & Garden', 'Books & Stationery', 'Gifts & Crafts', 'Sports & Outdoors']
    },
    { 
      value: 'services', 
      label: 'Services', 
      icon: Wrench,
      types: ['Car Wash', 'Hair Salon', 'Beauty Spa', 'Auto Repair', 'Cleaning Services', 'Pet Grooming']
    }
  ]

  const southAfricanProvinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape'
  ]

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Business details and category' },
    { id: 2, title: 'Owner Details', description: 'Your personal information' },
    { id: 3, title: 'Location & Address', description: 'Business address and location' },
    { id: 4, title: 'Business Registration', description: 'Legal and financial details' },
    { id: 5, title: 'Business Locations', description: 'Add your business locations' },
    { id: 6, title: 'Operations', description: 'Operating hours and services' },
    { id: 7, title: 'Documents', description: 'Upload required documents' },
    { id: 8, title: 'Review & Submit', description: 'Final review and submission' }
  ]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
            ${currentStep >= step.id 
              ? 'bg-stone-600 border-stone-600 text-white' 
              : 'border-slate-300 text-slate-500'
            }
          `}>
            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-2
              ${currentStep > step.id ? 'bg-stone-600' : 'bg-slate-300'}
            `} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
          <Input
            value={formData.businessName}
            onChange={(e) => updateFormData('businessName', e.target.value)}
            placeholder="Enter your business name"
            className="w-full"
          />
          {validationErrors.businessName && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.businessName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Category</label>
          <Select value={formData.businessCategory} onValueChange={(value) => updateFormData('businessCategory', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your business category" />
            </SelectTrigger>
            <SelectContent>
              {businessCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.businessCategory && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.businessCategory}</p>
          )}
        </div>

        {formData.businessCategory && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
            <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.find(cat => cat.value === formData.businessCategory)?.types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Describe your business, products, or services..."
            className="min-h-24"
          />
          <p className="text-xs text-slate-500 mt-1">This will be visible to customers on your business profile</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Owner Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
            <Input
              value={formData.ownerFirstName}
              onChange={(e) => updateFormData('ownerFirstName', e.target.value)}
              placeholder="Your first name"
            />
            {validationErrors.ownerFirstName && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.ownerFirstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
            <Input
              value={formData.ownerLastName}
              onChange={(e) => updateFormData('ownerLastName', e.target.value)}
              placeholder="Your last name"
            />
            {validationErrors.ownerLastName && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.ownerLastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <Input
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => updateFormData('ownerEmail', e.target.value)}
            placeholder="your.email@example.com"
          />
          {validationErrors.ownerEmail ? (
            <p className="text-xs text-red-600 mt-1">{validationErrors.ownerEmail}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">This will be your account login email</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
          <Input
            value={formData.ownerPhone}
            onChange={(e) => updateFormData('ownerPhone', e.target.value)}
            placeholder="+27 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">ID Number</label>
          <Input
            value={formData.ownerIdNumber}
            onChange={(e) => updateFormData('ownerIdNumber', e.target.value)}
            placeholder="South African ID Number"
          />
          <p className="text-xs text-slate-500 mt-1">Required for verification purposes</p>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium text-slate-900 mb-4">Account Password</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                value={formData.ownerPassword}
                onChange={(e) => updateFormData('ownerPassword', e.target.value)}
                placeholder="Choose a secure password"
              />
              {validationErrors.ownerPassword ? (
                <p className="text-xs text-red-600 mt-1">{validationErrors.ownerPassword}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <Input
                type="password"
                value={formData.ownerPasswordConfirm}
                onChange={(e) => updateFormData('ownerPasswordConfirm', e.target.value)}
                placeholder="Confirm your password"
              />
              {validationErrors.ownerPasswordConfirm ? (
                <p className="text-xs text-red-600 mt-1">{validationErrors.ownerPasswordConfirm}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Must match the password above</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Location & Address</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
          <Input
            value={formData.streetAddress}
            onChange={(e) => updateFormData('streetAddress', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Suburb</label>
            <Input
              value={formData.suburb}
              onChange={(e) => updateFormData('suburb', e.target.value)}
              placeholder="Suburb name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
            <Input
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              placeholder="City name"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Province</label>
            <Select value={formData.province} onValueChange={(value) => updateFormData('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {southAfricanProvinces.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
            <Input
              value={formData.postalCode}
              onChange={(e) => updateFormData('postalCode', e.target.value)}
              placeholder="0000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Business Registration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Registration Number</label>
          <Input
            value={formData.registrationNumber}
            onChange={(e) => updateFormData('registrationNumber', e.target.value)}
            placeholder="2023/123456/07"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - if your business is registered</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tax Number / VAT Number</label>
          <Input
            value={formData.taxNumber}
            onChange={(e) => updateFormData('taxNumber', e.target.value)}
            placeholder="9876543210"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - for VAT registered businesses</p>
        </div>
        
        <div className="border-t pt-6">
          <h4 className="font-medium text-slate-900 mb-4">Banking Details</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
              <Select value={formData.bankName} onValueChange={(value) => updateFormData('bankName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absa">ABSA Bank</SelectItem>
                  <SelectItem value="standard">Standard Bank</SelectItem>
                  <SelectItem value="fnb">First National Bank (FNB)</SelectItem>
                  <SelectItem value="nedbank">Nedbank</SelectItem>
                  <SelectItem value="capitec">Capitec Bank</SelectItem>
                  <SelectItem value="investec">Investec</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => updateFormData('accountNumber', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Branch Code</label>
                <Input
                  value={formData.branchCode}
                  onChange={(e) => updateFormData('branchCode', e.target.value)}
                  placeholder="123456"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep5 = () => {
    const resetLocationForm = () => {
      setLocationForm({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: '',
        postalCode: '',
        phone: '',
        email: '',
        isPrimary: false
      })
      setEditingLocation(null)
      setShowLocationForm(false)
    }

    const handleAddLocation = () => {
      if (locationForm.name && locationForm.addressLine1 && locationForm.city) {
        addLocation(locationForm)
        resetLocationForm()
      }
    }

    const handleEditLocation = (id: string) => {
      const location = formData.locations.find(loc => loc.id === id)
      if (location) {
        setLocationForm({
          name: location.name,
          addressLine1: location.addressLine1,
          addressLine2: location.addressLine2 || '',
          city: location.city,
          province: location.province,
          postalCode: location.postalCode,
          phone: location.phone || '',
          email: location.email || '',
          isPrimary: location.isPrimary
        })
        setEditingLocation(id)
        setShowLocationForm(true)
      }
    }

    const handleUpdateLocation = () => {
      if (editingLocation) {
        updateLocation(editingLocation, locationForm)
        resetLocationForm()
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Business Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Type Selection */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-stone-400"
              style={{ borderColor: formData.locationType === 'single' ? '#57534e' : '#d6d3d1' }}>
              <input
                type="radio"
                name="locationType"
                value="single"
                checked={formData.locationType === 'single'}
                onChange={(e) => updateFormData('locationType', e.target.value as 'single' | 'multiple')}
                className="w-4 h-4 text-stone-600"
              />
              <div className="flex-1">
                <p className="font-medium text-stone-900">Single Location (Headquarters Only)</p>
                <p className="text-sm text-stone-600 mt-1">Use the headquarters address from Step 3. You can add more locations later from your dashboard.</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-stone-400"
              style={{ borderColor: formData.locationType === 'multiple' ? '#57534e' : '#d6d3d1' }}>
              <input
                type="radio"
                name="locationType"
                value="multiple"
                checked={formData.locationType === 'multiple'}
                onChange={(e) => updateFormData('locationType', e.target.value as 'single' | 'multiple')}
                className="w-4 h-4 text-stone-600"
              />
              <div className="flex-1">
                <p className="font-medium text-stone-900">Multiple Locations</p>
                <p className="text-sm text-stone-600 mt-1">Add all your business locations now (including headquarters).</p>
              </div>
            </label>
          </div>

          {/* Multiple Locations Section */}
          {formData.locationType === 'multiple' && (
            <div className="space-y-4 pt-4 border-t">
              {/* List of Added Locations */}
              {formData.locations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-stone-900">Added Locations ({formData.locations.length})</h4>
                  {formData.locations.map((location) => (
                    <div key={location.id} className="p-4 border rounded-lg bg-stone-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-stone-900">{location.name}</p>
                            {location.isPrimary && (
                              <Badge className="text-xs bg-indigo-600">Headquarters</Badge>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mt-1">
                            {location.addressLine1}{location.addressLine2 && `, ${location.addressLine2}`}
                          </p>
                          <p className="text-sm text-stone-600">
                            {location.city}, {location.province} {location.postalCode}
                          </p>
                          {location.phone && (
                            <p className="text-sm text-stone-600 mt-1">📞 {location.phone}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLocation(location.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLocation(location.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Location Button or Form */}
              {!showLocationForm && (
                <Button
                  onClick={() => setShowLocationForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}

              {/* Location Form */}
              {showLocationForm && (
                <div className="p-4 border-2 border-stone-300 rounded-lg space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-stone-900">
                      {editingLocation ? 'Edit Location' : 'Add New Location'}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetLocationForm}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
                    <Input
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      placeholder="e.g., Main Branch, Downtown Office"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Street Address *</label>
                    <Input
                      value={locationForm.addressLine1}
                      onChange={(e) => setLocationForm({ ...locationForm, addressLine1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address Line 2 (Optional)</label>
                    <Input
                      value={locationForm.addressLine2}
                      onChange={(e) => setLocationForm({ ...locationForm, addressLine2: e.target.value })}
                      placeholder="Suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                      <Input
                        value={locationForm.city}
                        onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Province *</label>
                      <Select
                        value={locationForm.province}
                        onValueChange={(value) => setLocationForm({ ...locationForm, province: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {southAfricanProvinces.map((province) => (
                            <SelectItem key={province} value={province}>{province}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code *</label>
                      <Input
                        value={locationForm.postalCode}
                        onChange={(e) => setLocationForm({ ...locationForm, postalCode: e.target.value })}
                        placeholder="0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone (Optional)</label>
                      <Input
                        value={locationForm.phone}
                        onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                        placeholder="+27 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
                      <Input
                        type="email"
                        value={locationForm.email}
                        onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                        placeholder="location@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPrimary"
                      checked={locationForm.isPrimary}
                      onCheckedChange={(checked) => setLocationForm({ ...locationForm, isPrimary: checked as boolean })}
                    />
                    <label htmlFor="isPrimary" className="text-sm text-slate-700">
                      Mark as Headquarters (Primary Location)
                    </label>
                  </div>

                  <Button
                    onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                    disabled={!locationForm.name || !locationForm.addressLine1 || !locationForm.city}
                    className="w-full"
                  >
                    {editingLocation ? 'Update Location' : 'Add Location'}
                  </Button>
                </div>
              )}

              {formData.locations.length === 0 && !showLocationForm && (
                <div className="text-center py-8 text-stone-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No locations added yet. Click &ldquo;Add Location&rdquo; to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                {formData.locationType === 'single' ? (
                  <p>Your headquarters address from Step 3 will be automatically added as your primary location. You can add more locations anytime from your business dashboard after approval.</p>
                ) : (
                  <p>Add all your current business locations. Make sure to mark one as your headquarters (primary location). You can always add, edit, or remove locations later from your dashboard.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStep6 = () => (
    <Card>
      <CardHeader className="md:block hidden">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Operating Hours</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-6">
        <div className="space-y-3">
          {Object.entries(formData.operatingHours).map(([day, hours]) => (
            <div key={day} className="border rounded-lg p-3 bg-white">
              {/* Day and Closed Toggle */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-stone-900 capitalize text-sm">{day}</span>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${day}-closed`}
                    checked={hours.closed}
                    onCheckedChange={(checked) =>
                      updateFormData('operatingHours', {
                        ...formData.operatingHours,
                        [day]: { ...hours, closed: checked === true }
                      })
                    }
                  />
                  <label htmlFor={`${day}-closed`} className="text-xs text-slate-600">Closed</label>
                </div>
              </div>

              {/* Time Inputs */}
              {!hours.closed && (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1">Open</label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        updateFormData('operatingHours', {
                          ...formData.operatingHours,
                          [day]: { ...hours, open: e.target.value }
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-4">-</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1">Close</label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        updateFormData('operatingHours', {
                          ...formData.operatingHours,
                          [day]: { ...hours, close: e.target.value }
                        })
                      }
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-900">Operating Hours Note</p>
              <p className="text-xs text-blue-700 mt-1">
                These hours will be displayed to customers. You can update them later from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  const renderStep7 = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">Document Upload Coming Soon</p>
                <p className="text-sm text-blue-700">
                  Document uploads will be available after your initial application is submitted.
                  Once your application is approved, you&apos;ll be able to upload required documents
                  directly from your business dashboard.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-blue-700 font-medium">Documents you&apos;ll need:</p>
                  <ul className="text-sm text-blue-700 space-y-1 ml-4">
                    <li>• South African ID Document (owner)</li>
                    <li>• Business Registration Certificate (if registered)</li>
                    <li>• Recent 3-month Bank Statement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> You can proceed with your application now. Our team will contact you
              via email regarding document submission once your application has been reviewed.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStep8 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Review & Submit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-4">Application Summary</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Business:</strong> {formData.businessName || 'Not provided'}</p>
            <p><strong>Category:</strong> {formData.businessCategory || 'Not selected'}</p>
            <p><strong>Type:</strong> {formData.businessType || 'Not selected'}</p>
            <p><strong>Owner:</strong> {formData.ownerFirstName} {formData.ownerLastName}</p>
            <p><strong>Email:</strong> {formData.ownerEmail || 'Not provided'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => updateFormData('agreeToTerms', checked === true)}
            />
            <label htmlFor="terms" className="text-sm text-slate-700">
              I agree to the <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="commission"
              checked={formData.agreeToCommission}
              onCheckedChange={(checked) => updateFormData('agreeToCommission', checked === true)}
            />
            <label htmlFor="commission" className="text-sm text-slate-700">
              I understand and agree to the 5.5% platform commission on all orders
            </label>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Submission Failed</p>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Application Submitted Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your application has been submitted for review. We&apos;ll send you an email confirmation shortly and notify you when our team reviews your application.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={submitApplication}
            disabled={!formData.agreeToTerms || !formData.agreeToCommission || isSubmitting || submitSuccess}
            className={`w-full py-3 text-lg transition-all duration-200 ${
              submitSuccess
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-stone-600 hover:bg-stone-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting Application...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Application Submitted
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      case 7: return renderStep7()
      case 8: return renderStep8()
      default: return null
    }
  }

  // Check if step can proceed
  const canProceed = (): boolean => {
    // Basic validation for required fields per step
    switch (currentStep) {
      case 1:
        return !!(formData.businessName && formData.businessCategory)
      case 2:
        return !!(formData.ownerFirstName && formData.ownerLastName && formData.ownerEmail && formData.ownerPassword && formData.ownerPasswordConfirm)
      case 8:
        return !!(formData.agreeToTerms && formData.agreeToCommission)
      default:
        return true
    }
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileApplicationWrapper
          currentStep={currentStep}
          totalSteps={steps.length}
          stepTitle={steps[currentStep - 1].title}
          stepDescription={steps[currentStep - 1].description}
          canProceed={canProceed()}
          isSubmitting={isSubmitting}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={submitApplication}
          onBack={prevStep}
        >
          {renderCurrentStep()}
        </MobileApplicationWrapper>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Navigation Header */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                  SideHusl
                </div>
                <Badge variant="secondary" className="text-xs">
                  Business Application
                </Badge>
              </Link>
              <Badge variant="outline" className="text-stone-600 border-stone-300">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          {renderStepIndicator()}

          {/* Current Step Content */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{steps[currentStep - 1].title}</h2>
              <p className="text-slate-600 mt-1">{steps[currentStep - 1].description}</p>
            </div>

            {renderCurrentStep()}
          </div>

          {/* Navigation - Hide on final step since submit button is in the card */}
          {currentStep < steps.length && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <span>Previous</span>
              </Button>

              <Button
                onClick={nextStep}
                className="bg-stone-600 hover:bg-stone-700 flex items-center space-x-2"
              >
                <span>Next</span>
              </Button>
            </div>
          )}

          {/* Show previous button only on final step */}
          {currentStep === steps.length && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center space-x-2"
              >
                <span>Previous</span>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

// Main component wrapped with provider
export default function BusinessApplication() {
  return (
    <BusinessApplicationProvider>
      <BusinessApplicationForm />
    </BusinessApplicationProvider>
  )
}