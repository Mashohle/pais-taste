'use client'

import { Component, ReactNode } from 'react'
import { BusinessDataError, BusinessErrorHandler } from '@/lib/utils/business-error-handler'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showRecoveryActions?: boolean
  onError?: (error: BusinessDataError) => void
}

interface State {
  hasError: boolean
  error: BusinessDataError | null
}

export class BusinessErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Convert error to BusinessDataError if needed
    const businessError = error instanceof BusinessDataError 
      ? error 
      : BusinessErrorHandler.handle(error, { 
          operation: 'render component',
          component: 'BusinessErrorBoundary'
        })

    return {
      hasError: true,
      error: businessError
    }
  }

  componentDidCatch(error: Error) {
    const businessError = this.state.error || BusinessErrorHandler.handle(error, {
      operation: 'render component',
      component: 'BusinessErrorBoundary'
    })

    BusinessErrorHandler.logError(businessError)
    this.props.onError?.(businessError)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <BusinessErrorDisplay 
        error={this.state.error}
        onRetry={this.handleRetry}
        showRecoveryActions={this.props.showRecoveryActions}
      />
    }

    return this.props.children
  }
}

interface BusinessErrorDisplayProps {
  error: BusinessDataError
  onRetry?: () => void
  showRecoveryActions?: boolean
  className?: string
}

export function BusinessErrorDisplay({ 
  error, 
  onRetry, 
  showRecoveryActions = true,
  className = ''
}: BusinessErrorDisplayProps) {
  const recoveryActions = BusinessErrorHandler.getRecoveryActions(error)

  const getErrorIcon = () => {
    switch (error.type) {
      case 'missing_business':
        return '🏪'
      case 'invalid_business':
        return '❌'
      case 'business_inactive':
        return '🔒'
      case 'access_denied':
        return '🚫'
      default:
        return '⚠️'
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'missing_business':
        return 'border-blue-200 bg-blue-50'
      case 'invalid_business':
        return 'border-red-200 bg-red-50'
      case 'business_inactive':
        return 'border-yellow-200 bg-yellow-50'
      case 'access_denied':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-4 ${className}`}>
      <div className={`max-w-md w-full text-center p-6 rounded-lg border-2 ${getErrorColor()}`}>
        {/* Error Icon */}
        <div className="text-6xl mb-4">
          {getErrorIcon()}
        </div>

        {/* Error Title */}
        <h2 className="text-xl font-bold text-stone-800 mb-2">
          {error.type === 'missing_business' && 'Business Not Found'}
          {error.type === 'invalid_business' && 'Invalid Business'}
          {error.type === 'business_inactive' && 'Business Unavailable'}
          {error.type === 'access_denied' && 'Access Denied'}
        </h2>

        {/* Error Message */}
        <p className="text-stone-600 mb-4">
          {error.userMessage}
        </p>

        {/* Contextual Message */}
        {error.context.businessName && (
          <p className="text-sm text-stone-500 mb-6">
            {error.getContextualMessage()}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="w-full bg-stone-700 hover:bg-stone-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          <div className="flex gap-2">
            <Link href="/directory" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Browse Businesses
              </Button>
            </Link>

            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Recovery Actions */}
        {showRecoveryActions && recoveryActions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-medium text-stone-700 mb-2">
              What you can do:
            </h3>
            <ul className="text-xs text-stone-600 space-y-1">
              {recoveryActions.map((action, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-stone-400 rounded-full mr-2 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-2 bg-stone-100 rounded text-xs text-left">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify({
                type: error.type,
                context: error.context,
                message: error.message
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}