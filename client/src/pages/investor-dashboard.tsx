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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Download, Settings, Wallet, PieChart, TrendingUp, FileText, User, Filter, Edit, Phone, MapPin, Calendar, Briefcase, DollarSign, Shield, Key, Monitor, CreditCard, Plus, Bell, AlertTriangle, Eye, EyeOff, Smartphone, Tablet, Clock, ExternalLink, Trash2, Target, Check } from "lucide-react";
import type { InvestmentWithCampaign, UserStats } from "@/lib/types";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";
import TwoFactorSetupModal from "@/components/modals/two-factor-setup-modal";
import PaymentModal from "@/components/modals/payment-modal";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';

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

// Edit Investment Form Schema
const editInvestmentSchema = z.object({
  amount: z.number().min(25, "Minimum investment is $25").max(100000, "Maximum investment is $100,000"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;
type EditInvestmentFormData = z.infer<typeof editInvestmentSchema>;

// Initialize Stripe with error handling
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY).catch(error => {
      console.warn('Stripe failed to load:', error);
      return null;
    })
  : Promise.resolve(null);

// Stripe Wrapper Component with Error Handling
const StripeWrapper = ({ children, stripePromise }: { children: React.ReactNode; stripePromise: Promise<Stripe | null> }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    stripePromise
      .then((stripeInstance) => {
        setStripe(stripeInstance);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn('Stripe failed to initialize:', error);
        setStripeError('Payment system unavailable');
        setIsLoading(false);
      });
  }, [stripePromise]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (stripeError || !stripe) {
    // Return children without Elements wrapper when Stripe fails
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  );
};

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

  // Edit investment modal state
  const [editInvestmentModal, setEditInvestmentModal] = useState({
    isOpen: false,
    investment: null as InvestmentWithCampaign | null,
    amount: 0
  });

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
  const { data: notificationPreferences = {}, isLoading: isLoadingNotificationPreferences } = useQuery({
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

  // Initialize edit investment form
  const editInvestmentForm = useForm<EditInvestmentFormData>({
    resolver: zodResolver(editInvestmentSchema),
    defaultValues: {
      amount: 0,
      notes: "",
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

  // Update edit investment form when modal opens
  useEffect(() => {
    if (editInvestmentModal.isOpen && editInvestmentModal.investment) {
      editInvestmentForm.reset({
        amount: parseFloat(editInvestmentModal.investment.amount),
        notes: (editInvestmentModal.investment as any).notes || "",
      });
    }
  }, [editInvestmentModal.isOpen, editInvestmentModal.investment, editInvestmentForm]);

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
      const response = await apiRequest('PUT', '/api/notification-preferences', preferences);
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update the cache with the response data
      queryClient.setQueryData(['/api/notification-preferences'], data);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      // Revert optimistic update by refetching
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
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
    mutationFn: async ({ id, amount, notes }: { id: number; amount: number; notes?: string }) => {
      return apiRequest("PUT", `/api/investments/${id}`, { amount, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setEditInvestmentModal({ isOpen: false, investment: null, amount: 0 });
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
    // Optimistic update
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

  // Handle opening edit investment modal
  const handleOpenEditInvestment = (investment: InvestmentWithCampaign) => {
    setEditInvestmentModal({ 
      isOpen: true, 
      investment, 
      amount: parseFloat(investment.amount) 
    });
    editInvestmentForm.reset({
      amount: parseFloat(investment.amount),
      notes: investment.notes || "",
    });
  };

  // Handle edit investment form submission
  const handleEditInvestmentSubmit = (data: EditInvestmentFormData) => {
    if (editInvestmentModal.investment) {
      editInvestmentMutation.mutate({
        id: editInvestmentModal.investment.id,
        amount: data.amount,
        notes: data.notes,
      });
    }
  };

  // Filter campaigns based on search and category
  const filteredCampaigns = (campaigns as any[] || []).filter((campaign: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (campaign.title?.toLowerCase()?.includes(searchLower)) ||
                         (campaign.short_pitch?.toLowerCase()?.includes(searchLower)) ||
                         (campaign.full_pitch?.toLowerCase()?.includes(searchLower));
    const matchesCategory = selectedCategory === "All Categories" || 
                           campaign.business_sector === selectedCategory;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-blue-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Modern Header with Gradient */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-blue-700/10 rounded-2xl"></div>
          <div className="relative p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-orange-100/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-700 bg-clip-text text-transparent mb-3">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600 text-base md:text-lg max-w-2xl">
                  Manage your investments and discover new opportunities in the world of micro-investing
                </p>
              </div>
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg md:text-xl">{user.firstName?.[0]}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500 font-medium">Investor</p>
                    <p className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Invested Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">Total Invested</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{userStats?.totalInvested || "$0"}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">All time</span>
            </div>
          </div>

          {/* Active Investments Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">Active Investments</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{userStats?.activeInvestments?.toString() || "0"}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-600 font-medium">Currently active</span>
            </div>
          </div>

          {/* Pending Commitments Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">Pending Commitments</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{pendingInvestments.length.toString()}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-amber-600 font-medium">Awaiting payment</span>
            </div>
          </div>

          {/* Paid Investments Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">Paid Investments</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{paidInvestments.length.toString()}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-emerald-600 font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent gap-1">
              <TabsTrigger 
                value="portfolio" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Discover</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="updates" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Updates</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documents</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="xl:col-span-2 space-y-8">
                {/* Pending Commitments */}
                <div id="pending-commitments" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Pending Commitments</h3>
                        <p className="text-amber-100 text-sm">Investments awaiting payment</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {isLoadingInvestments ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
                      </div>
                    ) : pendingInvestments.length > 0 ? (
                      <div className="space-y-4">
                        {pendingInvestments.map((investment) => (
                          <div key={investment.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                            <InvestmentCard
                              investment={investment}
                              onPayNow={handlePayNow}
                              onEdit={(id: number, amount: number) => handleOpenEditInvestment(investment)}
                              onDelete={(id: number) => deleteInvestmentMutation.mutate(id)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No pending commitments</h4>
                        <p className="text-gray-500 mb-6">All your investments are up to date</p>
                        <Button 
                          onClick={() => setActiveTab("discover")} 
                          className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white"
                        >
                          Discover New Opportunities
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actual Paid Investments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Paid Investments</h3>
                        <p className="text-emerald-100 text-sm">Successfully completed investments</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {isLoadingInvestments ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                      </div>
                    ) : paidInvestments.length > 0 ? (
                      <div className="space-y-4">
                        {paidInvestments.map((investment) => (
                          <div key={investment.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                            <InvestmentCard
                              investment={investment}
                              onPayNow={handlePayNow}
                              onEdit={(id: number, amount: number) => editInvestmentMutation.mutate({ id, amount })}
                              onDelete={(id: number) => deleteInvestmentMutation.mutate(id)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Wallet className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No paid investments yet</h4>
                        <p className="text-gray-500 mb-6">Start investing to see your portfolio here</p>
                        <Button 
                          onClick={() => setActiveTab("discover")} 
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                        >
                          Browse Opportunities
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modern Quick Actions Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      Quick Actions
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <Button 
                      onClick={goToDiscover} 
                      className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Discover Campaigns
                    </Button>
                    <Button 
                      onClick={goToDocuments} 
                      variant="outline" 
                      className="w-full border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-all duration-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                    <Button 
                      onClick={goToProfile} 
                      variant="outline" 
                      className="w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                {/* Investment Summary Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      Portfolio Summary
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Invested</span>
                        <span className="font-semibold text-gray-900">{userStats?.totalInvested || "$0"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Active Investments</span>
                        <span className="font-semibold text-blue-600">{userStats?.activeInvestments || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Pending Payments</span>
                        <span className="font-semibold text-amber-600">{pendingInvestments.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-emerald-600">{paidInvestments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Discover Investment Opportunities</h3>
                    <p className="text-orange-100 text-sm">Find promising startups to invest in</p>
                  </div>
                </div>
                
                {/* Modern Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by company name, industry, or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-white/20 focus:border-white focus:ring-white/50 placeholder-gray-400"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-white border-white/20 text-gray-700">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">All Categories</SelectItem>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-6">
                {isLoadingCampaigns && (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                )}
                {!isLoadingCampaigns && filteredCampaigns.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign: any) => (
                      <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all duration-300">
                        <CampaignCard campaign={campaign} />
                      </div>
                    ))}
                  </div>
                )}
                {!isLoadingCampaigns && filteredCampaigns.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h4>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                    <Button 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All Categories");
                      }}
                      variant="outline"
                      className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Campaign Updates</h3>
                    <p className="text-blue-100 text-sm">Latest news from your investments</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {isLoadingUpdates ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : (campaignUpdates as any[])?.length > 0 ? (
                  <div className="space-y-6">
                    {(campaignUpdates as any[]).map((update: any) => (
                      <div key={update.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{update.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <span className="font-medium">{update.campaign?.companyName}</span>
                              <span>•</span>
                              <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={`
                              ${update.type === 'milestone' ? 'border-green-200 text-green-700 bg-green-50' : ''}
                              ${update.type === 'financial' ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
                              ${update.type === 'announcement' ? 'border-orange-200 text-orange-700 bg-orange-50' : ''}
                              ${update.type === 'general' ? 'border-gray-200 text-gray-700 bg-gray-50' : ''}
                              capitalize
                            `}
                          >
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h4>
                    <p className="text-gray-500 mb-6">Updates will appear here once you invest in campaigns</p>
                    <Button 
                      onClick={() => setActiveTab("discover")} 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      Find Campaigns to Invest
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
          <TabsContent value="profile" className="space-y-8">
            <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                      <p className="text-orange-100 text-sm">Manage your personal details</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-lg font-semibold text-gray-900">{user.phone || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.country && user.state ? `${user.state}, ${user.country}` : 
                         user.country || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Bio</Label>
                    <p className="text-gray-900 leading-relaxed">{user.bio || "No bio provided"}</p>
                  </div>
                  <div className="pt-6 border-t border-gray-200">
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
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
                                          <SelectItem key={typeof state === 'string' ? state : state.code} value={typeof state === 'string' ? state : state.name}>
                                            {typeof state === 'string' ? state : state.name}
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
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Security Settings</h3>
                      <p className="text-blue-100 text-sm">Secure your account</p>
                    </div>
                  </div>
                </div>
                  <div className="space-y-4">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white justify-start"
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
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Payment Methods</h3>
                      <p className="text-green-100 text-sm">Manage your payment options</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {isLoadingPaymentMethods ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (paymentMethods as any[])?.length > 0 ? (
                    <div className="space-y-3">
                      {(paymentMethods as any[]).map((method: any) => (
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
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
                      <p className="text-purple-100 text-sm">Customize your alerts</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {isLoadingNotificationPreferences ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Investment Updates</p>
                          <p className="text-sm text-gray-600">Email updates about your investments</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.emailInvestmentUpdates || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('emailInvestmentUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Opportunities</p>
                          <p className="text-sm text-gray-600">Email about new investment opportunities</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.emailNewOpportunities || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('emailNewOpportunities', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Security Alerts</p>
                          <p className="text-sm text-gray-600">Important security notifications</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.emailSecurityAlerts || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('emailSecurityAlerts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Communications</p>
                          <p className="text-sm text-gray-600">Promotional content and platform news</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.emailMarketingCommunications || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('emailMarketingCommunications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Campaign Updates</p>
                          <p className="text-sm text-gray-600">Push notifications for campaign updates</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.pushCampaignUpdates || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('pushCampaignUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Investment Reminders</p>
                          <p className="text-sm text-gray-600">Push reminders about pending investments</p>
                        </div>
                        <Switch
                          checked={notificationPreferences?.pushInvestmentReminders || false}
                          onCheckedChange={(checked) => handleUpdateNotificationPreference('pushInvestmentReminders', checked)}
                        />
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* Account Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Account Management</h3>
                      <p className="text-red-100 text-sm">Account settings and data</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white justify-start"
                    onClick={handleExportData}
                    disabled={exportDataMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exportDataMutation.isPending ? "Exporting..." : "Export Account Data"}
                  </Button>
                  
                  <AlertDialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white justify-start">
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
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedInvestmentForPayment && (
        <StripeWrapper stripePromise={stripePromise}>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedInvestmentForPayment(null);
            }}
            investment={selectedInvestmentForPayment}
          />
        </StripeWrapper>
      )}

      {/* Comprehensive Edit Investment Modal */}
      <Dialog open={editInvestmentModal.isOpen} onOpenChange={(open) => !open && setEditInvestmentModal({ isOpen: false, investment: null, amount: 0 })}>
        <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border border-orange-200 shadow-2xl rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Edit Investment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update your investment amount and add notes for your records
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editInvestmentForm}>
            <form onSubmit={editInvestmentForm.handleSubmit(handleEditInvestmentSubmit)} className="space-y-6">
              {/* Investment Details Card */}
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Investment Details</h3>
                {editInvestmentModal.investment && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Campaign:</span>
                      <span className="font-medium text-gray-900">{editInvestmentModal.investment.campaign?.companyName || editInvestmentModal.investment.campaign?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Amount:</span>
                      <span className="font-medium text-gray-900">${parseFloat(editInvestmentModal.investment.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize text-orange-600">{editInvestmentModal.investment.status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Investment Amount Field */}
              <FormField
                control={editInvestmentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">Investment Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          {...field}
                          type="number"
                          min={25}
                          max={100000}
                          step={1}
                          placeholder="Enter amount"
                          className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Minimum: $25 • Maximum: $100,000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Investment Notes Field */}
              <FormField
                control={editInvestmentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-medium">
                      Investment Notes 
                      <span className="text-gray-500 font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any notes about this investment (e.g., reasons for investing, expectations, etc.)"
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 min-h-[80px] resize-none"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      {(field.value?.length || 0)}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-orange-200">
                <Button
                  type="button"
                  onClick={() => setEditInvestmentModal({ isOpen: false, investment: null, amount: 0 })}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editInvestmentMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white"
                >
                  {editInvestmentMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}