import formData from "form-data"
import Mailgun from "mailgun.js"
import crypto from "crypto"
import { storeCertificateUpdateToken } from "./db-helpers"
import type { Supplier, Certificate, NotificationSettings } from "./db-helpers"

const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "7efbc36b3fdb0d18cabf983d24382b41-c02fd0ba-5a8d5b2d",
  url: "https://api.eu.mailgun.net",
})

export async function sendReminderEmail(
  supplier: Supplier,
  certificate: Certificate,
  settings: NotificationSettings,
  reminderNumber: number,
): Promise<void> {
  const magicLink = await generateMagicLink(supplier._id.toString(), certificate.id)

  const data = {
    from: "Certyfix <noreply@certyfix.com>",
    to: supplier.email,
    subject: `Certificate Expiration Reminder #${reminderNumber}`,
    html: settings.emailTemplate
      .replace("{{supplierName}}", supplier.name)
      .replace("{{certificateType}}", certificate.type)
      .replace("{{expirationDate}}", certificate.expirationDate.toLocaleDateString())
      .replace("{{magicLink}}", magicLink)
      .replace("{{reminderNumber}}", reminderNumber.toString()),
  }

  try {
    console.log(
      `Attempting to send reminder email #${reminderNumber} to ${supplier.email} for certificate ${certificate.id}`,
    )
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN || "", data)
    console.log(`Reminder email #${reminderNumber} sent to ${supplier.email}. Mailgun response:`, response)
  } catch (error) {
    console.error(`Error sending reminder email #${reminderNumber} to ${supplier.email}:`, error)
    throw error
  }
}

export async function sendClientNotification(
  clientEmail: string,
  supplier: Supplier,
  certificate: Certificate,
  companyData: any,
): Promise<void> {
  const data = {
    from: "Certyfix <noreply@certyfix.com>",
    to: clientEmail,
    subject: "Urgent: Supplier Certificate Expiration",
    html: `
      <p>Dear ${companyData.name},</p>
      <p>This is to notify you that the following supplier certificate is about to expire and has not been updated despite multiple reminders:</p>
      <ul>
        <li>Supplier: ${supplier.name}</li>
        <li>Certificate Type: ${certificate.type}</li>
        <li>Expiration Date: ${certificate.expirationDate.toLocaleDateString()}</li>
      </ul>
      <p>Please take immediate action to ensure the certificate is updated or to make alternative arrangements.</p>
      <p>Best regards,<br>Certyfix Team</p>
    `,
  }

  try {
    console.log(`Attempting to send client notification to ${clientEmail} for supplier ${supplier.name}`)
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN || "", data)
    console.log(`Client notification sent to ${clientEmail}. Mailgun response:`, response)
  } catch (error) {
    console.error(`Error sending client notification to ${clientEmail}:`, error)
    throw error
  }
}

async function generateMagicLink(supplierId: string, certificateId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  await storeCertificateUpdateToken(supplierId, certificateId, token, expiresAt)

  return `${process.env.NEXT_PUBLIC_APP_URL}/update-certificate?token=${token}`
}

