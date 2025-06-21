import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, PieChart, Users, Eye, MessageSquare, Download, FileText, Settings, Trash2 } from "lucide-react";
import type { InvestmentWithCampaign } from "@/lib/types";

export default function InvestorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");

  // Queries that only run when user is available
  const { data: userInvestments = [], isLoading: investmentsLoading } = useQuery<InvestmentWithCampaign[]>({
    queryKey: ["/api/investments/user"],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user?.id,
  });

  // Check if we should show loading states
  const showLoading = authLoading || !user || investmentsLoading;

  // Split investments by payment status
  const pendingInvestments = userInvestments.filter(inv => 
    inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing'
  );
  
  const paidInvestments = userInvestments.filter(inv => 
    inv.paymentStatus === 'completed'
  );

  // Calculate stats
  const totalInvested = paidInvestments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalActiveInvestments = paidInvestments.length;
  const totalPendingCommitments = pendingInvestments.length;
  const totalPaidInvestments = paidInvestments.length;

  // Stats data with loading fallbacks
  const statsData = [
    {
      title: "Total Invested",
      value: showLoading ? "Loading..." : `$${totalInvested.toLocaleString()}`,
      icon: DollarSign,
      change: showLoading ? "..." : "+12.5%",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Active Investments",
      value: showLoading ? "..." : totalActiveInvestments.toString(),
      icon: TrendingUp,
      change: showLoading ? "..." : "+2 this month",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Pending Commitments",
      value: showLoading ? "..." : totalPendingCommitments.toString(),
      icon: PieChart,
      change: showLoading ? "..." : "Awaiting payment",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      title: "Actual Paid Investments",
      value: showLoading ? "..." : totalPaidInvestments.toString(),
      icon: Users,
      change: showLoading ? "..." : "Completed",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const goToDiscover = () => {
    setLocation("/browse-campaigns");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {showLoading ? (
                <Skeleton className="w-16 h-16 rounded-full" />
              ) : (
                user?.email?.[0]?.toUpperCase() || "I"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {showLoading ? (
                  <Skeleton className="h-8 w-48" />
                ) : (
                  `Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'Investor'}`
                )}
              </h1>
              <p className="text-gray-600">
                {showLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  "Manage your investment portfolio"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {showLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {showLoading ? <Skeleton className="h-4 w-16" /> : stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-transparent">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="discover" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Discover
              </TabsTrigger>
              <TabsTrigger value="updates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Updates
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Documents
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Portfolio Tab Content */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Investment Portfolio</h2>
                <p className="text-orange-100">Track your investments and performance</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={goToDiscover}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
                  >
                    <Eye className="w-6 h-6" />
                    <span>Discover Campaigns</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("documents")}
                    variant="outline" 
                    className="p-6 h-auto flex flex-col items-center space-y-2 border-emerald-200 hover:bg-emerald-50"
                  >
                    <FileText className="w-6 h-6 text-emerald-600" />
                    <span>View Documents</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("profile")}
                    variant="outline" 
                    className="p-6 h-auto flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
                  >
                    <Settings className="w-6 h-6 text-purple-600" />
                    <span>Account Settings</span>
                  </Button>
                </div>

                {/* Pending Commitments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Commitments</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {showLoading ? "..." : pendingInvestments.length}
                    </Badge>
                  </div>
                  
                  {showLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : pendingInvestments.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-gray-500">No pending commitments</p>
                      <Button onClick={goToDiscover} className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600">
                        Discover Campaigns
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {pendingInvestments.map((investment) => (
                        <Card key={investment.id} className="p-4 border-l-4 border-amber-400">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{investment.campaign?.title || "Campaign"}</h4>
                              <p className="text-sm text-gray-600">
                                ${Number(investment.amount).toLocaleString()} • Awaiting Payment
                              </p>
                            </div>
                            <Badge variant="outline" className="border-amber-400 text-amber-700">
                              Pending
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actual Paid Investments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Actual Paid Investments</h3>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {showLoading ? "..." : paidInvestments.length}
                    </Badge>
                  </div>
                  
                  {showLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : paidInvestments.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-gray-500">No completed investments yet</p>
                      <Button onClick={goToDiscover} className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600">
                        Start Investing
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {paidInvestments.map((investment) => (
                        <Card key={investment.id} className="p-4 border-l-4 border-emerald-400">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{investment.campaign?.title || "Campaign"}</h4>
                              <p className="text-sm text-gray-600">
                                ${Number(investment.amount).toLocaleString()} • 
                                {investment.createdAt ? new Date(investment.createdAt).toLocaleDateString() : "Recent"}
                              </p>
                            </div>
                            <Badge className="bg-emerald-500">
                              Completed
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other tab contents */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Discover Investment Opportunities</h3>
              <p className="text-gray-600 mb-4">Explore new campaigns and investment opportunities</p>
              <Button onClick={goToDiscover} className="bg-gradient-to-r from-orange-500 to-orange-600">
                Browse All Campaigns
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Updates</h3>
              {showLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <p className="text-gray-600">Stay updated with your investments</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Investment Documents</h3>
              {showLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <p className="text-gray-600">Access your SAFE agreements and investment documents</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              {showLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <p className="text-gray-600">Manage your account settings and preferences</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}