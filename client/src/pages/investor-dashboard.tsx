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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp, FileText, User, Filter, Edit, Phone, MapPin, Calendar, Briefcase, DollarSign, Shield, Key, Monitor, CreditCard, Plus, Bell, AlertTriangle, Eye, EyeOff, Smartphone, Tablet, Clock, ExternalLink, Trash2 } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";
import TwoFactorSetupModal from "@/components/modals/two-factor-setup-modal";
import PaymentModal from "@/components/modals/payment-modal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

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

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  // Account management modal states
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [confirmDeactivation, setConfirmDeactivation] = useState("");

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvestmentForPayment, setSelectedInvestmentForPayment] = useState<any>(null);

  // Password data state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Edit payment method state
  const [editPaymentMethod, setEditPaymentMethod] = useState({
    expiryMonth: "",
    expiryYear: "",
  });

  // New payment method state
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  // Fetch payment methods from API
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: !!user,
  });

  // Fetch notification preferences from API
  const { data: notificationPreferences, isLoading: isLoadingNotificationPreferences } = useQuery({
    queryKey: ['/api/notification-preferences'],
    enabled: !!user,
  });

  // Fetch user stats
  const { data: userStats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  // Fetch user investments
  const { data: userInvestments = [], isLoading: isLoadingInvestments } = useQuery<InvestmentWithCampaign[]>({
    queryKey: ["/api/investments/user"],
    enabled: !!user,
  });

  // Fetch campaigns for discovery
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: activeTab === "discover",
  });

  // Fetch campaign updates for invested campaigns
  const { data: campaignUpdates = [], isLoading: isLoadingUpdates } = useQuery({
    queryKey: ["/api/campaign-updates/investor", user?.id],
    enabled: !!user && activeTab === "updates",
  });

  // Initialize form with user data
  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      bio: "",
      dateOfBirth: "",
      occupation: "",
      annualIncome: "",
      investmentExperience: "",
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

  // Payment method mutations
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('POST', '/api/payment-methods', { paymentMethodId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsAddPaymentOpen(false);
      setNewPaymentMethod({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been successfully added.",
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

  const removePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: number) => {
      const response = await apiRequest('DELETE', `/api/payment-methods/${paymentMethodId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsRemovePaymentOpen(false);
      setSelectedPaymentMethod(null);
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been successfully removed.",
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

  // Edit Payment Method Mutation
  const editPaymentMethodMutation = useMutation({
    mutationFn: async ({ id, expiryMonth, expiryYear }: { id: number; expiryMonth: string; expiryYear: string }) => {
      const response = await apiRequest('PATCH', `/api/payment-methods/${id}`, {
        expiryMonth,
        expiryYear,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsEditPaymentOpen(false);
      setSelectedPaymentMethod(null);
      setEditPaymentMethod({ expiryMonth: "", expiryYear: "" });
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been successfully updated.",
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

  // Update notification preferences mutation
  const updateNotificationPreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest('PATCH', '/api/notification-preferences', preferences);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
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
    mutationFn: async (reason: string) => {
      return apiRequest("POST", "/api/user/deactivate", { reason });
    },
    onSuccess: () => {
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated successfully",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    },
  });

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation({
    mutationFn: async (investmentId: number) => {
      return apiRequest("DELETE", `/api/investments/${investmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Investment Deleted",
        description: "Your investment commitment has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete investment",
        variant: "destructive",
      });
    },
  });

  // Edit investment mutation
  const editInvestmentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      return apiRequest("PATCH", `/api/investments/${id}`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Investment Updated",
        description: "Your investment amount has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update investment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditProfileFormData) => {
    editProfileMutation.mutate(data);
  };

  const handlePayNow = (investment: InvestmentWithCampaign) => {
    setSelectedInvestmentForPayment(investment);
    setIsPaymentModalOpen(true);
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const countryData = COUNTRIES_AND_STATES.find(c => c.code === countryCode);
    form.setValue("country", countryCode);
    form.setValue("state", "");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleUpdateNotificationPreference = (key: string, value: boolean) => {
    queryClient.setQueryData(['/api/notification-preferences'], (old: any) => ({
      ...old,
      [key]: value,
    }));
    
    updateNotificationPreferencesMutation.mutate({
      [key]: value,
    });
  };

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  const handleDeactivateAccount = () => {
    if (confirmDeactivation !== "DEACTIVATE") {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DEACTIVATE' to confirm account deactivation.",
        variant: "destructive",
      });
      return;
    }
    deactivateAccountMutation.mutate(deactivationReason);
  };

  // Filter campaigns based on search and category
  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || 
                           campaign.businessSector === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const goToDiscover = () => {
    setLocation("/browse-campaigns");
  };

  const goToDocuments = () => {
    setActiveTab("documents");
  };

  const goToProfile = () => {
    setActiveTab("profile");
  };

  const goToUpdates = () => {
    setActiveTab("updates");
  };

  // Separate investments by payment status
  const pendingInvestments = userInvestments.filter(investment => 
    investment.paymentStatus === 'pending' || investment.paymentStatus === 'processing'
  );
  
  const paidInvestments = userInvestments.filter(investment => 
    investment.paymentStatus === 'completed'
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access your dashboard.",
      variant: "destructive",
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your investments and discover new opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Invested"
            value={userStats?.totalInvested || "$0"}
            icon={<DollarSign className="h-6 w-6" />}
            trend={userStats?.totalInvestedTrend || 0}
          />
          <StatsCard
            title="Active Investments"
            value={userStats?.activeInvestments?.toString() || "0"}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={userStats?.activeInvestmentsTrend || 0}
          />
          <StatsCard
            title="Pending Commitments"
            value={pendingInvestments.length.toString()}
            icon={<Clock className="h-6 w-6" />}
            trend={0}
          />
          <StatsCard
            title="Actual Paid Investments"
            value={paidInvestments.length.toString()}
            icon={<Wallet className="h-6 w-6" />}
            trend={0}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Commitments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pending Commitments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInvestments ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : pendingInvestments.length > 0 ? (
                      <div className="space-y-4">
                        {pendingInvestments.map((investment) => (
                          <InvestmentCard
                            key={investment.id}
                            investment={investment}
                            onPayNow={handlePayNow}
                            onEdit={(id, amount) => editInvestmentMutation.mutate({ id, amount })}
                            onDelete={(id) => deleteInvestmentMutation.mutate(id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No pending commitments</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actual Paid Investments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Actual Paid Investments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingInvestments ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : paidInvestments.length > 0 ? (
                      <div className="space-y-4">
                        {paidInvestments.map((investment) => (
                          <InvestmentCard
                            key={investment.id}
                            investment={investment}
                            onPayNow={handlePayNow}
                            onEdit={(id, amount) => editInvestmentMutation.mutate({ id, amount })}
                            onDelete={(id) => deleteInvestmentMutation.mutate(id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No paid investments yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={goToDiscover} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Discover Campaigns
                    </Button>
                    <Button onClick={goToDocuments} variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                    <Button onClick={goToProfile} variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discover Investment Opportunities</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">All Categories</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign: any) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No campaigns found matching your criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Updates</CardTitle>
                <p className="text-sm text-gray-600">
                  Updates from campaigns you've invested in
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingUpdates ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : campaignUpdates.length > 0 ? (
                  <div className="space-y-6">
                    {campaignUpdates.map((update: any) => (
                      <div key={update.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{update.title}</h3>
                            <p className="text-sm text-gray-600">
                              {update.campaign?.companyName} • {new Date(update.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            update.type === 'milestone' ? 'default' :
                            update.type === 'financial' ? 'secondary' :
                            update.type === 'announcement' ? 'destructive' : 'outline'
                          }>
                            {update.type}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{update.content}</p>
                        {update.attachments && update.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {update.attachments.map((attachment: any, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {attachment.filename}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No updates available</p>
                    <p className="text-sm mt-2">
                      Updates will appear here once you invest in campaigns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Documents</CardTitle>
                <p className="text-sm text-gray-600">
                  Access your signed investment agreements and documents
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Total Agreements</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {paidInvestments.length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Total Invested</h3>
                    <p className="text-2xl font-bold text-green-600">
                      ${paidInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {paidInvestments.length > 0 ? (
                  <div className="space-y-4">
                    {paidInvestments.map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{investment.campaign?.companyName}</h3>
                            <p className="text-sm text-gray-600">
                              SAFE Agreement • ${investment.amount?.toLocaleString()} • 
                              {new Date(investment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Generate and download SAFE agreement
                                const safeContent = `
SAFE AGREEMENT

Investment Details:
- Investor: ${user.firstName} ${user.lastName}
- Company: ${investment.campaign?.companyName}
- Investment Amount: $${investment.amount?.toLocaleString()}
- Date: ${new Date(investment.createdAt).toLocaleDateString()}
- Discount Rate: ${investment.campaign?.discountRate || 20}%
- Valuation Cap: $${investment.campaign?.valuationCap?.toLocaleString() || 'N/A'}

This SAFE Agreement has been digitally signed and executed.
                                `.trim();
                                
                                const blob = new Blob([safeContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `SAFE_${investment.campaign?.companyName}_${investment.id}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // View SAFE agreement in modal
                                alert(`SAFE Agreement for ${investment.campaign?.companyName}\nAmount: $${investment.amount?.toLocaleString()}\nDate: ${new Date(investment.createdAt).toLocaleDateString()}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No signed documents yet</p>
                    <p className="text-sm mt-2">
                      Documents will appear here after you complete investments
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Name</Label>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="font-medium">{user.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Location</Label>
                      <p className="font-medium">
                        {user.country && user.state ? `${user.state}, ${user.country}` : 
                         user.country || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Bio</Label>
                    <p className="font-medium">{user.bio || "No bio provided"}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
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
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
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
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={handleCountryChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select country" />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {selectedCountry && COUNTRIES_AND_STATES
                                          .find(c => c.code === selectedCountry)?.states?.map((state) => (
                                          <SelectItem key={state} value={state}>
                                            {state}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Occupation</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                        <SelectItem value="150k-plus">$150,000+</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="investmentExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Investment Experience</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select experience level" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="beginner">Beginner</SelectItem>
                                      <SelectItem value="intermediate">Intermediate</SelectItem>
                                      <SelectItem value="advanced">Advanced</SelectItem>
                                      <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={3} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex gap-3">
                              <Button type="submit" disabled={editProfileMutation.isPending}>
                                {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditProfileOpen(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setIsChangePasswordOpen(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setIsTwoFactorSetupOpen(true)}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setIsViewSessionsOpen(true)}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Active Sessions
                    </Button>
                  </div>

                  {/* Change Password Modal */}
                  <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                    <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Current Password</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleChangePassword}
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsChangePasswordOpen(false)}
                          >
                            Cancel
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

                  {/* Active Sessions Modal */}
                  <Dialog open={isViewSessionsOpen} onOpenChange={setIsViewSessionsOpen}>
                    <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                      <DialogHeader>
                        <DialogTitle>Active Sessions</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Monitor className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">Current Session</p>
                                <p className="text-sm text-gray-600">
                                  {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'} • 
                                  {new Date().toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          This is your current session. You'll be logged out of all other sessions when you change your password.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  {isLoadingPaymentMethods ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method: any) => (
                        <div key={method.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-6 rounded flex items-center justify-center ${
                                method.type === 'visa' ? 'bg-blue-600' : 'bg-red-600'
                              }`}>
                                <span className="text-white text-xs font-bold">
                                  {method.type?.toUpperCase()}
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
                              <Dialog 
                                open={isEditPaymentOpen && selectedPaymentMethod?.id === method.id} 
                                onOpenChange={(open) => {
                                  setIsEditPaymentOpen(open);
                                  if (open) {
                                    setSelectedPaymentMethod(method);
                                    setEditPaymentMethod({
                                      expiryMonth: method.expiryMonth,
                                      expiryYear: method.expiryYear,
                                    });
                                  } else {
                                    setSelectedPaymentMethod(null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                                  <DialogHeader>
                                    <DialogTitle>Edit Payment Method</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Expiry Month</Label>
                                        <Select
                                          value={editPaymentMethod.expiryMonth}
                                          onValueChange={(value) => setEditPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="MM" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                              <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                                {month.toString().padStart(2, '0')}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Expiry Year</Label>
                                        <Select
                                          value={editPaymentMethod.expiryYear}
                                          onValueChange={(value) => setEditPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="YYYY" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                              <SelectItem key={year} value={year.toString()}>
                                                {year}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex gap-3">
                                      <Button
                                        onClick={() => {
                                          if (selectedPaymentMethod) {
                                            editPaymentMethodMutation.mutate({
                                              id: selectedPaymentMethod.id,
                                              expiryMonth: editPaymentMethod.expiryMonth,
                                              expiryYear: editPaymentMethod.expiryYear,
                                            });
                                          }
                                        }}
                                        disabled={editPaymentMethodMutation.isPending}
                                      >
                                        {editPaymentMethodMutation.isPending ? "Updating..." : "Update"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setIsEditPaymentOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <AlertDialog
                                open={isRemovePaymentOpen && selectedPaymentMethod?.id === method.id}
                                onOpenChange={(open) => {
                                  setIsRemovePaymentOpen(open);
                                  if (open) {
                                    setSelectedPaymentMethod(method);
                                  } else {
                                    setSelectedPaymentMethod(null);
                                  }
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this payment method? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (selectedPaymentMethod) {
                                          removePaymentMethodMutation.mutate(selectedPaymentMethod.id);
                                        }
                                      }}
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No payment methods added</p>
                    </div>
                  )}
                  
                  <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input
                            placeholder="0000 0000 0000 0000"
                            value={newPaymentMethod.cardNumber}
                            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry Month</Label>
                            <Select
                              value={newPaymentMethod.expiryMonth}
                              onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                  <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                    {month.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry Year</Label>
                            <Select
                              value={newPaymentMethod.expiryYear}
                              onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>CVV</Label>
                            <Input
                              placeholder="123"
                              value={newPaymentMethod.cvv}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cardholder Name</Label>
                            <Input
                              placeholder="John Doe"
                              value={newPaymentMethod.cardholderName}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => addPaymentMethodMutation.mutate(newPaymentMethod.cardNumber)}
                            disabled={addPaymentMethodMutation.isPending}
                          >
                            {addPaymentMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddPaymentOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                <CardContent className="space-y-4">
                  {isLoadingNotificationPreferences ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Updates</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.emailUpdates || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('emailUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Alerts</p>
                          <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.smsAlerts || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('smsAlerts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-600">Browser push notifications</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.pushNotifications || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('pushNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Emails</p>
                          <p className="text-sm text-gray-600">Promotional content and news</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.marketingEmails || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('marketingEmails', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Security Alerts</p>
                          <p className="text-sm text-gray-600">Account security notifications</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.securityAlerts || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('securityAlerts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Investment Updates</p>
                          <p className="text-sm text-gray-600">Updates from your investments</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.investmentUpdates || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('investmentUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Campaign News</p>
                          <p className="text-sm text-gray-600">News from campaign founders</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.campaignNews || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('campaignNews', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Monthly Reports</p>
                          <p className="text-sm text-gray-600">Monthly investment summaries</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.monthlyReports || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('monthlyReports', checked)}
                        />
                      </div>
                    </div>
                  )}
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
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExportData}
                    disabled={exportDataMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exportDataMutation.isPending ? "Exporting..." : "Export Account Data"}
                  </Button>
                  
                  <AlertDialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Deactivate Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently deactivate your account. All your data will be preserved but you won't be able to access your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Reason for deactivation</Label>
                          <Select value={deactivationReason} onValueChange={setDeactivationReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="privacy">Privacy concerns</SelectItem>
                              <SelectItem value="not-useful">Platform not useful</SelectItem>
                              <SelectItem value="too-many-emails">Too many emails</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Type "DEACTIVATE" to confirm</Label>
                          <Input
                            value={confirmDeactivation}
                            onChange={(e) => setConfirmDeactivation(e.target.value)}
                            placeholder="DEACTIVATE"
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeactivateAccount}
                          disabled={deactivateAccountMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deactivateAccountMutation.isPending ? "Deactivating..." : "Deactivate Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedInvestmentForPayment && (
        <Elements stripe={stripePromise}>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedInvestmentForPayment(null);
            }}
            investment={selectedInvestmentForPayment}
          />
        </Elements>
      )}

      <Footer />
    </div>
  );
}