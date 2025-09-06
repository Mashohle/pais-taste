"use client"

import { useState } from 'react'
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
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  DollarSign,
  Calendar,
  Utensils,
  ShoppingBag,
  Wrench,
  Crown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BusinessApplication() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: '',
    businessCategory: '',
    businessType: '',
    description: '',
    
    // Owner Information
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerIdNumber: '',
    
    // Business Address
    streetAddress: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Business Details
    registrationNumber: '',
    taxNumber: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    
    // Operations
    operatingHours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    
    // Documents
    documents: [],
    
    // Terms
    agreeToTerms: false,
    agreeToCommission: false
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
    { id: 5, title: 'Operations', description: 'Operating hours and services' },
    { id: 6, title: 'Documents', description: 'Upload required documents' },
    { id: 7, title: 'Review & Submit', description: 'Final review and submission' }
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // In real app, would submit to API
    console.log('Submitting application:', formData)
    alert('Application submitted successfully! You will receive a confirmation email shortly.')
    router.push('/')
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
            ${currentStep >= step.id 
              ? 'bg-indigo-600 border-indigo-600 text-white' 
              : 'border-slate-300 text-slate-500'
            }
          `}>
            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-2
              ${currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-300'}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
            <Input
              value={formData.ownerLastName}
              onChange={(e) => updateFormData('ownerLastName', e.target.value)}
              placeholder="Your last name"
            />
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
          <p className="text-xs text-slate-500 mt-1">This will be your account login email</p>
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
      </CardContent>
    </Card>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Address form coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )
      case 4: return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Business Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Registration details form coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )
      case 5: return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Operating hours form coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )
      case 6: return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Document upload form coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )
      case 7: return (
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
                  onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                />
                <label htmlFor="terms" className="text-sm text-slate-700">
                  I agree to the <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="commission" 
                  checked={formData.agreeToCommission}
                  onCheckedChange={(checked) => updateFormData('agreeToCommission', checked)}
                />
                <label htmlFor="commission" className="text-sm text-slate-700">
                  I understand and agree to the 5.5% platform commission on all orders
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LocalHub</h1>
                <p className="text-xs text-slate-600">Business Application</p>
              </div>
            </Link>
            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
        </div>
      </header>

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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <span>Previous</span>
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={handleSubmit}
              disabled={!formData.agreeToTerms || !formData.agreeToCommission}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Application</span>
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
            >
              <span>Next</span>
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}