import { type NextRequest, NextResponse } from "next/server"
import { getFile } from "@/lib/db-helpers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerId = session.user.customerId
    const fileId = new ObjectId(params.fileId)

    const file = await getFile(fileId, customerId)

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="certificate.pdf"',
      },
    })
  } catch (error) {
    console.error("Error retrieving file:", error)
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 })
  }
}

