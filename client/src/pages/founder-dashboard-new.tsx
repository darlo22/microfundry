import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Users, BarChart, Plus, MessageSquare, Settings, FileText } from "lucide-react";
import { Link } from "wouter";
import type { CampaignWithStats } from "@/lib/types";

export default function FounderDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Queries that only run when user is available
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns/founder"],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: founderStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/founder/stats"],
    enabled: !!user?.id,
    retry: false,
  });

  // Check if we should show loading states
  const showLoading = authLoading || !user || campaignsLoading || statsLoading;

  // Calculate stats with loading fallbacks
  const totalRaised = showLoading ? 0 : (founderStats?.totalRaised || 0);
  const totalCampaigns = showLoading ? 0 : campaigns.length;
  const totalInvestors = showLoading ? 0 : (founderStats?.totalInvestors || 0);
  const avgInvestment = showLoading ? 0 : (founderStats?.averageInvestment || 0);

  const statsData = [
    {
      title: "Total Raised",
      value: showLoading ? "Loading..." : `$${totalRaised.toLocaleString()}`,
      icon: DollarSign,
      change: showLoading ? "..." : "+12.5%",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Active Campaigns",
      value: showLoading ? "..." : totalCampaigns.toString(),
      icon: TrendingUp,
      change: showLoading ? "..." : "Running",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Total Investors",
      value: showLoading ? "..." : totalInvestors.toString(),
      icon: Users,
      change: showLoading ? "..." : "Supporters",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Avg Investment",
      value: showLoading ? "..." : `$${avgInvestment.toLocaleString()}`,
      icon: BarChart,
      change: showLoading ? "..." : "Per investor",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {showLoading ? (
                  <Skeleton className="h-9 w-64 bg-slate-700" />
                ) : (
                  `Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'Founder'}`
                )}
              </h1>
              <p className="text-slate-400">
                {showLoading ? (
                  <Skeleton className="h-5 w-48 bg-slate-700" />
                ) : (
                  "Manage your campaigns and track progress"
                )}
              </p>
            </div>
            <Button 
              onClick={() => setLocation("/founder-dashboard")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">
                      {showLoading ? <Skeleton className="h-8 w-16 bg-slate-700" /> : stat.value}
                    </p>
                    <p className="text-xs text-slate-500">
                      {showLoading ? <Skeleton className="h-3 w-12 bg-slate-700" /> : stat.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Investor Communications</h3>
                  <p className="text-sm text-slate-400">Send updates to investors</p>
                </div>
                <Link href="/founder-updates">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Open
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Analytics</h3>
                  <p className="text-sm text-slate-400">View detailed metrics</p>
                </div>
                <Link href="/founder-analytics">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Settings</h3>
                  <p className="text-sm text-slate-400">Manage your account</p>
                </div>
                <Link href="/founder-settings">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Campaigns</h2>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                {showLoading ? "..." : campaigns.length}
              </Badge>
            </div>

            {showLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-slate-700 rounded-lg p-4">
                    <Skeleton className="h-6 w-48 mb-2 bg-slate-700" />
                    <Skeleton className="h-4 w-64 mb-4 bg-slate-700" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32 bg-slate-700" />
                      <Skeleton className="h-8 w-20 bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
                <p className="text-slate-400 mb-6">Create your first campaign to start raising funds</p>
                <Button 
                  onClick={() => setLocation("/founder-dashboard")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{campaign.title}</h3>
                        <p className="text-sm text-slate-400 mb-2">{campaign.shortPitch}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>${Number(campaign.totalRaised || 0).toLocaleString()} raised</span>
                          <span>•</span>
                          <span>{campaign.investorCount || 0} investors</span>
                          <span>•</span>
                          <span>{campaign.progressPercent || 0}% complete</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          className={campaign.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'}
                        >
                          {campaign.status}
                        </Badge>
                        <Link href={`/campaign/${campaign.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}