import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '7efbc36b3fdb0d18cabf983d24382b41-c02fd0ba-5a8d5b2d',
  url: 'https://api.eu.mailgun.net'
});

const domain = process.env.MAILGUN_DOMAIN || '';

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log('Attempting to send password reset email to:', email);
  console.log('Using Mailgun domain:', domain);

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const messageData = {
    from: process.env.EMAIL_FROM || 'noreply@certyfix.com',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    console.log('Sending email with Mailgun...');
    const response = await client.messages.create(domain, messageData);
    console.log('Email sent successfully. Mailgun response:', response);
    return response;
  } catch (error) {
    console.error('Error sending email with Mailgun:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  console.log('Attempting to send verification email to:', email);
  console.log('Using Mailgun domain:', domain);

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const messageData = {
    from: process.env.EMAIL_FROM || 'noreply@certyfix.com',
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't register for an account, please ignore this email.</p>
    `,
  };

  try {
    console.log('Sending verification email with Mailgun...');
    const response = await client.messages.create(domain, messageData);
    console.log('Verification email sent successfully. Mailgun response:', response);
    return response;
  } catch (error) {
    console.error('Error sending verification email with Mailgun:', error);
    throw new Error('Failed to send verification email');
  }
}

