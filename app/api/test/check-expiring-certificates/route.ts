import { NextResponse } from "next/server"
import { getExpiringCertificates, getNotificationSettings, updateCertificate } from "@/lib/db-helpers"
import { sendReminderEmail } from "@/lib/email-service"

export async function GET() {
  try {
    console.log("Manual trigger: Checking for expiring certificates")

    const settings = await getNotificationSettings("default") // You might want to pass a specific company ID here
    if (!settings) {
      return NextResponse.json({ error: "Notification settings not found" }, { status: 404 })
    }

    const expiringCertificates = await getExpiringCertificates(settings.daysBeforeExpiration)

    for (const { supplier, certificate } of expiringCertificates) {
      if (certificate.remindersSent < settings.maxReminders) {
        await sendReminderEmail(supplier, certificate, settings)

        // Update the remindersSent count
        await updateCertificate(supplier._id.toString(), certificate.id, {
          ...certificate,
          remindersSent: (certificate.remindersSent || 0) + 1,
        })

        console.log(`Reminder email sent for certificate ${certificate.id} to ${supplier.email}`)
      }
    }

    return NextResponse.json({
      message: "Expiring certificates check completed",
      certificatesChecked: expiringCertificates.length,
    })
  } catch (error) {
    console.error("Error in manual expiring certificates check:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

