import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Email service
const resend = new Resend(process.env.RESEND_API_KEY);

// Email verification token generation
function generateToken() {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

async function sendVerificationToExistingUsers() {
  try {
    console.log('Starting verification email process for existing users...');

    // Find all users who don't have email verification records
    const unverifiedUsers = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name 
      FROM users u 
      WHERE NOT EXISTS (
        SELECT 1 FROM email_verification_tokens evt 
        WHERE evt.user_id = u.id
      )
      AND u.email IS NOT NULL
    `;

    console.log(`Found ${unverifiedUsers.length} users without verification tokens`);

    if (unverifiedUsers.length === 0) {
      console.log('No users need verification emails');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const user of unverifiedUsers) {
      try {
        // Generate verification token
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        // Generate ID for verification token
        const tokenId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        
        // Insert verification token
        await sql`
          INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
          VALUES (${tokenId}, ${user.id}, ${token}, ${expiresAt})
        `;

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
        
        await resend.emails.send({
          from: 'Micro Fundry Support <support@microfundry.com>',
          to: user.email,
          subject: 'Verify Your Fundry Account',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Fundry Account</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f97316 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .highlight { background: #fef3e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Fundry!</h1>
                  <p>Verify your email to complete your account setup</p>
                </div>
                <div class="content">
                  <h2>Hello ${user.first_name || 'there'}!</h2>
                  
                  <p>We're implementing enhanced security measures for all Fundry accounts. To continue using your account, please verify your email address by clicking the button below:</p>
                  
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify My Email</a>
                  </div>
                  
                  <div class="highlight">
                    <strong>Important:</strong> This verification link will expire in 24 hours for security purposes.
                  </div>
                  
                  <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #f97316;"><a href="${verificationUrl}">${verificationUrl}</a></p>
                  
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  
                  <p><strong>Why are we doing this?</strong></p>
                  <p>Email verification helps us:</p>
                  <ul>
                    <li>Protect your account from unauthorized access</li>
                    <li>Ensure you receive important updates about your investments</li>
                    <li>Maintain the security of the Fundry platform</li>
                  </ul>
                  
                  <p>If you didn't create a Fundry account, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© 2025 Micro Fundry. All rights reserved.</p>
                  <p>This is an automated message from the Fundry platform.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        console.log(`✓ Sent verification email to ${user.email}`);
        successCount++;

      } catch (error) {
        console.error(`✗ Failed to send email to ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Verification Email Summary ===');
    console.log(`Total users processed: ${unverifiedUsers.length}`);
    console.log(`Successful emails sent: ${successCount}`);
    console.log(`Failed emails: ${errorCount}`);
    console.log('=================================\n');

    if (successCount > 0) {
      console.log('✓ Verification emails have been sent to existing users');
      console.log('Users can now verify their emails and log in normally');
    }

  } catch (error) {
    console.error('Error in verification email process:', error);
    process.exit(1);
  }
}

// Run the script
sendVerificationToExistingUsers()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { sendVerificationToExistingUsers };