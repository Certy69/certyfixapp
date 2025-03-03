require('dotenv').config({ path: '.env.local' });
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);

console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'Set' : 'Not set');
console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN ? 'Set' : 'Not set');

const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const domain = process.env.MAILGUN_DOMAIN || '';

async function sendTestEmail() {
  const messageData = {
    from: process.env.EMAIL_FROM || 'noreply@mg.certyfix.com',
    to: 'alemarcelis@gmail.com', // Replace with a real email address for testing
    subject: 'Test Email',
    text: 'This is a test email from Certyfix.',
  };

  try {
    console.log('Sending test email with Mailgun...');
    const response = await client.messages.create(domain, messageData);
    console.log('Test email sent successfully. Mailgun response:', response);
  } catch (error) {
    console.error('Error sending test email with Mailgun:', error);
  }
}

sendTestEmail();

