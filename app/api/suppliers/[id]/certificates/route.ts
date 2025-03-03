import { type NextRequest, NextResponse } from "next/server"
import { getSupplierById, addCertificate, storeFile, updateCertificate, deleteCertificate } from "@/lib/db-helpers"
import type { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerId = session.user.customerId

    const supplier = await getSupplierById(params.id, customerId)
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const type = formData.get("type") as string
    const issueDate = formData.get("issueDate") as string
    const expirationDate = formData.get("expirationDate") as string
    const file = formData.get("file") as File | null

    let fileId: ObjectId | undefined

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      fileId = await storeFile(buffer, file.name, customerId)
    }

    const status = calculateCertificateStatus(new Date(expirationDate))

    const newCertificate = {
      type,
      issueDate,
      expirationDate,
      fileId,
      status,
      remindersSent: 0,
    }

    await addCertificate(params.id, customerId, newCertificate)

    const updatedSupplier = await getSupplierById(params.id, customerId)
    return NextResponse.json(updatedSupplier)
  } catch (error) {
    console.error("Error adding certificate:", error)
    return NextResponse.json({ error: "Failed to add certificate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerId = session.user.customerId

    const supplier = await getSupplierById(params.id, customerId)
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    const { certificateId, ...updatedCertificate } = await request.json()

    if (!certificateId) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
    }

    if (updatedCertificate.expirationDate) {
      updatedCertificate.status = calculateCertificateStatus(new Date(updatedCertificate.expirationDate))
    }

    const result = await updateCertificate(params.id, certificateId, updatedCertificate)

    if (!result) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const updatedSupplier = await getSupplierById(params.id, customerId)
    return NextResponse.json(updatedSupplier)
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerId = session.user.customerId

    const supplier = await getSupplierById(params.id, customerId)
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get("certificateId")

    if (!certificateId) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
    }

    const result = await deleteCertificate(params.id, certificateId)

    if (!result) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const updatedSupplier = await getSupplierById(params.id, customerId)
    return NextResponse.json(updatedSupplier)
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 })
  }
}

function calculateCertificateStatus(expirationDate: Date): "valid" | "expiring" | "expired" {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (expirationDate < today) {
    return "expired"
  } else if (expirationDate <= thirtyDaysFromNow) {
    return "expiring"
  } else {
    return "valid"
  }
}

