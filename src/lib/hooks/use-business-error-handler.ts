import { useState, useCallback } from 'react'
import { BusinessDataError, BusinessErrorHandler, type BusinessErrorContext } from '@/lib/utils/business-error-handler'

export interface BusinessErrorState {
  error: BusinessDataError | null
  isLoading: boolean
  hasError: boolean
}

export function useBusinessErrorHandler() {
  const [errorState, setErrorState] = useState<BusinessErrorState>({
    error: null,
    isLoading: false,
    hasError: false
  })

  const handleError = useCallback((error: unknown, context: BusinessErrorContext) => {
    const businessError = BusinessErrorHandler.handle(error, context)
    BusinessErrorHandler.logError(businessError)
    
    setErrorState({
      error: businessError,
      isLoading: false,
      hasError: true
    })
    
    return businessError
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      hasError: false
    })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isLoading: loading,
      hasError: loading ? false : prev.hasError
    }))
  }, [])

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context: BusinessErrorContext
  ): Promise<T | null> => {
    try {
      setLoading(true)
      clearError()
      const result = await operation()
      setLoading(false)
      return result
    } catch (error) {
      handleError(error, context)
      return null
    }
  }, [handleError, clearError, setLoading])

  const validateBusinessData = useCallback((businessData: Record<string, unknown>, context: BusinessErrorContext): boolean => {
    try {
      BusinessErrorHandler.validateBusinessData(businessData, context)
      return true
    } catch (error) {
      handleError(error, context)
      return false
    }
  }, [handleError])

  return {
    errorState,
    handleError,
    clearError,
    setLoading,
    executeWithErrorHandling,
    validateBusinessData,
    
    // Convenience getters
    error: errorState.error,
    isLoading: errorState.isLoading,
    hasError: errorState.hasError,
    userMessage: errorState.error?.userMessage,
    contextualMessage: errorState.error?.getContextualMessage(),
    recoveryActions: errorState.error ? BusinessErrorHandler.getRecoveryActions(errorState.error) : []
  }
}