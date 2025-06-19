import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Email service
const resend = new Resend(process.env.RESEND_API_KEY);

function generateToken() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

async function sendVerificationToUser(email) {
  try {
    console.log(`Sending verification email to ${email}...`);

    // Find the user
    const users = await sql`
      SELECT id, email, first_name, last_name 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      console.log('User not found');
      return;
    }

    const user = users[0];
    console.log(`Found user: ${user.first_name} ${user.last_name}`);

    // Delete any existing tokens for this user
    await sql`
      DELETE FROM email_verification_tokens 
      WHERE user_id = ${user.id}
    `;

    // Generate new verification token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    const tokenId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    // Insert verification token
    await sql`
      INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
      VALUES (${tokenId}, ${user.id}, ${token}, ${expiresAt})
    `;

    // Send verification email with correct URL
    const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const emailResult = await resend.emails.send({
      from: 'Micro Fundry Support <support@microfundry.com>',
      to: user.email,
      subject: 'Verify Your Fundry Account - Priority Delivery',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Fundry Account</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              margin: 0; 
              padding: 0; 
              background-color: #f3f4f6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              padding: 30px 20px;
              background: linear-gradient(135deg, #f97316 0%, #1e40af 100%);
              border-radius: 12px 12px 0 0;
              margin: -20px -20px 40px -20px;
            }
            .logo-container {
              width: 80px;
              height: 80px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
            }
            .logo-text {
              color: white;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: -0.5px;
            }
            .header-title {
              color: white;
              font-size: 28px;
              font-weight: 700;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              margin: 8px 0 0 0;
            }
            .content { 
              padding: 0 20px 30px; 
            }
            .welcome-text {
              font-size: 24px;
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 24px;
              text-align: center;
            }
            .description {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 32px;
              text-align: center;
              line-height: 1.7;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
            }
            .link-fallback {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              text-align: center;
            }
            .link-text {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .verification-link {
              font-size: 14px;
              color: #f97316;
              word-break: break-all;
              font-family: monospace;
            }
            .expiry-notice {
              background: #fef3e2;
              border-left: 4px solid #f97316;
              padding: 16px;
              border-radius: 0 8px 8px 0;
              margin: 24px 0;
            }
            .expiry-text {
              color: #92400e;
              font-weight: 600;
              margin: 0;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #9ca3af; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
              padding-top: 24px;
            }
            .footer p {
              margin: 4px 0;
            }
            .company-name {
              font-weight: 600;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo-text">F</div>
              </div>
              <h1 class="header-title">Verify Your Account</h1>
              <p class="header-subtitle">Complete your Fundry account setup</p>
            </div>
            
            <div class="content">
              <h2 class="welcome-text">Hello ${user.first_name}!</h2>
              
              <p class="description">
                Please verify your email address to complete your account setup and start using Fundry. Click the button below to verify your account:
              </p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify My Email</a>
              </div>
              
              <div class="expiry-notice">
                <p class="expiry-text">Important: This verification link will expire in 24 hours for security purposes.</p>
              </div>
              
              <div class="link-fallback">
                <p class="link-text">If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p class="verification-link">${verificationUrl}</p>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p><strong>Why verify your email?</strong></p>
              <p>Email verification helps us:</p>
              <ul style="color: #4b5563; line-height: 1.7;">
                <li>Protect your account from unauthorized access</li>
                <li>Ensure you receive important updates about your investments</li>
                <li>Maintain the security of the Fundry platform</li>
              </ul>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                If you didn't create a Fundry account, please ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p class="company-name">© 2025 Micro Fundry. All rights reserved.</p>
              <p>This is an automated message from the Fundry platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✓ Verification email sent successfully to ${user.email}`);
    console.log(`Email ID: ${emailResult.data?.id}`);
    console.log(`Verification URL: ${verificationUrl}`);

  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

// Run the script for the specific email
const email = process.argv[2] || 'mycirclemate@gmail.com';
sendVerificationToUser(email).then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});