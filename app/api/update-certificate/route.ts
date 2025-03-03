import { NextResponse } from "next/server"
import {
  getCertificateUpdateToken,
  deleteCertificateUpdateToken,
  updateCertificate,
  getSupplierById,
  getCertificateById,
  type Certificate,
} from "@/lib/db-helpers"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  const body = await request.json()
  const { token, expirationDate, file } = body

  if (!token || !expirationDate || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const tokenData = await getCertificateUpdateToken(token)

  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  if (tokenData.expiresAt < new Date()) {
    await deleteCertificateUpdateToken(token)
    return NextResponse.json({ error: "Token has expired" }, { status: 400 })
  }

  try {
    const supplier = await getSupplierById(tokenData.supplierId.toString())
    const certificate = await getCertificateById(tokenData.supplierId.toString(), tokenData.certificateId)

    if (!supplier || !certificate) {
      return NextResponse.json({ error: "Supplier or certificate not found" }, { status: 404 })
    }

    // Update the certificate
    const updatedCertificate: Omit<Certificate, "id" | "_id"> = {
      ...certificate,
      expirationDate: new Date(expirationDate),
      fileId: new ObjectId(), // You might want to handle file upload separately
      type: certificate.type,
      issueDate: certificate.issueDate,
      status: certificate.status,
      remindersSent: certificate.remindersSent,
    }

    await updateCertificate(tokenData.supplierId.toString(), tokenData.certificateId, updatedCertificate)

    // Delete the used token
    await deleteCertificateUpdateToken(token)

    return NextResponse.json({ message: "Certificate updated successfully" })
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

