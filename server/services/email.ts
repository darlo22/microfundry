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
}

export class EmailService {
  private fromEmail = 'onboarding@resend.dev'; // Using verified Resend domain

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const result = await resend.emails.send({
        from: params.from || this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<boolean> {
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - Fundry</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #f97316; font-size: 24px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #f97316; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📈 Fundry</div>
            </div>
            
            <div class="content">
              <h1>Welcome to Fundry, ${firstName}!</h1>
              
              <p>Thank you for joining our equity crowdfunding platform. To complete your registration and start investing in startups or raising capital, please verify your email address.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with Fundry, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Fundry. All rights reserved.</p>
              <p>Connecting startups with investors through smart funding solutions.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - Fundry',
      html,
      from: 'Fundry <onboarding@resend.dev>',
    });
  }

  async sendWelcomeEmail(email: string, firstName: string, userType: 'founder' | 'investor'): Promise<boolean> {
    const dashboardUrl = userType === 'founder' 
      ? `${process.env.BASE_URL || 'http://localhost:5000'}/founder-dashboard`
      : `${process.env.BASE_URL || 'http://localhost:5000'}/investor-dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Fundry!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #f97316; font-size: 24px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #f97316; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📈 Fundry</div>
            </div>
            
            <div class="content">
              <h1>Welcome to Fundry, ${firstName}!</h1>
              
              <p>Your email has been verified and your ${userType} account is now active. You're ready to start your journey on our equity crowdfunding platform.</p>
              
              ${userType === 'founder' ? `
                <h2>As a Founder, you can:</h2>
                <ul>
                  <li>Create compelling funding campaigns</li>
                  <li>Connect with potential investors</li>
                  <li>Manage SAFE agreements automatically</li>
                  <li>Track your fundraising progress</li>
                </ul>
              ` : `
                <h2>As an Investor, you can:</h2>
                <ul>
                  <li>Discover exciting startup opportunities</li>
                  <li>Invest with secure SAFE agreements</li>
                  <li>Track your investment portfolio</li>
                  <li>Get updates from founders</li>
                </ul>
              `}
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Fundry. All rights reserved.</p>
              <p>Connecting startups with investors through smart funding solutions.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to Fundry - Your ${userType} account is ready!`,
      html,
      from: 'Fundry <onboarding@resend.dev>',
    });
  }
}

export const emailService = new EmailService();