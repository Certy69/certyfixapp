import formData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.eu.mailgun.net', // EU endpoint
})

const domain = process.env.MAILGUN_DOMAIN || '';

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  const data = {
    from: `Certyfix <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    text,
    html,
  }

  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN || '', data)
    console.log('Email sent:', response)
    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

