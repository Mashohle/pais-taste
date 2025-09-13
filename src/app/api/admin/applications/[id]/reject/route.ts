import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { rejection_reason } = await request.json()

    if (!rejection_reason || !rejection_reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get current user (super-admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('business_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      )
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('business_applications')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejection_reason.trim()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update application:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    // TODO: Send rejection email to applicant with feedback
    
    return NextResponse.json({
      message: 'Application rejected',
      rejection_reason
    })

  } catch (error) {
    console.error('Application rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}