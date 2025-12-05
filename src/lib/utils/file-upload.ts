/**
 * File Upload Utilities for Business Application Documents
 */

import { createClient } from '@/lib/supabase/client'

// Allowed file types for document uploads
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
}

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Document types
export type DocumentType = 'id_document' | 'registration_certificate' | 'bank_statement'

export interface UploadedDocument {
  type: DocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

/**
 * Validates a file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB. Please upload a smaller file.`
    }
  }

  // Check file type
  const allowedTypes = Object.keys(ALLOWED_FILE_TYPES)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload PDF, JPG, or PNG files only.`
    }
  }

  return { valid: true }
}

/**
 * Generates a unique file name for storage
 */
export function generateFileName(originalName: string, documentType: DocumentType): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 9)
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  return `${documentType}_${timestamp}_${randomString}${extension}`
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadDocumentToStorage(
  file: File,
  documentType: DocumentType
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique file name
    const fileName = generateFileName(file.name, documentType)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('business-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: `Upload failed: ${error.message}` }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('business-documents')
      .getPublicUrl(data.path)

    return {
      success: true,
      fileUrl: publicUrl
    }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteDocumentFromStorage(
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = fileUrl.split('/business-documents/')
    if (urlParts.length !== 2) {
      return { success: false, error: 'Invalid file URL' }
    }

    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('business-documents')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: `Delete failed: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    }
  }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
