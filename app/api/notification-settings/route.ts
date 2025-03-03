import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { updateNotificationSettings } from "@/lib/db-helpers"

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { emailTemplate, firstReminderDays, secondReminderDays, thirdReminderDays, notificationEmail } = body

  try {
    const updatedSettings = await updateNotificationSettings(session.user.companyId, {
      emailTemplate,
      firstReminderDays: Number.parseInt(firstReminderDays, 10),
      secondReminderDays: Number.parseInt(secondReminderDays, 10),
      thirdReminderDays: Number.parseInt(thirdReminderDays, 10),
      notificationEmail,
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

