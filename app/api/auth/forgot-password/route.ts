import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, storePasswordResetToken } from '@/lib/db-helpers'
import { sendPasswordResetEmail } from '@/lib/email'
import { generatePasswordResetToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    console.log('Received forgot password request for email:', email)

    const user = await getUserByEmail(email)
    console.log('User found:', user ? 'Yes' : 'No')

    if (user) {
      const token = await generatePasswordResetToken(user._id.toString())
      console.log('Generated reset token:', token)
      
      await sendPasswordResetEmail(user.email, token)
      console.log('Password reset email sent successfully')
    } else {
      console.log('No user found with this email')
    }

    return NextResponse.json({ message: 'If an account exists for this email, you will receive password reset instructions.' })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

