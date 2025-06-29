import speakeasy from "speakeasy";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { storage } from "./storage";

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  // Using a simple SMTP configuration - in production, use proper email service
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class TwoFactorService {
  // Generate TOTP secret for authenticator apps
  static generateTOTPSecret(email: string): {
    secret: string;
    qrCodeUrl: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `Fundry (${email})`,
      issuer: "Fundry",
      length: 32,
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: email,
      issuer: "Fundry",
      encoding: "base32",
    });

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  // Generate QR code image for TOTP setup
  static async generateQRCodeImage(qrCodeUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
      return qrCodeDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  // Verify TOTP code from authenticator app
  static verifyTOTPCode(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps before and after current time
    });
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Generate email OTP
  static generateEmailOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  // Send email OTP
  static async sendEmailOTP(
    email: string,
    code: string,
    purpose: string = "2FA verification"
  ): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email configuration not set up. OTP code would be:", code);
      return; // Skip sending in development if email not configured
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Fundry ${purpose} Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #1e3a8a 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Fundry</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">${purpose}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Your verification code is:
            </p>
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 4px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; font-size: 12px; margin: 0;">
              Fundry - Equity Crowdfunding Platform
            </p>
          </div>
        </div>
      `,
    };

    try {
      await emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email OTP:", error);
      throw new Error("Failed to send verification email");
    }
  }

  // Store email OTP in database
  static async storeEmailOTP(
    userId: string,
    code: string,
    type: string = "email_2fa"
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up old unused codes for this user and type
    await storage.cleanupExpiredOTP(userId, type);

    // Store new code
    await storage.createOTPCode({
      userId,
      code,
      type,
      expiresAt,
      used: false,
    });
  }

  // Verify email OTP
  static async verifyEmailOTP(
    userId: string,
    code: string,
    type: string = "email_2fa"
  ): Promise<boolean> {
    const otpRecord = await storage.getValidOTPCode(userId, code, type);

    if (!otpRecord) {
      return false;
    }

    // Mark code as used
    await storage.markOTPAsUsed(otpRecord.id);
    return true;
  }

  // Verify backup code
  static async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }

    const backupCodes = user.twoFactorBackupCodes as string[];
    const codeIndex = backupCodes.indexOf(code.toUpperCase());

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await storage.updateUserBackupCodes(userId, backupCodes);

    return true;
  }

  // Enable 2FA for user
  static async enable2FA(
    userId: string,
    method: "app" | "email",
    secret?: string
  ): Promise<void> {
    const backupCodes = this.generateBackupCodes();

    await storage.updateUser2FASettings(userId, {
      twoFactorEnabled: true,
      twoFactorMethod: method,
      twoFactorSecret: secret || null,
      twoFactorBackupCodes: backupCodes,
    });
  }

  // Disable 2FA for user
  static async disable2FA(userId: string): Promise<void> {
    await storage.updateUser2FASettings(userId, {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    });
  }

  // Check if user has 2FA enabled
  static async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    return user?.twoFactorEnabled || false;
  }

  // Get user's 2FA method
  static async get2FAMethod(userId: string): Promise<string | null> {
    const user = await storage.getUser(userId);
    return user?.twoFactorMethod || null;
  }
}
