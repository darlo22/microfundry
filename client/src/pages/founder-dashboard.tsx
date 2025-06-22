import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import CampaignCard from "@/components/campaign/campaign-card";
import CampaignCreationModal from "@/components/modals/campaign-creation-modal";
import { EditCampaignModal } from "@/components/modals/edit-campaign-modal";
import { ShareCampaignSelectorModal } from "@/components/modals/share-campaign-selector-modal";
import { SafeTemplatesModal } from "@/components/modals/safe-templates-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share, FileText, DollarSign, Rocket, Users, BarChart, TrendingUp, Settings, MessageSquare, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { CampaignWithStats, UserStats } from "@/lib/types";

export default function FounderDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSafeTemplatesModal, setShowSafeTemplatesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithStats | null>(null);

  // Handlers for campaign actions
  const handleEditCampaign = (campaign: CampaignWithStats) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const handleShareCampaign = (campaign: CampaignWithStats) => {
    setShowShareModal(true);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch founder stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/analytics/founder/${user?.id}`],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch founder campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: [`/api/campaigns/founder/${user?.id}`],
    enabled: !!user?.id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fundry-navy">
              Welcome back, {user?.firstName || "Founder"}!
            </h1>
            <p className="text-fundry-orange mt-2 text-sm sm:text-base font-medium">Here's an overview of your fundraising activities.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1">
            <nav className="flex flex-wrap gap-1" aria-label="Tabs">
              <Link href="/founder-dashboard" className="bg-gradient-to-r from-fundry-orange to-orange-500 text-white rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap shadow-lg">
                Campaigns
              </Link>
              <Link href="/founder/investors" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Investors
              </Link>
              <Link href="/founder/analytics" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Analytics
              </Link>
              <Link href="/founder/updates" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Updates
              </Link>
              <Link href="/founder/settings" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Settings
              </Link>
              <Link href="/payment-withdrawal" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Payments
              </Link>
              <Link href="/founder/messages" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Messages
              </Link>
              <Link href="/founder/outreach" className="text-gray-600 hover:text-fundry-orange hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-initial text-center whitespace-nowrap">
                Outreach
              </Link>
            </nav>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Raised"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(parseFloat(stats?.totalRaised || "0"))}
            icon={DollarSign}
            iconBgColor="bg-gradient-to-br from-green-50 to-emerald-100"
            iconColor="text-green-600"
            trend={{ 
              value: stats?.totalRaised && parseFloat(stats.totalRaised) > 0 ? "+12%" : "No change", 
              color: stats?.totalRaised && parseFloat(stats.totalRaised) > 0 ? "text-green-600" : "text-gray-500" 
            }}
            subtitle="from last month"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={Rocket}
            iconBgColor="bg-gradient-to-br from-orange-50 to-orange-100"
            iconColor="text-fundry-orange"
            subtitle={campaigns && campaigns.length > 0 ? `${campaigns.length} total campaign${campaigns.length > 1 ? 's' : ''}` : "No campaigns yet"}
          />
          <StatsCard
            title="Total Investors"
            value={stats?.totalInvestors || 0}
            icon={Users}
            iconBgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            iconColor="text-fundry-navy"
            trend={{ 
              value: stats?.totalInvestors && stats.totalInvestors > 0 ? "+5 this week" : "No investors yet", 
              color: stats?.totalInvestors && stats.totalInvestors > 0 ? "text-blue-600" : "text-gray-500" 
            }}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            icon={BarChart}
            iconBgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            iconColor="text-purple-600"
            subtitle={stats?.conversionRate && stats.conversionRate > 50 ? "Above average" : "Building momentum"}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 sm:mb-8 bg-fundry-navy border-fundry-navy shadow-xl">
          <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center">
              <TrendingUp className="mr-2 text-fundry-orange" size={24} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-3 sm:p-4 h-auto min-h-[100px] bg-fundry-orange border-2 border-fundry-orange hover:border-orange-600 hover:shadow-lg group transition-all duration-300 hover:scale-105"
                onClick={() => setShowCampaignModal(true)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-white to-orange-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Plus className="text-fundry-orange" size={20} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white group-hover:text-white transition-colors duration-300 text-xs sm:text-sm mb-1">Create Campaign</div>
                  <div className="text-xs text-white leading-tight">Start a new fundraising campaign</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center p-3 sm:p-4 h-auto min-h-[100px] bg-fundry-navy border-2 border-white hover:border-white hover:shadow-lg group transition-all duration-300 hover:scale-105"
                onClick={() => setShowShareModal(true)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-fundry-navy to-blue-700 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Share className="text-white" size={20} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white group-hover:text-fundry-navy transition-colors duration-300 text-xs sm:text-sm mb-1">Share Campaign</div>
                  <div className="text-xs text-slate-300 leading-tight">Get your private campaign link</div>
                </div>
              </Button>

              <Link href="/founder/outreach">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto min-h-[100px] bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 hover:border-purple-500 hover:shadow-lg group w-full transition-all duration-300 hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-fundry-navy group-hover:text-purple-600 transition-colors duration-300 text-xs sm:text-sm mb-1">Investor Outreach</div>
                    <div className="text-xs text-fundry-navy leading-tight">Send personalized emails to investors</div>
                  </div>
                </Button>
              </Link>

              <Link href="/payment-withdrawal">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto min-h-[100px] bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-500 hover:shadow-lg group w-full transition-all duration-300 hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 text-xs sm:text-sm mb-1">Payment Withdrawal</div>
                    <div className="text-xs text-gray-600 leading-tight">Withdraw earnings and manage KYC</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card className="bg-fundry-navy border-fundry-navy shadow-xl">
          <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20 rounded-t-lg flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center">
              <Rocket className="mr-2 text-fundry-orange" size={24} />
              Active Campaigns
            </CardTitle>
            <Button variant="link" className="text-fundry-orange hover:text-orange-400 font-semibold">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {campaignsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-fundry-orange border-t-transparent"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {campaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    isFounder 
                    onEdit={handleEditCampaign}
                    onShare={handleShareCampaign}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-slate-700 rounded-2xl p-6 sm:p-8 border border-slate-600">
                  <Rocket className="mx-auto mb-4 text-fundry-orange" size={48} />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Launch?</h3>
                  <p className="text-slate-300 mb-6 text-sm sm:text-base">No campaigns yet. Create your first campaign to start raising funds!</p>
                  <Button 
                    onClick={() => setShowCampaignModal(true)}
                    className="bg-gradient-to-r from-fundry-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2" size={20} />
                    Create Your First Campaign
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CampaignCreationModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
      />

      <ShareCampaignSelectorModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        campaigns={campaigns || []}
      />

      <SafeTemplatesModal
        isOpen={showSafeTemplatesModal}
        onClose={() => setShowSafeTemplatesModal(false)}
      />

      {selectedCampaign && (
        <EditCampaignModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign}
        />
      )}

      <Footer />
    </div>
  );
}
