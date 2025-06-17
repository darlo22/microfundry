import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import InvestmentCard from "@/components/investment/investment-card";
import CampaignCard from "@/components/campaign/campaign-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp, FileText, User, Filter, Edit, Phone, MapPin, Calendar, Briefcase, DollarSign } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";

// Edit Profile Form Schema
const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.string().optional(),
  investmentExperience: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function InvestorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  // Initialize form with user data
  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      country: user?.country || "",
      state: user?.state || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      occupation: user?.occupation || "",
      annualIncome: user?.annualIncome || "",
      investmentExperience: user?.investmentExperience || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        state: user.state || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        occupation: user.occupation || "",
        annualIncome: user.annualIncome || "",
        investmentExperience: user.investmentExperience || "",
      });
      setSelectedCountry(user.country || "");
    }
  }, [user, form]);

  // Edit Profile Mutation
  const editProfileMutation = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      return apiRequest("PUT", `/api/user/profile`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditProfileOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Handle download SAFE agreement
  const handleDownloadSafe = async (investmentId: number, campaignTitle: string) => {
    try {
      const response = await fetch(`/api/investments/${investmentId}/safe-agreement`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download SAFE agreement');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SAFE_Agreement_${campaignTitle.replace(/\s+/g, '_')}_${investmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your SAFE agreement is downloading.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download SAFE agreement. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = (data: EditProfileFormData) => {
    editProfileMutation.mutate(data);
  };

  // Get states for selected country
  const selectedCountryData = COUNTRIES_AND_STATES.find(c => c.code === selectedCountry);
  const availableStates = selectedCountryData?.states || [];

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

  // Fetch all campaigns for discovery
  const { data: allCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: !!user?.id,
    retry: false,
  });

  // Create categories based on actual businessSector data
  const sectorSet = new Set<string>();
  if (Array.isArray(allCampaigns)) {
    allCampaigns.forEach((c: any) => {
      if (c.businessSector) {
        sectorSet.add(c.businessSector);
      }
    });
  }
  const uniqueSectors = Array.from(sectorSet);
  const categories = [
    "All Categories",
    ...uniqueSectors
  ];

  // Filter campaigns based on search term and category
  const filteredCampaigns = Array.isArray(allCampaigns) ? allCampaigns.filter((campaign: any) => {
    const matchesSearch = !searchTerm || 
      campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.businessSector?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Categories" || 
      campaign.businessSector === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Get category counts
  const getCategoryCount = (category: string) => {
    if (!Array.isArray(allCampaigns)) return 0;
    if (category === "All Categories") return allCampaigns.length;
    return allCampaigns.filter((campaign: any) => campaign.businessSector === category).length;
  };

  // Quick action handlers
  const handleDiscoverCampaigns = () => {
    setLocation('/browse-campaigns');
  };

  const handleDownloadDocuments = () => {
    setActiveTab('documents');
  };

  const handleManageProfile = () => {
    setActiveTab('profile');
  };

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

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('discover')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.totalInvested || "0"}</p>
                    <p className="text-sm text-green-600 mt-1">+15% this quarter</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-fundry-orange" />
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('documents')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Investments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeInvestments || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">3 campaigns closing soon</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-fundry-navy" />
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('profile')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                    <p className="text-3xl font-bold text-gray-900">${stats?.estimatedValue || "0.00"}</p>
                    <p className="text-sm text-green-600 mt-1">+16.4% growth</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Portfolio */}
            <Card>
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
                    <Button 
                      className="mt-4 bg-fundry-orange hover:bg-orange-600"
                      onClick={handleDiscoverCampaigns}
                    >
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
                    onClick={handleDiscoverCampaigns}
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
                    onClick={handleDownloadDocuments}
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
                    onClick={handleManageProfile}
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
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Discover Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search campaigns by name or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category
                          ? "bg-fundry-orange hover:bg-orange-600"
                          : "hover:border-fundry-orange"
                      }`}
                    >
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {getCategoryCount(category)}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* Campaign Results */}
                <div className="space-y-4">
                  {campaignsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                    </div>
                  ) : filteredCampaigns.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDiscoverCampaigns}
                        >
                          View All Campaigns
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCampaigns.slice(0, 4).map((campaign: any) => (
                          <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {searchTerm || selectedCategory !== "All Categories"
                          ? "No campaigns match your search criteria"
                          : "No active campaigns available"}
                      </p>
                      <Button 
                        className="bg-fundry-orange hover:bg-orange-600"
                        onClick={handleDiscoverCampaigns}
                      >
                        Browse All Campaigns
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Investment Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Download your SAFE agreements and investment documents</p>
                  {investments && investments.length > 0 ? (
                    <div className="space-y-4">
                      {investments.map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="text-left">
                            <p className="font-medium">{investment.campaign?.title || 'Investment Document'}</p>
                            <p className="text-sm text-gray-500">Investment: ${investment.amount}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadSafe(investment.id, investment.campaign?.title || 'Investment')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No investment documents available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                    
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{user?.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="text-gray-900">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">
                          {user?.country && user?.state ? `${user.state}, ${user.country}` : 
                           user?.country ? user.country : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <p className="text-gray-900">{user?.occupation || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                        <p className="text-gray-900">{user?.annualIncome || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Investment Experience</label>
                        <p className="text-gray-900">{user?.investmentExperience || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User Type</label>
                        <p className="text-gray-900 capitalize">{user?.userType || 'Investor'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {user?.bio && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-6 bg-fundry-orange hover:bg-orange-600">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Personal Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                            
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your first name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Location & Professional */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Location & Professional</h3>
                            
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select 
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      setSelectedCountry(value);
                                      form.setValue("state", ""); // Reset state when country changes
                                    }} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {COUNTRIES_AND_STATES.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                          {country.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State/Province</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={
                                          availableStates.length > 0 
                                            ? "Select your state/province" 
                                            : "Select country first"
                                        } />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {availableStates.map((state) => (
                                        <SelectItem key={state.code} value={state.code}>
                                          {state.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="occupation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Occupation</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your occupation" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="annualIncome"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Annual Income</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select income range" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="under-25k">Under $25,000</SelectItem>
                                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                                      <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                                      <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                                      <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                                      <SelectItem value="150k-250k">$150,000 - $250,000</SelectItem>
                                      <SelectItem value="over-250k">Over $250,000</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="investmentExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Investment Experience</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select experience level" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                                      <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Bio Section */}
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About You</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about yourself, your investment interests, and goals..."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-4 pt-6 border-t">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditProfileOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-fundry-orange hover:bg-orange-600"
                            disabled={editProfileMutation.isPending}
                          >
                            {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
