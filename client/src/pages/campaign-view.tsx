import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import InvestmentModal from "@/components/modals/investment-modal";
import { ShareCampaignModal } from "@/components/modals/share-campaign-modal";
import { EditCampaignModal } from "@/components/modals/edit-campaign-modal";
import { PitchDeckModal } from "@/components/modals/pitch-deck-modal";
import { RobustVideoPlayer } from "@/components/RobustVideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Share, 
  FileText, 
  Calendar, 
  MapPin, 
  Building,
  Users,
  DollarSign,
  Edit,
  ExternalLink
} from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

// Local interface to handle the specific campaign data structure
interface CampaignData extends Omit<CampaignWithStats, 'country' | 'state'> {
  country?: string | null;
  state?: string | null;
}

export default function CampaignView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get campaign ID from URL params (either /campaign/:id or /c/:privateLink)
  const campaignId = params.id;
  const privateLink = params.privateLink;

  // Determine API endpoint based on URL structure
  const apiUrl = campaignId 
    ? `/api/campaigns/${campaignId}`
    : `/api/campaigns/link/${privateLink}`;

  // Fetch campaign data
  const { data: campaign, isLoading: campaignLoading, error } = useQuery<CampaignWithStats>({
    queryKey: [apiUrl],
    retry: false,
  });

  // Fetch investments for this campaign
  const { data: campaignInvestments = [] } = useQuery<any[]>({
    queryKey: [`/api/investments/campaign/${campaign?.id}`],
    enabled: !!campaign?.id,
  });

  // Helper functions for processing investment data
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter investments to only show committed/paid ones (not just pending)
  const committedInvestments = campaignInvestments.filter((investment: any) => 
    investment.status === 'committed' || investment.status === 'paid' || investment.status === 'completed'
  );

  const handleBackToDashboard = () => {
    if (user?.userType === "founder") {
      setLocation("/founder/dashboard");
    } else {
      setLocation("/browse-campaigns");
    }
  };

  const handleInvest = () => {
    console.log("Invest button clicked");
    setShowInvestmentModal(true);
  };

  const handleViewPitchDeck = () => {
    console.log("View Pitch Deck clicked");
    setShowPitchDeckModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  if (isLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-fundry-navy flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
          <p className="text-gray-200">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-fundry-navy">
        <Navbar showBackButton={true} onBackClick={handleBackToDashboard} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">Campaign Not Found</h1>
            <p className="text-gray-200 mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/")} className="bg-fundry-orange hover:bg-orange-600">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        showBackButton={true}
        onBackClick={handleBackToDashboard}
        rightContent={
          <div className="flex items-center space-x-3">
            {user && campaign.founderId === user.id && (
              <Button 
                onClick={handleEdit}
                className="flex items-center border-2 border-fundry-orange text-white bg-fundry-orange hover:bg-orange-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Edit className="mr-2" size={16} />
                Edit
              </Button>
            )}
            <Button 
              onClick={handleShare} 
              className="bg-fundry-orange hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Share className="mr-2" size={16} />
              Share
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Hero Section - Two Column Layout like Wefunder */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Left Column - Video/Cover Image (3/5 width - 60%) */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Media Section */}
                <div className="relative">
                  <div className="aspect-video w-full bg-gray-900 relative overflow-hidden">
                    <RobustVideoPlayer 
                      videoUrl={campaign.pitchMediaUrl || ''}
                      title={campaign.title}
                      logoUrl={campaign.logoUrl}
                    />
                  </div>
                </div>

                {/* Campaign Info Below Video */}
                <div className="p-6">
                  {/* Company Logo and Title */}
                  <div className="flex items-start gap-4 mb-6">
                    {campaign.logoUrl && (
                      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg shadow-md overflow-hidden border">
                        <img 
                          src={campaign.logoUrl.startsWith('/') ? campaign.logoUrl : `/${campaign.logoUrl}`}
                          alt={`${campaign.companyName} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{campaign.title}</h1>
                        <Badge className="bg-fundry-orange text-white border-fundry-orange">
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed">{campaign.shortPitch}</p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center">
                      <Building className="mr-2 text-fundry-orange" size={16} />
                      <span>{campaign.businessSector || 'Technology'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-fundry-orange" size={16} />
                      <span>{campaign.country && campaign.state ? `${campaign.state}, ${campaign.country}` : 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 text-fundry-orange" size={16} />
                      <span>Started {formatDate(campaign.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investment Information (2/5 width - 40%) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white sticky top-8">
              <CardContent className="p-6">
                {/* Status Badge */}
                <div className="mb-4">
                  <Badge className="bg-red-500 text-white border-red-500 px-3 py-1 text-xs font-semibold">
                    ALMOST SOLD OUT
                  </Badge>
                </div>

                {/* Funding Amount - Large Display */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(campaign.totalRaised)}</div>
                  <div className="text-sm text-gray-600">raised from {campaign.investorCount} investors</div>
                </div>

                {/* Investment Form */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">INVEST</label>
                  <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                    <span className="px-3 py-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      min={campaign.minimumInvestment}
                      className="flex-1 px-3 py-3 border-0 focus:ring-0 focus:outline-none text-lg bg-transparent"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">min ${campaign.minimumInvestment}</div>
                </div>

                {/* Invest Button */}
                <Button 
                  onClick={handleInvest}
                  disabled={isProcessing}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 text-base mb-4 rounded-lg"
                >
                  {isProcessing ? "Processing..." : "INVEST"}
                </Button>

                {/* Watch for Updates Button */}
                <Button 
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-700 font-medium py-3 text-base mb-6 rounded-lg hover:bg-gray-50"
                >
                  WATCH FOR UPDATES
                </Button>

                {/* Investment Terms */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">INVESTMENT TERMS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Future Equity</span>
                      <span className="font-medium">{formatCurrency(campaign.valuationCap)} Valuation Cap</span>
                    </div>
                    {campaign.discountRate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Rate</span>
                        <span className="font-medium">{campaign.discountRate}%</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-3">
                      Investor Perks: $100, $500, $1K, $5K, $10K, $25K, $50K, $100K, $500K, $1M
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{campaign.progressPercent}% of {formatCurrency(campaign.fundingGoal)} goal</span>
                  </div>
                  <Progress 
                    value={campaign.progressPercent} 
                    className="h-2 bg-gray-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Content Sections */}
        <div className="space-y-8">
          {/* View Pitch Deck Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 overflow-hidden">
            <CardContent className="py-16 px-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-fundry-navy mb-4 tracking-tight">Pitch Deck</h2>
                
                {campaign.pitchDeckUrl ? (
                  <div className="space-y-8">
                    <div className="max-w-2xl mx-auto">
                      <p className="text-lg text-gray-700 font-medium leading-relaxed mb-2">
                        Discover the complete vision and strategy behind this investment opportunity
                      </p>
                      <p className="text-gray-600">
                        Comprehensive business plan, market analysis, and growth projections
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleViewPitchDeck}
                        className="group relative bg-gradient-to-r from-fundry-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-lg">View Pitch Deck</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-gray-600 text-lg">Pitch deck will be available soon</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showInvestmentModal && (
        <InvestmentModal
          isOpen={showInvestmentModal}
          onClose={() => setShowInvestmentModal(false)}
          campaign={campaign}
        />
      )}

      {showShareModal && (
        <ShareCampaignModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          campaign={campaign}
        />
      )}

      {showEditModal && (
        <EditCampaignModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          campaign={campaign}
        />
      )}

      {campaign && (
        <PitchDeckModal 
          isOpen={showPitchDeckModal}
          onClose={() => setShowPitchDeckModal(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      )}

      <Footer />
    </div>
  );
}