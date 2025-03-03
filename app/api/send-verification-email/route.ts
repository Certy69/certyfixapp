import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { email, verificationToken } = await req.json()

    // Create a test account using Ethereal
    let testAccount = await nodemailer.createTestAccount()

    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })

    // Verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Certyfix" <noreply@certyfix.com>',
      to: email,
      subject: "Verify your email for Certyfix",
      text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
      html: `<p>Please verify your email by clicking on the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    })

    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

    return NextResponse.json({ message: 'Verification email sent successfully' })
  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

