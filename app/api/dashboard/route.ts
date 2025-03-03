import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getSuppliersByCompanyId, type Certificate } from "@/lib/db-helpers"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const suppliers = await getSuppliersByCompanyId(session.user.companyId)

    let totalCertificates = 0
    let validCertificates = 0
    let expiringCertificates = 0
    let expiredCertificates = 0
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const processedSuppliers = suppliers.map((supplier) => {
      const processedCertificates = supplier.certificates.map((cert: Certificate) => {
        const expirationDate = new Date(cert.expirationDate)
        let status: "valid" | "expiring" | "expired"

        if (expirationDate <= now) {
          status = "expired"
          expiredCertificates++
        } else if (expirationDate <= thirtyDaysFromNow) {
          status = "expiring"
          expiringCertificates++
        } else {
          status = "valid"
          validCertificates++
        }

        totalCertificates++

        return {
          ...cert,
          status,
          id: cert._id ? cert._id.toString() : cert.id,
        }
      })

      return {
        ...supplier,
        _id: supplier._id.toString(),
        certificates: processedCertificates,
      }
    })

    const dashboardData = {
      suppliers: processedSuppliers,
      totalCertificates,
      validCertificates,
      expiringCertificates,
      expiredCertificates,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

