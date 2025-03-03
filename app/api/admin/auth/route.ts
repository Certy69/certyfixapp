import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db-helpers"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await getUserByEmail(email)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,
      role: user.role,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

