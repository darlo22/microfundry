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
  deadline?: string;
  createdAt: string;
  totalRaised: string;
  investorCount: number;
  progressPercent: number;
  // Additional campaign creation fields
  businessSector?: string;
  startupStage?: string;
  teamStructure?: string;
  teamMembers?: string | any[];
  currentRevenue?: string;
  customers?: string;
  previousFunding?: string;
  businessModel?: string;
  useOfFunds?: string;
  marketSize?: string;
  competitiveLandscape?: string;
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
