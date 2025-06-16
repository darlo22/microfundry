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
  Edit
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

  // Fetch recent investors (mock data for now)
  const recentInvestors = [
    { initials: "JD", name: "John Doe", amount: "$250", timeAgo: "2 hours ago" },
    { initials: "SM", name: "Sarah Miller", amount: "$500", timeAgo: "1 day ago" },
    { initials: "MJ", name: "Mike Johnson", amount: "$100", timeAgo: "2 days ago" },
  ];

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

    // Check if we have team data and it's not corrupted
    if (campaign.teamStructure === "team" && campaign.teamMembers) {
      try {
        let teamData = campaign.teamMembers;
        
        // Skip if it's the corrupted "[object Object]" string
        if (typeof teamData === 'string') {
          if (teamData === '"[object Object]"' || teamData === '[object Object]') {
            throw new Error('Corrupted team data');
          }
          teamData = JSON.parse(teamData);
        }
        
        // Ensure we have a valid array with proper data
        if (Array.isArray(teamData) && teamData.length > 0 && teamData[0].name) {
          return teamData.map((member: any, index: number) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {member.name?.split(' ').map((n: string) => n[0]).join('') || 'TM'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                <p className="text-fundry-orange font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.experience}</p>
              </div>
            </div>
          ));
        }
      } catch (error) {
        // Silently fall through to solo founder display for corrupted data
      }
    }

    // Solo founder display
    return (
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">
            {campaign.title.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">Founder</h3>
          <p className="text-fundry-orange font-medium mb-2">CEO & Founder</p>
          <p className="text-sm text-gray-600">Leading this exciting venture</p>
        </div>
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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `$${num.toLocaleString()}`;
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
                  <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center ml-6 overflow-hidden">
                    {campaign.logoUrl ? (
                      <img 
                        src={campaign.logoUrl} 
                        alt={campaign.title}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
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
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Business Model</h3>
                    <p className="text-gray-600">
                      {campaign.businessModel || "Subscription-based SaaS model with tiered pricing structure"}
                    </p>
                  </div>
                  {campaign.useOfFunds && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Use of Funds</h3>
                      <p className="text-gray-600">{campaign.useOfFunds}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Information */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet the Team</h2>
                <div className="grid md:grid-cols-2 gap-6">
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
            <Card className="sticky top-24">
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
                <div className="space-y-3">
                  {recentInvestors.map((investor, index) => (
                    <div key={index} className="flex items-center justify-between">
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
                
                <Button variant="link" className="w-full mt-4 text-fundry-orange hover:text-orange-600 text-sm">
                  View All Investors
                </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" aria-describedby="pitch-deck-description">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2" size={20} />
              {campaign?.title} - Pitch Deck
            </DialogTitle>
          </DialogHeader>
          <div id="pitch-deck-description" className="sr-only">
            View the pitch deck document for this campaign
          </div>
          <div className="w-full h-[70vh] bg-gray-100 rounded-lg flex items-center justify-center">
            {campaign?.pitchDeckUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <FileText className="mx-auto h-20 w-20 mb-4 text-fundry-orange" />
                  <h3 className="text-xl font-semibold mb-2">Pitch Deck Available</h3>
                  <p className="mb-4">This campaign has uploaded a pitch deck document</p>
                  <div className="space-y-3">
                    <a 
                      href={campaign.pitchDeckUrl.startsWith('/') ? campaign.pitchDeckUrl : `/${campaign.pitchDeckUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-fundry-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <FileText className="mr-2" size={16} />
                      Open Pitch Deck
                    </a>
                    <div className="text-xs text-gray-500">
                      Opens in new tab for viewing
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="mx-auto h-16 w-16 mb-4" />
                <p>Pitch deck not available</p>
              </div>
            )}
          </div>
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

      <Footer />
    </div>
  );
}
