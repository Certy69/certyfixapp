import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getUserByEmail, getCollection } from "@/lib/db-helpers"
import { sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, companyName } = await request.json()

    // Validate input
    if (!fullName || !email || !password || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company
    const companies = await getCollection("companies")
    const companyResult = await companies.insertOne({
      name: companyName,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user
    const users = await getCollection("users")
    const userResult = await users.insertOne({
      fullName,
      email,
      password: hashedPassword,
      companyId: companyResult.insertedId,
      customerId: new ObjectId(), // Generate a new ObjectId for customerId
      companyName,
      isVerified: false,
      isApproved: false,
      isActive: true,
      role: "client",
      createdAt: new Date(),
      verificationToken,
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email to verify your account.",
        userId: userResult.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

