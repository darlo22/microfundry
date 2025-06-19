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



  // Loading state
  if (isLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-fundry-navy">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-200 text-lg">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-fundry-navy">
        <Navbar />
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
    <div className="min-h-screen bg-fundry-navy">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Hero Section - Pitch Media First (Wefunder Style) */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm">
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
                            src={campaign.logoUrl.startsWith('/') ? campaign.logoUrl : `/${campaign.logoUrl}`} 
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
                            src={campaign.logoUrl.startsWith('/') ? campaign.logoUrl : `/${campaign.logoUrl}`} 
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
              <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800 relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-indigo-900/20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                
                {/* Title and Basic Info */}
                <div className="mb-6 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">{campaign.title}</h1>
                        <Badge className="bg-fundry-orange text-white border-fundry-orange">
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-lg text-gray-100 mb-4 leading-relaxed font-medium">{campaign.shortPitch}</p>
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
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
                <div className="grid grid-cols-3 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl mb-6 relative z-10">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{formatCurrency(campaign.totalRaised)}</div>
                    <div className="text-sm text-gray-300 font-medium">Raised</div>
                  </div>
                  <div className="text-center border-l border-r border-gray-400/30">
                    <div className="text-2xl sm:text-3xl font-bold text-fundry-orange mb-1">{campaign.progressPercent}%</div>
                    <div className="text-sm text-gray-300 font-medium">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">{formatCurrency(campaign.fundingGoal)}</div>
                    <div className="text-sm text-gray-300 font-medium">Goal</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6 relative z-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-200">Funding Progress</span>
                    <span className="text-sm font-bold text-fundry-orange">{campaign.progressPercent}%</span>
                  </div>
                  <Progress 
                    value={campaign.progressPercent} 
                    className="h-3 bg-gray-600/50"
                  />
                </div>
                
                {/* Investment CTA */}
                <Button 
                  onClick={handleInvest}
                  disabled={isProcessing}
                  className="w-full bg-fundry-orange hover:bg-orange-600 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-gradient-to-r from-fundry-orange to-orange-600">
            {/* Header */}
            <div className="px-8 py-6">
              <h2 className="text-2xl font-bold text-fundry-navy flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  📖
                </div>
                About This Campaign
              </h2>
              <p className="text-fundry-navy font-medium mt-2">Learn more about this investment opportunity</p>
            </div>
            
            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                {(() => {
                  const paragraphs = campaign.fullPitch.split('\r\n\r\n').filter(p => p.trim() !== '');
                  const allFeatures = [];
                  const processedContent = [];
                  
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
                    if (index === 0 && paragraph.includes('"beyond payments"')) {
                      processedContent.push(
                        <div key={`vision-${index}`} className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-200">
                          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                            <div className="w-8 h-8 bg-fundry-orange rounded-lg flex items-center justify-center text-white">
                              🎯
                            </div>
                            Company Vision
                          </h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-medium">{paragraph.trim()}</p>
                        </div>
                      );
                    }
                    // Skip feature paragraphs (we'll handle them separately)
                    else if (paragraph.includes('Effortless') || paragraph.includes('Quick loans') || 
                             paragraph.includes('Business-friendly') || paragraph.includes('Interactive')) {
                      // Skip individual feature paragraphs
                      return;
                    }
                    // Market positioning
                    else if (paragraph.includes('holistic fintech alternative')) {
                      processedContent.push(
                        <div key={`market-${index}`} className="bg-gray-50 rounded-xl p-6 border-l-4 border-emerald-500 shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">
                              📈
                            </div>
                            Market Position
                          </h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">{paragraph.trim()}</p>
                        </div>
                      );
                    }
                    // Regular content
                    else {
                      processedContent.push(
                        <div key={`content-${index}`} className="bg-gray-50 rounded-xl p-6 border-l-4 border-gray-400 shadow-md">
                          <p className="text-gray-900 leading-relaxed text-lg font-medium">{paragraph.trim()}</p>
                        </div>
                      );
                    }
                  });
                  
                  // Add consolidated features section after vision
                  if (allFeatures.length > 0) {
                    processedContent.splice(1, 0, 
                      <div key="features" className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                            ✓
                          </div>
                          Key Features & Benefits
                        </h3>
                        <div className="grid gap-4">
                          {allFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-white rounded-lg p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                              <div className="w-10 h-10 bg-gradient-to-br from-fundry-orange to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg">
                                  {idx === 0 ? '💳' : idx === 1 ? '✈️' : idx === 2 ? '🏢' : '👥'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 font-semibold leading-relaxed text-lg">{feature.trim()}</p>
                              </div>
                            </div>
                          ))}
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
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Investment Details</h2>
              </div>
              
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {/* Funding Goal */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
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
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Minimum Investment</h3>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(campaign.minimumInvestment)}</p>
                </div>

                {/* Discount Rate */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Discount Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">{campaign.discountRate}%</p>
                </div>

                {/* Valuation Cap */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Valuation Cap</h3>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(campaign.valuationCap || "1000000")}</p>
                </div>

                {/* Investors */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Investors</h3>
                  <p className="text-2xl font-bold text-cyan-600">{campaign.investorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Strategy Section */}
          {(campaign.problemStatement || campaign.solution || campaign.marketOpportunity || campaign.businessModel || campaign.goToMarketStrategy || campaign.competitiveLandscape) && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Business Strategy</h2>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {campaign.problemStatement && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-700 mb-3">Problem Statement</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.problemStatement}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.solution && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-emerald-700 mb-3">Solution</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.solution}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.marketOpportunity && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-sky-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-700 mb-3">Market Opportunity</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.marketOpportunity}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.businessModel && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-purple-700 mb-3">Business Model</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.businessModel}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.goToMarketStrategy && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-amber-700 mb-3">Go-To-Market Strategy</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.goToMarketStrategy}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.competitiveLandscape && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-indigo-700 mb-3">Competitive Landscape</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.competitiveLandscape}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          {(campaign.companyName || campaign.country || campaign.state || campaign.businessAddress || campaign.registrationStatus) && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Company Information</h2>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {campaign.companyName && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-orange-700 mb-3">Company Name</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">{campaign.companyName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(campaign.country || campaign.state) && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-sky-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-700 mb-3">Location</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">
                            {campaign.state && campaign.country ? `${campaign.state}, ${campaign.country}` : campaign.country || campaign.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.businessAddress && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-emerald-700 mb-3">Business Address</h3>
                          <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.businessAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.registrationStatus && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-purple-700 mb-3">Registration Status</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold capitalize">{campaign.registrationStatus}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Traction & Growth */}
          {(campaign.startupStage || campaign.currentRevenue || campaign.customers || campaign.previousFunding || campaign.keyMilestones) && (
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
              <CardContent className="p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-10 bg-gradient-to-b from-fundry-orange via-orange-500 to-orange-600 rounded-full shadow-md"></div>
                  <h2 className="text-3xl font-bold text-fundry-navy tracking-tight">Traction & Growth</h2>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {campaign.startupStage && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-700 mb-3">Startup Stage</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold capitalize">{campaign.startupStage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.currentRevenue && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-emerald-700 mb-3">Current Revenue</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">{campaign.currentRevenue}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.customers && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-purple-700 mb-3">Customer Base</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">{campaign.customers}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.previousFunding && (
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-amber-700 mb-3">Previous Funding</h3>
                          <p className="text-gray-800 leading-relaxed text-lg font-semibold">{campaign.previousFunding}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {campaign.keyMilestones && (
                  <div className="mt-8 group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-pink-600"></div>
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-rose-700 mb-4">Key Milestones</h3>
                        <p className="text-gray-800 leading-relaxed text-base font-medium">{campaign.keyMilestones}</p>
                      </div>
                    </div>
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
                  <h2 className="text-2xl font-bold text-fundry-navy">Use of Funds</h2>
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