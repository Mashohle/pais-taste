"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBusiness } from '@/lib/contexts/business-context'
import { useBusinessCategories } from '@/lib/hooks'
import { useOnboardingSteps } from '@/lib/hooks'
import { DynamicIcon } from '@/lib/utils/icon-mapper'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface BusinessOnboardingData {
  name: string
  slug: string
  category_id: string
  description?: string
  email?: string
  phone?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  primary_color?: string
  accent_color?: string
}

interface BusinessOnboardingProps {
  onComplete?: (business: any) => void
}

export function BusinessOnboarding({ onComplete }: BusinessOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BusinessOnboardingData>({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'South Africa',
    primary_color: '#000000',
    accent_color: '#0066CC'
  })
  
  const { createBusiness } = useBusiness()
  const { categories, loading: categoriesLoading } = useBusinessCategories()
  const { steps, loading: stepsLoading } = useOnboardingSteps()
  const router = useRouter()

  const handleInputChange = (field: keyof BusinessOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const business = await createBusiness(formData)
      
      if (business) {
        onComplete?.(business)
        router.push(`/${business.slug}/admin/setup`)
      }
    } catch (error) {
      console.error('Error creating business:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    const currentStepData = steps.find(step => step.id === currentStep)
    const componentName = currentStepData?.component

    switch (componentName) {
      case 'CategorySelection':
        return <CategorySelection />
      case 'BasicInfo':
        return <BasicInfo />
      case 'LocationInfo':
        return <LocationInfo />
      case 'BusinessSettings':
        return <BusinessSettings />
      case 'ReviewStep':
        return <ReviewStep />
      default:
        return <div>Step not found</div>
    }
  }

  const CategorySelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">What type of business are you?</h3>
        <p className="text-sm text-gray-600">Choose the category that best describes your business.</p>
      </div>
      
      {categoriesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(category => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.category_id === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleInputChange('category_id', category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <DynamicIcon name={category.icon} className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const BasicInfo = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Tell us about your business</h3>
        <p className="text-sm text-gray-600">Basic information that customers will see.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Business Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your business name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="slug">Business URL *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              yourdomain.com/
            </span>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="business-name"
              className="rounded-l-none"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">This will be your unique business URL</p>
        </div>
        
        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what your business does"
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const LocationInfo = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Where is your business located?</h3>
        <p className="text-sm text-gray-600">Contact information and business address.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="business@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+27 123 456 7890"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="address_line1">Street Address</Label>
          <Input
            id="address_line1"
            value={formData.address_line1}
            onChange={(e) => handleInputChange('address_line1', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>
        
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Johannesburg"
          />
        </div>
        
        <div>
          <Label htmlFor="state">Province/State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Gauteng"
          />
        </div>
        
        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            placeholder="2000"
          />
        </div>
      </div>
    </div>
  )

  const BusinessSettings = () => {
    const selectedCategory = categories.find(c => c.id === formData.category_id)
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Configure your {selectedCategory?.name.toLowerCase()}</h3>
          <p className="text-sm text-gray-600">Basic settings to get you started.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary_color">Primary Color</Label>
            <Input
              id="primary_color"
              type="color"
              value={formData.primary_color}
              onChange={(e) => handleInputChange('primary_color', e.target.value)}
              className="h-10"
            />
          </div>
          
          <div>
            <Label htmlFor="accent_color">Accent Color</Label>
            <Input
              id="accent_color"
              type="color"
              value={formData.accent_color}
              onChange={(e) => handleInputChange('accent_color', e.target.value)}
              className="h-10"
            />
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Additional settings for your {selectedCategory?.name.toLowerCase()} will be available 
            after creating your business.
          </p>
        </div>
      </div>
    )
  }

  const ReviewStep = () => {
    const selectedCategory = categories.find(c => c.id === formData.category_id)
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Review your business details</h3>
          <p className="text-sm text-gray-600">Make sure everything looks correct before creating your business.</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">{selectedCategory?.name}</Badge>
              <CardTitle>{formData.name}</CardTitle>
            </div>
            <CardDescription>yourdomain.com/{formData.slug}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {formData.description && (
              <div>
                <h5 className="font-medium text-gray-900">Description</h5>
                <p className="text-sm text-gray-600">{formData.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.email && (
                <div>
                  <h5 className="font-medium text-gray-900">Email</h5>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                </div>
              )}
              
              {formData.phone && (
                <div>
                  <h5 className="font-medium text-gray-900">Phone</h5>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                </div>
              )}
            </div>
            
            {formData.address_line1 && (
              <div>
                <h5 className="font-medium text-gray-900">Address</h5>
                <p className="text-sm text-gray-600">
                  {formData.address_line1}
                  {formData.city && `, ${formData.city}`}
                  {formData.state && `, ${formData.state}`}
                  {formData.postal_code && ` ${formData.postal_code}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (stepsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 w-1/3 rounded"></div>
          <div className="bg-gray-200 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length ? (
          <Button onClick={nextStep} className="flex items-center">
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Business'}
          </Button>
        )}
      </div>
    </div>
  )
}