"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress" // Removed - not needed
import {
  CheckCircle,
  Building2,
  Palette,
  Settings,
  ArrowRight,
  Crown,
  Users,
  Utensils,
  ShoppingBag,
  Wrench
} from "lucide-react"
import Link from "next/link"

interface Business {
  id: string
  name: string
  category_id: string
  setup_completed: boolean
  logo_url?: string
  primary_color: string
  accent_color: string
  description?: string
  settings: Record<string, unknown>
}

export default function BusinessSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState({
    logo_url: '',
    primary_color: '#000000',
    accent_color: '#0066CC',
    description: '',
    settings: {}
  })

  const setupSteps = [
    { id: 1, title: 'Welcome', description: 'Getting started with your business' },
    { id: 2, title: 'Branding', description: 'Logo and colors' },
    { id: 3, title: 'Business Info', description: 'Description and details' },
    { id: 4, title: 'Features', description: 'Configure your business features' },
    { id: 5, title: 'Review', description: 'Complete setup' }
  ]

  const businessCategories = {
    food: { name: 'Food & Restaurant', icon: Utensils, color: 'text-orange-600' },
    retail: { name: 'Retail & Shopping', icon: ShoppingBag, color: 'text-blue-600' },
    service: { name: 'Services', icon: Wrench, color: 'text-green-600' },
    car_wash: { name: 'Car Wash & Detailing', icon: Wrench, color: 'text-purple-600' },
    salon: { name: 'Beauty & Wellness', icon: Users, color: 'text-pink-600' }
  }

  useEffect(() => {
    // In a real app, fetch the business data for the logged-in user
    // For now, simulate loading
    setTimeout(() => {
      setBusiness({
        id: '1',
        name: 'Demo Business',
        category_id: 'food',
        setup_completed: false,
        primary_color: '#000000',
        accent_color: '#0066CC',
        settings: {}
      })
      setLoading(false)
    }, 1000)
  }, [])

  const updateSetupData = (field: string, value: string | Record<string, unknown>) => {
    setSetupData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < setupSteps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeSetup = async () => {
    try {
      // In real app, update business with setup data
      console.log('Completing setup with data:', setupData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to business dashboard
      router.push('/business/dashboard')
      
    } catch (error) {
      console.error('Setup completion error:', error)
      alert('There was an error completing your setup. Please try again.')
    }
  }

  const renderWelcomeStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Congratulations!</h2>
        <p className="text-lg text-slate-600 mb-6">
          Your business application has been approved and your account is ready to set up.
        </p>
        
        {business && (
          <div className="bg-slate-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              {businessCategories[business.category_id as keyof typeof businessCategories] && (
                <>
                  {React.createElement(businessCategories[business.category_id as keyof typeof businessCategories].icon, {
                    className: `w-6 h-6 ${businessCategories[business.category_id as keyof typeof businessCategories].color}`
                  })}
                  <span className="text-lg font-semibold text-slate-900">{business.name}</span>
                </>
              )}
            </div>
            <Badge variant="outline" className="text-slate-600">
              {businessCategories[business.category_id as keyof typeof businessCategories]?.name}
            </Badge>
          </div>
        )}
        
        <p className="text-slate-600 mb-8">
          Let&apos;s get your business profile set up so customers can discover and order from you.
          This should only take a few minutes.
        </p>
        
        <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg">
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )

  const renderBrandingStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Business Branding</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
          <Input
            value={setupData.logo_url}
            onChange={(e) => updateSetupData('logo_url', e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - you can add this later</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
            <div className="flex items-center space-x-3">
              <Input
                type="color"
                value={setupData.primary_color}
                onChange={(e) => updateSetupData('primary_color', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={setupData.primary_color}
                onChange={(e) => updateSetupData('primary_color', e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Accent Color</label>
            <div className="flex items-center space-x-3">
              <Input
                type="color"
                value={setupData.accent_color}
                onChange={(e) => updateSetupData('accent_color', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={setupData.accent_color}
                onChange={(e) => updateSetupData('accent_color', e.target.value)}
                placeholder="#0066CC"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Preview</h4>
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: setupData.primary_color }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: setupData.primary_color }}>
                {business?.name}
              </p>
              <p className="text-sm" style={{ color: setupData.accent_color }}>
                {businessCategories[business?.category_id as keyof typeof businessCategories]?.name}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBusinessInfoStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Business Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
          <Textarea
            value={setupData.description}
            onChange={(e) => updateSetupData('description', e.target.value)}
            placeholder="Tell customers about your business, what you offer, and what makes you special..."
            className="min-h-24"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">
            {setupData.description.length}/500 characters - This will appear on your business page
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderFeaturesStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Business Features</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Features Configuration</h3>
          <p className="text-slate-600 mb-4">
            Based on your business category, we&apos;ll configure the right features for you.
          </p>
          <Badge variant="outline" className="text-slate-600">
            {businessCategories[business?.category_id as keyof typeof businessCategories]?.name} Features
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const renderReviewStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Review & Complete</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-4">Setup Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Business Name:</span>
              <span className="font-medium">{business?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Category:</span>
              <span className="font-medium">
                {businessCategories[business?.category_id as keyof typeof businessCategories]?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Description:</span>
              <span className="font-medium">
                {setupData.description ? 'Added' : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Branding:</span>
              <span className="font-medium">Configured</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Your business will be visible to customers</li>
            <li>• You can start adding your menu/catalog</li>
            <li>• You&apos;ll have access to your business dashboard</li>
            <li>• You can begin receiving orders</li>
          </ul>
        </div>
        
        <Button
          onClick={completeSetup}
          className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Setup & Launch Business
        </Button>
      </CardContent>
    </Card>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderWelcomeStep()
      case 2: return renderBrandingStep()
      case 3: return renderBusinessInfoStep()
      case 4: return renderFeaturesStep()
      case 5: return renderReviewStep()
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your business setup...</p>
        </div>
      </div>
    )
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
                <p className="text-xs text-stone-600">Business Setup</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                Step {currentStep} of {setupSteps.length}
              </Badge>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / setupSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator - show only if not on welcome step */}
        {currentStep > 1 && (
          <div className="flex items-center justify-center space-x-8 mb-8">
            {setupSteps.slice(1).map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                  }
                `}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {step.id < setupSteps.length && (
                  <div className={`
                    w-16 h-0.5 mx-4
                    ${currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Current Step Content */}
        <div className="mb-8">
          {currentStep > 1 && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{setupSteps[currentStep - 1].title}</h2>
              <p className="text-slate-600 mt-1">{setupSteps[currentStep - 1].description}</p>
            </div>
          )}
          
          {renderCurrentStep()}
        </div>

        {/* Navigation - show only for steps 2-4 */}
        {currentStep > 1 && currentStep < setupSteps.length && (
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <Button
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}