import { storage } from '../storage';

/**
 * Notification Service for creating user-specific notifications
 * based on real platform activities and events
 */
export class NotificationService {
  
  /**
   * Create notification when an investment reaches milestone amounts
   */
  static async createInvestmentMilestoneNotification(investorId: string, amount: number, campaignTitle: string) {
    let milestoneMessage = '';
    
    if (amount >= 10000) {
      milestoneMessage = `Congratulations! You've made a significant investment of $${amount.toLocaleString()} in ${campaignTitle}. This qualifies you for premium investor benefits.`;
    } else if (amount >= 5000) {
      milestoneMessage = `Great investment! Your $${amount.toLocaleString()} investment in ${campaignTitle} shows strong confidence in this opportunity.`;
    } else if (amount >= 1000) {
      milestoneMessage = `Thank you for your $${amount.toLocaleString()} investment in ${campaignTitle}. You're now part of this exciting venture!`;
    }
    
    if (milestoneMessage) {
      await storage.createNotification(
        investorId,
        'investment',
        'Investment Milestone Reached',
        milestoneMessage,
        JSON.stringify({ amount, campaignTitle, milestone: true })
      );
    }
  }

  /**
   * Create notification for campaign funding milestones
   */
  static async createCampaignMilestoneNotification(founderId: string, campaignId: number, totalRaised: number, fundingGoal: number, campaignTitle: string) {
    const progressPercent = (totalRaised / fundingGoal) * 100;
    let milestoneMessage = '';
    
    if (progressPercent >= 100) {
      milestoneMessage = `🎉 Campaign fully funded! ${campaignTitle} has reached $${totalRaised.toLocaleString()} (${progressPercent.toFixed(0)}% of goal).`;
    } else if (progressPercent >= 75) {
      milestoneMessage = `Almost there! ${campaignTitle} is at ${progressPercent.toFixed(0)}% funded with $${totalRaised.toLocaleString()} raised.`;
    } else if (progressPercent >= 50) {
      milestoneMessage = `Halfway milestone! ${campaignTitle} has reached ${progressPercent.toFixed(0)}% of funding goal.`;
    } else if (progressPercent >= 25) {
      milestoneMessage = `Great progress! ${campaignTitle} is now ${progressPercent.toFixed(0)}% funded.`;
    }
    
    if (milestoneMessage) {
      await storage.createNotification(
        founderId,
        'campaign',
        'Campaign Milestone Reached',
        milestoneMessage,
        JSON.stringify({ campaignId, totalRaised, fundingGoal, progressPercent })
      );
    }
  }

  /**
   * Create notification for new campaign launches
   */
  static async createCampaignLaunchNotification(founderId: string, campaignTitle: string, fundingGoal: number) {
    await storage.createNotification(
      founderId,
      'campaign',
      'Campaign Successfully Launched',
      `Your campaign "${campaignTitle}" is now live and accepting investments. Funding goal: $${fundingGoal.toLocaleString()}`,
      JSON.stringify({ campaignTitle, fundingGoal, launched: true })
    );
  }

  /**
   * Create notification for investment document readiness
   */
  static async createDocumentReadyNotification(investorId: string, investmentId: number, documentType: string) {
    const documentNames = {
      'safe_agreement': 'SAFE Agreement',
      'investment_certificate': 'Investment Certificate',
      'shareholder_agreement': 'Shareholder Agreement'
    };
    
    const docName = documentNames[documentType as keyof typeof documentNames] || documentType;
    
    await storage.createNotification(
      investorId,
      'document',
      'Investment Document Ready',
      `Your ${docName} is ready for download. You can access it from your Documents section.`,
      JSON.stringify({ investmentId, documentType })
    );
  }

  /**
   * Create notification for email engagement
   */
  static async createEmailEngagementNotification(founderId: string, emailStats: any) {
    if (emailStats.openedCount > 0 && emailStats.openedCount % 5 === 0) {
      await storage.createNotification(
        founderId,
        'email',
        'Email Engagement Update',
        `Your recent email campaign has been opened ${emailStats.openedCount} times. Keep up the great outreach!`,
        JSON.stringify({ openedCount: emailStats.openedCount, emailStats })
      );
    }
  }

  /**
   * Create notification for security events
   */
  static async createSecurityNotification(userId: string, eventType: string, details: any) {
    const securityMessages = {
      'login': 'New sign-in detected from a new device or location.',
      'password_change': 'Your password has been successfully changed.',
      '2fa_enabled': 'Two-factor authentication has been enabled on your account.',
      '2fa_disabled': 'Two-factor authentication has been disabled on your account.',
      'suspicious_activity': 'Unusual activity detected on your account. Please review your recent actions.'
    };
    
    const message = securityMessages[eventType as keyof typeof securityMessages] || 'Security event detected on your account.';
    
    await storage.createNotification(
      userId,
      'security',
      'Security Alert',
      message,
      JSON.stringify({ eventType, details, timestamp: new Date().toISOString() })
    );
  }
}