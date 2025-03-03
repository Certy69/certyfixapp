import { NextResponse } from "next/server"
import { getCertificateUpdateToken, getSupplierById, getCertificateById } from "@/lib/db-helpers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const tokenData = await getCertificateUpdateToken(token)

  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  if (tokenData.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token has expired" }, { status: 400 })
  }

  try {
    const supplier = await getSupplierById(tokenData.supplierId.toString())
    const certificate = await getCertificateById(tokenData.supplierId.toString(), tokenData.certificateId)

    if (!supplier || !certificate) {
      return NextResponse.json({ error: "Supplier or certificate not found" }, { status: 404 })
    }

    return NextResponse.json({
      supplier: {
        name: supplier.name,
        email: supplier.email,
      },
      certificate: {
        type: certificate.type,
        expirationDate: certificate.expirationDate,
      },
    })
  } catch (error) {
    console.error("Error fetching supplier or certificate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

