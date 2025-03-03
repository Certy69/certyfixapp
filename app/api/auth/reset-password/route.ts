import { NextRequest, NextResponse } from 'next/server'
import { getPasswordResetToken, getUserById, updateUserPassword, deletePasswordResetToken } from '@/lib/db-helpers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    const resetToken = await getPasswordResetToken(token)
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user = await getUserById(resetToken.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await updateUserPassword(user._id.toString(), hashedPassword)

    // Delete the used token
    await deletePasswordResetToken(token)

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

