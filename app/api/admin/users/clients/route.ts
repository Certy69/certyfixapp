import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllUsers, updateUserApproval } from '@/lib/db-helpers'

export async function GET(req: Request) {
  console.log('GET /api/admin/clients: Start')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', JSON.stringify(session, null, 2))

    if (!session || !session.user) {
      console.log('No session or user found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if ((session.user as any).role !== 'admin') {
      console.log('User is not admin:', JSON.stringify(session.user, null, 2))
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const users = await getAllUsers()
    console.log('All users fetched:', users.length, 'users')
    console.log('Sample user:', users[0] ? JSON.stringify(users[0], null, 2) : 'No users found')

    const clients = users.filter(user => user.role === 'client')
    console.log('Filtered clients:', clients.length, 'clients')
    console.log('Sample client:', clients[0] ? JSON.stringify(clients[0], null, 2) : 'No clients found')

    console.log('GET /api/admin/clients: Success')
    return new NextResponse(JSON.stringify({ clients }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Unhandled error in GET /api/admin/clients:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, isApproved } = await req.json()

    if (isApproved !== undefined) {
      await updateUserApproval(userId, isApproved)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 })
  }
}

