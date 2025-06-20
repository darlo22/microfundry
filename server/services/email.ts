import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable must be set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  headers?: Record<string, string>;
}

export class EmailService {
  private fromEmail = 'support@microfundry.com';

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const emailData: any = {
        from: params.from || this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        headers: {
          'X-Mailer': 'Micro Fundry Platform',
          'List-Unsubscribe': '<mailto:support@microfundry.com?subject=unsubscribe>',
          'X-Entity-ID': 'micro-fundry-platform',
          ...params.headers
        }
      };

      const result = await resend.emails.send(emailData);
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<boolean> {
    const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Fundry</title>
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
              <h1 class="header-title">Welcome to Fundry!</h1>
              <p class="header-subtitle">Verify your email to complete your account setup</p>
            </div>
            
            <div class="content">
              <h2 class="welcome-text">Hello ${firstName}!</h2>
              
              <p class="description">
                We're implementing enhanced security measures for all Fundry accounts. To continue using your account, please verify your email address by clicking the button below:
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
              
              <p><strong>Why are we doing this?</strong></p>
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
    `;

    return this.sendEmail({
      to: email,
      subject: 'Complete Your Account Setup - Action Required',
      html,
      from: 'Micro Fundry Team <support@microfundry.com>',
      headers: {
        'X-Priority': '3',
        'Importance': 'normal',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
        'X-Sender-ID': 'micro-fundry-verification',
        'Message-ID': `<verification-${Date.now()}@microfundry.com>`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetUrl: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Fundry</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              color: #334155;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #1e40af 100%);
              color: white;
              padding: 40px 32px;
              text-align: center;
            }
            .logo-container {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
            }
            .logo-text {
              font-size: 28px;
              font-weight: bold;
              color: white;
            }
            .header-title {
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header-subtitle {
              margin: 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 32px;
              line-height: 1.6;
            }
            .welcome-text {
              color: #1e40af;
              font-size: 24px;
              margin: 0 0 24px 0;
              font-weight: 600;
            }
            .description {
              color: #4b5563;
              font-size: 16px;
              margin-bottom: 32px;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
              transition: all 0.2s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
            }
            .link-fallback {
              background: #f8fafc;
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
            .reset-link {
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
            .security-notice {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 16px;
              border-radius: 0 8px 8px 0;
              margin: 24px 0;
            }
            .security-text {
              color: #dc2626;
              font-weight: 600;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo-text">F</div>
              </div>
              <h1 class="header-title">Password Reset Request</h1>
              <p class="header-subtitle">Reset your Fundry account password securely</p>
            </div>
            
            <div class="content">
              <h2 class="welcome-text">Hello ${firstName}!</h2>
              
              <p class="description">
                We received a request to reset your password for your Fundry account. If you made this request, click the button below to create a new password:
              </p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <div class="expiry-notice">
                <p class="expiry-text">This password reset link will expire in 24 hours for security purposes.</p>
              </div>
              
              <div class="link-fallback">
                <p class="link-text">If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p class="reset-link">${resetUrl}</p>
              </div>
              
              <div class="security-notice">
                <p class="security-text">If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p><strong>Security Tips:</strong></p>
              <ul style="color: #4b5563; line-height: 1.7;">
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password for your Fundry account</li>
                <li>Enable two-factor authentication for extra security</li>
                <li>Log out of shared or public computers</li>
              </ul>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                For security reasons, this email was sent from an automated system. Please do not reply to this email.
              </p>
            </div>
            
            <div class="footer">
              <p class="company-name">© 2025 Micro Fundry. All rights reserved.</p>
              <p>This is an automated security message from the Fundry platform.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Password Reset Request - Fundry Account",
      html
    });
  }

  async sendWelcomeEmail(email: string, firstName: string, userType: 'founder' | 'investor'): Promise<boolean> {
    const dashboardUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/landing` : 'http://localhost:5000/landing';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Fundry!</title>
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
            .features-section {
              background: #f8fafc;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              border: 1px solid #e2e8f0;
            }
            .features-title {
              font-size: 20px;
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 16px;
              text-align: center;
            }
            .features-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .features-list li {
              background: white;
              margin: 8px 0;
              padding: 12px 16px;
              border-radius: 8px;
              border-left: 4px solid #f97316;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              color: #374151;
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
            .support-section {
              background: #fef3e2;
              border: 1px solid #fed7aa;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              text-align: center;
            }
            .support-text {
              color: #92400e;
              margin: 0;
              font-size: 14px;
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
              <h1 class="header-title">Welcome to Fundry!</h1>
              <p class="header-subtitle">Your account is now active and ready to use</p>
            </div>
            
            <div class="content">
              <h2 class="welcome-text">Welcome to Fundry, ${firstName}!</h2>
              
              <p class="description">
                Your email has been verified and your ${userType} account is now active. You're ready to start your journey on our equity crowdfunding platform.
              </p>
              
              <div class="features-section">
                ${userType === 'founder' ? `
                  <h3 class="features-title">As a Founder, you can:</h3>
                  <ul class="features-list">
                    <li>Create compelling funding campaigns</li>
                    <li>Connect with potential investors</li>
                    <li>Manage SAFE agreements automatically</li>
                    <li>Track your fundraising progress</li>
                  </ul>
                ` : `
                  <h3 class="features-title">As an Investor, you can:</h3>
                  <ul class="features-list">
                    <li>Discover exciting startup opportunities</li>
                    <li>Invest with secure SAFE agreements</li>
                    <li>Track your investment portfolio</li>
                    <li>Get updates from founders</li>
                  </ul>
                `}
              </div>
              
              <div class="button-container">
                <a href="${dashboardUrl}" class="button">Sign In to Get Started</a>
              </div>
              
              <div class="support-section">
                <p class="support-text">
                  If you have any questions, feel free to reach out to our support team.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p class="company-name">© 2025 Micro Fundry. All rights reserved.</p>
              <p>Connecting startups with investors through smart funding solutions.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Fundry account is active - Start ${userType === 'founder' ? 'fundraising' : 'investing'} today`,
      html,
      from: 'Micro Fundry Team <support@microfundry.com>',
      headers: {
        'X-Priority': '3',
        'Importance': 'normal',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
        'X-Sender-ID': 'micro-fundry-welcome',
        'Message-ID': `<welcome-${Date.now()}@microfundry.com>`,
      },
    });
  }
}

export const emailService = new EmailService();