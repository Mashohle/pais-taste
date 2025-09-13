"use client"

import { useState } from 'react'
import { useApplicationSubmission } from '@/lib/hooks/use-application-submission'
import { useBusinessApplicationForm } from '@/lib/hooks/use-business-application-form'
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
  const { isSubmitting, submitSuccess, submitError, submitApplication } = useApplicationSubmission()
  const { formData, updateFormData, getApplicationData } = useBusinessApplicationForm()

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

  const handleSubmit = async () => {
    await submitApplication(getApplicationData())
  }

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
  
  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Operating Hours</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(formData.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24">
                <span className="font-medium text-slate-900 capitalize">{day}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${day}-closed`}
                  checked={hours.closed}
                  onCheckedChange={(checked) => 
                    updateFormData('operatingHours', {
                      ...formData.operatingHours,
                      [day]: { ...hours, closed: checked }
                    })
                  }
                />
                <label htmlFor={`${day}-closed`} className="text-sm text-slate-600">Closed</label>
              </div>
              
              {!hours.closed && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => 
                      updateFormData('operatingHours', {
                        ...formData.operatingHours,
                        [day]: { ...hours, open: e.target.value }
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-slate-500">to</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => 
                      updateFormData('operatingHours', {
                        ...formData.operatingHours,
                        [day]: { ...hours, close: e.target.value }
                      })
                    }
                    className="w-24"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Operating Hours Note</p>
              <p className="text-sm text-blue-700 mt-1">
                These hours will be displayed to customers. You can always update them later from your business dashboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Required Documents</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Document Requirements</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please prepare the following documents. You can upload them now or submit them later during the review process.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 mb-2">South African ID Document</h4>
            <p className="text-sm text-slate-600 mb-4">Clear copy of owner's South African ID</p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 mb-2">Business Registration Certificate</h4>
            <p className="text-sm text-slate-600 mb-4">Optional - if your business is formally registered</p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 mb-2">Bank Statement</h4>
            <p className="text-sm text-slate-600 mb-4">Recent 3-month bank statement for verification</p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> All documents will be reviewed by our team. 
            We take privacy seriously and your documents are stored securely and only used for verification purposes.
          </p>
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
                        Your application has been submitted for review. We'll send you an email confirmation shortly and notify you when our team reviews your application.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
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
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-stone-800 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">sideHusl</h1>
                <p className="text-xs text-stone-600">Business Application</p>
              </div>
            </Link>
            <Badge variant="outline" className="text-stone-600 border-stone-300">
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
  )
}