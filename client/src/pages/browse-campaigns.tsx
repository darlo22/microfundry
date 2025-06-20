import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, TrendingUp, Eye, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/navbar";
import type { Campaign } from "@shared/schema";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Interface for campaigns with additional stats
interface CampaignWithStats extends Campaign {
  totalRaised: number;
  investorCount: number;
  progressPercent: number;
}

// Status badge helper
const getStatusBadge = (campaign: CampaignWithStats) => {
  if (campaign.progressPercent >= 100) {
    return { text: "Funded", color: "bg-green-500" };
  } else if (campaign.progressPercent >= 75) {
    return { text: "Almost Sold Out", color: "bg-fundry-orange" };
  } else if (campaign.progressPercent >= 50) {
    return { text: "Trending", color: "bg-blue-500" };
  } else {
    return { text: "Active", color: "bg-green-500" };
  }
};

// Clean Wefunder-style Campaign Card Component
function WefunderCampaignCard({ campaign }: { campaign: CampaignWithStats }) {
  const [, setLocation] = useLocation();
  const status = getStatusBadge(campaign);
  const totalRaised = typeof campaign.totalRaised === 'string' ? parseFloat(campaign.totalRaised) : campaign.totalRaised || 0;
  const fundingGoal = typeof campaign.fundingGoal === 'string' ? parseFloat(campaign.fundingGoal) : campaign.fundingGoal || 1;
  const progressPercent = (totalRaised / fundingGoal) * 100;

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 rounded-xl"
      onClick={() => setLocation(`/campaign/${campaign.id}`)}
    >
      {/* Company Logo and Header */}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Company Logo */}
            <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              {campaign.logoUrl ? (
                <img 
                  src={campaign.logoUrl} 
                  alt={campaign.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-fundry-orange to-fundry-navy flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {campaign.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Company Info */}
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1">
                {campaign.title}
              </h3>
              <Badge className={`${status.color} text-white border-0 px-2 py-1 text-xs font-medium`}>
                {status.text}
              </Badge>
            </div>
          </div>
          
          {/* View Button */}
          <Button 
            size="sm" 
            className="bg-fundry-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/campaign/${campaign.id}`);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>

        {/* Short Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.shortPitch}
        </p>

        {/* Funding Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Raised</p>
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(totalRaised)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Goal</p>
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(Number(fundingGoal))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Investors</p>
            <p className="font-bold text-lg text-gray-900">
              {campaign.investorCount || 0}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-fundry-orange">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-fundry-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Deadline: 6/30/2025
          </span>
          <span className="text-fundry-navy font-medium">
            {campaign.businessSector}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrowseCampaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("trending");

  // Ensure campaigns is an array
  const campaignsArray = Array.isArray(campaigns) ? campaigns : [];

  // Filter campaigns based on selected category
  const filteredCampaigns = campaignsArray.filter((campaign: any) => {
    if (selectedCategory === "all") return true;
    return campaign.businessSector?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort campaigns based on selected sort option
  const sortedCampaigns = [...filteredCampaigns].sort((a: any, b: any) => {
    switch (sortBy) {
      case "trending":
        // Sort by highest percentage funded (using funding goal as proxy)
        return (Number(b.fundingGoal) || 0) - (Number(a.fundingGoal) || 0);
      case "newest":
        const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      case "ending-soon":
        // For now, sort by campaign ID (can be improved with actual deadline data)
        return a.id - b.id;
      case "funding-goal":
        return (Number(b.fundingGoal) || 0) - (Number(a.fundingGoal) || 0);
      default:
        return 0;
    }
  });

  const campaignsWithStats: CampaignWithStats[] = sortedCampaigns.map((campaign: any) => ({
    ...campaign,
    totalRaised: 0, // Will be calculated from actual investment data
    investorCount: 0, // Will be calculated from actual investment data
    progressPercent: 0, // Will be calculated from actual investment data
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-fundry-navy to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Investment Opportunities
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Browse and invest in innovative startups that are changing the world. 
              Find the next big opportunity with as little as $25.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="e-commerce">E-Commerce</SelectItem>
                <SelectItem value="sustainability">Sustainability</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="food & beverage">Food & Beverage</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="real estate">Real Estate</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="funding-goal">Funding Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search campaigns..." 
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {campaignsWithStats.length} investment opportunities
            {selectedCategory !== "all" && (
              <span className="ml-1">in {selectedCategory}</span>
            )}
          </p>
        </div>

        {/* Campaign Grid */}
        {campaignsWithStats.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignsWithStats.map((campaign) => (
              <WefunderCampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}