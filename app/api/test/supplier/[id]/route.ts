import { NextResponse } from "next/server"
import { getSupplierById } from "@/lib/db-helpers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supplierId = params.id
  // For testing purposes, we're using a placeholder customerId
  const customerId = "6782fce61dfc43b2463c8e39"

  try {
    const supplier = await getSupplierById(supplierId, customerId)
    return NextResponse.json(supplier)
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 })
  }
}

