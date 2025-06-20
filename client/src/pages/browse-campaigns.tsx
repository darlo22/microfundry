import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Clock, Users, ArrowLeft, Eye, Star } from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get status badge for campaign
const getStatusBadge = (campaign: CampaignWithStats) => {
  const totalRaised = typeof campaign.totalRaised === 'string' ? parseFloat(campaign.totalRaised) : campaign.totalRaised || 0;
  const fundingGoal = typeof campaign.fundingGoal === 'string' ? parseFloat(campaign.fundingGoal) : campaign.fundingGoal || 1;
  const progressPercent = (totalRaised / fundingGoal) * 100;
  
  if (progressPercent >= 90) {
    return { text: "Almost Funded", color: "bg-red-500" };
  } else if (progressPercent >= 75) {
    return { text: "Hot Deal", color: "bg-orange-500" };
  } else if (progressPercent >= 50) {
    return { text: "Trending", color: "bg-blue-500" };
  } else {
    return { text: "New", color: "bg-green-500" };
  }
};

// Wefunder-style Campaign Card Component
function WefunderCampaignCard({ campaign }: { campaign: CampaignWithStats }) {
  const [, setLocation] = useLocation();
  const status = getStatusBadge(campaign);
  const totalRaised = typeof campaign.totalRaised === 'string' ? parseFloat(campaign.totalRaised) : campaign.totalRaised || 0;
  const fundingGoal = typeof campaign.fundingGoal === 'string' ? parseFloat(campaign.fundingGoal) : campaign.fundingGoal || 1;
  const progressPercent = (totalRaised / fundingGoal) * 100;

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white"
      onClick={() => setLocation(`/campaign/${campaign.id}`)}
    >
      {/* Hero Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200">
        {campaign.pitchMediaUrl ? (
          campaign.pitchMediaUrl.endsWith('.mp4') || campaign.pitchMediaUrl.endsWith('.mov') ? (
            <video 
              className="w-full h-full object-cover"
              src={campaign.pitchMediaUrl}
              muted
              playsInline
            />
          ) : (
            <img 
              src={campaign.pitchMediaUrl} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-fundry-orange/20 to-fundry-navy/20 flex items-center justify-center">
            <TrendingUp className="w-16 h-16 text-fundry-navy/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${status.color} text-white border-0 px-3 py-1 text-sm font-medium`}>
            {status.text}
          </Badge>
        </div>

        {/* Founder Profile Circle */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-2 border-white shadow-lg">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Company Name */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-600">{campaign.companyName || campaign.title}</h3>
        </div>

        {/* Main Headline */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {campaign.shortPitch}
        </h2>

        {/* Key Metrics */}
        <div className="text-gray-600 text-sm mb-4">
          <div className="flex flex-wrap gap-1">
            <span className="font-medium">
              {progressPercent.toFixed(0)}% funded:
            </span>
            <span>
              {formatCurrency(totalRaised)} raised,
            </span>
            <span>
              {campaign.investorCount} investors,
            </span>
            <span>
              {campaign.businessSector}
            </span>
          </div>
        </div>

        {/* Notable Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {progressPercent >= 50 && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
              TRENDING
            </Badge>
          )}
          {campaign.investorCount >= 10 && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
              POPULAR
            </Badge>
          )}
          {totalRaised >= 1000 && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
              ${Math.floor(totalRaised / 1000)}K+ RAISED
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-fundry-orange to-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>

        {/* Bottom Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="font-medium">
            {formatCurrency(Number(fundingGoal))} goal
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {Math.floor(Math.random() * 500 + 100)} views
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrowseCampaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [, setLocation] = useLocation();

  // Fetch campaigns from API
  const { data: campaigns = [], isLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
  });

  // Create categories based on actual businessSector data
  const sectorSet = new Set<string>();
  campaigns.forEach(c => {
    if (c.businessSector) {
      sectorSet.add(c.businessSector);
    }
  });
  const uniqueSectors = Array.from(sectorSet);
  
  const categories = [
    { id: "all", name: "All Categories", count: campaigns.length },
    ...uniqueSectors.map(sector => ({
      id: sector,
      name: sector,
      count: campaigns.filter(c => c.businessSector === sector).length
    }))
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.shortPitch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.businessSector && campaign.businessSector.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || campaign.businessSector === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Browse Campaigns" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Browse Campaigns" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/investor-dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Investment Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse active fundraising campaigns from innovative startups. 
            Invest in the future with SAFE agreements.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-fundry-orange text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 font-medium">Active Campaigns</p>
                  <p className="text-3xl font-bold text-white">{campaigns.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-fundry-navy text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Total Raised</p>
                  <p className="text-3xl font-bold text-white">
                    ${campaigns.reduce((sum, c) => sum + parseFloat(c.totalRaised || '0'), 0).toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-100 text-green-900 shadow-lg border border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-medium">Total Investors</p>
                  <p className="text-3xl font-bold text-green-900">
                    {campaigns.reduce((sum, c) => sum + (c.investorCount || 0), 0) || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search campaigns by name or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id 
                      ? "bg-fundry-orange hover:bg-orange-600" 
                      : "hover:bg-fundry-orange hover:text-white"
                  }`}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Grid - Wefunder Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <WefunderCampaignCard key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search terms or browse different categories to discover exciting investment opportunities.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="bg-fundry-orange hover:bg-orange-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-fundry-gradient rounded-2xl p-12 text-center text-white mb-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Own Campaign?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of founders who have successfully raised capital through our platform. 
              Get started in minutes with our simple campaign builder.
            </p>
            <Button 
              size="lg" 
              className="bg-fundry-orange hover:bg-orange-600 text-lg px-8 py-4"
              onClick={() => window.location.href = "/api/login"}
            >
              Start Your Campaign
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}