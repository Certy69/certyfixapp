// lib/scheduled-tasks.ts

import { getNotificationSettings, getExpiringCertificates, getCompanyById, updateCertificate } from "./db-helpers"

export async function startScheduledTasks() {
  console.log("Starting scheduled tasks...")

  //Check for expiring certificates every hour
  setInterval(async () => {
    try {
      const expiringCertificates = await getExpiringCertificates()
      if (expiringCertificates.length > 0) {
        console.log(`Found ${expiringCertificates.length} expiring certificates.`)
        //Process expiring certificates
        for (const certificate of expiringCertificates) {
          const company = await getCompanyById(certificate.companyId)
          if (company) {
            const notificationSettings = await getNotificationSettings(company.id)
            //Send notification based on notification settings
            console.log(`Sending notification for certificate ${certificate.id} to company ${company.name}`)
            //Update certificate status
            await updateCertificate(certificate.id, { status: "expiring" })
          }
        }
      }
    } catch (error) {
      console.error("Error checking for expiring certificates:", error)
    }
  }, 3600000) // 3600000 milliseconds = 1 hour
}

