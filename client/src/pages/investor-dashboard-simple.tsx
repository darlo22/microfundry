import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, PieChart, Users } from "lucide-react";
import type { InvestmentWithCampaign } from "@/lib/types";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");

  // Get user data
  const { data: userInvestments = [] } = useQuery<InvestmentWithCampaign[]>({
    queryKey: ["/api/investments/user"],
    retry: false,
  });

  // Display name
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Investor';

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

  // Stats data
  const statsData = [
    {
      title: "Total Invested",
      value: `$${totalInvested.toLocaleString()}`,
      icon: DollarSign,
      change: "+12.5%",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Active Investments", 
      value: totalActiveInvestments.toString(),
      icon: TrendingUp,
      change: "+2 this month",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Pending Commitments",
      value: totalPendingCommitments.toString(),
      icon: PieChart,
      change: "Awaiting payment",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      title: "Actual Paid Investments",
      value: totalPaidInvestments.toString(),
      icon: Users,
      change: "Completed",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {displayName[0]?.toUpperCase() || "I"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {displayName}
              </h1>
              <p className="text-gray-600">
                Manage your investment portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Commitments */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                    <CardTitle>Pending Commitments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {pendingInvestments.length === 0 ? (
                      <p className="text-gray-600">No pending commitments</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingInvestments.map((investment) => (
                          <div key={investment.id} className="border rounded-lg p-4">
                            <h3 className="font-semibold">{investment.campaign?.companyName}</h3>
                            <p className="text-gray-600">${Number(investment.amount).toLocaleString()}</p>
                            <Button size="sm" className="mt-2">Pay Now</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actual Paid Investments */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    <CardTitle>Actual Paid Investments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {paidInvestments.length === 0 ? (
                      <p className="text-gray-600">No completed investments yet</p>
                    ) : (
                      <div className="space-y-4">
                        {paidInvestments.map((investment) => (
                          <div key={investment.id} className="border rounded-lg p-4">
                            <h3 className="font-semibold">{investment.campaign?.companyName}</h3>
                            <p className="text-gray-600">${Number(investment.amount).toLocaleString()}</p>
                            <p className="text-sm text-green-600">Completed</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      onClick={() => setLocation("/browse-campaigns")}
                    >
                      Discover Campaigns
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("documents")}
                    >
                      View Documents
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("profile")}
                    >
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Discover Investment Opportunities</h3>
                <Button onClick={() => setLocation("/browse-campaigns")}>
                  Browse All Campaigns
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Campaign Updates</h3>
                <p className="text-gray-600">No recent updates from your investments</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Investment Documents</h3>
                <p className="text-gray-600">Your SAFE agreements and investment documents will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}