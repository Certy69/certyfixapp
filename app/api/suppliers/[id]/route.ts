import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { updateCertificate, deleteCertificate } from "@/lib/db-helpers"

export async function PUT(request: Request, { params }: { params: { id: string; certificateId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: supplierId, certificateId } = params
  const body = await request.json()

  try {
    const updatedSupplier = await updateCertificate(supplierId, certificateId, body)
    if (updatedSupplier) {
      return NextResponse.json(updatedSupplier)
    } else {
      return NextResponse.json({ error: "Supplier or certificate not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; certificateId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: supplierId, certificateId } = params

  try {
    const updatedSupplier = await deleteCertificate(supplierId, certificateId)
    if (updatedSupplier) {
      return NextResponse.json(updatedSupplier)
    } else {
      return NextResponse.json({ error: "Supplier or certificate not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

