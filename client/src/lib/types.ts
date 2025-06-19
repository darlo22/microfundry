export interface CampaignStats {
  totalRaised: string;
  investorCount: number;
  progressPercent: number;
}

export interface CampaignWithStats {
  id: number;
  title: string;
  shortPitch: string;
  fullPitch: string;
  fundingGoal: string;
  minimumInvestment: string;
  status: string;
  discountRate: string;
  valuationCap: string;
  privateLink: string;
  founderId: string;
  logoUrl?: string;
  pitchDeckUrl?: string;
  pitchMediaUrl?: string;
  deadline?: string;
  createdAt: string;
  totalRaised: string;
  investorCount: number;
  progressPercent: number;
  // Business Information fields
  companyName?: string | null;
  country?: string | null;
  state?: string | null;
  businessAddress?: string;
  registrationStatus?: string;
  registrationType?: string;
  directors?: any[];
  // Additional campaign creation fields
  businessSector?: string;
  startupStage?: string;
  teamStructure?: string;
  teamMembers?: string | any[];
  currentRevenue?: string;
  customers?: string;
  previousFunding?: string;
  keyMilestones?: string;
  updatedAt?: string;
  businessProfileId?: number;
  // Business Strategy fields
  problemStatement?: string;
  solution?: string;
  marketOpportunity?: string;
  businessModel?: string;
  goToMarketStrategy?: string;
  competitiveLandscape?: string;
  // Use of Funds
  useOfFunds?: string | any[];
  // Legacy fields for compatibility
  marketSize?: string;
  riskFactors?: string;
}

export interface InvestmentWithCampaign {
  id: number;
  amount: string;
  status: string;
  paymentStatus: string;
  agreementSigned: boolean;
  createdAt: string;
  campaign: {
    id: number;
    title: string;
    shortPitch: string;
    logoUrl?: string;
    status: string;
  };
}

export interface UserStats {
  totalRaised?: string;
  activeCampaigns?: number;
  totalInvestors?: number;
  conversionRate?: number;
  totalInvested?: string;
  activeInvestments?: number;
  estimatedValue?: string;
}
