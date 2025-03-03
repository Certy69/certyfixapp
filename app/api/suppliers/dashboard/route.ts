import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getSuppliersByCompanyId, type Certificate } from "@/lib/db-helpers"
import type { ObjectId } from "mongodb"

interface Supplier {
  _id: ObjectId
  name?: string
  certificates: Certificate[]
}

export async function GET(request: NextRequest) {
  console.log("Dashboard API route called")

  const session = await getServerSession(authOptions)
  console.log("Session:", JSON.stringify(session, null, 2))

  if (!session || !session.user || !session.user.companyId) {
    console.log("Unauthorized access attempt")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("Fetching suppliers for companyId:", session.user.companyId)
    const suppliers: Supplier[] = await getSuppliersByCompanyId(session.user.companyId)

    console.log("Suppliers fetched:", JSON.stringify(suppliers, null, 2))

    const dashboardData = {
      suppliers: suppliers.map((s) => ({
        _id: s._id.toString(),
        name: s.name || "Unnamed Supplier",
        certificates: s.certificates.map((cert) => ({
          type: cert.type,
          expirationDate: cert.expirationDate,
          status: cert.status,
        })),
      })),
    }

    console.log("Dashboard data:", dashboardData)
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

