import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const user = await db.collection('users').findOne({ verificationToken: token })

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "" }
      }
    )

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'An error occurred during email verification' }, { status: 500 })
  }
}

