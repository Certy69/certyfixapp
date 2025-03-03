import { ObjectId, GridFSBucket } from "mongodb"
import { connectToDatabase } from "./mongodb"

// Custom error type for database operations
export interface DatabaseError extends Error {
  code?: string
  collection?: string
  operation?: string
}

// Helper function to safely convert string to ObjectId
export function toObjectId(id: string | ObjectId | undefined): ObjectId | undefined {
  if (!id) return undefined
  if (id instanceof ObjectId) return id
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Invalid ObjectId: ${id}`, error)
    return undefined
  }
}

export interface Certificate {
  id: string
  type: string
  issueDate: string
  expirationDate: string
  status: "valid" | "expiring" | "expired"
  fileId?: ObjectId
  remindersSent: number
}

export interface Supplier {
  _id: ObjectId
  name: string
  email: string
  phone: string
  address: string
  type?: "manufacturer" | "distributor" | "retailer"
  status: "active" | "inactive"
  certificates: Certificate[]
  customerId: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  _id: ObjectId
  fullName: string
  email: string
  password: string
  companyId: ObjectId
  customerId: ObjectId
  companyName: string
  companyLogo?: string
  companyAddress: string
  companyPhone: string
  companyWebsite: string
  contactPerson: string
  bio: string
  isVerified: boolean
  isApproved: boolean
  isActive: boolean
  role: "admin" | "client"
  createdAt: Date
  updatedAt: Date
  paymentStatus?: "active" | "inactive"
}

export interface NotificationSettings {
  _id: ObjectId
  companyId: ObjectId
  emailTemplate: string
  firstReminderDays: number
  secondReminderDays: number
  thirdReminderDays: number
  notificationEmail: string
}

async function getGridFSBucket() {
  const { db } = await connectToDatabase()
  return new GridFSBucket(db, { bucketName: "certificates" })
}

export async function getSupplierById(supplierId: string, customerId: string): Promise<Supplier | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    const customerObjectId = toObjectId(customerId)

    if (!supplierObjectId || !customerObjectId) {
      throw new Error("Invalid supplier or customer ID")
    }

    const result = await suppliers.findOne({
      _id: supplierObjectId,
      customerId: customerObjectId,
    })

    console.log("Raw supplier data from database:", JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "getSupplierById"
    console.error("Error in getSupplierById:", dbError)
    throw dbError
  }
}

export async function getCompanyById(companyId: string) {
  try {
    const { db } = await connectToDatabase()
    const companies = db.collection("companies")
    const companyObjectId = toObjectId(companyId)

    if (!companyObjectId) {
      throw new Error("Invalid company ID")
    }

    return companies.findOne({ _id: companyObjectId })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "companies"
    dbError.operation = "getCompanyById"
    console.error("Error in getCompanyById:", dbError)
    throw dbError
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) {
    throw new Error("Email is required")
  }

  try {
    const { db } = await connectToDatabase()
    console.log(`Attempting to fetch user with email: ${email}`)
    const users = db.collection<User>("users")
    const user = await users.findOne({ email })

    if (!user) {
      console.log(`No user found with email: ${email}`)
      return null
    }

    // Process the user data and ensure ObjectId conversions
    const processedUser: User = {
      ...user,
      id: user._id.toString(),
      _id: user._id instanceof ObjectId ? user._id : new ObjectId(user._id),
      companyId: user.companyId instanceof ObjectId ? user.companyId : new ObjectId(user.companyId),
      customerId: user.customerId instanceof ObjectId ? user.customerId : new ObjectId(user.customerId),
    }

    console.log("User found:", JSON.stringify({ ...processedUser, password: "[REDACTED]" }, null, 2))
    return processedUser
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "getUserByEmail"
    console.error("Error in getUserByEmail:", dbError)
    throw dbError
  }
}

export async function createUser(userData: Omit<User, "_id" | "id" | "createdAt" | "updatedAt">): Promise<User> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const newUser = {
      _id: new ObjectId(),
      id: new ObjectId().toString(),
      ...userData,
      companyId: toObjectId(userData.companyId?.toString()) || new ObjectId(),
      customerId: toObjectId(userData.customerId?.toString()) || new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating user with data:", { ...newUser, password: "[REDACTED]" })
    const result = await users.insertOne(newUser as User)

    if (!result.acknowledged) {
      throw new Error("Failed to create user")
    }

    return newUser as User
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "createUser"
    console.error("Error in createUser:", dbError)
    throw dbError
  }
}

export async function getSuppliersByCompanyId(companyId: string): Promise<Supplier[]> {
  if (!companyId) {
    console.log("No companyId provided to getSuppliersByCompanyId")
    return []
  }

  try {
    const { db } = await connectToDatabase()
    console.log(`Attempting to fetch suppliers for companyId: ${companyId}`)
    const suppliers = db.collection<Supplier>("suppliers")

    const companyObjectId = toObjectId(companyId)
    if (!companyObjectId) {
      throw new Error("Invalid company ID")
    }

    const result = await suppliers.find({ companyId: companyObjectId }).toArray()
    console.log(`Found ${result.length} suppliers for companyId: ${companyId}`)

    // Process certificates
    const processedResult = result.map((supplier) => {
      const processedCertificates = supplier.certificates.map((cert: Certificate) => {
        const expirationDate = new Date(cert.expirationDate)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

        let status: "valid" | "expired" | "expiring"
        if (expirationDate < today) {
          status = "expired"
        } else if (expirationDate <= thirtyDaysFromNow) {
          status = "expiring"
        } else {
          status = "valid"
        }

        return { ...cert, status }
      })

      return { ...supplier, certificates: processedCertificates }
    })

    console.log("Processed suppliers:", JSON.stringify(processedResult, null, 2))
    return processedResult
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "getSuppliersByCompanyId"
    console.error("Error in getSuppliersByCompanyId:", dbError)
    throw dbError
  }
}

export async function createSupplier(
  supplierData: Omit<Supplier, "_id" | "createdAt" | "updatedAt">,
): Promise<Supplier> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const newSupplier = {
      _id: new ObjectId(),
      ...supplierData,
      customerId: toObjectId(supplierData.customerId?.toString()) || new ObjectId(),
      status: supplierData.status || "active",
      certificates: supplierData.certificates || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Attempting to insert supplier:", newSupplier)
    const result = await suppliers.insertOne(newSupplier as Supplier)

    if (!result.acknowledged) {
      throw new Error("Failed to create supplier")
    }

    return newSupplier as Supplier
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "createSupplier"
    console.error("Error in createSupplier:", dbError)
    throw dbError
  }
}

export async function updateSupplier(supplierId: string, supplierData: Partial<Supplier>): Promise<Supplier | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const updateData = { ...supplierData, updatedAt: new Date() }

    const result = await suppliers.findOneAndUpdate(
      { _id: supplierObjectId },
      { $set: updateData },
      { returnDocument: "after" },
    )

    return result.value
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "updateSupplier"
    console.error("Error in updateSupplier:", dbError)
    throw dbError
  }
}

export async function addCertificate(
  supplierId: string,
  customerId: string,
  certificate: Omit<Certificate, "id" | "remindersSent">,
): Promise<Supplier | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    const customerObjectId = toObjectId(customerId)

    if (!supplierObjectId || !customerObjectId) {
      throw new Error("Invalid supplier or customer ID")
    }

    const newCertificate = {
      ...certificate,
      id: new ObjectId().toString(),
      remindersSent: 0,
    }

    const result = await suppliers.findOneAndUpdate(
      { _id: supplierObjectId, customerId: customerObjectId },
      { $push: { certificates: newCertificate } },
      { returnDocument: "after" },
    )

    return result.value
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "addCertificate"
    console.error("Error in addCertificate:", dbError)
    throw dbError
  }
}

export async function updateCertificate(
  supplierId: string,
  certificateId: string,
  updatedCertificate: Partial<Omit<Certificate, "id">>,
): Promise<Supplier | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const result = await suppliers.findOneAndUpdate(
      { _id: supplierObjectId, "certificates.id": certificateId },
      { $set: { "certificates.$": { ...updatedCertificate, id: certificateId } } },
      { returnDocument: "after" },
    )

    return result.value
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "updateCertificate"
    console.error("Error in updateCertificate:", dbError)
    throw dbError
  }
}

export async function deleteCertificate(supplierId: string, certificateId: string): Promise<Supplier | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const result = await suppliers.findOneAndUpdate(
      { _id: supplierObjectId },
      { $pull: { certificates: { id: certificateId } } },
      { returnDocument: "after" },
    )

    return result.value
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "deleteCertificate"
    console.error("Error in deleteCertificate:", dbError)
    throw dbError
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")
    console.log("Getting users collection")

    const allUsers = await users.find({}).toArray()
    console.log(`Found ${allUsers.length} users`)

    return allUsers.map((user) => ({
      ...user,
      id: user._id.toString(),
      _id: user._id instanceof ObjectId ? user._id : new ObjectId(user._id),
      companyId: user.companyId instanceof ObjectId ? user.companyId : new ObjectId(user.companyId),
      customerId: user.customerId instanceof ObjectId ? user.customerId : new ObjectId(user.customerId),
    }))
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "getAllUsers"
    console.error("Error in getAllUsers:", dbError)
    throw dbError
  }
}

export async function updateUserApproval(userId: string, isApproved: boolean): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await users.updateOne({ _id: userObjectId }, { $set: { isApproved, updatedAt: new Date() } })

    if (!result.acknowledged) {
      throw new Error("Failed to update user approval status")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "updateUserApproval"
    console.error("Error in updateUserApproval:", dbError)
    throw dbError
  }
}

export async function updateUserPaymentStatus(userId: string, paymentStatus: "active" | "inactive"): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await users.updateOne({ _id: userObjectId }, { $set: { paymentStatus, updatedAt: new Date() } })

    if (!result.acknowledged) {
      throw new Error("Failed to update user payment status")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "updateUserPaymentStatus"
    console.error("Error in updateUserPaymentStatus:", dbError)
    throw dbError
  }
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await users.updateOne({ _id: userObjectId }, { $set: { isActive, updatedAt: new Date() } })

    if (!result.acknowledged) {
      throw new Error("Failed to update user status")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "updateUserStatus"
    console.error("Error in updateUserStatus:", dbError)
    throw dbError
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    console.log(`Attempting to fetch user with ID: ${userId}`)

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const users = db.collection<User>("users")
    const user = await users.findOne({ _id: userObjectId })

    if (user) {
      const processedUser: User = {
        ...user,
        id: user._id.toString(),
        _id: user._id instanceof ObjectId ? user._id : new ObjectId(user._id),
        companyId: user.companyId instanceof ObjectId ? user.companyId : new ObjectId(user.companyId),
        customerId: user.customerId instanceof ObjectId ? user.customerId : new ObjectId(user.customerId),
      }
      console.log("User found:", JSON.stringify({ ...processedUser, password: "[REDACTED]" }, null, 2))
      return processedUser
    }

    console.log(`No user found with ID: ${userId}`)
    return null
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "getUserById"
    console.error("Error in getUserById:", dbError)
    throw dbError
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await users.deleteOne({ _id: userObjectId })
    return result.deletedCount === 1
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "deleteUser"
    console.error("Error in deleteUser:", dbError)
    throw dbError
  }
}

export async function storeFile(file: Buffer, filename: string, customerId: string): Promise<ObjectId> {
  try {
    const { db } = await connectToDatabase()
    const bucket = await getGridFSBucket()

    const customerObjectId = toObjectId(customerId)
    if (!customerObjectId) {
      throw new Error("Invalid customer ID")
    }

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: { customerId: customerObjectId },
      })

      // Instead of using pipe, we'll write directly to the stream
      uploadStream.write(file, (error) => {
        if (error) {
          reject(error)
          return
        }
        uploadStream.end(() => {
          resolve(uploadStream.id)
        })
      })

      uploadStream.on("error", reject)
    })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "gridfs"
    dbError.operation = "storeFile"
    console.error("Error in storeFile:", dbError)
    throw dbError
  }
}

export async function getFile(fileId: ObjectId, customerId: string): Promise<Buffer> {
  try {
    const { db } = await connectToDatabase()
    const bucket = await getGridFSBucket()

    const customerObjectId = toObjectId(customerId)
    if (!customerObjectId) {
      throw new Error("Invalid customer ID")
    }

    const file = await bucket
      .find({
        _id: fileId,
        "metadata.customerId": customerObjectId,
      })
      .next()

    if (!file) {
      throw new Error("File not found")
    }

    return new Promise((resolve, reject) => {
      const chunks: any[] = []
      bucket
        .openDownloadStream(fileId)
        .on("data", (chunk) => chunks.push(chunk))
        .on("error", reject)
        .on("end", () => resolve(Buffer.concat(chunks)))
    })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "gridfs"
    dbError.operation = "getFile"
    console.error("Error in getFile:", dbError)
    throw dbError
  }
}

export async function storePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const passwordResetTokens = db.collection("passwordResetTokens")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await passwordResetTokens.insertOne({
      userId: userObjectId,
      token,
      expiresAt,
      createdAt: new Date(),
    })

    if (!result.acknowledged) {
      throw new Error("Failed to store password reset token")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "passwordResetTokens"
    dbError.operation = "storePasswordResetToken"
    console.error("Error in storePasswordResetToken:", dbError)
    throw dbError
  }
}

export async function getPasswordResetToken(token: string) {
  try {
    const { db } = await connectToDatabase()
    const passwordResetTokens = db.collection("passwordResetTokens")
    return passwordResetTokens.findOne({ token })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "passwordResetTokens"
    dbError.operation = "getPasswordResetToken"
    console.error("Error in getPasswordResetToken:", dbError)
    throw dbError
  }
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const passwordResetTokens = db.collection("passwordResetTokens")

    const result = await passwordResetTokens.deleteOne({ token })

    if (!result.acknowledged) {
      throw new Error("Failed to delete password reset token")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "passwordResetTokens"
    dbError.operation = "deletePasswordResetToken"
    console.error("Error in deletePasswordResetToken:", dbError)
    throw dbError
  }
}

export async function updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const result = await users.updateOne(
      { _id: userObjectId },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    )

    if (!result.acknowledged) {
      throw new Error("Failed to update user password")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "updateUserPassword"
    console.error("Error in updateUserPassword:", dbError)
    throw dbError
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    console.log(`Attempting to update user with ID: ${userId}`)

    const userObjectId = toObjectId(userId)
    if (!userObjectId) {
      throw new Error("Invalid user ID")
    }

    const users = db.collection<User>("users")
    const updateData = { ...userData, updatedAt: new Date() }

    // Convert string IDs to ObjectIds
    if (updateData.companyId) {
      updateData.companyId = toObjectId(updateData.companyId.toString()) || new ObjectId()
    }
    if (updateData.customerId) {
      updateData.customerId = toObjectId(updateData.customerId.toString()) || new ObjectId()
    }

    const result = await users.findOneAndUpdate(
      { _id: userObjectId },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result.value) {
      console.log(`No user found to update with ID: ${userId}`)
      return null
    }

    const updatedUser: User = {
      ...result.value,
      id: result.value._id.toString(),
      _id: result.value._id instanceof ObjectId ? result.value._id : new ObjectId(result.value._id),
      companyId:
        result.value.companyId instanceof ObjectId ? result.value.companyId : new ObjectId(result.value.companyId),
      customerId:
        result.value.customerId instanceof ObjectId ? result.value.customerId : new ObjectId(result.value.customerId),
    }

    console.log("Updated user:", JSON.stringify({ ...updatedUser, password: "[REDACTED]" }, null, 2))
    return updatedUser
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "users"
    dbError.operation = "updateUser"
    console.error("Error in updateUser:", dbError)
    throw dbError
  }
}

export async function deleteSupplier(supplierId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const result = await suppliers.deleteOne({ _id: supplierObjectId })
    return result.deletedCount === 1
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "deleteSupplier"
    console.error("Error in deleteSupplier:", dbError)
    throw dbError
  }
}

export async function getNotificationSettings(companyId: string): Promise<NotificationSettings | null> {
  try {
    const { db } = await connectToDatabase()
    const settings = db.collection<NotificationSettings>("notificationSettings")

    const companyObjectId = toObjectId(companyId)
    if (!companyObjectId) {
      throw new Error("Invalid company ID")
    }

    return settings.findOne({ companyId: companyObjectId })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "notificationSettings"
    dbError.operation = "getNotificationSettings"
    console.error("Error in getNotificationSettings:", dbError)
    throw dbError
  }
}

export async function updateNotificationSettings(
  companyId: string,
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings | null> {
  try {
    const { db } = await connectToDatabase()
    const settingsCollection = db.collection<NotificationSettings>("notificationSettings")

    const companyObjectId = toObjectId(companyId)
    if (!companyObjectId) {
      throw new Error("Invalid company ID")
    }

    const result = await settingsCollection.findOneAndUpdate(
      { companyId: companyObjectId },
      { $set: { ...settings, updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    )

    return result.value
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "notificationSettings"
    dbError.operation = "updateNotificationSettings"
    console.error("Error in updateNotificationSettings:", dbError)
    throw dbError
  }
}

export async function getExpiringCertificates(
  daysBeforeExpiration: number,
): Promise<Array<{ supplier: Supplier; certificate: Certificate }>> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysBeforeExpiration)

    const result = await suppliers
      .aggregate([
        { $unwind: "$certificates" },
        {
          $match: {
            "certificates.expirationDate": { $lte: expirationDate, $gt: new Date() },
            "certificates.remindersSent": { $lt: 3 },
          },
        },
        {
          $project: {
            _id: 0,
            supplier: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              phone: "$phone",
              address: "$address",
            },
            certificate: "$certificates",
          },
        },
      ])
      .toArray()

    return result.map((item) => ({
      supplier: item.supplier as Supplier,
      certificate: item.certificate as Certificate,
    }))
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "getExpiringCertificates"
    console.error("Error in getExpiringCertificates:", dbError)
    throw dbError
  }
}

export async function getCertificateById(supplierId: string, certificateId: string): Promise<Certificate | null> {
  try {
    const { db } = await connectToDatabase()
    const suppliers = db.collection<Supplier>("suppliers")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const supplier = await suppliers.findOne(
      { _id: supplierObjectId, "certificates.id": certificateId },
      { projection: { "certificates.$": 1 } },
    )

    if (!supplier || !supplier.certificates || supplier.certificates.length === 0) {
      return null
    }

    return supplier.certificates[0]
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "suppliers"
    dbError.operation = "getCertificateById"
    console.error("Error in getCertificateById:", dbError)
    throw dbError
  }
}

export async function storeCertificateUpdateToken(
  supplierId: string,
  certificateId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const certificateUpdateTokens = db.collection("certificateUpdateTokens")

    const supplierObjectId = toObjectId(supplierId)
    if (!supplierObjectId) {
      throw new Error("Invalid supplier ID")
    }

    const result = await certificateUpdateTokens.insertOne({
      supplierId: supplierObjectId,
      certificateId,
      token,
      expiresAt,
      createdAt: new Date(),
    })

    if (!result.acknowledged) {
      throw new Error("Failed to store certificate update token")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "certificateUpdateTokens"
    dbError.operation = "storeCertificateUpdateToken"
    console.error("Error in storeCertificateUpdateToken:", dbError)
    throw dbError
  }
}

export async function getCertificateUpdateToken(token: string) {
  try {
    const { db } = await connectToDatabase()
    const certificateUpdateTokens = db.collection("certificateUpdateTokens")
    return certificateUpdateTokens.findOne({ token })
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "certificateUpdateTokens"
    dbError.operation = "getCertificateUpdateToken"
    console.error("Error in getCertificateUpdateToken:", dbError)
    throw dbError
  }
}

export async function deleteCertificateUpdateToken(token: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const certificateUpdateTokens = db.collection("certificateUpdateTokens")

    const result = await certificateUpdateTokens.deleteOne({ token })

    if (!result.acknowledged) {
      throw new Error("Failed to delete certificate update token")
    }
  } catch (error) {
    const dbError = error as DatabaseError
    dbError.collection = "certificateUpdateTokens"
    dbError.operation = "deleteCertificateUpdateToken"
    console.error("Error in deleteCertificateUpdateToken:", dbError)
    throw dbError
  }
}

