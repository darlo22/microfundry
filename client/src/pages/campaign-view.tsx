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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Share, 
  FileText, 
  Calendar, 
  MapPin, 
  Building,
  Clock,
  Users,
  DollarSign,
  Edit,
  ExternalLink,
  Download,
  ZoomIn
} from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

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
      setLocation("/investor/dashboard");
    }
  };

  const handleInvest = () => {
    if (!isAuthenticated) {
      // Redirect to landing page with investor onboarding auto-open
      setLocation("/landing?invest=true&type=investor");
      return;
    }
    setShowInvestmentModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleViewPitchDeck = () => {
    setShowPitchDeckModal(true);
  };

  // Debug logo URL
  console.log('Campaign logo URL:', campaign?.logoUrl);
  console.log('Campaign data:', campaign);

  // Loading state
  if (isLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
            <p className="text-gray-600 mb-6">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={handleBackToDashboard}
        rightContent={
          <div className="flex items-center space-x-3">
            {user && campaign.founderId === user.id && (
              <Button 
                onClick={handleEdit}
                className="flex items-center border-2 border-fundry-orange text-fundry-orange hover:bg-fundry-orange hover:text-white transition-all duration-200 shadow-sm"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Hero Section - Pitch Media First (Wefunder Style) */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <CardContent className="p-0">
              {/* Pitch Video/Cover Image - Prominent Display */}
              <div className="relative">
                {campaign.pitchMediaUrl ? (
                  <div className="aspect-video w-full bg-gray-900 relative overflow-hidden">
                    {campaign.pitchMediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                      <video 
                        controls 
                        className="w-full h-full object-cover"
                        poster={campaign.logoUrl}
                        preload="metadata"
                      >
                        <source src={campaign.pitchMediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img 
                        src={campaign.pitchMediaUrl} 
                        alt={`${campaign.title} - Cover Image`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Logo Overlay on Media */}
                    <div className="absolute bottom-4 left-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
                        {campaign.logoUrl ? (
                          <img 
                            src={campaign.logoUrl} 
                            alt={campaign.title}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              console.log('Logo failed to load:', campaign.logoUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('div');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${campaign.logoUrl ? 'hidden' : 'flex'}`}>
                          <span className="text-fundry-orange text-xl sm:text-2xl font-bold">
                            {campaign.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback Header if no pitch media */
                  <div className="aspect-video w-full bg-gradient-to-br from-fundry-navy via-blue-700 to-fundry-orange relative overflow-hidden flex items-center justify-center">
                    <div className="text-center text-white z-10">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white border-4 border-white rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden shadow-2xl">
                        {campaign.logoUrl ? (
                          <img 
                            src={campaign.logoUrl} 
                            alt={campaign.title}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              console.log('Logo failed to load in fallback header:', campaign.logoUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('div');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${campaign.logoUrl ? 'hidden' : 'flex'}`}>
                          <span className="text-fundry-orange text-3xl sm:text-4xl font-bold">
                            {campaign.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{campaign.title}</h1>
                      <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">{campaign.shortPitch}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-white/10"></div>
                  </div>
                )}
              </div>

              {/* Campaign Info Below Media */}
              <div className="p-6 sm:p-8">
                {/* Title and Basic Info */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-fundry-navy">{campaign.title}</h1>
                        <Badge className="bg-fundry-orange/10 text-fundry-orange border-fundry-orange/20">
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-lg text-gray-700 mb-4 leading-relaxed">{campaign.shortPitch}</p>
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                  </div>
                </div>

                {/* Funding Stats - Compact Row */}
                <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-fundry-navy mb-1">{formatCurrency(campaign.totalRaised)}</div>
                    <div className="text-sm text-gray-600 font-medium">Raised</div>
                  </div>
                  <div className="text-center border-l border-r border-gray-300">
                    <div className="text-2xl sm:text-3xl font-bold text-fundry-orange mb-1">{campaign.progressPercent}%</div>
                    <div className="text-sm text-gray-600 font-medium">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{formatCurrency(campaign.fundingGoal)}</div>
                    <div className="text-sm text-gray-600 font-medium">Goal</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                    <span className="text-sm font-bold text-fundry-orange">{campaign.progressPercent}%</span>
                  </div>
                  <Progress 
                    value={campaign.progressPercent} 
                    className="h-3 bg-gray-200"
                  />
                </div>
                
                {/* Investment CTA */}
                <Button 
                  onClick={handleInvest}
                  disabled={isProcessing}
                  className="w-full bg-fundry-navy hover:bg-blue-800 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <DollarSign className="mr-2" size={20} />
                  {isProcessing ? "Processing..." : "Commit to Investment"}
                </Button>
                <p className="text-sm text-gray-600 text-center mt-3 font-medium">
                  Minimum investment: {formatCurrency(campaign.minimumInvestment)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* View Pitch Deck Section */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-fundry-navy to-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Pitch Deck</h2>
              </div>
              {campaign.pitchDeckUrl ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">View the detailed pitch deck to learn more about this opportunity</p>
                  <Button 
                    onClick={handleViewPitchDeck}
                    className="bg-fundry-orange hover:bg-orange-600 text-white font-bold py-3 px-8 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FileText className="mr-2" size={18} />
                    View Pitch Deck
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    No pitch deck uploaded
                  </h3>
                  <p className="text-gray-400 font-medium">This campaign hasn't uploaded a pitch deck yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* About This Campaign */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">About This Campaign</h2>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {campaign.fullPitch.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-7">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Investment Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:py-4 sm:px-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border-l-4 border-fundry-orange">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Funding Goal</span>
                    <span className="font-bold text-base sm:text-lg text-fundry-navy mt-1 sm:mt-0">{formatCurrency(campaign.fundingGoal)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:py-4 sm:px-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-lg border-l-4 border-green-500">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Amount Raised</span>
                    <span className="font-bold text-base sm:text-lg text-green-600 mt-1 sm:mt-0">{formatCurrency(campaign.totalRaised)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:py-4 sm:px-4 bg-gradient-to-r from-orange-50 to-amber-50/30 rounded-lg border-l-4 border-fundry-orange">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Minimum Investment</span>
                    <span className="font-bold text-base sm:text-lg text-fundry-orange mt-1 sm:mt-0">{formatCurrency(campaign.minimumInvestment)}</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-purple-50 to-violet-50/30 rounded-lg border-l-4 border-purple-500">
                    <span className="text-gray-700 font-medium">Discount Rate</span>
                    <span className="font-bold text-lg text-purple-600">{campaign.discountRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-lg border-l-4 border-indigo-500">
                    <span className="text-gray-700 font-medium">Valuation Cap</span>
                    <span className="font-bold text-lg text-indigo-600">{formatCurrency(campaign.valuationCap || "1000000")}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-lg border-l-4 border-blue-500">
                    <span className="text-gray-700 font-medium">Investors</span>
                    <span className="font-bold text-lg text-blue-600">{campaign.investorCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Strategy Section */}
          {(campaign.problemStatement || campaign.solution || campaign.marketOpportunity || campaign.businessModel || campaign.goToMarketStrategy || campaign.competitiveLandscape) && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Business Strategy</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {campaign.problemStatement && (
                    <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                      <h3 className="text-lg font-semibold text-red-700 mb-3">Problem Statement</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.problemStatement}</p>
                    </div>
                  )}
                  {campaign.solution && (
                    <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                      <h3 className="text-lg font-semibold text-green-700 mb-3">Solution</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.solution}</p>
                    </div>
                  )}
                  {campaign.marketOpportunity && (
                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3">Market Opportunity</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.marketOpportunity}</p>
                    </div>
                  )}
                  {campaign.businessModel && (
                    <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                      <h3 className="text-lg font-semibold text-purple-700 mb-3">Business Model</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.businessModel}</p>
                    </div>
                  )}
                  {campaign.goToMarketStrategy && (
                    <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                      <h3 className="text-lg font-semibold text-orange-700 mb-3">Go-To-Market Strategy</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.goToMarketStrategy}</p>
                    </div>
                  )}
                  {campaign.competitiveLandscape && (
                    <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500">
                      <h3 className="text-lg font-semibold text-indigo-700 mb-3">Competitive Landscape</h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.competitiveLandscape}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          {(campaign.companyName || campaign.country || campaign.state || campaign.businessAddress || campaign.registrationStatus) && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Company Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {campaign.companyName && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border-l-4 border-fundry-orange">
                      <span className="text-gray-700 font-medium">Company Name</span>
                      <span className="font-bold text-fundry-navy">{campaign.companyName}</span>
                    </div>
                  )}
                  {(campaign.country || campaign.state) && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border-l-4 border-blue-500">
                      <span className="text-gray-700 font-medium">Location</span>
                      <span className="font-bold text-blue-600">
                        {campaign.state && campaign.country ? `${campaign.state}, ${campaign.country}` : campaign.country || campaign.state}
                      </span>
                    </div>
                  )}
                  {campaign.businessAddress && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-lg border-l-4 border-green-500">
                      <span className="text-gray-700 font-medium">Address</span>
                      <span className="font-bold text-green-600">{campaign.businessAddress}</span>
                    </div>
                  )}
                  {campaign.registrationStatus && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg border-l-4 border-purple-500">
                      <span className="text-gray-700 font-medium">Registration</span>
                      <span className="font-bold text-purple-600 capitalize">{campaign.registrationStatus}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Traction & Growth */}
          {(campaign.startupStage || campaign.currentRevenue || campaign.customers || campaign.previousFunding || campaign.keyMilestones) && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Traction & Growth</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {campaign.startupStage && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border-l-4 border-fundry-orange">
                      <span className="text-gray-700 font-medium">Stage</span>
                      <span className="font-bold text-fundry-navy capitalize">{campaign.startupStage}</span>
                    </div>
                  )}
                  {campaign.currentRevenue && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-lg border-l-4 border-green-500">
                      <span className="text-gray-700 font-medium">Current Revenue</span>
                      <span className="font-bold text-green-600">{campaign.currentRevenue}</span>
                    </div>
                  )}
                  {campaign.customers && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg border-l-4 border-purple-500">
                      <span className="text-gray-700 font-medium">Customers</span>
                      <span className="font-bold text-purple-600">{campaign.customers}</span>
                    </div>
                  )}
                  {campaign.previousFunding && (
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-lg border-l-4 border-indigo-500">
                      <span className="text-gray-700 font-medium">Previous Funding</span>
                      <span className="font-bold text-indigo-600">{campaign.previousFunding}</span>
                    </div>
                  )}
                </div>
                {campaign.keyMilestones && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50/30 rounded-xl border-l-4 border-yellow-500">
                    <h3 className="text-lg font-semibold text-yellow-700 mb-3">Key Milestones</h3>
                    <p className="text-gray-700 leading-relaxed">{campaign.keyMilestones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Use of Funds */}
          {campaign.useOfFunds && Array.isArray(campaign.useOfFunds) && campaign.useOfFunds.length > 0 && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Use of Funds</h2>
                </div>
                <div className="space-y-4">
                  {campaign.useOfFunds.map((fund: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-fundry-navy">{fund.category}</h3>
                        <span className="text-xl font-bold text-fundry-orange">{fund.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div 
                          className="bg-gradient-to-r from-fundry-orange to-orange-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${fund.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{fund.description}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        Amount: <span className="font-semibold">{formatCurrency((parseFloat(campaign.fundingGoal) * fund.percentage) / 100)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          {campaign.teamMembers && Array.isArray(campaign.teamMembers) && campaign.teamMembers.length > 0 && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Meet the Team</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaign.teamMembers.map((member: any, index: number) => (
                    <div key={index} className="text-center bg-gray-50 rounded-xl p-6">
                      <div className="w-20 h-20 bg-fundry-orange rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.name?.charAt(0) || 'T'
                        )}
                      </div>
                      <h3 className="font-semibold text-fundry-navy mb-1">{member.name || 'Team Member'}</h3>
                      <p className="text-sm text-fundry-orange font-medium mb-2">{member.role || 'Role'}</p>
                      <p className="text-xs text-gray-600">{member.experience || ''}</p>
                      {member.linkedinUrl && (
                        <a 
                          href={member.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Directors Information */}
          {campaign.directors && Array.isArray(campaign.directors) && campaign.directors.length > 0 && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Company Directors</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {campaign.directors.map((director: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-fundry-navy mb-2">{director.name || `Director ${index + 1}`}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Position:</span> {director.position || 'Director'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Ownership:</span> {director.ownership || 'N/A'}%
                      </p>
                      {director.experience && (
                        <p className="text-sm text-gray-700 mt-2">{director.experience}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

      {/* Pitch Deck Modal */}
      <Dialog open={showPitchDeckModal} onOpenChange={setShowPitchDeckModal}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center justify-between text-xl font-bold text-fundry-navy">
              <span>Pitch Deck - {campaign?.title}</span>
              {campaign?.pitchDeckUrl && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`;
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${campaign.title}-pitch-deck.pdf`;
                      link.click();
                    }}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[75vh] bg-gray-50 rounded-lg overflow-hidden border">
            {campaign?.pitchDeckUrl ? (
              <iframe
                src={`${campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title="Pitch Deck Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="mx-auto h-16 w-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pitch Deck Available</h3>
                  <p>This campaign hasn't uploaded a pitch deck yet.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}