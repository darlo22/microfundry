import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import InvestmentCard from "@/components/investment/investment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp, FileText, User } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";

export default function InvestorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Fetch investor stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/analytics/investor/" + user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch investor investments
  const { data: investments, isLoading: investmentsLoading } = useQuery<InvestmentWithCampaign[]>({
    queryKey: ["/api/investments/investor/" + user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch active campaigns for discovery
  const { data: activeCampaigns } = useQuery({
    queryKey: ["/api/campaigns/active"],
    enabled: !!user?.id,
    retry: false,
  });

  // Quick action handlers
  const handleDiscoverCampaigns = () => {
    setLocation('/browse-campaigns');
  };

  const handleDownloadDocuments = () => {
    setActiveTab('documents');
  };

  const handleManageProfile = () => {
    setActiveTab('profile');
  };

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
            Welcome back, {user?.firstName || "Investor"}!
          </h1>
          <p className="text-gray-600 mt-2">Track your startup investments and discover new opportunities.</p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('discover')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.totalInvested || "0"}</p>
                    <p className="text-sm text-green-600 mt-1">+15% this quarter</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-fundry-orange" />
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('documents')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Investments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeInvestments || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">3 campaigns closing soon</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-fundry-navy" />
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('profile')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.estimatedValue || "0.00"}</p>
                    <p className="text-sm text-green-600 mt-1">+16.4% growth</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Portfolio */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Investments</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Active</Button>
                  <Button variant="outline" size="sm">Completed</Button>
                </div>
              </CardHeader>
              <CardContent>
                {investmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : investments && investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <InvestmentCard key={investment.id} investment={investment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No investments yet. Discover campaigns to get started!</p>
                    <Button 
                      className="mt-4 bg-fundry-orange hover:bg-orange-600"
                      onClick={handleDiscoverCampaigns}
                    >
                      Discover Campaigns
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                    onClick={handleDiscoverCampaigns}
                  >
                    <div className="w-10 h-10 bg-fundry-orange rounded-lg flex items-center justify-center mr-4">
                      <Search className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">Discover Campaigns</div>
                      <div className="text-sm text-gray-500">Find new investment opportunities</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                    onClick={handleDownloadDocuments}
                  >
                    <div className="w-10 h-10 bg-fundry-navy rounded-lg flex items-center justify-center mr-4">
                      <Download className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">Download Documents</div>
                      <div className="text-sm text-gray-500">Get your SAFE agreements</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center p-4 h-auto border-2 border-dashed hover:border-fundry-orange group"
                    onClick={handleManageProfile}
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                      <Settings className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 group-hover:text-fundry-orange">Manage Profile</div>
                      <div className="text-sm text-gray-500">Update account settings</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Discover Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Explore active campaigns and find your next investment opportunity</p>
                  <Button 
                    className="bg-fundry-orange hover:bg-orange-600"
                    onClick={handleDiscoverCampaigns}
                  >
                    Browse All Campaigns
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Investment Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Download your SAFE agreements and investment documents</p>
                  {investments && investments.length > 0 ? (
                    <div className="space-y-4">
                      {investments.map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="text-left">
                            <p className="font-medium">{investment.campaign?.title || 'Investment Document'}</p>
                            <p className="text-sm text-gray-500">Investment: ${investment.amount}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No investment documents available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{user?.firstName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{user?.lastName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                    <p className="text-gray-900 capitalize">{user?.userType || 'Investor'}</p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
