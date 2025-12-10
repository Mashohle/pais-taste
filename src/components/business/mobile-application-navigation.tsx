"use client"

import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

interface MobileApplicationNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting: boolean
  canProceed: boolean
}

export function MobileApplicationNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  canProceed
}: MobileApplicationNavigationProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 md:hidden z-20">
      <div className="flex gap-3 max-w-md mx-auto">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="flex-1"
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}

        <Button
          onClick={isLastStep ? onSubmit : onNext}
          disabled={!canProceed || isSubmitting}
          className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-stone-700 hover:bg-stone-800`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Application
            </>
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  )
}
