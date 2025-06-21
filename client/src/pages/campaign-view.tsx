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
import { CampaignUpdatesModal } from "@/components/modals/campaign-updates-wefunder";
import { CampaignCommentsModal } from "@/components/modals/campaign-comments-modal";
import { CampaignQuestionsModal } from "@/components/modals/campaign-questions-modal";
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
  ExternalLink,
  MessageSquare,
  Globe
} from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaMedium, FaTiktok, FaSnapchat } from "react-icons/fa";
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
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<string>("");

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

  // Fetch campaign updates count
  const { data: updatesData } = useQuery<any[]>({
    queryKey: [`/api/campaign-updates/campaign/${campaign?.id}`],
    enabled: !!campaign?.id,
  });
  const updatesCount = updatesData?.length || 0;

  // Fetch campaign comments count
  const { data: commentsData } = useQuery<any[]>({
    queryKey: [`/api/campaigns/${campaign?.id}/comments`],
    enabled: !!campaign?.id,
  });
  const commentsCount = commentsData?.length || 0;

  // Fetch campaign questions count
  const { data: questionsData } = useQuery<any[]>({
    queryKey: [`/api/campaigns/${campaign?.id}/questions`],
    enabled: !!campaign?.id,
  });
  const questionsCount = questionsData?.length || 0;

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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && campaign.founderId === user.id && (
              <Button 
                onClick={handleEdit}
                className="flex items-center border-2 border-fundry-orange text-white bg-fundry-orange hover:bg-orange-600 hover:text-white transition-all duration-200 shadow-sm px-2 sm:px-4 py-2"
              >
                <Edit className="sm:mr-2" size={16} />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button 
              onClick={handleShare} 
              className="bg-fundry-orange hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 sm:px-4 py-2"
            >
              <Share className="sm:mr-2" size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8">
        
        {/* Hero Section - Mobile-First Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 sm:gap-4 lg:gap-8 mb-4 sm:mb-6 lg:mb-12">
          
          {/* Left Column - Video/Cover Image (7/10 width - 70%) */}
          <div className="lg:col-span-7 order-1">
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

                {/* Social Engagement Buttons */}
                <div className="border-t border-gray-200 bg-gray-50 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    <Button
                      onClick={() => setShowUpdatesModal(true)}
                      variant="outline"
                      className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 font-medium px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <FileText size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline sm:inline">UPDATES</span>
                      <span className="xs:hidden sm:hidden">UPD</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs ml-1">
                        {updatesCount || 0}
                      </Badge>
                    </Button>
                    <Button
                      onClick={() => setShowCommentsModal(true)}
                      variant="outline"
                      className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 font-medium px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <Users size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline sm:inline">WHAT PEOPLE SAY</span>
                      <span className="xs:hidden sm:hidden">COMMENTS</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs ml-1">
                        {commentsCount || 0}
                      </Badge>
                    </Button>
                    <Button
                      onClick={() => setShowQuestionsModal(true)}
                      variant="outline"
                      className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 font-medium px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline sm:inline">ASK A QUESTION</span>
                      <span className="xs:hidden sm:hidden">Q&A</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs ml-1">
                        {questionsCount || 0}
                      </Badge>
                    </Button>
                  </div>
                </div>

                {/* Campaign Info Below Video */}
                <div className="p-3 sm:p-4 lg:p-6">
                  {/* Company Title */}
                  <div className="mb-4 sm:mb-6 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{campaign.title}</h1>
                      <Badge className="bg-fundry-orange text-white border-fundry-orange self-center sm:self-start">
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">{campaign.shortPitch}</p>
                  </div>

                  {/* Meta Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 border-t pt-3 sm:pt-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Building className="mr-2 text-fundry-orange" size={14} />
                      <span className="truncate">{campaign.businessSector || 'Technology'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <MapPin className="mr-2 text-fundry-orange" size={14} />
                      <span className="truncate">{campaign.country && campaign.state ? `${campaign.state}, ${campaign.country}` : 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start sm:col-span-2 lg:col-span-1">
                      <Calendar className="mr-2 text-fundry-orange" size={14} />
                      <span className="truncate">Started {formatDate(campaign.createdAt)}</span>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  {((campaign as any).websiteUrl || (campaign as any).twitterUrl || (campaign as any).facebookUrl || (campaign as any).instagramUrl || 
                    (campaign as any).linkedinUrl || (campaign as any).youtubeUrl || (campaign as any).mediumUrl || (campaign as any).tiktokUrl || (campaign as any).snapchatUrl) && (
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 border-t pt-4 mt-4">
                      {(campaign as any).websiteUrl && (
                        <a 
                          href={(campaign as any).websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-fundry-orange transition-colors"
                        >
                          <Globe size={18} />
                        </a>
                      )}
                      {(campaign as any).twitterUrl && (
                        <a 
                          href={(campaign as any).twitterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <FaTwitter size={18} />
                        </a>
                      )}
                      {(campaign as any).facebookUrl && (
                        <a 
                          href={(campaign as any).facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <FaFacebook size={18} />
                        </a>
                      )}
                      {(campaign as any).instagramUrl && (
                        <a 
                          href={(campaign as any).instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-pink-500 transition-colors"
                        >
                          <FaInstagram size={18} />
                        </a>
                      )}
                      {(campaign as any).linkedinUrl && (
                        <a 
                          href={(campaign as any).linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-blue-700 transition-colors"
                        >
                          <FaLinkedin size={18} />
                        </a>
                      )}
                      {(campaign as any).youtubeUrl && (
                        <a 
                          href={(campaign as any).youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <FaYoutube size={18} />
                        </a>
                      )}
                      {(campaign as any).mediumUrl && (
                        <a 
                          href={(campaign as any).mediumUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <FaMedium size={18} />
                        </a>
                      )}
                      {(campaign as any).tiktokUrl && (
                        <a 
                          href={(campaign as any).tiktokUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-black transition-colors"
                        >
                          <FaTiktok size={18} />
                        </a>
                      )}
                      {(campaign as any).snapchatUrl && (
                        <a 
                          href={(campaign as any).snapchatUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-500 hover:text-yellow-400 transition-colors"
                        >
                          <FaSnapchat size={18} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investment Information (3/10 width - 30%) */}
          <div className="lg:col-span-3 order-2 lg:order-2">
            <Card className="border-0 shadow-xl bg-white lg:sticky lg:top-8">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {/* Status Badge */}
                <div className="mb-3 sm:mb-4 text-center lg:text-left">
                  <Badge className="bg-fundry-orange text-white border-fundry-orange px-3 py-1 text-xs font-semibold">
                    {campaign.progressPercent >= 75 ? "ALMOST SOLD OUT" : "ACCEPTING INVESTMENTS"}
                  </Badge>
                </div>

                {/* Funding Amount - Large Display */}
                <div className="mb-3 sm:mb-4 lg:mb-6 text-center lg:text-left">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{formatCurrency(campaign.totalRaised)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">raised from {campaign.investorCount} investors</div>
                </div>

                {/* Investment Form */}
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 text-center lg:text-left">INVEST</label>
                  <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                    <span className="px-3 py-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      min={campaign.minimumInvestment}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="flex-1 px-3 py-3 border-0 focus:ring-0 focus:outline-none text-base bg-transparent text-center lg:text-left"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center lg:text-left">min ${campaign.minimumInvestment}</div>
                </div>

                {/* Invest Button */}
                <Button 
                  onClick={handleInvest}
                  disabled={isProcessing}
                  className="w-full bg-fundry-orange hover:bg-orange-600 text-white font-bold py-3 text-base mb-3 sm:mb-4 rounded-lg"
                >
                  {isProcessing ? "Processing..." : "INVEST"}
                </Button>

                {/* Investment Terms */}
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-xs sm:text-sm text-center lg:text-left">INVESTMENT TERMS</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                      <span className="text-gray-600 text-center sm:text-left">Future Equity</span>
                      <span className="font-medium text-center sm:text-right">{formatCurrency(campaign.valuationCap)} Valuation Cap</span>
                    </div>
                    {campaign.discountRate && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-gray-600 text-center sm:text-left">Discount Rate</span>
                        <span className="font-medium text-center sm:text-right">{campaign.discountRate}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex justify-center lg:justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-gray-600 text-center lg:text-left">{campaign.progressPercent}% of {formatCurrency(campaign.fundingGoal)} goal</span>
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
            <CardContent className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fundry-navy mb-3 sm:mb-4 tracking-tight">Pitch Deck</h2>
                
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

          {/* About This Campaign Section */}
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
            <div className="relative px-10 py-8 bg-gradient-to-br from-fundry-navy via-blue-800 to-blue-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  About This Campaign
                </h2>
                <p className="text-white/90 font-medium text-lg">Learn more about this investment opportunity</p>
              </div>
            </div>
            
            <CardContent className="p-10 bg-white">
              <div className="space-y-8">
                {(() => {
                  const paragraphs = campaign.fullPitch.split('\r\n\r\n').filter(p => p.trim() !== '');
                  const allFeatures: string[] = [];
                  const processedContent: React.ReactNode[] = [];
                  
                  // Collect all features first
                  paragraphs.forEach(paragraph => {
                    if (paragraph.includes('Effortless') || paragraph.includes('Quick loans') || 
                        paragraph.includes('Business-friendly') || paragraph.includes('Interactive')) {
                      const features = paragraph.split('\r\n').filter(line => line.trim());
                      allFeatures.push(...features);
                    }
                  });
                  
                  // Process content sections
                  paragraphs.forEach((paragraph, index) => {
                    if (paragraph.trim() === '') return;
                    
                    // Company Vision section
                    if (index === 0) {
                      processedContent.push(
                        <div key={`vision-${index}`} className="relative bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-8 shadow-xl border border-slate-200/50 overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fundry-orange/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                              <h3 className="text-2xl font-bold text-fundry-navy">Company Vision</h3>
                            </div>
                            <p className="text-gray-800 leading-relaxed text-lg font-medium">{paragraph.trim()}</p>
                          </div>
                        </div>
                      );
                    }
                    // Skip feature paragraphs (we'll handle them separately)
                    else if (paragraph.includes('Effortless') || paragraph.includes('Quick loans') || 
                             paragraph.includes('Business-friendly') || paragraph.includes('Interactive')) {
                      return;
                    }
                    // Market positioning
                    else if (paragraph.includes('holistic fintech alternative')) {
                      processedContent.push(
                        <div key={`market-${index}`} className="relative bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl p-8 border-l-4 border-emerald-500 shadow-xl overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <h3 className="text-xl font-bold text-emerald-800">Market Position</h3>
                            </div>
                            <p className="text-gray-800 leading-relaxed text-lg font-medium">{paragraph.trim()}</p>
                          </div>
                        </div>
                      );
                    }
                    // Regular content
                    else {
                      processedContent.push(
                        <div key={`content-${index}`} className="bg-gradient-to-br from-gray-50 to-slate-50/50 rounded-2xl p-8 border-l-4 border-gray-400 shadow-lg">
                          <p className="text-gray-900 leading-relaxed text-lg font-medium">{paragraph.trim()}</p>
                        </div>
                      );
                    }
                  });
                  
                  // Add consolidated features section after vision
                  if (allFeatures.length > 0) {
                    processedContent.splice(1, 0, 
                      <div key="features" className="relative bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-2xl p-8 shadow-xl border border-orange-200/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-fundry-orange/5 via-transparent to-amber-500/5"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-fundry-orange/10 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-fundry-navy">Key Features & Benefits</h3>
                          </div>
                          
                          <div className="grid gap-6">
                            {allFeatures.map((feature, idx) => (
                              <div key={idx} className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {idx === 0 ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                      ) : idx === 1 ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                      ) : idx === 2 ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      )}
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-900 font-semibold leading-relaxed text-lg group-hover:text-fundry-navy transition-colors duration-300">{feature.trim()}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return processedContent;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <CardContent className="p-10">
              <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                <div className="w-3 h-8 sm:h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-fundry-navy tracking-tight">Investment Details</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Funding Goal */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-orange" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Funding Goal</h3>
                  <p className="text-2xl font-bold text-fundry-navy">{formatCurrency(campaign.fundingGoal)}</p>
                </div>

                {/* Amount Raised */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Amount Raised</h3>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(campaign.totalRaised)}</p>
                </div>

                {/* Minimum Investment */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Minimum Investment</h3>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(campaign.minimumInvestment)}</p>
                </div>

                {/* Discount Rate */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fundry-orange to-orange-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-fundry-orange to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Discount Rate</h3>
                  <p className="text-2xl font-bold text-fundry-orange">{campaign.discountRate}%</p>
                </div>

                {/* Valuation Cap */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fundry-navy to-blue-800"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Valuation Cap</h3>
                  <p className="text-2xl font-bold text-fundry-navy">{formatCurrency(campaign.valuationCap)}</p>
                </div>

                {/* Investors */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Investors</h3>
                  <p className="text-2xl font-bold text-blue-600">{campaign.investorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Strategy Section */}
          {(campaign.problemStatement || campaign.solution || campaign.marketOpportunity || 
            campaign.businessModel || campaign.goToMarketStrategy || campaign.competitiveLandscape) && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Business Strategy</h2>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {campaign.problemStatement && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Problem Statement</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.problemStatement}</p>
                    </div>
                  )}

                  {campaign.solution && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Solution</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.solution}</p>
                    </div>
                  )}

                  {campaign.marketOpportunity && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Market Opportunity</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.marketOpportunity}</p>
                    </div>
                  )}

                  {campaign.businessModel && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Business Model</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.businessModel}</p>
                    </div>
                  )}

                  {campaign.goToMarketStrategy && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Go-to-Market Strategy</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.goToMarketStrategy}</p>
                    </div>
                  )}

                  {campaign.competitiveLandscape && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-fundry-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Competitive Landscape</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.competitiveLandscape}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <CardContent className="p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Company Information</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Company Name</h3>
                  </div>
                  <p className="text-xl font-semibold text-blue-600">{campaign.companyName}</p>
                </div>

                {/* Location */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                  </div>
                  <p className="text-lg text-emerald-600 font-medium">
                    {campaign.country && campaign.state ? `${campaign.state}, ${campaign.country}` : 'Location TBD'}
                  </p>
                </div>

                {/* Business Address */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Business Address</h3>
                  </div>
                  <p className="text-lg text-purple-600 font-medium">{campaign.businessAddress || 'Address TBD'}</p>
                </div>

                {/* Registration Status */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Registration Status</h3>
                  </div>
                  <p className="text-lg text-amber-600 font-medium">{campaign.registrationStatus || 'Pending'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traction & Growth */}
          {(campaign.startupStage || campaign.currentRevenue || campaign.customers || 
            campaign.previousFunding || campaign.keyMilestones) && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Traction & Growth</h2>
                </div>
                
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {campaign.startupStage && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Startup Stage</h3>
                      </div>
                      <p className="text-lg text-blue-600 font-medium">{campaign.startupStage}</p>
                    </div>
                  )}

                  {campaign.currentRevenue && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Current Revenue</h3>
                      </div>
                      <p className="text-lg text-green-600 font-medium">{campaign.currentRevenue}</p>
                    </div>
                  )}

                  {campaign.customers && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Customer Base</h3>
                      </div>
                      <p className="text-lg text-purple-600 font-medium">{campaign.customers}</p>
                    </div>
                  )}

                  {campaign.previousFunding && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Previous Funding</h3>
                      </div>
                      <p className="text-lg text-amber-600 font-medium">{campaign.previousFunding}</p>
                    </div>
                  )}

                  {campaign.keyMilestones && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 lg:col-span-2">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-600"></div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Key Milestones</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{campaign.keyMilestones}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Use of Funds */}
          {campaign.useOfFunds && Array.isArray(campaign.useOfFunds) && campaign.useOfFunds.length > 0 && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Use of Funds</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {campaign.useOfFunds.map((fund: any, index: number) => {
                    const colors = [
                      { bg: "from-blue-500 to-indigo-600", text: "text-blue-600", icon: "text-blue-500" },
                      { bg: "from-emerald-500 to-green-600", text: "text-emerald-600", icon: "text-emerald-500" },
                      { bg: "from-purple-500 to-violet-600", text: "text-purple-600", icon: "text-purple-500" },
                      { bg: "from-amber-500 to-orange-500", text: "text-amber-600", icon: "text-amber-500" },
                      { bg: "from-rose-500 to-pink-600", text: "text-rose-600", icon: "text-rose-500" }
                    ];
                    const color = colors[index % colors.length];
                    const icons = [
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    ];
                    
                    return (
                      <div key={index} className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:scale-105">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color.bg}`}></div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${color.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {icons[index % icons.length]}
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{fund.category}</h3>
                            <div className="flex items-center gap-3">
                              <span className={`text-xl font-bold ${color.text}`}>{fund.percentage}%</span>
                              <span className="text-sm text-gray-600 font-medium">
                                {formatCurrency(parseFloat(campaign.fundingGoal) * (fund.percentage / 100))}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                            <div 
                              className={`h-2 bg-gradient-to-r ${color.bg} rounded-full transition-all duration-500 shadow-sm`}
                              style={{ width: `${fund.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {fund.description && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50/50 rounded-lg p-3 border-l-3 border-gray-300">
                            <p className="text-gray-700 leading-relaxed text-sm">{fund.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  <h2 className="text-2xl font-bold text-fundry-navy">Company Directors</h2>
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

          {/* Meet the Team */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <CardContent className="p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Meet the Team</h2>
              </div>
              
              {campaign.teamMembers && Array.isArray(campaign.teamMembers) && campaign.teamMembers.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {campaign.teamMembers.map((member: any, index: number) => {
                    const colors = [
                      { bg: "from-blue-500 to-indigo-600", ring: "ring-blue-200", text: "text-blue-600" },
                      { bg: "from-emerald-500 to-green-600", ring: "ring-emerald-200", text: "text-emerald-600" },
                      { bg: "from-purple-500 to-violet-600", ring: "ring-purple-200", text: "text-purple-600" },
                      { bg: "from-amber-500 to-orange-500", ring: "ring-amber-200", text: "text-amber-600" },
                      { bg: "from-rose-500 to-pink-600", ring: "ring-rose-200", text: "text-rose-600" },
                      { bg: "from-cyan-500 to-blue-600", ring: "ring-cyan-200", text: "text-cyan-600" }
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:scale-105">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color.bg}`}></div>
                        
                        <div className="flex flex-col items-center text-center">
                          {/* Photo at the top */}
                          <div className="mb-6">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl.startsWith('/') ? member.photoUrl : `/${member.photoUrl}`}
                                alt={member.name}
                                className={`w-32 h-32 rounded-2xl object-cover ring-4 ${color.ring} shadow-lg mx-auto`}
                              />
                            ) : (
                              <div className={`w-32 h-32 bg-gradient-to-br ${color.bg} rounded-2xl flex items-center justify-center ring-4 ${color.ring} shadow-lg mx-auto`}>
                                <span className="text-white text-3xl font-bold">
                                  {member.name ? member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'TM'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Text content below photo */}
                          <div className="w-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{member.name}</h3>
                            <p className={`font-semibold uppercase tracking-wide text-sm mb-4 ${color.text}`}>
                              {member.role}
                            </p>
                            
                            {member.experience && (
                              <div className="mb-6">
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50/50 rounded-xl p-4 border-l-4 border-gray-300 text-left">
                                  <p className="text-gray-700 leading-relaxed text-sm">{member.experience}</p>
                                </div>
                              </div>
                            )}
                            
                            {member.linkedinUrl && (
                              <div className="flex justify-center">
                                <a
                                  href={member.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${color.bg} text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                                >
                                  <ExternalLink size={16} />
                                  <span>LinkedIn Profile</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3">Team Information Coming Soon</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    The founder is preparing detailed team information to showcase the talented individuals behind this startup.
                  </p>
                  <div className="text-sm text-gray-500 mt-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {campaign.teamStructure || 'Solo Founder'}
                    </span>
                  </div>
                </div>
              )}
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
          initialAmount={investmentAmount}
          onAmountChange={setInvestmentAmount}
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

      {campaign && (
        <CampaignUpdatesModal
          isOpen={showUpdatesModal}
          onClose={() => setShowUpdatesModal(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      )}

      {campaign && (
        <CampaignCommentsModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      )}

      {campaign && (
        <CampaignQuestionsModal
          isOpen={showQuestionsModal}
          onClose={() => setShowQuestionsModal(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      )}

      <Footer />
    </div>
  );
}