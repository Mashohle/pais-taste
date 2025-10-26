/**
 * Business Data Error Handler
 * Provides centralized error handling for missing business data
 */

export interface BusinessErrorContext {
  businessId?: string
  businessName?: string
  operation: string
  component?: string
}

export class BusinessDataError extends Error {
  public readonly type: 'missing_business' | 'invalid_business' | 'business_inactive' | 'access_denied'
  public readonly context: BusinessErrorContext
  public readonly userMessage: string

  constructor(
    type: BusinessDataError['type'], 
    context: BusinessErrorContext, 
    userMessage?: string
  ) {
    super(`Business data error: ${type}`)
    this.type = type
    this.context = context
    this.userMessage = userMessage || this.getDefaultUserMessage()
    this.name = 'BusinessDataError'
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case 'missing_business':
        return 'Business information is not available. Please try again or contact support.'
      case 'invalid_business':
        return 'The selected business appears to be invalid. Please choose a different business.'
      case 'business_inactive':
        return 'This business is currently unavailable. Please try again later.'
      case 'access_denied':
        return 'You do not have permission to access this business.'
      default:
        return 'An error occurred while loading business information.'
    }
  }

  public getContextualMessage(): string {
    const businessName = this.context.businessName || 'business'
    const operation = this.context.operation

    switch (this.type) {
      case 'missing_business':
        return `Unable to ${operation} - ${businessName} information is missing.`
      case 'invalid_business':
        return `Cannot ${operation} - ${businessName} is not valid or has been removed.`
      case 'business_inactive':
        return `${businessName} is currently inactive and cannot ${operation}.`
      case 'access_denied':
        return `Access denied when trying to ${operation} for ${businessName}.`
      default:
        return `Error occurred during ${operation} for ${businessName}.`
    }
  }
}

export class BusinessErrorHandler {
  static handle(error: unknown, context: BusinessErrorContext): BusinessDataError {
    // If already a BusinessDataError, return as is
    if (error instanceof BusinessDataError) {
      return error
    }

    // Convert common errors to BusinessDataError
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      if (message.includes('not found') || message.includes('null') || message.includes('undefined')) {
        return new BusinessDataError('missing_business', context)
      }
      
      if (message.includes('inactive') || message.includes('disabled')) {
        return new BusinessDataError('business_inactive', context)
      }
      
      if (message.includes('permission') || message.includes('access') || message.includes('denied')) {
        return new BusinessDataError('access_denied', context)
      }
      
      if (message.includes('invalid') || message.includes('corrupt')) {
        return new BusinessDataError('invalid_business', context)
      }
    }

    // Default to missing business error
    return new BusinessDataError('missing_business', context, 'An unexpected error occurred.')
  }

  static validateBusinessData(businessData: unknown, context: BusinessErrorContext): void {
    if (!businessData) {
      throw new BusinessDataError('missing_business', context)
    }

    // Type guard: check if businessData is an object with required properties
    if (typeof businessData !== 'object') {
      throw new BusinessDataError('invalid_business', context, 'Business data is not a valid object.')
    }

    const data = businessData as Record<string, unknown>

    if (!data.id || !data.name) {
      throw new BusinessDataError('invalid_business', context, 'Business is missing essential information.')
    }

    if (data.is_active === false) {
      throw new BusinessDataError('business_inactive', context)
    }
  }

  static async safeBusinessOperation<T>(
    operation: () => Promise<T>,
    context: BusinessErrorContext
  ): Promise<{ success: true; data: T } | { success: false; error: BusinessDataError }> {
    try {
      const data = await operation()
      return { success: true, data }
    } catch (error) {
      const businessError = BusinessErrorHandler.handle(error, context)
      console.error(`Business operation failed:`, {
        type: businessError.type,
        context: businessError.context,
        message: businessError.message
      })
      return { success: false, error: businessError }
    }
  }

  static logError(error: BusinessDataError): void {
    console.error('BusinessDataError:', {
      type: error.type,
      context: error.context,
      userMessage: error.userMessage,
      contextualMessage: error.getContextualMessage(),
      stack: error.stack
    })
  }

  static getRecoveryActions(error: BusinessDataError): string[] {
    switch (error.type) {
      case 'missing_business':
        return [
          'Refresh the page',
          'Go back to the business directory',
          'Contact support if the problem persists'
        ]
      case 'invalid_business':
        return [
          'Choose a different business',
          'Return to the business directory',
          'Clear your browser cache'
        ]
      case 'business_inactive':
        return [
          'Try again later',
          'Check if the business has resumed operations',
          'Look for alternative businesses'
        ]
      case 'access_denied':
        return [
          'Log in to your account',
          'Contact the business directly',
          'Check if you have the required permissions'
        ]
      default:
        return [
          'Refresh the page',
          'Try again in a few minutes',
          'Contact support if the issue continues'
        ]
    }
  }
}

export function withBusinessErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  defaultContext: Omit<BusinessErrorContext, 'businessId' | 'businessName'> = { operation: 'unknown operation' }
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw BusinessErrorHandler.handle(error, { ...defaultContext } as BusinessErrorContext)
    }
  }
}