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
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  // Filter investments to only show committed/paid ones (not just pending)
  const committedInvestments = campaignInvestments.filter((investment: any) => 
    investment.status === 'committed' || investment.status === 'paid' || investment.status === 'completed'
  );

  // Process recent investors from actual committed investment data
  const recentInvestors = committedInvestments.slice(0, 3).map((investment: any) => ({
    id: investment.id,
    name: `${investment.investor.firstName} ${investment.investor.lastName}`,
    initials: getInitials(`${investment.investor.firstName} ${investment.investor.lastName}`),
    amount: formatCurrency(investment.amount),
    timeAgo: getTimeAgo(investment.createdAt),
  }));

  const handleBackToDashboard = () => {
    if (user?.userType === "founder") {
      setLocation("/founder/dashboard");
    } else {
      setLocation("/investor/dashboard");
    }
  };

  const handleInvest = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to invest in this campaign.",
        variant: "destructive",
      });
      window.location.href = "/api/login";
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

    // First, try to display structured team data if available
    if (campaign.teamStructure === "team" && campaign.teamMembers) {
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
        if (Array.isArray(teamData) && teamData.length > 0 && teamData[0].name) {
          return teamData.map((member: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">
                    {member.name?.split(' ').map((n: string) => n[0]).join('') || 'TM'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-fundry-orange font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.experience}</p>
                  {member.linkedin && (
                    <div className="mt-3">
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View LinkedIn Profile →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ));
        }
      } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Campaign Navigation */}
      <Navbar 
        title={campaign.title}
        showNotifications={false}
        actions={
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="flex items-center text-gray-600 hover:text-fundry-orange"
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </Button>
            {user?.id === campaign?.founderId && (
              <Button 
                variant="outline" 
                onClick={handleEdit}
                className="flex items-center border-fundry-orange text-fundry-orange hover:bg-fundry-orange hover:text-white"
              >
                <Edit className="mr-2" size={16} />
                Edit
              </Button>
            )}
            <Button onClick={handleShare} className="bg-fundry-orange hover:bg-orange-600">
              <Share className="mr-2" size={16} />
              Share
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Campaign Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xl text-gray-600 mb-6">{campaign.shortPitch}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building className="mr-2" size={16} />
                        <span>Technology</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2" size={16} />
                        <span>San Francisco, CA</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2" size={16} />
                        <span>Started {formatDate(campaign.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Logo */}
                  <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center ml-6 overflow-hidden shadow-sm">
                    {campaign.logoUrl ? (
                      <img 
                        src={campaign.logoUrl} 
                        alt={campaign.title}
                        className="w-full h-full object-contain p-3"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl font-bold">
                        {campaign.title.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Description */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Campaign</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {campaign.fullPitch.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Investment Details */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Funding Goal</span>
                      <span className="font-semibold text-lg">{formatCurrency(campaign.fundingGoal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Amount Raised</span>
                      <span className="font-semibold text-lg text-green-600">{formatCurrency(campaign.totalRaised)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Minimum Investment</span>
                      <span className="font-semibold text-lg">{formatCurrency(campaign.minimumInvestment)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Maximum Ask</span>
                      <span className="font-semibold text-lg">$5,000</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Discount Rate</span>
                      <span className="font-semibold text-lg">{campaign.discountRate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Valuation Cap</span>
                      <span className="font-semibold text-lg">{formatCurrency(campaign.valuationCap || "1000000")}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Total Investors</span>
                      <span className="font-semibold text-lg">{campaign.investorCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-lg">{campaign.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traction & Metrics */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Traction & Growth</h2>
                {renderTractionMetrics()}
                <div className="space-y-4">
                  {campaign.businessModel && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Business Model</h3>
                      <p className="text-gray-600">{campaign.businessModel}</p>
                    </div>
                  )}
                  {campaign.useOfFunds && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Use of Funds</h3>
                      <p className="text-gray-600">{campaign.useOfFunds}</p>
                    </div>
                  )}
                  {campaign.marketSize && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Market Opportunity</h3>
                      <p className="text-gray-600">{campaign.marketSize}</p>
                    </div>
                  )}
                  {campaign.competitiveLandscape && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Competitive Landscape</h3>
                      <p className="text-gray-600">{campaign.competitiveLandscape}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Information */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet the Team</h2>
                <div className="space-y-4">
                  {renderTeamMembers()}
                </div>
              </CardContent>
            </Card>

            {/* Pitch Deck Viewer */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pitch Deck</h2>
                {campaign.pitchDeckUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-fundry-orange mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {campaign.title}_PitchDeck.pdf
                    </h3>
                    <p className="text-gray-600 mb-6">Pitch deck available for viewing</p>
                    <Button 
                      onClick={handleViewPitchDeck}
                      className="bg-fundry-orange hover:bg-orange-600"
                    >
                      <FileText className="mr-2" size={16} />
                      View Pitch Deck
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No pitch deck uploaded
                    </h3>
                    <p className="text-gray-400">This campaign hasn't uploaded a pitch deck yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Investment Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatCurrency(campaign.totalRaised)}
                  </div>
                  <div className="text-gray-600">
                    raised of <span className="font-semibold">{formatCurrency(campaign.fundingGoal)}</span> goal
                  </div>
                </div>

                <div className="mb-6">
                  <Progress value={campaign.progressPercent} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{campaign.progressPercent}% funded</span>
                    {campaign.deadline && (
                      <span>
                        {Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.investorCount}</div>
                    <div className="text-sm text-gray-600">Investors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {campaign.investorCount > 0 
                        ? formatCurrency(Math.round(parseFloat(campaign.totalRaised) / campaign.investorCount))
                        : "$0"
                      }
                    </div>
                    <div className="text-sm text-gray-600">Avg. Investment</div>
                  </div>
                </div>

                <Button 
                  onClick={handleInvest}
                  disabled={isProcessing}
                  className="w-full bg-fundry-orange hover:bg-orange-600 text-lg font-semibold py-4 mb-4"
                >
                  <DollarSign className="mr-2" size={20} />
                  {isProcessing ? "Processing..." : "Commit to Invest"}
                </Button>
                <p className="text-xs text-gray-500 text-center mb-4">
                  Commit now, complete payment later via dashboard
                </p>

                <div className="text-center text-sm text-gray-500">
                  Minimum investment: <span className="font-medium">{formatCurrency(campaign.minimumInvestment)}</span>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">SAFE Agreement Terms</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount Rate:</span>
                      <span className="font-medium">{campaign.discountRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valuation Cap:</span>
                      <span className="font-medium">{formatCurrency(campaign.valuationCap || "1000000")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Investors */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Investors</h3>
                {recentInvestors.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {recentInvestors.map((investor: any, index: number) => (
                        <div key={investor.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">{investor.initials}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{investor.name}</div>
                              <div className="text-xs text-gray-500">{investor.timeAgo}</div>
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900">{investor.amount}</div>
                        </div>
                      ))}
                    </div>
                    
                    {committedInvestments.length > 3 && (
                      <Button 
                        variant="link" 
                        className="w-full mt-4 text-fundry-orange hover:text-orange-600 text-sm"
                        onClick={() => setShowAllInvestorsModal(true)}
                      >
                        View All {committedInvestments.length} Investors
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No investors yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Be the first to invest in this campaign
                    </p>
                  </div>
                )}
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
                      {getInitials(`${investment.investor.firstName} ${investment.investor.lastName}`)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {investment.investor.firstName} {investment.investor.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Invested {getTimeAgo(investment.createdAt)}
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
