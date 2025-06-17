import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, TrendingUp, DollarSign, Mail, Phone, Calendar, Filter, Download, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Investment {
  id: number;
  amount: string;
  status: "pending" | "committed" | "paid";
  createdAt: string;
  investor: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface InvestorProfile {
  id: string;
  name: string;
  email: string;
  totalInvested: string;
  investmentCount: number;
  firstInvestment: string;
  status: "active" | "committed" | "pending";
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  location: string;
  phone?: string;
}

export default function FounderInvestors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Fetch all investments for founder's campaigns
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ["/api/investments/founder", user?.id],
    enabled: !!user?.id,
  });

  // Process investments to create investor profiles
  const investorProfiles: InvestorProfile[] = investments.reduce((profiles: InvestorProfile[], investment: Investment) => {
    const existingProfile = profiles.find(p => p.email === investment.investor.email);
    
    if (existingProfile) {
      existingProfile.totalInvested = (parseFloat(existingProfile.totalInvested) + parseFloat(investment.amount)).toString();
      existingProfile.investmentCount += 1;
      if (new Date(investment.createdAt) < new Date(existingProfile.firstInvestment)) {
        existingProfile.firstInvestment = investment.createdAt;
      }
    } else {
      profiles.push({
        id: investment.investor.email,
        name: `${investment.investor.firstName} ${investment.investor.lastName}`,
        email: investment.investor.email,
        totalInvested: investment.amount,
        investmentCount: 1,
        firstInvestment: investment.createdAt,
        status: investment.status === "paid" ? "active" : investment.status,
        riskProfile: parseFloat(investment.amount) > 5000 ? "Aggressive" : parseFloat(investment.amount) > 1000 ? "Moderate" : "Conservative",
        location: "Not provided",
      });
    }
    
    return profiles;
  }, []);

  // Filter and sort investors
  const filteredInvestors = investorProfiles
    .filter(investor => {
      const matchesSearch = investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          investor.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || investor.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return parseFloat(b.totalInvested) - parseFloat(a.totalInvested);
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return new Date(b.firstInvestment).getTime() - new Date(a.firstInvestment).getTime();
      }
    });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "committed": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Conservative": return "bg-green-100 text-green-800";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Aggressive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalInvestors = investorProfiles.length;
  const totalInvested = investorProfiles.reduce((sum, investor) => sum + parseFloat(investor.totalInvested), 0);
  const activeInvestors = investorProfiles.filter(i => i.status === "active").length;
  const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading investor data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investors</h1>
        <p className="text-gray-600">Manage and track your investor relationships</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-fundry-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investors</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvestors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Investors</p>
                <p className="text-2xl font-bold text-gray-900">{activeInvestors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageInvestment.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search investors by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="committed">Committed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Recent First</SelectItem>
                    <SelectItem value="amount">Investment Amount</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investor List */}
          <div className="grid gap-4">
            {filteredInvestors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Investors Found</h3>
                  <p className="text-gray-600">
                    {totalInvestors === 0 
                      ? "You haven't received any investments yet. Share your campaign to attract investors."
                      : "No investors match your current search criteria."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInvestors.map((investor) => (
                <Card key={investor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-fundry-orange rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                          <p className="text-sm text-gray-600">{investor.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(investor.status)}>
                              {investor.status}
                            </Badge>
                            <Badge className={getRiskColor(investor.riskProfile)}>
                              {investor.riskProfile}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(investor.totalInvested)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {investor.investmentCount} investment{investor.investmentCount !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {new Date(investor.firstInvestment).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Investor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced analytics and detailed investor insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investor Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication Hub</h3>
                <p className="text-gray-600">
                  Send updates, newsletters, and messages to your investors from here.
                </p>
                <Button className="mt-4 bg-fundry-orange hover:bg-orange-600">
                  <Mail className="mr-2 h-4 w-4" />
                  Compose Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}