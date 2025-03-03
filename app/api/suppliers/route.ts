import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getSuppliersByCompanyId, createSupplier, storeFile } from '@/lib/db-helpers'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log('No session or user found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    console.log('Session user:', session.user)
    console.log('Company ID:', companyId)

    if (!companyId) {
      console.log('No company ID found in session')
      return NextResponse.json({ error: 'No company ID found' }, { status: 400 })
    }

    const suppliers = await getSuppliersByCompanyId(companyId)
    console.log('Suppliers fetched:', suppliers)
    return NextResponse.json({ suppliers: suppliers || [] })
  } catch (error) {
    console.error('Error in GET /api/suppliers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const companyId = (session.user as any).companyId
    if (!companyId) {
      return NextResponse.json({ error: 'No company ID found' }, { status: 400 })
    }

    const formData = await req.formData()
    const supplierDataJson = formData.get('supplierData') as string
    const supplierData = JSON.parse(supplierDataJson)

    const certificates = []
    let index = 0
    while (formData.has(`certificate${index}`)) {
      const certificateJson = formData.get(`certificate${index}`) as string
      const certificate = JSON.parse(certificateJson)
      const file = formData.get(`certificateFile${index}`) as File | null

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileId = await storeFile(buffer, file.name)
        certificate.fileId = fileId
      }

      certificates.push({
        ...certificate,
        id: new ObjectId().toString()
      })
      index++
    }

    const newSupplier = {
      ...supplierData,
      companyId: new ObjectId(companyId),
      certificates,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await createSupplier(newSupplier)

    return NextResponse.json({ success: true, supplier: result })
  } catch (error) {
    console.error('Error in POST /api/suppliers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

