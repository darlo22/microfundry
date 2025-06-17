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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp, FileText, User, Filter, Edit, Phone, MapPin, Calendar, Briefcase, DollarSign, Shield, Key, Monitor, CreditCard, Plus, Bell, AlertTriangle, Eye, EyeOff, Smartphone, Tablet } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";
import TwoFactorSetupModal from "@/components/modals/two-factor-setup-modal";

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
  const [activeTab, setActiveTab] = useState("portfolio");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  
  // Security modal states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isViewSessionsOpen, setIsViewSessionsOpen] = useState(false);
  const [isTwoFactorSetupOpen, setIsTwoFactorSetupOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Payment method modal states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isRemovePaymentOpen, setIsRemovePaymentOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    id: number;
    type: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
  } | null>(null);

  // Account management modal states
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [confirmDeactivation, setConfirmDeactivation] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock session data
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, US",
      lastActive: "2 minutes ago",
      current: true,
      deviceType: "desktop",
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, US", 
      lastActive: "1 hour ago",
      current: false,
      deviceType: "mobile",
    },
    {
      id: 3,
      device: "Chrome on MacBook",
      location: "San Francisco, US",
      lastActive: "2 days ago",
      current: false,
      deviceType: "desktop",
    },
  ]);

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    passwordLastChanged: "2024-05-18T00:00:00Z",
  });

  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "25",
      isDefault: true,
    },
    {
      id: 2,
      type: "mastercard",
      last4: "8888",
      expiryMonth: "06",
      expiryYear: "26",
      isDefault: false,
    },
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  const [editPaymentMethod, setEditPaymentMethod] = useState({
    expiryMonth: "",
    expiryYear: "",
  });

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
      // Invalidate and refetch user data to show updated profile
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
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

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return apiRequest("PUT", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangePasswordOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });



  // Add Payment Method Mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: typeof newPaymentMethod) => {
      // In a real implementation, this would integrate with a payment processor like Stripe
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      const newMethod = {
        id: paymentMethods.length + 1,
        type: newPaymentMethod.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        last4: newPaymentMethod.cardNumber.slice(-4),
        expiryMonth: newPaymentMethod.expiryMonth,
        expiryYear: newPaymentMethod.expiryYear,
        isDefault: paymentMethods.length === 0,
      };
      setPaymentMethods(prev => [...prev, newMethod]);
      setNewPaymentMethod({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
      setIsAddPaymentOpen(false);
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit Payment Method Mutation
  const editPaymentMethodMutation = useMutation({
    mutationFn: async (data: { id: number; expiryMonth: string; expiryYear: string }) => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: (_, data) => {
      setPaymentMethods(prev => prev.map(method => 
        method.id === data.id 
          ? { ...method, expiryMonth: data.expiryMonth, expiryYear: data.expiryYear }
          : method
      ));
      setIsEditPaymentOpen(false);
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove Payment Method Mutation
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: (_, id) => {
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      setIsRemovePaymentOpen(false);
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/user/export-data");
      return await response.json();
    },
    onSuccess: (data) => {
      // Create and download JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fundry-account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your account data has been downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export account data",
        variant: "destructive",
      });
    },
  });

  // Deactivate account mutation
  const deactivateAccountMutation = useMutation({
    mutationFn: (data: { reason: string }) =>
      apiRequest("/api/user/deactivate", "POST", data),
    onSuccess: () => {
      toast({
        title: "Account Deactivated",
        description: "Your account has been temporarily deactivated",
      });
      // Redirect to landing page after deactivation
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate account",
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

  // Fetch updates from invested campaigns
  const { data: investorUpdates, isLoading: updatesLoading } = useQuery({
    queryKey: ["/api/campaign-updates/investor", user?.id],
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

  // Handle tab changes with special behavior for Discover
  const handleTabChange = (value: string) => {
    if (value === 'discover') {
      // Instead of navigating away, show discover content within the tab
      setActiveTab('discover');
    } else {
      setActiveTab(value);
    }
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-fundry-orange transition-colors"
                onClick={() => setActiveTab('portfolio')}
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

          <TabsContent value="discover" className="space-y-8">
            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Discover Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">All Categories ({getCategoryCount("All Categories")})</SelectItem>
                      {Array.from(sectorSet).sort().map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector} ({getCategoryCount(sector)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Available Campaigns</p>
                        <p className="text-2xl font-bold text-gray-900">{Array.isArray(allCampaigns) ? allCampaigns.length : 0}</p>
                      </div>
                      <div className="h-10 w-10 bg-fundry-orange rounded-lg flex items-center justify-center">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Your Investments</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.activeInvestments || 0}</p>
                      </div>
                      <div className="h-10 w-10 bg-fundry-navy rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Invested</p>
                        <p className="text-2xl font-bold text-gray-900">${stats?.totalInvested || "0"}</p>
                      </div>
                      <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browse All Button */}
                <div className="text-center">
                  <Button 
                    className="bg-fundry-orange hover:bg-orange-600"
                    onClick={handleDiscoverCampaigns}
                  >
                    Browse All Campaigns
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.slice(0, 6).map((campaign: any) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No campaigns found matching your criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All Categories");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Founder Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {updatesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading updates...</p>
                    </div>
                  ) : investorUpdates && Array.isArray(investorUpdates) && investorUpdates.length > 0 ? (
                    investorUpdates.map((update: any) => {
                      const getBorderColor = (type: string) => {
                        switch (type?.toLowerCase()) {
                          case 'milestone': return 'border-fundry-orange bg-orange-50';
                          case 'financial': return 'border-blue-500 bg-blue-50';
                          case 'team': return 'border-green-500 bg-green-50';
                          case 'announcement': return 'border-purple-500 bg-purple-50';
                          case 'newsletter': return 'border-indigo-500 bg-indigo-50';
                          default: return 'border-gray-500 bg-gray-50';
                        }
                      };

                      const formatDate = (dateString: string) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - date.getTime());
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 0) return 'Today';
                        if (diffDays === 1) return '1 day ago';
                        if (diffDays < 7) return `${diffDays} days ago`;
                        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                        return `${Math.floor(diffDays / 30)} months ago`;
                      };

                      return (
                        <div key={update.id} className={`border-l-4 p-6 rounded-r-lg ${getBorderColor(update.type)}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {update.campaign?.title} - {update.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {update.createdAt ? formatDate(update.createdAt) : 'Recently'}
                              </p>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {update.type || 'General'}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {update.content}
                          </p>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              Reply
                            </Button>
                            <Button variant="outline" size="sm">
                              👍 Like
                            </Button>
                            <Button variant="outline" size="sm">
                              Share
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No updates from your investments yet.</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Updates from founders will appear here once you invest in campaigns.
                      </p>
                      <Button variant="outline" className="mt-3" onClick={handleDiscoverCampaigns}>
                        Discover Investment Opportunities
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
                <p className="text-sm text-gray-600 mt-2">
                  Download your signed SAFE agreements and investment documents
                </p>
              </CardHeader>
              <CardContent>
                {investmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : investments && investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments
                      .filter(investment => investment.status === 'committed' || investment.status === 'paid' || investment.status === 'completed')
                      .map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-6 hover:border-fundry-orange transition-colors bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{investment.campaign?.title}</h3>
                                <p className="text-sm text-gray-600">SAFE Agreement</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Investment Amount</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(investment.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Investment Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(investment.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                <Badge 
                                  variant={investment.status === 'completed' ? 'default' : 'secondary'}
                                  className={investment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {investment.status === 'committed' ? 'Signed' : 
                                   investment.status === 'paid' ? 'Funded' : 
                                   investment.status === 'completed' ? 'Completed' : investment.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Document Type</p>
                                <p className="text-sm font-medium text-gray-900">SAFE Agreement</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                // Download SAFE agreement for this investment
                                const link = document.createElement('a');
                                link.href = `/api/investments/${investment.id}/safe-agreement`;
                                link.download = `SAFE_Agreement_${investment.campaign?.title?.replace(/\s+/g, '_')}_${investment.id}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                toast({
                                  title: "Download Started",
                                  description: "Your SAFE agreement is being downloaded.",
                                });
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                // Open SAFE agreement in new window for viewing
                                window.open(`/api/investments/${investment.id}/safe-agreement`, '_blank');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show message if no signed agreements yet */}
                    {investments.length > 0 && investments.filter(inv => inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed').length === 0 && (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Your investments are being processed</p>
                        <p className="text-sm text-gray-400 mb-4">
                          SAFE agreements will be available for download once your investments are confirmed.
                        </p>
                      </div>
                    )}
                    
                    {/* Summary Statistics */}
                    {investments.filter(inv => inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed').length > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Document Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-fundry-orange">
                              {investments.filter(inv => inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed').length}
                            </p>
                            <p className="text-xs text-gray-600">SAFE Agreements</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-fundry-navy">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(
                                investments
                                  .filter(inv => inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed')
                                  .reduce((sum, inv) => sum + inv.amount, 0)
                              )}
                            </p>
                            <p className="text-xs text-gray-600">Total Invested</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {investments.filter(inv => inv.status === 'completed').length}
                            </p>
                            <p className="text-xs text-gray-600">Completed</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No investment documents yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Your SAFE agreements and investment documents will appear here after you invest in campaigns.
                    </p>
                    <Button 
                      className="bg-fundry-orange hover:bg-orange-600"
                      onClick={handleDiscoverCampaigns}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Discover Investment Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Personal Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
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
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
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

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">
                        Last changed {new Date(security.passwordLastChanged).toLocaleDateString()}
                      </p>
                    </div>
                    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (passwordData.newPassword !== passwordData.confirmPassword) {
                            toast({
                              title: "Error",
                              description: "New passwords do not match.",
                              variant: "destructive",
                            });
                            return;
                          }
                          if (passwordData.newPassword.length < 8) {
                            toast({
                              title: "Error",
                              description: "Password must be at least 8 characters long.",
                              variant: "destructive",
                            });
                            return;
                          }
                          changePasswordMutation.mutate(passwordData);
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Enter current password"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                                required
                                minLength={8}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                                required
                                minLength={8}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4">
                            <Button variant="outline" type="button" onClick={() => setIsChangePasswordOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={changePasswordMutation.isPending}
                              className="bg-fundry-orange hover:bg-orange-600"
                            >
                              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={security.twoFactorEnabled ? "default" : "secondary"} className={security.twoFactorEnabled ? "" : "text-red-600"}>
                        {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsTwoFactorSetupOpen(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {security.twoFactorEnabled ? "Manage" : "Enable"} 2FA
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Login Sessions */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Active Sessions</h3>
                      <p className="text-sm text-gray-600">Manage your active login sessions</p>
                    </div>
                    <Dialog open={isViewSessionsOpen} onOpenChange={setIsViewSessionsOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Monitor className="h-4 w-4 mr-2" />
                          View Sessions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Active Sessions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            These are the devices that are currently logged into your account. If you see any suspicious activity, you can log out from specific devices.
                          </p>
                          <div className="space-y-3">
                            {sessions.map((session) => (
                              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    {session.deviceType === "mobile" ? (
                                      <Smartphone className="h-4 w-4 text-gray-600" />
                                    ) : session.deviceType === "tablet" ? (
                                      <Tablet className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <Monitor className="h-4 w-4 text-gray-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {session.device}
                                      {session.current && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          Current
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {session.location} • Last active {session.lastActive}
                                    </p>
                                  </div>
                                </div>
                                {!session.current && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Session Terminated",
                                        description: "Device has been logged out successfully.",
                                      });
                                    }}
                                  >
                                    Log Out
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 border-t">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => {
                                toast({
                                  title: "All Sessions Terminated",
                                  description: "All other devices have been logged out. You'll need to log in again on those devices.",
                                });
                                setIsViewSessionsOpen(false);
                              }}
                            >
                              Log Out All Other Sessions
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Payment Methods */}
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-6 rounded flex items-center justify-center ${
                          method.type === 'visa' ? 'bg-blue-600' : 'bg-red-600'
                        }`}>
                          <span className="text-white text-xs font-bold">
                            {method.type.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• {method.last4}</p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                            {method.isDefault && (
                              <Badge variant="secondary" className="ml-2">Default</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isEditPaymentOpen && selectedPaymentMethod?.id === method.id} 
                               onOpenChange={(open) => {
                                 setIsEditPaymentOpen(open);
                                 if (!open) setSelectedPaymentMethod(null);
                               }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPaymentMethod(method);
                                setEditPaymentMethod({
                                  expiryMonth: method.expiryMonth,
                                  expiryYear: method.expiryYear,
                                });
                              }}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Payment Method</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              editPaymentMethodMutation.mutate({
                                id: method.id,
                                expiryMonth: editPaymentMethod.expiryMonth,
                                expiryYear: editPaymentMethod.expiryYear,
                              });
                            }} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Card Number</Label>
                                <Input 
                                  value={`•••• •••• •••• ${method.last4}`}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editExpiryMonth">Expiry Month</Label>
                                  <Select 
                                    value={editPaymentMethod.expiryMonth}
                                    onValueChange={(value) => setEditPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 12 }, (_, i) => {
                                        const month = (i + 1).toString().padStart(2, '0');
                                        return (
                                          <SelectItem key={month} value={month}>
                                            {month}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="editExpiryYear">Expiry Year</Label>
                                  <Select 
                                    value={editPaymentMethod.expiryYear}
                                    onValueChange={(value) => setEditPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 10 }, (_, i) => {
                                        const year = (new Date().getFullYear() + i).toString().slice(-2);
                                        return (
                                          <SelectItem key={year} value={year}>
                                            {year}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex gap-3 justify-end pt-4">
                                <Button 
                                  variant="outline" 
                                  type="button" 
                                  onClick={() => setIsEditPaymentOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={editPaymentMethodMutation.isPending}
                                  className="bg-fundry-orange hover:bg-orange-600"
                                >
                                  {editPaymentMethodMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isRemovePaymentOpen && selectedPaymentMethod?.id === method.id} 
                               onOpenChange={(open) => {
                                 setIsRemovePaymentOpen(open);
                                 if (!open) setSelectedPaymentMethod(null);
                               }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setSelectedPaymentMethod(method)}
                            >
                              Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Remove Payment Method</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                Are you sure you want to remove this payment method? This action cannot be undone.
                              </p>
                              
                              <div className="bg-gray-50 border rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-5 rounded flex items-center justify-center ${
                                    method.type === 'visa' ? 'bg-blue-600' : 'bg-red-600'
                                  }`}>
                                    <span className="text-white text-xs font-bold">
                                      {method.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">•••• •••• •••• {method.last4}</p>
                                    <p className="text-xs text-gray-600">
                                      Expires {method.expiryMonth}/{method.expiryYear}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3 justify-end">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsRemovePaymentOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => removePaymentMethodMutation.mutate(method.id)}
                                  disabled={removePaymentMethodMutation.isPending}
                                >
                                  {removePaymentMethodMutation.isPending ? "Removing..." : "Remove"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center py-4">
                  <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || 
                            !newPaymentMethod.expiryYear || !newPaymentMethod.cvv || 
                            !newPaymentMethod.cardholderName) {
                          toast({
                            title: "Error",
                            description: "Please fill in all required fields.",
                            variant: "destructive",
                          });
                          return;
                        }
                        addPaymentMethodMutation.mutate(newPaymentMethod);
                      }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardholderName">Cardholder Name</Label>
                          <Input
                            id="cardholderName"
                            value={newPaymentMethod.cardholderName}
                            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            value={newPaymentMethod.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 16) {
                                setNewPaymentMethod(prev => ({ ...prev, cardNumber: value }));
                              }
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryMonth">Month</Label>
                            <Select 
                              value={newPaymentMethod.expiryMonth}
                              onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const month = (i + 1).toString().padStart(2, '0');
                                  return (
                                    <SelectItem key={month} value={month}>
                                      {month}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expiryYear">Year</Label>
                            <Select 
                              value={newPaymentMethod.expiryYear}
                              onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="YY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const year = (new Date().getFullYear() + i).toString().slice(-2);
                                  return (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              value={newPaymentMethod.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setNewPaymentMethod(prev => ({ ...prev, cvv: value }));
                                }
                              }}
                              placeholder="123"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                          <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => setIsAddPaymentOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={addPaymentMethodMutation.isPending}
                            className="bg-fundry-orange hover:bg-orange-600"
                          >
                            {addPaymentMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Investment Updates</p>
                        <p className="text-sm text-gray-600">Receive updates from portfolio companies</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Opportunities</p>
                        <p className="text-sm text-gray-600">Get notified about new investment opportunities</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-gray-600">Important security notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Communications</p>
                        <p className="text-sm text-gray-600">Product updates and newsletters</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Campaign Updates</p>
                        <p className="text-sm text-gray-600">Real-time updates from your investments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Investment Reminders</p>
                        <p className="text-sm text-gray-600">Reminders about pending actions</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data Export */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Export Data</h3>
                      <p className="text-sm text-gray-600">Download a copy of your account data</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportDataMutation.mutate()}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exportDataMutation.isPending ? "Exporting..." : "Export"}
                    </Button>
                  </div>
                </div>

                {/* Account Deactivation */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900">Deactivate Account</h3>
                      <p className="text-sm text-red-600">Temporarily disable your account</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 text-red-600 hover:bg-red-100"
                      onClick={() => setIsDeactivateModalOpen(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deactivation Confirmation Modal */}
      <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-900">Deactivate Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Account Deactivation Warning</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Deactivating your account will temporarily disable access to all Fundry services. 
                    Your investment data will be preserved, but you won't be able to access your portfolio 
                    or receive updates until you reactivate your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="deactivation-reason">Reason for deactivation (optional)</Label>
              <Select value={deactivationReason} onValueChange={setDeactivationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privacy_concerns">Privacy concerns</SelectItem>
                  <SelectItem value="too_many_emails">Too many emails</SelectItem>
                  <SelectItem value="not_using_platform">Not using the platform</SelectItem>
                  <SelectItem value="found_alternative">Found alternative service</SelectItem>
                  <SelectItem value="temporary_break">Taking a temporary break</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm-deactivation">
                Type "DEACTIVATE" to confirm (case sensitive)
              </Label>
              <Input
                id="confirm-deactivation"
                value={confirmDeactivation}
                onChange={(e) => setConfirmDeactivation(e.target.value)}
                placeholder="Type DEACTIVATE to confirm"
                className="font-mono"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeactivateModalOpen(false);
                  setDeactivationReason("");
                  setConfirmDeactivation("");
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirmDeactivation === "DEACTIVATE") {
                    deactivateAccountMutation.mutate({ reason: deactivationReason });
                    setIsDeactivateModalOpen(false);
                    setDeactivationReason("");
                    setConfirmDeactivation("");
                  } else {
                    toast({
                      title: "Confirmation Required",
                      description: "Please type 'DEACTIVATE' exactly to confirm",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={deactivateAccountMutation.isPending || confirmDeactivation !== "DEACTIVATE"}
              >
                {deactivateAccountMutation.isPending ? "Deactivating..." : "Deactivate Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Setup Modal */}
      <TwoFactorSetupModal 
        isOpen={isTwoFactorSetupOpen} 
        onClose={() => setIsTwoFactorSetupOpen(false)} 
      />

      <Footer />
    </div>
  );
}
