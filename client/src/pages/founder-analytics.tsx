import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, Calendar, Download, RefreshCw, Target, Award, Clock, ArrowLeft, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";

export default function FounderAnalytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Fetch founder stats
  const { data: founderStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/founder", user?.id],
    enabled: !!user?.id,
  });

  // Fetch campaigns for filtering
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns/founder", user?.id],
    enabled: !!user?.id,
  });

  // Sample analytics data (in production, this would come from your analytics API)
  const investmentTrends = [
    { date: "Week 1", amount: 2500, investors: 3 },
    { date: "Week 2", amount: 4200, investors: 5 },
    { date: "Week 3", amount: 3800, investors: 4 },
    { date: "Week 4", amount: 5600, investors: 7 },
    { date: "Week 5", amount: 4900, investors: 6 },
    { date: "Week 6", amount: 6200, investors: 8 },
  ];

  const campaignPerformance = Array.isArray(campaigns) ? (campaigns as any[]).map((campaign: any) => ({
    name: campaign.title,
    raised: parseFloat(campaign.totalRaised || "0"),
    goal: parseFloat(campaign.fundingGoal || "0"),
    investors: campaign.investorCount || 0,
    progress: campaign.progressPercent || 0,
  })) : [];

  const investorDistribution = [
    { name: "Small ($25-$500)", value: 45, color: "#22C55E" },
    { name: "Medium ($500-$2K)", value: 35, color: "#F59E0B" },
    { name: "Large ($2K+)", value: 20, color: "#EF4444" },
  ];

  const monthlyGrowth = [
    { month: "Jan", campaigns: 1, investors: 12, revenue: 8400 },
    { month: "Feb", campaigns: 2, investors: 28, revenue: 15600 },
    { month: "Mar", campaigns: 2, investors: 35, revenue: 21200 },
    { month: "Apr", campaigns: 3, investors: 48, revenue: 28900 },
    { month: "May", campaigns: 3, investors: 62, revenue: 36500 },
    { month: "Jun", campaigns: 4, investors: 75, revenue: 42100 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (statsLoading || campaignsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const totalRaised = parseFloat((founderStats as any)?.totalRaised || "0");
  const totalInvestors = (founderStats as any)?.totalInvestors || 0;
  const activeCampaigns = (founderStats as any)?.activeCampaigns || 0;
  const conversionRate = (founderStats as any)?.conversionRate || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <Button
              variant="ghost"
              onClick={() => setLocation("/founder-dashboard")}
              className="flex items-center gap-2 text-gray-700 hover:text-fundry-orange transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>

            {/* Center: Fundry Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setLocation("/landing")}
            >
              <img 
                src={fundryLogoNew} 
                alt="Fundry" 
                className="h-12 w-auto"
              />
            </div>

            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="bg-gradient-to-r from-fundry-orange to-fundry-navy p-6 rounded-2xl text-white flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center">
              <BarChart3 className="mr-3 text-white" size={32} />
              Analytics Dashboard
            </h1>
            <p className="text-orange-100 text-sm sm:text-base">Track your fundraising performance and growth</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[140px] border-orange-200 focus:border-fundry-orange">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-full sm:w-[180px] border-orange-200 focus:border-fundry-orange">
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {Array.isArray(campaigns) && (campaigns as any[]).map((campaign: any) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              className="border-fundry-orange text-fundry-orange hover:bg-fundry-orange hover:text-white transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-100">Total Raised</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(totalRaised)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-orange-100 mr-1" />
                  <span className="text-xs sm:text-sm text-orange-100">+12.5% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-100">Total Investors</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{totalInvestors}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-100 mr-1" />
                  <span className="text-xs sm:text-sm text-blue-100">+8.3% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-100">Active Campaigns</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{activeCampaigns}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-purple-100 mr-1" />
                  <span className="text-xs sm:text-sm text-purple-100">2 ending soon</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-100">Conversion Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-emerald-100 mr-1" />
                  <span className="text-xs sm:text-sm text-emerald-100">-2.1% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white shadow-sm border border-orange-200 rounded-xl p-1">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg font-medium"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg font-medium"
          >
            Campaign Performance
          </TabsTrigger>
          <TabsTrigger 
            value="investors"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg font-medium"
          >
            Investor Insights
          </TabsTrigger>
          <TabsTrigger 
            value="growth"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg font-medium"
          >
            Growth Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Investment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={investmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'amount' ? formatCurrency(value as number) : value,
                    name === 'amount' ? 'Investment Amount' : 'New Investors'
                  ]} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#F97316" 
                    fill="#F9731620" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.slice(0, 3).map((campaign, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{campaign.name}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                        </span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{campaign.progress}% funded</span>
                        <span>{campaign.investors} investors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Investor Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Investor Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={investorDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {investorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'raised' || name === 'goal' ? formatCurrency(value as number) : value,
                    name === 'raised' ? 'Amount Raised' : name === 'goal' ? 'Funding Goal' : 'Investors'
                  ]} />
                  <Legend />
                  <Bar dataKey="raised" fill="#F97316" name="Amount Raised" />
                  <Bar dataKey="goal" fill="#E5E7EB" name="Funding Goal" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investor Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="investors" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(totalRaised / Math.max(totalInvestors, 1))}
                    </div>
                    <p className="text-sm text-gray-600">Average Investment Size</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">72%</div>
                    <p className="text-sm text-gray-600">Investor Retention Rate</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">4.2</div>
                    <p className="text-sm text-gray-600">Days Average Decision Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenue' : name === 'investors' ? 'Total Investors' : 'Active Campaigns'
                  ]} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B98120" />
                  <Area type="monotone" dataKey="investors" stackId="2" stroke="#3B82F6" fill="#3B82F620" />
                  <Area type="monotone" dataKey="campaigns" stackId="3" stroke="#F97316" fill="#F9731620" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}