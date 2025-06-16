import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CampaignCard from "@/components/campaign/campaign-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Clock, Users } from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

export default function BrowseCampaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for demonstration - in production this would fetch from API
  const mockCampaigns: CampaignWithStats[] = [
    {
      id: 1,
      title: "GreenTech Solutions",
      shortPitch: "Revolutionizing renewable energy storage with advanced battery technology",
      fullPitch: "Our proprietary battery technology...",
      fundingGoal: "250000",
      minimumInvestment: "1000",
      status: "active",
      discountRate: "20",
      valuationCap: "5000000",
      privateLink: "greentech-2024",
      founderId: "founder1",
      logoUrl: undefined,
      pitchDeckUrl: undefined,
      deadline: "2025-07-15",
      createdAt: "2024-12-01",
      totalRaised: "127500",
      investorCount: 23,
      progressPercent: 51
    },
    {
      id: 2,
      title: "HealthAI Platform",
      shortPitch: "AI-powered diagnostics for early disease detection in primary care",
      fullPitch: "Our AI platform analyzes medical data...",
      fundingGoal: "500000",
      minimumInvestment: "2500",
      status: "active",
      discountRate: "15",
      valuationCap: "8000000",
      privateLink: "healthai-series-a",
      founderId: "founder2",
      logoUrl: undefined,
      pitchDeckUrl: undefined,
      deadline: "2025-08-30",
      createdAt: "2024-11-15",
      totalRaised: "342000",
      investorCount: 41,
      progressPercent: 68
    },
    {
      id: 3,
      title: "EduSpace",
      shortPitch: "Virtual reality learning environments for immersive education",
      fullPitch: "EduSpace creates virtual classrooms...",
      fundingGoal: "150000",
      minimumInvestment: "500",
      status: "active",
      discountRate: "25",
      valuationCap: "3000000",
      privateLink: "eduspace-vr",
      founderId: "founder3",
      logoUrl: undefined,
      pitchDeckUrl: undefined,
      deadline: "2025-06-20",
      createdAt: "2024-12-10",
      totalRaised: "78000",
      investorCount: 34,
      progressPercent: 52
    }
  ];

  const categories = [
    { id: "all", name: "All Categories", count: mockCampaigns.length },
    { id: "tech", name: "Technology", count: 2 },
    { id: "health", name: "Healthcare", count: 1 },
    { id: "education", name: "Education", count: 1 },
    { id: "fintech", name: "FinTech", count: 0 },
    { id: "sustainability", name: "Sustainability", count: 1 }
  ];

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.shortPitch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Browse Campaigns" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className={`cursor-pointer px-3 py-1 ${
                  selectedCategory === category.id 
                    ? "bg-fundry-orange text-white" 
                    : "hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">$2.1M+</div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="text-white" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">340+</div>
              <div className="text-sm text-gray-600">Active Investors</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse all categories.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-fundry-navy text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Are you a founder looking to raise capital?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of entrepreneurs who have successfully raised funds 
              through their networks on Fundry.
            </p>
            <Button className="bg-fundry-orange hover:bg-orange-600">
              Start Your Campaign
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}