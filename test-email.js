require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing SMTP connection...');
  console.log('Host:', process.env.EMAIL_SERVER_HOST);
  console.log('Port:', process.env.EMAIL_SERVER_PORT);
  console.log('User:', process.env.EMAIL_SERVER_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection successful!');

    const mailOptions = {
      from: `"FuelSync Test" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_SERVER_USER, // Send test to self
      subject: "SMTP Test Email",
      text: "This is a test email to verify SMTP configuration.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}

testEmail();
