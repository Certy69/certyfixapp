import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserById, updateUser, User } from '@/lib/db-helpers'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs/promises'

export async function GET(request: NextRequest) {
  console.log('GET /api/profile: Starting request')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', JSON.stringify(session, null, 2))

    if (!session || !session.user) {
      console.log('GET /api/profile: No valid session or user')
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 })
    }

    if (!session.user.id) {
      console.log('GET /api/profile: No user ID in session')
      console.log('Session user:', JSON.stringify(session.user, null, 2))
      return NextResponse.json({ error: 'Unauthorized: No user ID in session' }, { status: 401 })
    }

    console.log(`GET /api/profile: Fetching profile for user ID: ${session.user.id}`)
    const user = await getUserById(session.user.id)
    
    if (!user) {
      console.log(`GET /api/profile: No user found for ID: ${session.user.id}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile: Partial<User> = {
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      companyAddress: user.companyAddress,
      companyPhone: user.companyPhone,
      companyWebsite: user.companyWebsite,
      contactPerson: user.contactPerson,
    }

    console.log('GET /api/profile: Profile fetched successfully', profile)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/profile: Starting request')
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const formData = await request.formData()
    const updatedProfile: Partial<User> = {}

    // Handle text fields
    const textFields = ['fullName', 'companyName', 'companyAddress', 'companyPhone', 'companyWebsite', 'contactPerson'] as const
    textFields.forEach(field => {
      const value = formData.get(field)
      if (value && typeof value === 'string') {
        updatedProfile[field] = value
      }
    })

    // Handle file upload
    const file = formData.get('companyLogo') as File | null
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = new Uint8Array(bytes)

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadsDir, { recursive: true })

      // Save the file
      const filename = `${userId}-${Date.now()}-${file.name}`
      const filepath = path.join(uploadsDir, filename)
      await fs.writeFile(filepath, buffer)

      // Update the profile with the new logo URL
      updatedProfile.companyLogo = `/uploads/${filename}`
    }

    const updatedUser = await updateUser(userId, updatedProfile)
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error in PUT /api/profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

