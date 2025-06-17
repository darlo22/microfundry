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

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No campaigns found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
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