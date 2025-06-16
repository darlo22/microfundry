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
import { ShareCampaignSelectorModal } from "@/components/modals/share-campaign-selector-modal";
import { SafeTemplatesModal } from "@/components/modals/safe-templates-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Share, FileText, DollarSign, Rocket, Users, BarChart } from "lucide-react";
import type { CampaignWithStats, UserStats } from "@/lib/types";

export default function FounderDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSafeTemplatesModal, setShowSafeTemplatesModal] = useState(false);

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
    queryKey: ["/api/analytics/founder/" + user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch founder campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns/founder/" + user?.id],
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "Founder"}!
          </h1>
          <p className="text-gray-600 mt-2">Here's an overview of your fundraising activities.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Raised"
            value={`$${stats?.totalRaised || "0"}`}
            icon={DollarSign}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{ value: "+12%", color: "text-green-600" }}
            subtitle="from last month"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={Rocket}
            iconBgColor="bg-fundry-orange-light"
            iconColor="text-fundry-orange"
            subtitle="1 closing soon"
          />
          <StatsCard
            title="Total Investors"
            value={stats?.totalInvestors || 0}
            icon={Users}
            iconBgColor="bg-blue-100"
            iconColor="text-fundry-navy"
            trend={{ value: "+5 this week", color: "text-blue-600" }}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            icon={BarChart}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            subtitle="Above average"
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                onClick={() => setShowCampaignModal(true)}
              >
                <div className="w-10 h-10 bg-fundry-orange rounded-lg flex items-center justify-center mr-4">
                  <Plus className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">Create Campaign</div>
                  <div className="text-sm text-gray-500">Start a new fundraising campaign</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                onClick={() => setShowShareModal(true)}
              >
                <div className="w-10 h-10 bg-fundry-navy rounded-lg flex items-center justify-center mr-4">
                  <Share className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">Share Campaign</div>
                  <div className="text-sm text-gray-500">Get your private campaign link</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                onClick={() => setShowSafeTemplatesModal(true)}
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">SAFE Templates</div>
                  <div className="text-sm text-gray-500">Manage agreement templates</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Campaigns</CardTitle>
            <Button variant="link" className="text-fundry-orange hover:text-orange-600">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundry-orange"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} isFounder />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No campaigns yet. Create your first campaign to get started!</p>
                <Button 
                  onClick={() => setShowCampaignModal(true)}
                  className="mt-4 bg-fundry-orange hover:bg-orange-600"
                >
                  Create Campaign
                </Button>
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

      <Footer />
    </div>
  );
}
