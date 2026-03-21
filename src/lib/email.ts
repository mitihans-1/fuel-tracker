import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVER_HOST?.includes("gmail") ? "gmail" : undefined,
    host: process.env.EMAIL_SERVER_HOST?.includes("gmail") ? undefined : process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD?.replace(/\s/g, ""),
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  console.log(`Attempting to send verification email to: ${email}`);

  const transporter = getTransporter();

  const mailOptions = {
    from: `"FuelSync Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your FuelSync Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to FuelSync!</h2>
        <p>Thank you for registering. To complete your setup and start tracking fuel in real-time, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not create an account, no further action is required.</p>
      </div>
    `,
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("❌ Error sending verification email:", error);
    throw error; // Throw the actual error so it can be handled/displayed by the caller
  }
}
