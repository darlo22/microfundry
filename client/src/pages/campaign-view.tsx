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
  const [showAllInvestorsModal, setShowAllInvestorsModal] = useState(false);
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

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleViewPitchDeck = () => {
    if (campaign?.pitchDeckUrl) {
      setShowPitchDeckModal(true);
    } else {
      toast({
        title: "No pitch deck",
        description: "This campaign hasn't uploaded a pitch deck yet",
        variant: "destructive",
      });
    }
  };

  const renderTeamMembers = () => {
    if (!campaign) return null;

    // Try to display structured team data if available
    if (campaign.teamMembers) {
      try {
        let teamData = campaign.teamMembers;
        
        // Handle string-encoded JSON
        if (typeof teamData === 'string') {
          if (teamData === '"[object Object]"' || teamData === '[object Object]') {
            throw new Error('Corrupted team data');
          }
          teamData = JSON.parse(teamData);
        }
        
        // Display structured team members
        if (Array.isArray(teamData) && teamData.length > 0) {
          return teamData.map((member: any, index: number) => (
            <div key={member.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Profile Photo or Avatar */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(member.photoUrl || member.photo) ? (
                    <img 
                      src={member.photoUrl || member.photo} 
                      alt={member.name || 'Team member'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Team member photo failed to load:', member.photoUrl || member.photo);
                        // Show initials fallback on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-fundry-orange rounded-full flex items-center justify-center">
                              <span class="text-white text-xl font-bold">
                                ${member.name?.split(' ').map((n: string) => n[0]).join('') || 'TM'}
                              </span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-fundry-orange rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {member.name?.split(' ').map((n: string) => n[0]).join('') || 'TM'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{member.name || 'Team Member'}</h3>
                  <p className="text-fundry-orange font-medium mb-3">{member.role || 'Team Member'}</p>
                  {member.experience && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{member.experience}</p>
                  )}
                  {member.linkedinProfile && (
                    <div className="mt-3">
                      <a 
                        href={member.linkedinProfile.startsWith('http') ? member.linkedinProfile : `https://${member.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ));
        }
      } catch (error) {
        console.error('Error parsing team members:', error);
        // Fall through to check for text-based team description
      }
    }

    // Check for text-based team description as fallback
    if (campaign.teamMembers && typeof campaign.teamMembers === 'string' && 
        campaign.teamMembers.trim() && 
        campaign.teamMembers !== '"[object Object]"' && 
        campaign.teamMembers !== '[object Object]') {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {campaign.title.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Team Information</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {campaign.teamMembers}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Solo founder display
    if (campaign.teamStructure === "solo") {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {campaign.title.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Solo Founder</h3>
              <p className="text-fundry-orange font-medium mb-3">CEO & Founder</p>
              <p className="text-sm text-gray-600">
                {campaign.businessSector ? `Experienced in ${campaign.businessSector}` : "Leading this venture independently"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Default message only when no team data exists
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Team information will be displayed once provided by the founder.</p>
      </div>
    );
  };

  const renderTractionMetrics = () => {
    if (!campaign) return null;

    const metrics = [];
    
    // Add real metrics from campaign data
    if (campaign.currentRevenue && campaign.currentRevenue !== "0") {
      metrics.push({
        label: "Monthly Revenue",
        value: campaign.currentRevenue.startsWith('$') ? campaign.currentRevenue : `$${campaign.currentRevenue}`,
        color: "text-blue-600"
      });
    }
    
    if (campaign.customers && campaign.customers !== "0") {
      metrics.push({
        label: "Active Users",
        value: campaign.customers,
        color: "text-green-600"
      });
    }

    if (campaign.previousFunding && campaign.previousFunding !== "0") {
      metrics.push({
        label: "Previous Funding",
        value: campaign.previousFunding.startsWith('$') ? campaign.previousFunding : `$${campaign.previousFunding}`,
        color: "text-purple-600"
      });
    }

    // If we have the startup stage, always show it
    if (campaign.startupStage) {
      metrics.unshift({
        label: "Stage",
        value: campaign.startupStage.charAt(0).toUpperCase() + campaign.startupStage.slice(1),
        color: "text-blue-600"
      });
    }

    // Fill remaining slots with status indicators if needed
    while (metrics.length < 3) {
      if (metrics.length === 1) {
        metrics.push({
          label: "Status",
          value: campaign.currentRevenue && campaign.currentRevenue !== "0" ? "Revenue Generating" : "Pre-revenue",
          color: "text-green-600"
        });
      } else if (metrics.length === 2) {
        metrics.push({
          label: "Investment Progress",
          value: `${campaign.progressPercent}%`,
          color: "text-purple-600"
        });
      }
    }

    return (
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {metrics.slice(0, 3).map((metric, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
            <div className={`text-2xl font-bold ${metric.color} mb-2`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
    );
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "funded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-8">The campaign you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/")} className="bg-fundry-orange hover:bg-orange-600">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Modern Campaign Navigation */}
      <Navbar 
        title={campaign.title}
        showNotifications={false}
        actions={
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="flex items-center text-gray-600 hover:text-fundry-orange hover:bg-orange-50 transition-all duration-200"
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </Button>
            {user?.id === campaign?.founderId && (
              <Button 
                variant="outline" 
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Campaign Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Modern Campaign Header */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Header with Solid Dark Orange Background */}
                <div className="bg-orange-700 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-white/5"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">{campaign.title}</h1>
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors self-start">
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-lg sm:text-xl text-white/95 mb-6 font-medium leading-relaxed">{campaign.shortPitch}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-white/80">
                          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
                            <Building className="mr-2" size={14} />
                            <span className="font-medium">{campaign.businessSector || 'Technology'}</span>
                          </div>
                          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
                            <MapPin className="mr-2" size={14} />
                            <span className="font-medium">{campaign.country && campaign.state ? `${campaign.state}, ${campaign.country}` : 'Location TBD'}</span>
                          </div>
                          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
                            <Calendar className="mr-2" size={14} />
                            <span className="font-medium">Started {formatDate(campaign.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Company Logo - Responsive */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/95 backdrop-blur-sm border-2 border-white/30 rounded-2xl flex items-center justify-center lg:ml-8 mt-4 lg:mt-0 overflow-hidden shadow-2xl shrink-0">
                        {campaign.logoUrl ? (
                          <img 
                            src={campaign.logoUrl} 
                            alt={campaign.title}
                            className="w-full h-full object-contain p-3 sm:p-4"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                          />
                        ) : (
                          <span className="text-fundry-orange text-xl sm:text-2xl lg:text-3xl font-bold">
                            {campaign.title.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Section - Mobile Responsive */}
                <div className="p-4 sm:p-6 lg:p-8 bg-white">
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-fundry-navy mb-1 sm:mb-2">{formatCurrency(campaign.totalRaised)}</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">Raised</div>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-fundry-orange mb-1 sm:mb-2">{campaign.progressPercent}%</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{formatCurrency(campaign.fundingGoal)}</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">Goal</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                      <span className="text-sm font-bold text-fundry-orange">{campaign.progressPercent}%</span>
                    </div>
                    <Progress 
                      value={campaign.progressPercent} 
                      className="h-3 bg-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Campaign Description */}
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

            {/* Modern Investment Details */}
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:py-4 sm:px-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-lg border-l-4 border-blue-500">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Maximum Ask</span>
                      <span className="font-bold text-base sm:text-lg text-blue-600 mt-1 sm:mt-0">{formatCurrency(campaign.fundingGoal)}</span>
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
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-teal-50 to-cyan-50/30 rounded-lg border-l-4 border-teal-500">
                      <span className="text-gray-700 font-medium">Total Investors</span>
                      <span className="font-bold text-lg text-teal-600">{campaign.investorCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-lg border-l-4 border-emerald-500">
                      <span className="text-gray-700 font-medium">Progress</span>
                      <span className="font-bold text-lg text-emerald-600">{campaign.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Traction & Metrics */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Traction & Growth</h2>
                </div>
                {renderTractionMetrics()}
                <div className="space-y-6">
                  {campaign.businessModel && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 rounded-2xl border border-blue-100 shadow-sm">
                      <h3 className="font-bold text-lg text-fundry-navy mb-3 flex items-center">
                        <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                        Business Model
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.businessModel}</p>
                    </div>
                  )}
                  {campaign.useOfFunds && Array.isArray(campaign.useOfFunds) && campaign.useOfFunds.length > 0 && (
                    <div className="p-6 bg-gradient-to-br from-orange-50 via-white to-amber-50/30 rounded-2xl border border-orange-100 shadow-sm">
                      <h3 className="font-bold text-lg text-fundry-navy mb-4 flex items-center">
                        <div className="w-2 h-6 bg-fundry-orange rounded-full mr-3"></div>
                        Use of Funds
                      </h3>
                      <div className="space-y-4">
                        {campaign.useOfFunds.map((allocation: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{allocation.category}</div>
                              {allocation.description && (
                                <div className="text-sm text-gray-600 mt-1">{allocation.description}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-bold text-fundry-orange text-lg">{allocation.percentage}%</div>
                                <div className="text-xs text-gray-500 font-medium">
                                  {formatCurrency((parseFloat(campaign.fundingGoal) * allocation.percentage / 100).toString())}
                                </div>
                              </div>
                              <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-fundry-orange to-orange-600 transition-all duration-500"
                                  style={{ width: `${allocation.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {campaign.marketSize && (
                    <div className="p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50/30 rounded-2xl border border-green-100 shadow-sm">
                      <h3 className="font-bold text-lg text-fundry-navy mb-3 flex items-center">
                        <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                        Market Opportunity
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.marketSize}</p>
                    </div>
                  )}
                  {campaign.competitiveLandscape && (
                    <div className="p-6 bg-gradient-to-br from-purple-50 via-white to-violet-50/30 rounded-2xl border border-purple-100 shadow-sm">
                      <h3 className="font-bold text-lg text-fundry-navy mb-3 flex items-center">
                        <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                        Competitive Landscape
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{campaign.competitiveLandscape}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Modern Team Information */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Meet the Team</h2>
                </div>
                <div className="space-y-4">
                  {renderTeamMembers()}
                </div>
              </CardContent>
            </Card>

            {/* Modern Pitch Deck Viewer */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-fundry-orange to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fundry-navy to-blue-700 bg-clip-text text-transparent">Pitch Deck</h2>
                </div>
                {campaign.pitchDeckUrl ? (
                  <div className="bg-fundry-navy border-2 border-dashed border-blue-400/30 rounded-2xl p-12 text-center shadow-inner">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {campaign.title}_PitchDeck.pdf
                    </h3>
                    <p className="text-white/80 mb-8 font-medium">Pitch deck available for viewing</p>
                    <Button 
                      onClick={handleViewPitchDeck}
                      className="bg-fundry-orange hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                    >
                      <FileText className="mr-2" size={18} />
                      View Pitch Deck
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/20 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      No pitch deck uploaded
                    </h3>
                    <p className="text-gray-400 font-medium">This campaign hasn't uploaded a pitch deck yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modern Investment Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Investment Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-orange-50/30 to-blue-50/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Header with solid orange */}
                <div className="bg-fundry-orange p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-white/5"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl font-bold mb-2">
                      {formatCurrency(campaign.totalRaised)}
                    </div>
                    <div className="text-white/90 font-medium">
                      raised of <span className="font-bold text-white">{formatCurrency(campaign.fundingGoal)}</span> goal
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-fundry-orange">{campaign.progressPercent}%</span>
                    </div>
                    <Progress value={campaign.progressPercent} className="h-4 bg-gray-200" />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span className="font-medium">{campaign.progressPercent}% funded</span>
                      {campaign.deadline && (
                        <span className="font-medium">
                          {Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-fundry-navy">{campaign.investorCount}</div>
                      <div className="text-sm text-gray-600 font-medium">Investors</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-xl border border-green-100">
                      <div className="text-2xl font-bold text-green-600">
                        {campaign.investorCount > 0 
                          ? formatCurrency(Math.round(parseFloat(campaign.totalRaised) / campaign.investorCount))
                          : "$0"
                        }
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Avg. Investment</div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleInvest}
                    disabled={isProcessing}
                    className="w-full bg-fundry-navy hover:bg-blue-800 text-white text-lg font-bold py-6 mb-4 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <DollarSign className="mr-3" size={24} />
                    {isProcessing ? "Processing..." : "Commit to Invest"}
                  </Button>
                  <p className="text-xs text-gray-600 text-center mb-6 font-medium">
                    Commit now, complete payment later via dashboard
                  </p>

                  <div className="text-center text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
                    Minimum investment: <span className="font-bold text-fundry-orange">{formatCurrency(campaign.minimumInvestment)}</span>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/20 rounded-xl p-6 border border-gray-100">
                    <h3 className="font-bold text-fundry-navy mb-4 flex items-center">
                      <div className="w-2 h-6 bg-fundry-orange rounded-full mr-3"></div>
                      SAFE Agreement Terms
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-700 font-medium">Discount Rate:</span>
                        <span className="font-bold text-purple-600">{campaign.discountRate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                        <span className="text-gray-700 font-medium">Valuation Cap:</span>
                        <span className="font-bold text-indigo-600">{formatCurrency(campaign.valuationCap || "1000000")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>

      <InvestmentModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        campaign={campaign}
      />

      {/* Pitch Deck Modal */}
      <Dialog open={showPitchDeckModal} onOpenChange={setShowPitchDeckModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden" aria-describedby="pitch-deck-description">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2" size={20} />
                {campaign?.title} - Pitch Deck
              </div>
              {campaign?.pitchDeckUrl && (
                <div className="flex items-center gap-2">
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
          <div id="pitch-deck-description" className="sr-only">
            Live preview of the pitch deck document for this campaign
          </div>
          <div className="w-full h-[75vh] bg-gray-50 rounded-lg overflow-hidden border">
            {campaign?.pitchDeckUrl ? (
              <div className="w-full h-full relative">
                {/* PDF Viewer */}
                <iframe
                  src={`${campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title="Pitch Deck Preview"
                  onError={(e) => {
                    // Fallback if iframe fails to load
                    const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-content');
                    if (fallbackDiv) {
                      e.currentTarget.style.display = 'none';
                      fallbackDiv.style.display = 'flex';
                    }
                  }}
                />
                
                {/* Fallback content */}
                <div className="fallback-content absolute inset-0 bg-gray-100 flex-col items-center justify-center hidden">
                  <div className="text-center text-gray-600 p-8">
                    <FileText className="mx-auto h-20 w-20 mb-4 text-fundry-orange" />
                    <h3 className="text-xl font-semibold mb-2">Preview Not Available</h3>
                    <p className="mb-6 text-gray-500">
                      The pitch deck cannot be previewed in the browser. You can download or open it in a new tab.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <a 
                        href={campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-fundry-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <ExternalLink className="mr-2" size={16} />
                        Open in New Tab
                      </a>
                      <a 
                        href={campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`}
                        download
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="mr-2" size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>

                {/* Loading overlay */}
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center loading-overlay">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pitch deck...</p>
                  </div>
                </div>
              </div>
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
          
          {campaign?.pitchDeckUrl && (
            <div className="flex items-center justify-between pt-4 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
              <div className="text-sm text-gray-500">
                Use the controls above to navigate through the presentation
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const iframe = document.querySelector('iframe[title="Pitch Deck Preview"]') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.style.transform = iframe.style.transform === 'scale(1.2)' ? 'scale(1)' : 'scale(1.2)';
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <ZoomIn className="w-4 h-4" />
                  Zoom
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Campaign Modal */}
      {campaign && (
        <ShareCampaignModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          campaignTitle={campaign.title}
          campaignUrl={`${window.location.origin}/c/${campaign.privateLink}`}
          shortPitch={campaign.shortPitch}
        />
      )}

      {/* Edit Campaign Modal */}
      {campaign && user?.id === campaign.founderId && (
        <EditCampaignModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          campaign={campaign}
        />
      )}

      {/* All Investors Modal */}
      <Dialog open={showAllInvestorsModal} onOpenChange={setShowAllInvestorsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="mr-3 text-fundry-orange" size={24} />
              All Investors ({committedInvestments.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            {committedInvestments.map((investment: any) => (
              <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-fundry-orange rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {`${investment.investor.firstName} ${investment.investor.lastName}`.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {investment.investor.firstName} {investment.investor.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Invested {new Date(investment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      Status: {investment.status}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg text-gray-900">
                    {formatCurrency(investment.amount)}
                  </div>
                  {investment.paymentStatus === 'completed' && (
                    <div className="text-xs text-green-600 font-medium">
                      Payment Complete
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {committedInvestments.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No committed investors yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Investors who commit will appear here
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
