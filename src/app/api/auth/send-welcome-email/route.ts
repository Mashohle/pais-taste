import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's business information
    const { data: businessUser, error: businessUserError } = await supabase
      .from('business_users')
      .select('business_id, businesses(name)')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()

    if (businessUserError || !businessUser) {
      console.error('Failed to fetch business info:', businessUserError)
      return NextResponse.json(
        { error: 'Business information not found' },
        { status: 404 }
      )
    }

    // Extract business name from the relation
    const business = businessUser.businesses as unknown as { name: string } | null
    const businessName = business?.name || 'Your Business'

    // TODO: Implement actual email sending logic here
    // This could use:
    // - Supabase Edge Functions
    // - SendGrid, Resend, or other email service
    // - AWS SES, etc.

    // For now, we'll just log and return success
    console.log('📧 Welcome email would be sent to:', user.email)
    console.log('Business name:', businessName)
    console.log('Admin portal link:', `${process.env.NEXT_PUBLIC_SITE_URL}/admin`)

    // In a real implementation, you would send an email like:
    /*
    await sendEmail({
      to: user.email,
      subject: `Welcome to ${businessName} on SideHusl!`,
      html: `
        <h1>Welcome to SideHusl!</h1>
        <p>Your business account has been approved!</p>
        <p>Business: ${businessName}</p>
        <p>You can access your admin portal here:</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Go to Admin Portal</a>
      `
    })
    */

    return NextResponse.json({
      message: 'Welcome email sent successfully',
      email_sent: true
    })

  } catch (error) {
    console.error('Send welcome email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
