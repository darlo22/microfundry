import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import InvestmentCard from "@/components/investment/investment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";

export default function InvestorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Invested"
            value={`$${stats?.totalInvested || "0"}`}
            icon={Wallet}
            iconBgColor="bg-fundry-orange-light"
            iconColor="text-fundry-orange"
            trend={{ value: "+15%", color: "text-green-600" }}
            subtitle="this quarter"
          />
          <StatsCard
            title="Active Investments"
            value={stats?.activeInvestments || 0}
            icon={PieChart}
            iconBgColor="bg-blue-100"
            iconColor="text-fundry-navy"
            subtitle="3 campaigns closing soon"
          />
          <StatsCard
            title="Portfolio Value"
            value={`$${stats?.estimatedValue || "0"}`}
            icon={TrendingUp}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{ value: "+16.4% growth", color: "text-green-600" }}
          />
        </div>

        {/* Investment Portfolio */}
        <Card className="mb-8">
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
                <Button className="mt-4 bg-fundry-orange hover:bg-orange-600">
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
      </div>

      <Footer />
    </div>
  );
}
