import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { client, db } = await connectToDatabase()
    const collections = await db.listCollections().toArray()
    await client.close()

    return NextResponse.json({
      message: "Database connection successful",
      collections: collections.map((col) => col.name),
    })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}

