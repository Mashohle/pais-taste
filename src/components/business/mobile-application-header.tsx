"use client"

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MobileApplicationHeaderProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  stepDescription: string
  onBack: () => void
  canGoBack: boolean
}

export function MobileApplicationHeader({
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  onBack
}: MobileApplicationHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/')
    } else {
      onBack()
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="bg-white pb-20 relative">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-stone-800" />
          </button>

          {/* Step Counter */}
          <Badge variant="outline" className="text-xs text-stone-600 border-stone-300">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 rounded-full h-2 mb-3">
          <div
            className="bg-gradient-to-r from-stone-600 to-stone-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Title */}
        <h1 className="text-lg font-bold text-stone-800">
          {stepTitle}
        </h1>
        <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
          {stepDescription}
        </p>
      </div>
    </div>
  )
}
