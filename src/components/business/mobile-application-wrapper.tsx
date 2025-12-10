"use client"

import { ReactNode } from 'react'
import { MobileApplicationHeader } from './mobile-application-header'
import { MobileApplicationNavigation } from './mobile-application-navigation'

interface MobileApplicationWrapperProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  stepDescription: string
  canProceed: boolean
  isSubmitting: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onBack: () => void
  children: ReactNode
}

export function MobileApplicationWrapper({
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  canProceed,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
  onBack,
  children
}: MobileApplicationWrapperProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      <MobileApplicationHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
        stepDescription={stepDescription}
        onBack={onBack}
        canGoBack={currentStep > 1}
      />

      <div
        className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-32"
        style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}
      >
        <div className="px-5 pt-8 pb-6">
          {children}
        </div>
      </div>

      <MobileApplicationNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        canProceed={canProceed}
      />
    </div>
  )
}
