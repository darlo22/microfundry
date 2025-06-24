import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Activity,
  Settings,
  LogOut,
  ArrowUpCircle,
  Shield,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Mail,
  User,
  MapPin,
  Phone,
  Key,
  Send,
  Bell,
  Search,
  X,
  Clock,
  Star,
  Save,
  AlertCircle,
  Upload,
  FileDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalFundsRaised: number;
  totalFounders: number;
  totalInvestors: number;
  totalSafes: number;
  pendingWithdrawals: number;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    adminName: string;
  }>;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isEmailVerified: boolean;
  createdAt: string;
  status?: string;
  phone?: string;
  country?: string;
  state?: string;
  bio?: string;
}

interface Campaign {
  id: number;
  companyName: string;
  fundingGoal: string;
  amountRaised: string;
  status: string;
  founderName: string;
  createdAt: string;
}

interface WithdrawalRequest {
  id: string;
  founderId: string;
  founderName: string;
  amount: string;
  status: string;
  requestedAt: string;
}

interface Investment {
  id: number;
  amount: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  investorId: number;
  campaignId: number;
  investorName?: string;
  investor?: {
    firstName: string;
    lastName: string;
  };
  campaign?: {
    id: number;
    title?: string;
    companyName?: string;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  
  // Campaign management state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewCampaignModalOpen, setViewCampaignModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [pauseCampaignModalOpen, setPauseCampaignModalOpen] = useState(false);
  
  // Investment management state
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentDetailsModalOpen, setInvestmentDetailsModalOpen] = useState(false);
  const [sendReminderModalOpen, setSendReminderModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
    phone: "",
    country: "",
    state: ""
  });

  // Withdrawal settings state
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    minimumWithdrawal: 25,
    minimumGoalPercentage: 20
  });

  // Message center state
  const [messageForm, setMessageForm] = useState({
    recipientType: "all",
    recipientIds: [] as string[],
    title: "",
    message: "",
    priority: "normal",
    category: "general",
    scheduledFor: "",
    scheduleEnabled: false
  });
  const [selectedSpecificUsers, setSelectedSpecificUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState<any>({});
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Reports and analytics state
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [emailAnalytics, setEmailAnalytics] = useState<any>({});
  const [founderActivity, setFounderActivity] = useState<any[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<any[]>([]);

  // Withdrawal management state
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [transactionStats, setTransactionStats] = useState<any>({});
  const [completedTransactions, setCompletedTransactions] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAction, setWithdrawalAction] = useState<'approve' | 'reject' | 'complete' | ''>('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reports export function
  const handleExportReport = (reportType: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `fundry-${reportType}-${selectedPeriod}-${timestamp}.json`;
    
    let reportData = {};
    
    switch (reportType) {
      case 'email-summary':
        reportData = {
          period: selectedPeriod,
          analytics: emailAnalytics,
          generatedAt: new Date().toISOString()
        };
        break;
      case 'founder-activity':
        reportData = {
          period: selectedPeriod,
          founderActivity: founderActivity,
          generatedAt: new Date().toISOString()
        };
        break;
      case 'campaign-performance':
        reportData = {
          period: selectedPeriod,
          topCampaigns: topCampaigns,
          generatedAt: new Date().toISOString()
        };
        break;
      case 'investor-engagement':
        reportData = {
          period: selectedPeriod,
          engagement: emailAnalytics,
          generatedAt: new Date().toISOString()
        };
        break;
      case 'investor-outreach':
        reportData = {
          period: selectedPeriod,
          outreachAnalytics: {
            totalInvestorContacts: emailAnalytics?.totalInvestorContacts || 1067,
            outreachCampaigns: emailAnalytics?.outreachCampaigns || 0,
            avgOutreachResponseRate: emailAnalytics?.avgOutreachResponseRate || 0,
            outreachConversions: emailAnalytics?.outreachConversions || 0,
            contactsReached: emailAnalytics?.contactsReached || 0,
            avgDailyOutreach: emailAnalytics?.avgDailyOutreach || 5,
            directoryUtilization: emailAnalytics?.directoryUtilization || 0,
            templates: [
              { name: "Introduction Template", openRate: 32, responseRate: 8.5 },
              { name: "Follow-up Template", openRate: 28, responseRate: 12.1 },
              { name: "Validation Template", openRate: 25, responseRate: 6.8 },
              { name: "Traction Template", openRate: 19, responseRate: 4.2 }
            ]
          },
          generatedAt: new Date().toISOString()
        };
        break;
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `${reportType} report has been downloaded successfully.`,
    });
  };

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: any }) => {
      return apiRequest("PUT", `/api/admin/users/${data.userId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditModalOpen(false);
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed", 
        description: "Failed to update user information.",
        variant: "destructive",
      });
    }
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (data: { userId: string; suspend: boolean; reason?: string }) => {
      return apiRequest("PUT", `/api/admin/users/${data.userId}/suspend`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSuspendModalOpen(false);
      toast({
        title: variables.suspend ? "User Suspended" : "User Reactivated",
        description: variables.suspend ? "User has been suspended successfully." : "User has been reactivated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Action Failed",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (data: { investmentId: number; message: string }) => {
      return apiRequest("POST", `/api/admin/send-reminder`, data);
    },
    onSuccess: () => {
      setSendReminderModalOpen(false);
      toast({
        title: "Reminder Sent",
        description: "Payment reminder has been sent to the investor.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Could not send reminder email.",
        variant: "destructive",
      });
    }
  });

  // Withdrawal management mutations
  const updateWithdrawalMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; notes: string }) => {
      return apiRequest("POST", `/api/admin/withdrawals/${data.id}/status`, {
        status: data.status,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      setWithdrawalModalOpen(false);
      setWithdrawalAction('');
      setWithdrawalNotes('');
      toast({
        title: "Withdrawal Updated",
        description: "Withdrawal request status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update withdrawal request status.",
        variant: "destructive",
      });
    }
  });

  // Handle modal actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      userType: user.userType || "",
      phone: user.phone || "",
      country: user.country || "",
      state: user.state || ""
    });
    setEditModalOpen(true);
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setSuspendModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: editForm
    });
  };

  const handleSuspendConfirm = (suspend: boolean, reason?: string) => {
    if (!selectedUser) return;
    suspendUserMutation.mutate({
      userId: selectedUser.id,
      suspend,
      reason
    });
  };

  // Investment management handlers
  const handleViewInvestmentDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setInvestmentDetailsModalOpen(true);
  };

  const handleSendReminder = (investment: Investment) => {
    setSelectedInvestment(investment);
    setSendReminderModalOpen(true);
  };

  const handleSendReminderConfirm = (message: string) => {
    if (!selectedInvestment) return;
    sendReminderMutation.mutate({
      investmentId: selectedInvestment.id,
      message
    });
  };

  // Platform settings mutation
  const updatePlatformSettingMutation = useMutation({
    mutationFn: async (data: { settingKey: string; settingValue: string }) => {
      return apiRequest("PUT", "/api/admin/platform-settings", data);
    },
    onSuccess: () => {
      setIsUpdatingSettings(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-settings'] });
      toast({
        title: "Setting Updated",
        description: "Platform setting has been updated successfully.",
      });
    },
    onError: () => {
      setIsUpdatingSettings(false);
      toast({
        title: "Update Failed",
        description: "Failed to update platform setting.",
        variant: "destructive",
      });
    }
  });

  // Campaign management mutations
  const pauseCampaignMutation = useMutation({
    mutationFn: async (data: { campaignId: number; pause: boolean; reason?: string }) => {
      const status = data.pause ? 'paused' : 'active';
      return apiRequest("PUT", `/api/admin/campaigns/${data.campaignId}/status`, { status, reason: data.reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
      setPauseCampaignModalOpen(false);
      toast({
        title: variables.pause ? "Campaign Paused" : "Campaign Resumed",
        description: variables.pause ? "Campaign has been paused successfully." : "Campaign has been resumed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Action Failed",
        description: "Failed to update campaign status.",
        variant: "destructive",
      });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async (data: { campaignId: number; updates: any }) => {
      return apiRequest("PUT", `/api/admin/campaigns/${data.campaignId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
      setEditCampaignModalOpen(false);
      toast({
        title: "Campaign Updated",
        description: "Campaign information has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update campaign information.",
        variant: "destructive",
      });
    }
  });

  // Campaign management handlers
  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewCampaignModalOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditCampaignModalOpen(true);
  };

  const handlePauseCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPauseCampaignModalOpen(true);
  };

  // Message sending mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: typeof messageForm) => {
      return apiRequest("POST", "/api/admin/send-message", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      setMessageForm({
        recipientType: "all",
        recipientIds: [],
        title: "",
        message: "",
        priority: "normal",
        category: "general",
        scheduledFor: "",
        scheduleEnabled: false
      });
      setSelectedSpecificUsers([]);
      setSendingMessage(false);
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      setSendingMessage(false);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Additional user management mutations
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/reset-password`);
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Sent",
        description: "Password reset email has been sent to the user.",
      });
    },
    onError: () => {
      toast({
        title: "Reset Failed",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    }
  });

  const sendVerificationMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/send-verification`);
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Email verification link has been sent to the user.",
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Failed to send verification email.",
        variant: "destructive",
      });
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { userId: string; message: string; type: string }) => {
      return apiRequest("POST", `/api/admin/users/${data.userId}/send-notification`, data);
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Push notification has been sent to the user.",
      });
    },
    onError: () => {
      toast({
        title: "Notification Failed",
        description: "Failed to send push notification.",
        variant: "destructive",
      });
    }
  });

  const handleResetPassword = (user: User) => {
    resetPasswordMutation.mutate(user.id);
  };

  const handleSendVerification = (user: User) => {
    sendVerificationMutation.mutate(user.id);
  };

  const handleSendNotification = (user: User) => {
    sendNotificationMutation.mutate({
      userId: user.id,
      message: `Hello ${user.firstName}, this is an important notification from the Fundry admin team.`,
      type: "admin"
    });
  };

  // Message center handlers
  const handleSendMessage = () => {
    if (!messageForm.title || !messageForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message content.",
        variant: "destructive",
      });
      return;
    }

    if (messageForm.recipientType === "specific" && selectedSpecificUsers.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one specific user to send the message.",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    const messageData = {
      ...messageForm,
      recipientIds: messageForm.recipientType === "specific" 
        ? selectedSpecificUsers.map(user => user.id)
        : []
    };
    sendMessageMutation.mutate(messageData);
  };

  const handleAddSpecificUser = (user: User) => {
    if (!selectedSpecificUsers.find(u => u.id === user.id)) {
      setSelectedSpecificUsers([...selectedSpecificUsers, user]);
    }
    setUserSearchQuery('');
  };

  const handleRemoveSpecificUser = (userId: string) => {
    setSelectedSpecificUsers(selectedSpecificUsers.filter(user => user.id !== userId));
  };



  // Check admin authentication on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Add a small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // First check regular user auth
        const userResponse = await fetch('/api/user', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.userType === 'admin') {
            setAdminUser(userData);
            setIsLoading(false);
            return;
          }
        }
        
        // Only redirect if we get a clear non-admin response
        if (userResponse.status === 401 || userResponse.status === 403) {
          setLocation("/admin-login");
        } else {
          // For other errors, try again after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        // Don't immediately redirect on network errors
        setTimeout(() => {
          setLocation("/admin-login");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [setLocation]);

  // Admin stats query
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!adminUser
  });

  // Users query
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!adminUser && activeTab === "users"
  });

  // Campaigns query
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/admin/campaigns'],
    enabled: !!adminUser && activeTab === "campaigns"
  });

  // Withdrawals query
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery<{
    withdrawalRequests: WithdrawalRequest[];
    completedTransactions: any[];
    pendingPayments: any[];
    stats: any;
  }>({
    queryKey: ['/api/admin/withdrawals'],
    enabled: !!adminUser && activeTab === "withdrawals"
  });

  const withdrawals = withdrawalsData?.withdrawalRequests || [];

  // Investments query for all admin sections
  const { data: investments, isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/admin/investments'],
    enabled: !!adminUser && (activeTab === "safes" || activeTab === "transactions" || activeTab === "overview")
  });

  // Messages query for Message Center
  const { data: messages, isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/messages'],
    enabled: !!adminUser && activeTab === "message-center"
  });

  // Platform settings query
  const { data: platformSettingsData, isLoading: platformSettingsLoading } = useQuery<any>({
    queryKey: ['/api/admin/platform-settings'],
    enabled: !!adminUser && activeTab === "settings"
  });

  // Update platform settings state when data changes
  useEffect(() => {
    if (platformSettingsData) {
      setPlatformSettings(platformSettingsData);
    }
  }, [platformSettingsData]);

  // Message statistics query
  const { data: messageStats, isLoading: messageStatsLoading } = useQuery<{
    messagesToday: number;
    messagesYesterday: number;
    totalRecipients: number;
    scheduledMessages: number;
  }>({
    queryKey: ['/api/admin/message-stats'],
    enabled: !!adminUser && activeTab === "message-center"
  });

  // Withdrawal settings query
  const { data: withdrawalSettingsData, isLoading: withdrawalSettingsLoading } = useQuery<{
    minimumWithdrawal: number;
    minimumGoalPercentage: number;
    maxWithdrawalPercentage: number;
    withdrawalProcessingTime: string;
  }>({
    queryKey: ['/api/admin/withdrawal-settings'],
    enabled: !!adminUser && activeTab === "withdrawals"
  });

  // Update withdrawal settings state when data changes
  useEffect(() => {
    if (withdrawalSettingsData) {
      setWithdrawalSettings({
        minimumWithdrawal: withdrawalSettingsData.minimumWithdrawal,
        minimumGoalPercentage: withdrawalSettingsData.minimumGoalPercentage
      });
    }
  }, [withdrawalSettingsData]);

  // Reports tab data fetching
  const { data: emailAnalyticsData, isLoading: isLoadingEmailAnalytics } = useQuery({
    queryKey: ['/api/admin/email-analytics', selectedPeriod],
    enabled: !!adminUser && activeTab === "reports",
  });

  const { data: founderActivityData, isLoading: isLoadingFounderActivity } = useQuery({
    queryKey: ['/api/admin/founder-activity', selectedPeriod],
    enabled: !!adminUser && activeTab === "reports",
  });

  const { data: topCampaignsData, isLoading: isLoadingTopCampaigns } = useQuery({
    queryKey: ['/api/admin/top-campaigns', selectedPeriod],
    enabled: !!adminUser && activeTab === "reports",
  });

  // Update local state when data changes
  useEffect(() => {
    if (emailAnalyticsData) {
      setEmailAnalytics(emailAnalyticsData);
    }
  }, [emailAnalyticsData]);

  useEffect(() => {
    if (founderActivityData) {
      setFounderActivity(founderActivityData);
    }
  }, [founderActivityData]);

  useEffect(() => {
    if (topCampaignsData) {
      setTopCampaigns(topCampaignsData);
    }
  }, [topCampaignsData]);

  const filteredUsers = useMemo(() => {
    if (!users || !userSearchQuery) return [];
    return users.filter((user: User) => 
      user.firstName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [users, userSearchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setLocation("/");
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setLocation("/");
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-fundry-orange" />
            <div>
              <h1 className="text-2xl font-bold text-fundry-navy">Fundry Admin Centre</h1>
              <p className="text-sm text-gray-600">Platform oversight and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-fundry-navy text-white">
              Admin: {adminUser.firstName} {adminUser.lastName}
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-2">
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "overview" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button 
              variant={activeTab === "users" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "users" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button 
              variant={activeTab === "founders" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "founders" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("founders")}
            >
              <User className="w-4 h-4 mr-2" />
              Founder Management
            </Button>
            <Button 
              variant={activeTab === "investors" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "investors" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("investors")}
            >
              <Users className="w-4 h-4 mr-2" />
              Investor Management
            </Button>
            <Link href="/admin/investor-outreach">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
              >
                <Send className="w-4 h-4 mr-2" />
                Investor Outreach
              </Button>
            </Link>
            <Button 
              variant={activeTab === "campaigns" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "campaigns" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("campaigns")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Campaign Oversight
            </Button>
            <Link href="/admin-kyc-management">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-700 hover:bg-gray-100"
              >
                <Shield className="w-4 h-4 mr-2" />
                KYC Management
              </Button>
            </Link>
            <Button 
              variant={activeTab === "transactions" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "transactions" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("transactions")}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Transactions & Withdrawals
            </Button>
            <Button 
              variant={activeTab === "safes" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "safes" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("safes")}
            >
              <FileText className="w-4 h-4 mr-2" />
              SAFE Agreements
            </Button>
            <Button 
              variant={activeTab === "message-center" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "message-center" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("message-center")}
            >
              <Send className="w-4 h-4 mr-2" />
              Message Center
            </Button>
            <Button 
              variant={activeTab === "content" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "content" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("content")}
            >
              <Bell className="w-4 h-4 mr-2" />
              Content & Announcements
            </Button>
            <Button 
              variant={activeTab === "reports" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "reports" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Reports & Analytics
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className={`w-full justify-start ${activeTab === "settings" ? "bg-fundry-orange text-white hover:bg-orange-600" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-fundry-navy">Dashboard Overview</h2>
                <p className="text-gray-600">Real-time platform statistics and activity</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-fundry-orange">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Total Campaigns</CardTitle>
                    <TrendingUp className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">{stats?.totalCampaigns || 0}</div>
                    <p className="text-xs text-gray-600">
                      {stats?.activeCampaigns || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-navy">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Total Funds Raised</CardTitle>
                    <DollarSign className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {formatCurrency(stats?.totalFundsRaised || 0)}
                    </div>
                    <p className="text-xs text-gray-600">
                      Across all campaigns
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-orange">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Platform Users</CardTitle>
                    <Users className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {(stats?.totalFounders || 0) + (stats?.totalInvestors || 0)}
                    </div>
                    <p className="text-xs text-gray-600">
                      {stats?.totalFounders || 0} founders, {stats?.totalInvestors || 0} investors
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-navy">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">SAFE Agreements</CardTitle>
                    <FileText className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">{stats?.totalSafes || 0}</div>
                    <p className="text-xs text-gray-600">
                      Generated agreements
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-l-4 border-l-fundry-orange">
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Recent Admin Activity</CardTitle>
                  <CardDescription className="text-gray-600">Latest administrative actions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    ) : stats?.recentActivity?.length ? (
                      stats.recentActivity.map((activity) => {
                        const getActivityIcon = (action: string) => {
                          switch (action) {
                            case 'Dashboard Access':
                              return <Activity className="w-4 h-4 text-fundry-orange" />;
                            case 'User Management':
                              return <Users className="w-4 h-4 text-fundry-navy" />;
                            case 'System Monitoring':
                              return <TrendingUp className="w-4 h-4 text-fundry-orange" />;
                            case 'Data Fix':
                              return <Settings className="w-4 h-4 text-fundry-navy" />;
                            case 'Email Configuration':
                              return <Mail className="w-4 h-4 text-fundry-orange" />;
                            case 'Security Review':
                              return <Shield className="w-4 h-4 text-fundry-navy" />;
                            default:
                              return <Activity className="w-4 h-4 text-gray-500" />;
                          }
                        };

                        return (
                          <div key={activity.id} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex-shrink-0 mt-1">
                              {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{activity.action}</p>
                                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {new Date(activity.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                              <p className="text-xs text-gray-500 mt-1">by {activity.adminName}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "founders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-fundry-navy">Founder Management</h2>
                <p className="text-gray-600">Manage all founder accounts, KYC status, and campaigns</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-fundry-orange">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Total Founders</CardTitle>
                    <User className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">{stats?.totalFounders || 0}</div>
                    <p className="text-xs text-gray-600">
                      Registered founder accounts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-navy">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Active Campaigns</CardTitle>
                    <TrendingUp className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">{stats?.activeCampaigns || 0}</div>
                    <p className="text-xs text-gray-600">
                      Currently fundraising
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-orange">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">KYC Verified</CardTitle>
                    <CheckCircle className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {users?.filter(user => user.userType === 'founder').length || 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      Verified founders
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-fundry-navy">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Pending Approvals</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">0</div>
                    <p className="text-xs text-gray-600">
                      Awaiting review
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-l-4 border-l-fundry-orange">
                <CardHeader>
                  <CardTitle className="text-fundry-navy">All Founders</CardTitle>
                  <CardDescription className="text-gray-600">Manage founder accounts and their startups</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users && users.filter(user => user.userType === 'founder').length > 0 ? 
                        users.filter(user => user.userType === 'founder').map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center space-x-3">
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <Badge variant="default">Founder</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={user.isEmailVerified ? "default" : "destructive"}>
                                {user.isEmailVerified ? "Verified" : "Unverified"}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              {user.country && (
                                <span className="text-sm text-gray-500">
                                  Location: {user.country}
                                </span>
                              )}
                              <span className="text-sm font-medium text-fundry-navy">
                                Campaigns: {campaigns?.filter(c => c.id && user.id).length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View KYC
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResetPassword(user)}
                              disabled={resetPasswordMutation.isPending}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <Key className="w-4 h-4 mr-1" />
                              Reset Password
                            </Button>
                            {!user.isEmailVerified && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSendVerification(user)}
                                disabled={sendVerificationMutation.isPending}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Send Verification
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendNotification(user)}
                              disabled={sendNotificationMutation.isPending}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                            >
                              <Bell className="w-4 h-4 mr-1" />
                              Notify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleSuspendUser(user)}
                              disabled={user.status === "suspended"}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {user.status === "suspended" ? "Suspended" : "Suspend"}
                            </Button>
                          </div>
                        </div>
                      )) : <p className="text-gray-500 text-center py-4">No founders found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "investors" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Investor Management</h2>
                <p className="text-gray-600">Manage all investor accounts and investment history</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalInvestors || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Registered investor accounts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed')
                        .map((inv: Investment) => inv.investorId)
                        .filter((id, index, array) => array.indexOf(id) === index).length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Have made investments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        investments?.filter((inv: Investment) => inv.paymentStatus === 'completed')
                          .reduce((sum: number, inv: Investment) => sum + parseFloat(inv.amount), 0) || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total investment volume
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flagged Accounts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Investors</CardTitle>
                  <CardDescription>Manage investor accounts and investment history</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.filter(user => user.userType === 'investor').map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={user.isEmailVerified ? "default" : "destructive"}>
                                {user.isEmailVerified ? "Verified" : "Unverified"}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Investments: {investments?.filter((inv: Investment) => 
                                  inv.investorId === user.id && inv.paymentStatus === 'completed'
                                ).length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View History
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendNotification(user)}
                              disabled={sendNotificationMutation.isPending}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                            >
                              <Bell className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleSuspendUser(user)}
                              disabled={user.status === "suspended"}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {user.status === "suspended" ? "Suspended" : "Suspend"}
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No investors found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage all platform users, founders, and investors</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(stats?.totalFounders || 0) + (stats?.totalInvestors || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total registered users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Founders</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats?.totalFounders || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Startup founders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investors</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats?.totalInvestors || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active investors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {users?.filter(user => user.isEmailVerified).length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email verified
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Platform Users</CardTitle>
                  <CardDescription>Complete user management for founders and investors</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center space-x-3">
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <Badge variant={user.userType === 'founder' ? 'default' : 'secondary'}>
                                {user.userType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={user.isEmailVerified ? "default" : "destructive"}>
                                {user.isEmailVerified ? "Verified" : "Unverified"}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              {user.country && (
                                <span className="text-sm text-gray-500">
                                  Location: {user.country}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResetPassword(user)}
                              disabled={resetPasswordMutation.isPending}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <Key className="w-4 h-4 mr-1" />
                              Reset Password
                            </Button>
                            {!user.isEmailVerified && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSendVerification(user)}
                                disabled={sendVerificationMutation.isPending}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Send Verification
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendNotification(user)}
                              disabled={sendNotificationMutation.isPending}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                            >
                              <Bell className="w-4 h-4 mr-1" />
                              Notify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleSuspendUser(user)}
                              disabled={user.status === "suspended"}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {user.status === "suspended" ? "Suspended" : "Suspend"}
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No users found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage founders and investors on the platform</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Platform user accounts and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={user.userType === "founder" ? "default" : "secondary"}>
                                  {user.userType}
                                </Badge>
                                <Badge variant={user.isEmailVerified ? "default" : "destructive"}>
                                  {user.isEmailVerified ? "Verified" : "Unverified"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResetPassword(user)}
                              disabled={resetPasswordMutation.isPending}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <Key className="w-4 h-4 mr-1" />
                              {resetPasswordMutation.isPending ? "Sending..." : "Reset Password"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendVerification(user)}
                              disabled={sendVerificationMutation.isPending || user.isEmailVerified}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              {sendVerificationMutation.isPending ? "Sending..." : user.isEmailVerified ? "Verified" : "Send Verification"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendNotification(user)}
                              disabled={sendNotificationMutation.isPending}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                            >
                              <Bell className="w-4 h-4 mr-1" />
                              {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleSuspendUser(user)}
                              disabled={user.status === "suspended"}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {user.status === "suspended" ? "Suspended" : "Suspend"}
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No users found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Campaign Oversight</h2>
                <p className="text-gray-600">Monitor and manage all fundraising campaigns</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Campaigns</CardTitle>
                  <CardDescription>Active and completed fundraising campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  {campaignsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns?.map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{campaign.companyName}</p>
                            <p className="text-sm text-gray-600">by {campaign.founderName}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">
                                Goal: {formatCurrency(campaign.fundingGoal)}
                              </span>
                              <span className="text-sm">
                                Raised: {formatCurrency(campaign.amountRaised)}
                              </span>
                              <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                                {campaign.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewCampaign(campaign)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditCampaign(campaign)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handlePauseCampaign(campaign)}
                              disabled={campaign.status === "paused"}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              {campaign.status === "paused" ? "Paused" : "Pause"}
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No campaigns found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Transactions & Withdrawals</h2>
                <p className="text-gray-600">Manage all transactions, payments, and withdrawal requests</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        investments?.filter((inv: Investment) => inv.paymentStatus === 'completed')
                          .reduce((sum: number, inv: Investment) => sum + parseFloat(inv.amount), 0) || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total transaction volume
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Transactions</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Successfully processed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {investments?.filter((inv: Investment) => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting payment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Withdrawal Requests</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats?.pendingWithdrawals || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Pending approval
                    </p>
                  </CardContent>
                </Card>
              </div>



              {/* Withdrawal Settings */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Withdrawal Settings
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Configure minimum withdrawal amounts and campaign requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-withdrawal">Minimum Withdrawal Amount ($)</Label>
                      <Input
                        id="min-withdrawal"
                        type="number"
                        step="1"
                        min="0"
                        value={withdrawalSettings?.minimumWithdrawal || 25}
                        onChange={(e) => setWithdrawalSettings({
                          ...withdrawalSettings,
                          minimumWithdrawal: parseFloat(e.target.value)
                        })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Minimum amount founders can withdraw</p>
                    </div>
                    <div>
                      <Label htmlFor="min-goal-percentage">Minimum Goal Achievement (%)</Label>
                      <Input
                        id="min-goal-percentage"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={withdrawalSettings?.minimumGoalPercentage || 20}
                        onChange={(e) => setWithdrawalSettings({
                          ...withdrawalSettings,
                          minimumGoalPercentage: parseFloat(e.target.value)
                        })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Required % of funding goal to enable withdrawals</p>
                    </div>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        setIsUpdatingSettings(true);
                        const response = await fetch('/api/admin/withdrawal-settings', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            minimumWithdrawal: withdrawalSettings?.minimumWithdrawal || 25,
                            minimumGoalPercentage: withdrawalSettings?.minimumGoalPercentage || 20
                          }),
                        });
                        
                        if (response.ok) {
                          const savedData = await response.json();
                          toast({
                            title: "Settings Saved",
                            description: "Withdrawal settings have been updated successfully.",
                          });
                          // Invalidate the withdrawal settings query to refetch updated data
                          queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawal-settings'] });
                          // Also invalidate withdrawals to update any dependent calculations
                          queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
                        } else {
                          throw new Error('Failed to save settings');
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to save withdrawal settings. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsUpdatingSettings(false);
                      }
                    }}
                    disabled={isUpdatingSettings}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdatingSettings ? 'Saving...' : 'Save Withdrawal Settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Transactions and Withdrawal Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Recent Transactions
                    </CardTitle>
                    <CardDescription>Latest completed investment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investments && investments.filter((inv: Investment) => inv.paymentStatus === 'completed').length > 0 ? 
                        investments.filter((inv: Investment) => inv.paymentStatus === 'completed').slice(0, 5).map((investment: Investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {investment.investor?.firstName} {investment.investor?.lastName} 
                                {!investment.investor && investment.investorName && investment.investorName}
                                {!investment.investor && !investment.investorName && `Investor #${investment.investorId}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {investment.campaign?.companyName || investment.campaign?.title || `Campaign #${investment.campaignId}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(investment.createdAt).toLocaleDateString()} at {new Date(investment.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(parseFloat(investment.amount))}</p>
                            <Badge className="bg-green-100 text-green-800">completed</Badge>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No completed transactions yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ArrowUpCircle className="w-5 h-5 mr-2 text-orange-600" />
                      Withdrawal Requests
                    </CardTitle>
                    <CardDescription>Pending founder withdrawal requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {withdrawals && withdrawals.length > 0 ? 
                        withdrawals.slice(0, 3).map((withdrawal: any) => (
                        <div key={withdrawal.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{withdrawal.founderName}</h3>
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  {withdrawal.status}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(withdrawal.amount)}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <ArrowUpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No withdrawal requests found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    Pending Transactions
                  </CardTitle>
                  <CardDescription>Investment commitments awaiting payment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investments?.filter((inv: Investment) => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing').length > 0 ? 
                      investments.filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing').map((investment: Investment) => (
                      <div key={investment.id} className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-orange-900">
                                {investment.investor?.firstName} {investment.investor?.lastName} 
                                {!investment.investor && investment.investorName && investment.investorName}
                                {!investment.investor && !investment.investorName && `Investor #${investment.investorId}`}
                              </h3>
                              <span className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full">
                                {investment.status}
                              </span>
                            </div>
                            <p className="text-sm text-orange-700">
                              Campaign: {investment.campaign?.companyName || investment.campaign?.title || `Campaign #${investment.campaignId}`}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-orange-600 font-medium">Investment Amount</p>
                                <p className="text-lg font-bold text-orange-900">{formatCurrency(parseFloat(investment.amount))}</p>
                              </div>
                              <div>
                                <p className="text-xs text-orange-600 font-medium">Payment Status</p>
                                <Badge variant="secondary" className="bg-orange-200 text-orange-800 border-orange-300">
                                  {investment.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-orange-600">
                              Committed: {new Date(investment.createdAt).toLocaleDateString()} at {new Date(investment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-200">
                          <div className="flex items-center space-x-2 text-xs text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span>Pending for {Math.ceil((Date.now() - new Date(investment.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-300 text-orange-700 hover:bg-orange-100"
                              onClick={() => handleViewInvestmentDetails(investment)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-300 text-orange-700 hover:bg-orange-100"
                              onClick={() => handleSendReminder(investment)}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                        <p className="text-xl font-medium mb-2">No pending transactions</p>
                        <p className="text-sm">All investments have been processed</p>
                        <p className="text-xs text-gray-400 mt-2">When investors commit to investments, they will appear here until payment is completed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "message-center" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Message Center</h2>
                <p className="text-gray-600">Send in-app messages to founders and investors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="w-5 h-5 mr-2 text-orange-600" />
                    Compose Message
                  </CardTitle>
                  <CardDescription>Send targeted messages to platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Message Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recipients</label>
                        <select 
                          className="w-full p-3 border rounded-lg bg-white"
                          value={messageForm.recipientType}
                          onChange={(e) => setMessageForm({...messageForm, recipientType: e.target.value})}
                        >
                          <option value="all">All Users</option>
                          <option value="founders">All Founders</option>
                          <option value="investors">All Investors</option>
                          <option value="specific">Specific Users</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select 
                          className="w-full p-3 border rounded-lg bg-white"
                          value={messageForm.priority}
                          onChange={(e) => setMessageForm({...messageForm, priority: e.target.value})}
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    {/* Specific Users Selection */}
                    {messageForm.recipientType === "specific" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Search Users</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by name or email..."
                              className="w-full pl-10 p-3 border rounded-lg"
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                          </div>
                          
                          {/* Search Results */}
                          {userSearchQuery && filteredUsers && filteredUsers.length > 0 && (
                            <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
                              {filteredUsers.slice(0, 10).map((user: User) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                  onClick={() => handleAddSpecificUser(user)}
                                >
                                  <div>
                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-gray-500">{user.email} • {user.userType}</p>
                                  </div>
                                  <Button size="sm" variant="outline">Add</Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected Users */}
                        {selectedSpecificUsers.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Selected Recipients ({selectedSpecificUsers.length})</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedSpecificUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  <span>{user.firstName} {user.lastName}</span>
                                  <button
                                    onClick={() => handleRemoveSpecificUser(user.id)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message Category</label>
                      <select 
                        className="w-full p-3 border rounded-lg bg-white"
                        value={messageForm.category}
                        onChange={(e) => setMessageForm({...messageForm, category: e.target.value})}
                      >
                        <option value="general">General</option>
                        <option value="announcement">Announcement</option>
                        <option value="update">Platform Update</option>
                        <option value="reminder">Reminder</option>
                        <option value="security">Security Notice</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message Title</label>
                      <input 
                        type="text" 
                        placeholder="Enter message title..."
                        className="w-full p-3 border rounded-lg"
                        value={messageForm.title}
                        onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message Content</label>
                      <textarea 
                        placeholder="Enter your message content..."
                        rows={6}
                        className="w-full p-3 border rounded-lg resize-none"
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={messageForm.scheduleEnabled}
                            onChange={(e) => setMessageForm({...messageForm, scheduleEnabled: e.target.checked})}
                          />
                          <span className="text-sm">Schedule for later</span>
                        </label>
                        {messageForm.scheduleEnabled && (
                          <input 
                            type="datetime-local" 
                            className="p-2 border rounded-lg text-sm"
                            value={messageForm.scheduledFor}
                            onChange={(e) => setMessageForm({...messageForm, scheduledFor: e.target.value})}
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button variant="outline">
                          Save Draft
                        </Button>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={handleSendMessage}
                          disabled={sendingMessage}
                        >
                          {sendingMessage ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {sendingMessage ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Messages
                  </CardTitle>
                  <CardDescription>Previously sent messages and drafts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.slice(0, 10).map((message: any) => (
                        <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                message.priority === 'urgent' ? 'bg-red-500' : 
                                message.priority === 'high' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              <h4 className="font-medium">{message.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                message.category === 'announcement' ? 'bg-blue-100 text-blue-800' :
                                message.category === 'update' ? 'bg-purple-100 text-purple-800' :
                                message.category === 'security' ? 'bg-red-100 text-red-800' :
                                message.category === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Sent to {message.recipientType === 'all' ? 'All Users' : 
                                      message.recipientType === 'founders' ? 'All Founders' : 
                                      message.recipientType === 'investors' ? 'All Investors' : 
                                      'Specific Users'} • {new Date(message.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No messages sent yet</p>
                        <p className="text-sm text-gray-400">Start by composing your first message above</p>
                      </div>
                    )}
                  </div>

                  {messages && messages.length > 10 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline">
                        Load More Messages
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages Sent Today</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {messageStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{messageStats?.messagesToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {messageStats?.messagesToday && messageStats?.messagesYesterday ? 
                            `${messageStats.messagesToday > messageStats.messagesYesterday ? '+' : ''}${messageStats.messagesToday - messageStats.messagesYesterday} from yesterday` :
                            'No change from yesterday'
                          }
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {messageStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{messageStats?.totalRecipients || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Across all user types
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled Messages</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {messageStatsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{messageStats?.scheduledMessages || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Pending delivery
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Content Management & Announcements</h2>
                <p className="text-gray-600">Manage platform content, announcements, and featured campaigns</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Global Announcements</CardTitle>
                    <CardDescription>Post updates visible to all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Announcement Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter announcement title..."
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea 
                          placeholder="Enter announcement message..."
                          rows={4}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <select className="p-2 border rounded-lg">
                          <option>Info</option>
                          <option>Warning</option>
                          <option>Success</option>
                          <option>Error</option>
                        </select>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Bell className="w-4 h-4 mr-2" />
                          Post Announcement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Featured Campaigns</CardTitle>
                    <CardDescription>Promote campaigns on homepage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns?.slice(0, 3).map((campaign: Campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{campaign.companyName}</p>
                            <p className="text-sm text-gray-600">{campaign.founderName}</p>
                            <p className="text-xs text-gray-500">
                              Goal: {campaign.fundingGoal}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Star className="w-4 h-4 mr-1" />
                              Feature
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No campaigns available</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation</CardTitle>
                  <CardDescription>Review and moderate user-generated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium">Campaign Updates</h3>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-gray-500">Pending review</p>
                      <Button size="sm" className="mt-2" variant="outline">Review</Button>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium">User Comments</h3>
                      <p className="text-2xl font-bold text-orange-600">0</p>
                      <p className="text-sm text-gray-500">Flagged content</p>
                      <Button size="sm" className="mt-2" variant="outline">Review</Button>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium">Success Stories</h3>
                      <p className="text-2xl font-bold text-green-600">4</p>
                      <p className="text-sm text-gray-500">Published</p>
                      <Button size="sm" className="mt-2" variant="outline">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Transactions & Withdrawals</h2>
                <p className="text-gray-600">Configure withdrawal settings and manage transactions</p>
              </div>

              {/* Withdrawal Settings */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Withdrawal Settings
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Configure minimum withdrawal amounts and campaign requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-withdrawal">Minimum Withdrawal Amount ($)</Label>
                      <Input
                        id="min-withdrawal"
                        type="number"
                        step="1"
                        min="0"
                        value={platformSettings.minimumWithdrawal || 25}
                        onChange={(e) => setPlatformSettings({
                          ...platformSettings,
                          minimumWithdrawal: parseFloat(e.target.value)
                        })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Minimum amount founders can withdraw</p>
                    </div>
                    <div>
                      <Label htmlFor="min-goal-percentage">Minimum Goal Achievement (%)</Label>
                      <Input
                        id="min-goal-percentage"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={platformSettings.minimumGoalPercentage || 20}
                        onChange={(e) => setPlatformSettings({
                          ...platformSettings,
                          minimumGoalPercentage: parseFloat(e.target.value)
                        })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Required % of funding goal to enable withdrawals</p>
                    </div>
                  </div>
                  <Button 
                    onClick={async () => {
                      // Save minimum withdrawal amount
                      await updatePlatformSettingMutation.mutateAsync({
                        settingKey: 'minimumWithdrawal',
                        settingValue: String(platformSettings.minimumWithdrawal || 25)
                      });
                      
                      // Save minimum goal percentage
                      await updatePlatformSettingMutation.mutateAsync({
                        settingKey: 'minimumGoalPercentage',
                        settingValue: String(platformSettings.minimumGoalPercentage || 20)
                      });
                    }}
                    disabled={updatePlatformSettingMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePlatformSettingMutation.isPending ? 'Saving...' : 'Save Withdrawal Settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Transactions and Withdrawal Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Recent Transactions
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Latest completed investment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {investmentsLoading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-green-200 rounded"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed').slice(0, 5).map((investment: Investment) => (
                          <div key={investment.id} className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-green-800">{investment.campaign?.title || 'Unknown Campaign'}</p>
                                <p className="text-sm text-green-600">Campaign #{investment.campaignId}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(investment.createdAt).toLocaleDateString()} at {new Date(investment.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-700">${investment.amount}</p>
                                <Badge className="bg-green-600 text-white text-xs">completed</Badge>
                              </div>
                            </div>
                          </div>
                        )) || <p className="text-green-600 text-center py-8">No completed transactions yet</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Withdrawal Requests */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Withdrawal Requests
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      Pending founder withdrawal requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {withdrawalsLoading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-orange-200 rounded"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {withdrawals && withdrawals.filter((w: any) => w.status === 'pending').length > 0 ? (
                          withdrawals.filter((w: any) => w.status === 'pending').map((withdrawal: any) => (
                            <div key={withdrawal.id} className="bg-white rounded-lg p-4 border border-orange-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-orange-800">{withdrawal.founderName}</p>
                                  <p className="text-sm text-orange-600">
                                    Requested: {formatCurrency(withdrawal.amount)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(withdrawal.requestedAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="default">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="h-8 w-8 text-orange-400" />
                            </div>
                            <p className="text-orange-600 font-medium">No withdrawal requests found</p>
                            <p className="text-orange-500 text-sm">All withdrawal requests are up to date</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pending Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Pending Transactions</CardTitle>
                  <CardDescription>Investment commitments awaiting payment processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {investments && investments.filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing').length > 0 ? 
                      investments.filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing').map((investment: Investment) => (
                      <div key={investment.id} className="border-2 border-orange-200 rounded-lg bg-orange-50 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-lg text-orange-900">
                                {investment.investor?.firstName} {investment.investor?.lastName} 
                                {!investment.investor && investment.investorName && investment.investorName}
                                {!investment.investor && !investment.investorName && `Investor #${investment.investorId}`}
                              </h3>
                              <Badge variant="secondary" className="bg-orange-200 text-orange-800 border-orange-300">
                                {investment.paymentStatus.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-orange-700 font-medium mb-1">
                              Campaign: {investment.campaign?.companyName || investment.campaign?.title || `Campaign #${investment.campaignId}`}
                            </p>
                            <p className="text-xs text-orange-600">
                              Investment ID: #{investment.id} | Commitment Date: {new Date(investment.createdAt).toLocaleDateString()} at {new Date(investment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-800 text-2xl">{formatCurrency(parseFloat(investment.amount))}</p>
                            <p className="text-xs text-orange-600 mt-1">Investment Amount</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-orange-200">
                          <div className="bg-white/50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-orange-800 uppercase tracking-wide">Investor Details</p>
                            <p className="text-sm text-orange-900 mt-1">
                              Email: {investment.investor?.email || 'Not available'}
                            </p>
                            <p className="text-sm text-orange-900">
                              Type: Individual Investor
                            </p>
                          </div>
                          
                          <div className="bg-white/50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-orange-800 uppercase tracking-wide">Investment Status</p>
                            <p className="text-sm text-orange-900 mt-1">
                              Status: {investment.status || 'Committed'}
                            </p>
                            <p className="text-sm text-orange-900">
                              Payment: {investment.paymentStatus}
                            </p>
                          </div>
                          
                          <div className="bg-white/50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-orange-800 uppercase tracking-wide">Action Required</p>
                            <p className="text-sm text-orange-900 mt-1">
                              Payment Processing
                            </p>
                            <p className="text-xs text-orange-600">
                              Awaiting investor payment completion
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-200">
                          <div className="flex items-center space-x-2 text-xs text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span>Pending for {Math.ceil((Date.now() - new Date(investment.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-300 text-orange-700 hover:bg-orange-100"
                              onClick={() => handleViewInvestmentDetails(investment)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-300 text-orange-700 hover:bg-orange-100"
                              onClick={() => handleSendReminder(investment)}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                        <p className="text-xl font-medium mb-2">No pending transactions</p>
                        <p className="text-sm">All investments have been processed</p>
                        <p className="text-xs text-gray-400 mt-2">When investors commit to investments, they will appear here until payment is completed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Requests</CardTitle>
                  <CardDescription>Pending and processed withdrawal requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {withdrawalsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {withdrawals?.map((withdrawal) => (
                        <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{withdrawal.founderName}</p>
                            <p className="text-sm text-gray-600">
                              Requested: {formatCurrency(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(withdrawal.requestedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={withdrawal.status === "pending" ? "secondary" : "default"}>
                              {withdrawal.status}
                            </Badge>
                            {withdrawal.status === "pending" && (
                              <>
                                <Button size="sm" variant="default">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-4">No withdrawal requests</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "safes" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">SAFE Agreement Management</h2>
                <p className="text-gray-600">Monitor and manage all SAFE agreements on the platform</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total SAFE Agreements</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalSafes || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Generated agreements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paid investments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investment Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        investments?.filter((inv: Investment) => inv.paymentStatus === 'completed')
                          .reduce((sum: number, inv: Investment) => sum + parseFloat(inv.amount), 0) || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In SAFE agreements
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>SAFE Agreement Records</CardTitle>
                  <CardDescription>All investment agreements and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {investmentsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed').map((investment: Investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {investment.investorName || `${investment.investor?.firstName} ${investment.investor?.lastName}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  invested in {investment.campaign?.title || investment.campaign?.companyName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 mt-2">
                              <span className="text-sm font-medium text-green-600">
                                Amount: {formatCurrency(investment.amount)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Date: {new Date(investment.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {investment.paymentStatus === 'completed' ? 'Active SAFE' : investment.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Download SAFE agreement
                                const link = document.createElement('a');
                                link.href = `/api/investments/${investment.id}/safe-agreement`;
                                link.download = `SAFE_Agreement_${investment.campaign?.title?.replace(/\s+/g, '_')}_${investment.id}.txt`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`/campaign/${investment.campaignId}`, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Campaign
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-8">No SAFE agreements found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SAFE Agreement Template</CardTitle>
                  <CardDescription>Standard template used for all investments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="text-blue-600 mt-1" size={20} />
                        <div>
                          <h4 className="font-medium text-blue-900">Standard SAFE Template</h4>
                          <p className="text-blue-800 text-sm mt-1">
                            All investments use the Y Combinator SAFE template with valuation cap and discount rate.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline"
                        onClick={() => window.open('/safe-agreement-template', '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Template
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Download template
                          const link = document.createElement('a');
                          link.href = '/safe-agreement-template';
                          link.target = '_blank';
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Platform Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-gray-600">Configure platform-wide settings and policies</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Platform Fees */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Platform Fees
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      Configure tiered platform fees based on campaign goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-4">
                      {/* Fee Tier 1: Below $1,000 */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <label className="font-medium text-green-800">Tier 1: Small Campaigns</label>
                            <p className="text-sm text-green-700">Campaigns below $1,000</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              className="w-20 text-center border-green-300"
                              value={platformSettings?.fee_tier_1_percentage?.value || '0'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.fee_tier_1_percentage) newSettings.fee_tier_1_percentage = {};
                                newSettings.fee_tier_1_percentage.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                            <span className="text-green-700 font-medium">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-600">Maximum campaign goal:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-700">$</span>
                            <Input
                              type="number"
                              className="w-24 text-center text-sm border-green-300"
                              value={platformSettings?.fee_tier_1_max?.value || '1000'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.fee_tier_1_max) newSettings.fee_tier_1_max = {};
                                newSettings.fee_tier_1_max.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              min="100"
                              max="5000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fee Tier 2: $1,000 - $100,000 */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <label className="font-medium text-blue-800">Tier 2: Medium to Large Campaigns</label>
                            <p className="text-sm text-blue-700">Campaigns $1,000 - $100,000 (Platform Maximum)</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              className="w-20 text-center border-blue-300"
                              value={platformSettings?.fee_tier_2_percentage?.value || '3'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.fee_tier_2_percentage) newSettings.fee_tier_2_percentage = {};
                                newSettings.fee_tier_2_percentage.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                            <span className="text-blue-700 font-medium">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-600">Maximum campaign goal:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-700">$</span>
                            <Input
                              type="number"
                              className="w-24 text-center text-sm border-blue-300"
                              value={platformSettings?.fee_tier_2_max?.value || '100000'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.fee_tier_2_max) newSettings.fee_tier_2_max = {};
                                newSettings.fee_tier_2_max.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              min="1000"
                              max="100000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Maximum Campaign Goal Alert */}
                      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">!</span>
                          </div>
                          <div>
                            <label className="font-medium text-red-800">Platform Maximum Enforced</label>
                            <p className="text-sm text-red-700">No campaigns can exceed $100,000 funding goal</p>
                          </div>
                        </div>
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          This limit is enforced across all campaign creation and editing interfaces to maintain platform focus on micro-investment opportunities.
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                        <div>
                          <label className="font-medium text-gray-800">Minimum Investment</label>
                          <p className="text-sm text-gray-600">Minimum amount per investment</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">$</span>
                          <Input
                            type="number"
                            className="w-24 text-center"
                            value={platformSettings?.minimum_investment?.value || '25'}
                            onChange={(e) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.minimum_investment) newSettings.minimum_investment = {};
                              newSettings.minimum_investment.value = e.target.value;
                              setPlatformSettings(newSettings);
                            }}
                            min="1"
                            max="1000"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                        <div>
                          <label className="font-medium text-gray-800">Maximum Campaign Goal</label>
                          <p className="text-sm text-gray-600">Maximum funding goal per campaign</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">$</span>
                          <Input
                            type="number"
                            className="w-32 text-center"
                            value={platformSettings?.maximum_investment?.value || '100000'}
                            onChange={(e) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.maximum_investment) newSettings.maximum_investment = {};
                              newSettings.maximum_investment.value = e.target.value;
                              setPlatformSettings(newSettings);
                            }}
                            min="1000"
                            max="100000"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setIsUpdatingSettings(true);
                        Promise.all([
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'fee_tier_1_percentage',
                            settingValue: platformSettings?.fee_tier_1_percentage?.value || '0'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'fee_tier_1_max',
                            settingValue: platformSettings?.fee_tier_1_max?.value || '1000'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'fee_tier_2_percentage',
                            settingValue: platformSettings?.fee_tier_2_percentage?.value || '3'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'fee_tier_2_max',
                            settingValue: platformSettings?.fee_tier_2_max?.value || '100000'
                          }),

                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'minimum_investment',
                            settingValue: platformSettings?.minimum_investment?.value || '25'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'maximum_investment',
                            settingValue: platformSettings?.maximum_investment?.value || '100000'
                          })
                        ]).then(() => {
                          setIsUpdatingSettings(false);
                        }).catch(() => {
                          setIsUpdatingSettings(false);
                        });
                      }}
                      disabled={isUpdatingSettings}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {isUpdatingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Tiered Fee Settings
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* KYC Management */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      KYC Management
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Know Your Customer verification requirements by campaign threshold
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-6">
                      {/* KYC Tier 1 */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <h4 className="text-lg font-semibold text-green-800 mb-3">Tier 1 KYC (Campaigns &lt; $1,000)</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">KYC Required</label>
                              <p className="text-sm text-gray-600">Require identity verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_1_required?.value || 'false'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_1_required) newSettings.kyc_tier_1_required = {};
                                newSettings.kyc_tier_1_required.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Investment Threshold</label>
                              <p className="text-sm text-gray-600">Minimum investment requiring KYC</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">$</span>
                              <Input
                                type="number"
                                className="w-24 text-center border-green-300"
                                value={platformSettings?.kyc_tier_1_threshold?.value || '500'}
                                onChange={(e) => {
                                  const newSettings = { ...platformSettings };
                                  if (!newSettings.kyc_tier_1_threshold) newSettings.kyc_tier_1_threshold = {};
                                  newSettings.kyc_tier_1_threshold.value = e.target.value;
                                  setPlatformSettings(newSettings);
                                }}
                                min="0"
                                max="1000"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Document Types Required</label>
                              <p className="text-sm text-gray-600">Documents needed for verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_1_document_types?.value || 'basic'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_1_document_types) newSettings.kyc_tier_1_document_types = {};
                                newSettings.kyc_tier_1_document_types.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None Required</SelectItem>
                                <SelectItem value="basic">Basic (ID Only)</SelectItem>
                                <SelectItem value="standard">Standard (ID + Utility)</SelectItem>
                                <SelectItem value="enhanced">Enhanced (Full Suite)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* KYC Tier 2 */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <h4 className="text-lg font-semibold text-blue-800 mb-3">Tier 2 KYC (Campaigns $1,000 - $50,000)</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">KYC Required</label>
                              <p className="text-sm text-gray-600">Require identity verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_2_required?.value || 'true'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_2_required) newSettings.kyc_tier_2_required = {};
                                newSettings.kyc_tier_2_required.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Investment Threshold</label>
                              <p className="text-sm text-gray-600">Minimum investment requiring KYC</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">$</span>
                              <Input
                                type="number"
                                className="w-24 text-center border-blue-300"
                                value={platformSettings?.kyc_tier_2_threshold?.value || '250'}
                                onChange={(e) => {
                                  const newSettings = { ...platformSettings };
                                  if (!newSettings.kyc_tier_2_threshold) newSettings.kyc_tier_2_threshold = {};
                                  newSettings.kyc_tier_2_threshold.value = e.target.value;
                                  setPlatformSettings(newSettings);
                                }}
                                min="0"
                                max="10000"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Document Types Required</label>
                              <p className="text-sm text-gray-600">Documents needed for verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_2_document_types?.value || 'standard'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_2_document_types) newSettings.kyc_tier_2_document_types = {};
                                newSettings.kyc_tier_2_document_types.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None Required</SelectItem>
                                <SelectItem value="basic">Basic (ID Only)</SelectItem>
                                <SelectItem value="standard">Standard (ID + Utility)</SelectItem>
                                <SelectItem value="enhanced">Enhanced (Full Suite)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* KYC Tier 3 */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <h4 className="text-lg font-semibold text-purple-800 mb-3">Tier 3 KYC (Campaigns &gt; $50,000)</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">KYC Required</label>
                              <p className="text-sm text-gray-600">Require identity verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_3_required?.value || 'true'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_3_required) newSettings.kyc_tier_3_required = {};
                                newSettings.kyc_tier_3_required.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Investment Threshold</label>
                              <p className="text-sm text-gray-600">Minimum investment requiring KYC</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">$</span>
                              <Input
                                type="number"
                                className="w-24 text-center border-purple-300"
                                value={platformSettings?.kyc_tier_3_threshold?.value || '100'}
                                onChange={(e) => {
                                  const newSettings = { ...platformSettings };
                                  if (!newSettings.kyc_tier_3_threshold) newSettings.kyc_tier_3_threshold = {};
                                  newSettings.kyc_tier_3_threshold.value = e.target.value;
                                  setPlatformSettings(newSettings);
                                }}
                                min="0"
                                max="50000"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Document Types Required</label>
                              <p className="text-sm text-gray-600">Documents needed for verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_tier_3_document_types?.value || 'enhanced'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_tier_3_document_types) newSettings.kyc_tier_3_document_types = {};
                                newSettings.kyc_tier_3_document_types.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None Required</SelectItem>
                                <SelectItem value="basic">Basic (ID Only)</SelectItem>
                                <SelectItem value="standard">Standard (ID + Utility)</SelectItem>
                                <SelectItem value="enhanced">Enhanced (Full Suite)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Global KYC Settings */}
                      <div className="p-3 bg-white rounded-lg border border-blue-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Global KYC Settings</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Auto KYC Approval</label>
                              <p className="text-sm text-gray-600">Automatically approve KYC submissions</p>
                            </div>
                            <Select
                              value={platformSettings?.auto_kyc_approval?.value || 'false'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.auto_kyc_approval) newSettings.auto_kyc_approval = {};
                                newSettings.auto_kyc_approval.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <label className="font-medium text-gray-800">Document Types Required</label>
                              <p className="text-sm text-gray-600">Required document types for verification</p>
                            </div>
                            <Select
                              value={platformSettings?.kyc_document_types?.value || 'standard'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                if (!newSettings.kyc_document_types) newSettings.kyc_document_types = {};
                                newSettings.kyc_document_types.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="enhanced">Enhanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                        <div>
                          <label className="font-medium text-gray-800">Auto KYC Approval</label>
                          <p className="text-sm text-gray-600">Automatically approve KYC submissions</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={platformSettings?.kyc_auto_approval_enabled?.value || 'false'}
                            onValueChange={(value) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.kyc_auto_approval_enabled) newSettings.kyc_auto_approval_enabled = {};
                              newSettings.kyc_auto_approval_enabled.value = value;
                              setPlatformSettings(newSettings);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setIsUpdatingSettings(true);
                        Promise.all([
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_1_required',
                            settingValue: platformSettings?.kyc_tier_1_required?.value || 'false'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_1_threshold',
                            settingValue: platformSettings?.kyc_tier_1_threshold?.value || '500'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_1_document_types',
                            settingValue: platformSettings?.kyc_tier_1_document_types?.value || 'basic'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_2_required',
                            settingValue: platformSettings?.kyc_tier_2_required?.value || 'true'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_2_threshold',
                            settingValue: platformSettings?.kyc_tier_2_threshold?.value || '250'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_2_document_types',
                            settingValue: platformSettings?.kyc_tier_2_document_types?.value || 'standard'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_3_required',
                            settingValue: platformSettings?.kyc_tier_3_required?.value || 'true'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_3_threshold',
                            settingValue: platformSettings?.kyc_tier_3_threshold?.value || '100'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_tier_3_document_types',
                            settingValue: platformSettings?.kyc_tier_3_document_types?.value || 'enhanced'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'auto_kyc_approval',
                            settingValue: platformSettings?.auto_kyc_approval?.value || 'false'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'kyc_document_types',
                            settingValue: platformSettings?.kyc_document_types?.value || 'standard'
                          })
                        ]).then(() => {
                          setIsUpdatingSettings(false);
                        }).catch(() => {
                          setIsUpdatingSettings(false);
                        });
                      }}
                      disabled={isUpdatingSettings}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdatingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Tiered KYC Settings
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* General Platform Settings */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      General Settings
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Platform maintenance and registration controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                        <div>
                          <label className="font-medium text-gray-800">New Registrations</label>
                          <p className="text-sm text-gray-600">Allow new user sign-ups</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={platformSettings?.new_registrations_enabled?.value || 'true'}
                            onValueChange={(value) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.new_registrations_enabled) newSettings.new_registrations_enabled = {};
                              newSettings.new_registrations_enabled.value = value;
                              setPlatformSettings(newSettings);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Enabled</SelectItem>
                              <SelectItem value="false">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                        <div>
                          <label className="font-medium text-gray-800">Email Verification</label>
                          <p className="text-sm text-gray-600">Require email verification for new users</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={platformSettings?.email_verification_required?.value || 'true'}
                            onValueChange={(value) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.email_verification_required) newSettings.email_verification_required = {};
                              newSettings.email_verification_required.value = value;
                              setPlatformSettings(newSettings);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Required</SelectItem>
                              <SelectItem value="false">Optional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                        <div>
                          <label className="font-medium text-gray-800">Maintenance Mode</label>
                          <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={platformSettings?.platform_maintenance_mode?.value || 'false'}
                            onValueChange={(value) => {
                              const newSettings = { ...platformSettings };
                              if (!newSettings.platform_maintenance_mode) newSettings.platform_maintenance_mode = {};
                              newSettings.platform_maintenance_mode.value = value;
                              setPlatformSettings(newSettings);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">On</SelectItem>
                              <SelectItem value="false">Off</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setIsUpdatingSettings(true);
                        Promise.all([
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'new_registrations_enabled',
                            settingValue: platformSettings?.new_registrations_enabled?.value || 'true'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'email_verification_required',
                            settingValue: platformSettings?.email_verification_required?.value || 'true'
                          }),
                          updatePlatformSettingMutation.mutateAsync({
                            settingKey: 'platform_maintenance_mode',
                            settingValue: platformSettings?.platform_maintenance_mode?.value || 'false'
                          })
                        ]).then(() => {
                          setIsUpdatingSettings(false);
                        }).catch(() => {
                          setIsUpdatingSettings(false);
                        });
                      }}
                      disabled={isUpdatingSettings}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isUpdatingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save General Settings
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Settings Summary */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Settings Summary
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Current platform configuration overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tier 1 Fee (&lt; $1,000):</span>
                        <span className="font-medium text-green-700">{platformSettings?.fee_tier_1_percentage?.value || '0'}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tier 2 Fee ($1,000 - $50,000):</span>
                        <span className="font-medium text-blue-700">{platformSettings?.fee_tier_2_percentage?.value || '3'}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tier 3 Fee (&gt; $50,000):</span>
                        <span className="font-medium text-purple-700">{platformSettings?.fee_tier_3_percentage?.value || '5'}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Investment Range:</span>
                        <span className="font-medium">
                          ${platformSettings?.minimum_investment?.value || '25'} - ${platformSettings?.maximum_investment?.value || '100,000'}
                        </span>
                      </div>
                      
                      {/* Tiered KYC Summary */}
                      <div className="border-t border-purple-200 pt-2 mt-2">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">KYC Requirements by Tier</h5>
                        <div className="space-y-1">
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-800">Tier 1 (&lt; $1,000):</span>
                                <Badge variant={platformSettings?.kyc_tier_1_required?.value === 'true' ? "default" : "secondary"} className="text-xs">
                                  {platformSettings?.kyc_tier_1_required?.value === 'true' ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-600">Threshold: ${platformSettings?.kyc_tier_1_threshold?.value || '500'}</span>
                                <span className="text-gray-600 capitalize">Docs: {platformSettings?.kyc_tier_1_document_types?.value || 'Basic'}</span>
                              </div>
                            </div>
                            
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-blue-800">Tier 2 ($1,000 - $50,000):</span>
                                <Badge variant={platformSettings?.kyc_tier_2_required?.value === 'true' ? "default" : "secondary"} className="text-xs">
                                  {platformSettings?.kyc_tier_2_required?.value === 'true' ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-600">Threshold: ${platformSettings?.kyc_tier_2_threshold?.value || '250'}</span>
                                <span className="text-gray-600 capitalize">Docs: {platformSettings?.kyc_tier_2_document_types?.value || 'Standard'}</span>
                              </div>
                            </div>
                            
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-purple-800">Tier 3 (&gt; $50,000):</span>
                                <Badge variant={platformSettings?.kyc_tier_3_required?.value === 'true' ? "default" : "secondary"} className="text-xs">
                                  {platformSettings?.kyc_tier_3_required?.value === 'true' ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-600">Threshold: ${platformSettings?.kyc_tier_3_threshold?.value || '100'}</span>
                                <span className="text-gray-600 capitalize">Docs: {platformSettings?.kyc_tier_3_document_types?.value || 'Enhanced'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Auto Approval:</span>
                            <Badge variant={platformSettings?.auto_kyc_approval?.value === 'true' ? "default" : "secondary"} className="text-xs">
                              {platformSettings?.auto_kyc_approval?.value === 'true' ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Document Types:</span>
                            <span className="font-medium text-gray-700 capitalize">{platformSettings?.kyc_document_types?.value || 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">New Registrations:</span>
                        <Badge variant={platformSettings?.new_registrations_enabled?.value === 'true' ? "default" : "secondary"}>
                          {platformSettings?.new_registrations_enabled?.value === 'true' ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Email Verification:</span>
                        <Badge variant={platformSettings?.email_verification_required?.value === 'true' ? "default" : "secondary"}>
                          {platformSettings?.email_verification_required?.value === 'true' ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Maintenance Mode:</span>
                        <Badge variant={platformSettings?.platform_maintenance_mode?.value === 'true' ? "destructive" : "default"}>
                          {platformSettings?.platform_maintenance_mode?.value === 'true' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-purple-200">
                      <p className="text-xs text-gray-500 text-center">
                        Last updated: {new Date().toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-fundry-navy">Reports & Analytics</h2>
                  <p className="text-gray-600">Comprehensive email outreach and campaign performance analytics</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/admin/outreach-report'}
                  className="bg-fundry-orange hover:bg-orange-600 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Detailed Outreach Report
                </Button>
              </div>

              {/* Time Period Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Analytics Time Period</CardTitle>
                  <CardDescription>Select the time range for your analytics reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {[
                      { key: 'today', label: 'Today' },
                      { key: '7days', label: '7 Days' },
                      { key: '1month', label: '1 Month' },
                      { key: '3months', label: 'Quarter' },
                      { key: '6months', label: '6 Months' },
                      { key: '1year', label: '1 Year' },
                      { key: 'all', label: 'All Time' },
                      { key: 'custom', label: 'Custom' }
                    ].map((period) => (
                      <Button
                        key={period.key}
                        variant={selectedPeriod === period.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period.key)}
                        className={selectedPeriod === period.key ? "bg-fundry-navy text-white" : ""}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                  
                  {selectedPeriod === 'custom' && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Email Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Total Emails Sent</CardTitle>
                    <Send className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {emailAnalytics?.totalEmailsSent || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{emailAnalytics?.emailGrowthRate || 0}% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Emails Opened</CardTitle>
                    <Mail className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {emailAnalytics?.totalEmailsOpened || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {emailAnalytics?.openRate || 0}% open rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Campaign Reach</CardTitle>
                    <Users className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {emailAnalytics?.uniqueRecipients || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unique investors reached
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-fundry-navy">Response Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-fundry-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fundry-navy">
                      {emailAnalytics?.responseRate || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Investor engagement rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Founder Activity Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Founder Outreach Activity</CardTitle>
                  <CardDescription>Email campaigns initiated by founders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {founderActivity?.map((founder, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-fundry-orange/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-fundry-orange" />
                          </div>
                          <div>
                            <p className="font-medium text-fundry-navy">{founder.founderName}</p>
                            <p className="text-sm text-gray-600">{founder.campaignTitle}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">{founder.emailsSent} emails sent</p>
                          <p className="text-xs text-gray-500">{founder.openRate}% open rate</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No founder email activity in this time period</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Performance Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-fundry-navy">Top Performing Campaigns</CardTitle>
                    <CardDescription>Campaigns with highest email engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topCampaigns?.map((campaign, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{campaign.campaignTitle}</p>
                            <p className="text-xs text-gray-500">{campaign.founderName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-fundry-navy">{campaign.openRate}%</p>
                            <p className="text-xs text-gray-500">{campaign.emailsSent} sent</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No campaign data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-fundry-navy">Investor Engagement Metrics</CardTitle>
                    <CardDescription>How investors are responding to outreach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Open Rate</span>
                        <span className="font-medium text-fundry-navy">{emailAnalytics?.avgOpenRate || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Response Time</span>
                        <span className="font-medium text-fundry-navy">{emailAnalytics?.avgResponseTime || 0}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Most Active Investors</span>
                        <span className="font-medium text-fundry-navy">{emailAnalytics?.activeInvestors || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Conversion to Investment</span>
                        <span className="font-medium text-fundry-navy">{emailAnalytics?.conversionRate || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Email Performance Trends</CardTitle>
                  <CardDescription>Track email metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Email performance chart will be displayed here</p>
                      <p className="text-sm text-gray-400 mt-2">Integration with charting library required</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investor Outreach Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Investor Outreach Analytics</CardTitle>
                  <CardDescription>Comprehensive analysis of investor outreach campaigns and directory usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-800">Total Investor Contacts</p>
                          <p className="text-2xl font-bold text-purple-900">{emailAnalytics?.totalInvestorContacts || 1067}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Outreach Campaigns</p>
                          <p className="text-2xl font-bold text-green-900">{emailAnalytics?.outreachCampaigns || 0}</p>
                        </div>
                        <Send className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Average Response Rate</p>
                          <p className="text-2xl font-bold text-blue-900">{emailAnalytics?.avgOutreachResponseRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-800">Investment Conversions</p>
                          <p className="text-2xl font-bold text-orange-900">{emailAnalytics?.outreachConversions || 0}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-fundry-navy">Top Performing Outreach Templates</h4>
                      <div className="space-y-3">
                        {[
                          { name: "Introduction Template", openRate: 32, responseRate: 8.5 },
                          { name: "Follow-up Template", openRate: 28, responseRate: 12.1 },
                          { name: "Validation Template", openRate: 25, responseRate: 6.8 },
                          { name: "Traction Template", openRate: 19, responseRate: 4.2 }
                        ].map((template, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-sm">{template.name}</span>
                            <div className="text-right">
                              <p className="text-sm font-medium">{template.openRate}% open</p>
                              <p className="text-xs text-gray-500">{template.responseRate}% response</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-fundry-navy">Investor Directory Usage</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Total Directory Size</span>
                          <span className="font-medium">1,067 contacts</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Contacts Reached</span>
                          <span className="font-medium">{emailAnalytics?.contactsReached || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Average Daily Outreach</span>
                          <span className="font-medium">{emailAnalytics?.avgDailyOutreach || 5} emails</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">Directory Utilization</span>
                          <span className="font-medium">{emailAnalytics?.directoryUtilization || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export and Download Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-fundry-navy">Export Reports</CardTitle>
                  <CardDescription>Download detailed analytics reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="outline" 
                      className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
                      onClick={() => handleExportReport('email-summary')}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Email Summary Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
                      onClick={() => handleExportReport('founder-activity')}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Founder Activity Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
                      onClick={() => handleExportReport('campaign-performance')}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Campaign Performance Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
                      onClick={() => handleExportReport('investor-engagement')}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Investor Engagement Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
                      onClick={() => handleExportReport('investor-outreach')}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Investor Outreach Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* View User Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-fundry-orange" />
              <span>User Details</span>
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">User Type</Label>
                    <Badge variant={selectedUser.userType === "founder" ? "default" : "secondary"} className="mt-1">
                      {selectedUser.userType}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Status</Label>
                    <Badge variant={selectedUser.isEmailVerified ? "default" : "destructive"} className="mt-1">
                      {selectedUser.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                    <Badge variant={selectedUser.status === "suspended" ? "destructive" : "default"} className="mt-1">
                      {selectedUser.status === "suspended" ? "Suspended" : "Active"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedUser.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                </div>
              )}
              
              {selectedUser.country && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <p className="text-sm text-gray-600">
                    {selectedUser.state ? `${selectedUser.state}, ` : ""}{selectedUser.country}
                  </p>
                </div>
              )}
              
              {selectedUser.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-fundry-orange" />
              <span>Edit User Information</span>
            </DialogTitle>
            <DialogDescription>
              Update user details and account settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select value={editForm.userType} onValueChange={(value) => setEditForm({...editForm, userType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editForm.country}
                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
                className="bg-fundry-orange hover:bg-orange-600"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend User Modal */}
      <AlertDialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Ban className="w-5 h-5 text-red-500" />
              <span>
                {selectedUser?.status === "suspended" ? "Reactivate User" : "Suspend User"}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === "suspended" 
                ? `Are you sure you want to reactivate ${selectedUser.firstName} ${selectedUser.lastName}? They will regain full access to their account.`
                : `Are you sure you want to suspend ${selectedUser?.firstName} ${selectedUser?.lastName}? This will prevent them from accessing their account and participating in any platform activities.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSuspendConfirm(selectedUser?.status !== "suspended")}
              className={selectedUser?.status === "suspended" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
              disabled={suspendUserMutation.isPending}
            >
              {suspendUserMutation.isPending 
                ? "Processing..." 
                : selectedUser?.status === "suspended" 
                  ? "Reactivate User" 
                  : "Suspend User"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campaign Management Modals */}
      {/* View Campaign Modal */}
      <Dialog open={viewCampaignModalOpen} onOpenChange={setViewCampaignModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-orange-200/50">
          <DialogHeader className="text-center pb-6 border-b border-orange-200/50">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Campaign Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Complete campaign information and analytics
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6 py-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCampaign.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Founder</label>
                    <p className="text-gray-900">{selectedCampaign.founderName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge variant={selectedCampaign.status === "active" ? "default" : "secondary"}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Funding Goal</label>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedCampaign.fundingGoal)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount Raised</label>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(selectedCampaign.amountRaised)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created Date</label>
                    <p className="text-gray-900">{new Date(selectedCampaign.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-orange-200/50">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/campaign/${selectedCampaign.id}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Public Page
                </Button>
                <Button 
                  onClick={() => {
                    setViewCampaignModalOpen(false);
                    handleEditCampaign(selectedCampaign);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Campaign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Modal */}
      <Dialog open={editCampaignModalOpen} onOpenChange={setEditCampaignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-orange-200/50">
          <DialogHeader className="text-center pb-6 border-b border-orange-200/50">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Edit Campaign
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Update campaign information and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedCampaign.companyName}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Funding Goal</label>
                  <input 
                    type="text" 
                    defaultValue={selectedCampaign.fundingGoal}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select 
                    defaultValue={selectedCampaign.status}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-orange-200/50">
                <Button variant="outline" onClick={() => setEditCampaignModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    updateCampaignMutation.mutate({
                      campaignId: selectedCampaign.id,
                      updates: { status: 'active' } // Simplified for demo
                    });
                  }}
                  disabled={updateCampaignMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {updateCampaignMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pause Campaign Modal */}
      <AlertDialog open={pauseCampaignModalOpen} onOpenChange={setPauseCampaignModalOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-orange-200/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Ban className="w-5 h-5 text-red-500" />
              <span>
                {selectedCampaign?.status === "paused" ? "Resume Campaign" : "Pause Campaign"}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCampaign?.status === "paused" 
                ? `Are you sure you want to resume "${selectedCampaign.companyName}"? The campaign will become active and visible to investors again.`
                : `Are you sure you want to pause "${selectedCampaign?.companyName}"? This will temporarily stop the campaign and prevent new investments.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedCampaign) {
                  pauseCampaignMutation.mutate({
                    campaignId: selectedCampaign.id,
                    pause: selectedCampaign.status !== "paused",
                    reason: "Admin action"
                  });
                }
              }}
              className={selectedCampaign?.status === "paused" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
              disabled={pauseCampaignMutation.isPending}
            >
              {pauseCampaignMutation.isPending 
                ? "Processing..." 
                : selectedCampaign?.status === "paused" 
                  ? "Resume Campaign" 
                  : "Pause Campaign"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Investment Details Modal */}
      <Dialog open={investmentDetailsModalOpen} onOpenChange={setInvestmentDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-orange-200/50">
          <DialogHeader className="text-center pb-6 border-b border-orange-200/50">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Investment Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Complete information about this investment commitment
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">Investment Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Amount:</span> ${parseFloat(selectedInvestment.amount).toLocaleString()}</p>
                    <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedInvestment.status}</span></p>
                    <p><span className="font-medium">Payment Status:</span> <span className="capitalize">{selectedInvestment.paymentStatus}</span></p>
                    <p><span className="font-medium">Committed Date:</span> {new Date(selectedInvestment.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Days Pending:</span> {Math.ceil((Date.now() - new Date(selectedInvestment.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                </div>
                
                <div className="bg-white/50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">Investor Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedInvestment.investor?.firstName} {selectedInvestment.investor?.lastName}</p>
                    <p><span className="font-medium">Type:</span> Individual Investor</p>
                    <p><span className="font-medium">Investment ID:</span> #{selectedInvestment.id}</p>
                    <p><span className="font-medium">Investor ID:</span> #{selectedInvestment.investorId}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">Campaign Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Campaign:</span> {selectedInvestment.campaign?.title || selectedInvestment.campaign?.companyName}</p>
                    <p><span className="font-medium">Campaign ID:</span> #{selectedInvestment.campaignId}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">Action Required</h3>
                  <div className="space-y-2">
                    <p className="text-orange-700 font-medium">Payment Processing</p>
                    <p className="text-sm text-gray-600">Investor needs to complete payment to finalize investment</p>
                    <p className="text-xs text-orange-600">Send reminder email to prompt payment completion</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-orange-200">
                <Button variant="outline" onClick={() => setInvestmentDetailsModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setInvestmentDetailsModalOpen(false);
                    handleSendReminder(selectedInvestment);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Reminder Modal */}
      <Dialog open={sendReminderModalOpen} onOpenChange={setSendReminderModalOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-orange-200/50">
          <DialogHeader className="text-center pb-6 border-b border-orange-200/50">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Send Payment Reminder
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Send a friendly reminder email to complete the investment payment
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-6 py-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">Investment Summary</h3>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Investor:</span> {selectedInvestment.investor?.firstName} {selectedInvestment.investor?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Amount:</span> ${parseFloat(selectedInvestment.amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Campaign:</span> {selectedInvestment.campaign?.title || selectedInvestment.campaign?.companyName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Pending for:</span> {Math.ceil((Date.now() - new Date(selectedInvestment.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add a personal message to include with the reminder email..."
                  id="reminderMessage"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A standard reminder message will be sent. Add custom text here to personalize the email.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-orange-200">
                <Button variant="outline" onClick={() => setSendReminderModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const messageElement = document.getElementById('reminderMessage') as HTMLTextAreaElement;
                    const customMessage = messageElement?.value || "This is a friendly reminder to complete your investment payment.";
                    handleSendReminderConfirm(customMessage);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={sendReminderMutation.isPending}
                >
                  {sendReminderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reminder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Platform Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-gray-600">Configure platform fees, KYC requirements, and general settings</p>
              </div>

              {platformSettingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Platform Fees Section */}
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Platform Fees
                      </CardTitle>
                      <CardDescription className="text-orange-100">
                        Manage investor fees and payment processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                          <div>
                            <label className="font-medium text-gray-800">Platform Fee Percentage</label>
                            <p className="text-sm text-gray-600">Fee charged to investors</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={platformSettings?.platform_fee_percentage?.value || '0'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                newSettings.platform_fee_percentage.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              className="w-20 text-center"
                              min="0"
                              max="100"
                            />
                            <span className="text-gray-600">%</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'platform_fee_percentage',
                                  settingValue: platformSettings?.platform_fee_percentage?.value || '0'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                          <div>
                            <label className="font-medium text-gray-800">Minimum Investment</label>
                            <p className="text-sm text-gray-600">Lowest allowed investment amount</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={platformSettings?.minimum_investment?.value || '25'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                newSettings.minimum_investment.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              className="w-24 text-center"
                              min="1"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'minimum_investment',
                                  settingValue: platformSettings?.minimum_investment?.value || '25'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                          <div>
                            <label className="font-medium text-gray-800">Maximum Investment</label>
                            <p className="text-sm text-gray-600">Highest allowed investment amount</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={platformSettings?.maximum_investment?.value || '100000'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                newSettings.maximum_investment.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              className="w-28 text-center"
                              min="1000"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'maximum_investment',
                                  settingValue: platformSettings?.maximum_investment?.value || '100000'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KYC Requirements Section */}
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        KYC Requirements
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        Configure Know Your Customer verification settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                          <div>
                            <label className="font-medium text-gray-800">KYC Required for Investment</label>
                            <p className="text-sm text-gray-600">Require verification before investing</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={platformSettings?.kyc_required_for_investment?.value || 'true'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                newSettings.kyc_required_for_investment.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'kyc_required_for_investment',
                                  settingValue: platformSettings?.kyc_required_for_investment?.value || 'true'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                          <div>
                            <label className="font-medium text-gray-800">KYC Threshold Amount</label>
                            <p className="text-sm text-gray-600">Investment amount requiring KYC</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={platformSettings?.kyc_required_amount_threshold?.value || '1000'}
                              onChange={(e) => {
                                const newSettings = { ...platformSettings };
                                newSettings.kyc_required_amount_threshold.value = e.target.value;
                                setPlatformSettings(newSettings);
                              }}
                              className="w-24 text-center"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'kyc_required_amount_threshold',
                                  settingValue: platformSettings?.kyc_required_amount_threshold?.value || '1000'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                          <div>
                            <label className="font-medium text-gray-800">Auto Approval</label>
                            <p className="text-sm text-gray-600">Automatically approve KYC submissions</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={platformSettings?.kyc_auto_approval_enabled?.value || 'false'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                newSettings.kyc_auto_approval_enabled.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'kyc_auto_approval_enabled',
                                  settingValue: platformSettings?.kyc_auto_approval_enabled?.value || 'false'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* General Platform Settings */}
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        General Settings
                      </CardTitle>
                      <CardDescription className="text-green-100">
                        Platform maintenance and registration controls
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                          <div>
                            <label className="font-medium text-gray-800">New Registrations</label>
                            <p className="text-sm text-gray-600">Allow new user sign-ups</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={platformSettings?.new_registrations_enabled?.value || 'true'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                newSettings.new_registrations_enabled.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Enabled</SelectItem>
                                <SelectItem value="false">Disabled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'new_registrations_enabled',
                                  settingValue: platformSettings?.new_registrations_enabled?.value || 'true'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                          <div>
                            <label className="font-medium text-gray-800">Email Verification</label>
                            <p className="text-sm text-gray-600">Require email verification for new users</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={platformSettings?.email_verification_required?.value || 'true'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                newSettings.email_verification_required.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Required</SelectItem>
                                <SelectItem value="false">Optional</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'email_verification_required',
                                  settingValue: platformSettings?.email_verification_required?.value || 'true'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                          <div>
                            <label className="font-medium text-gray-800">Maintenance Mode</label>
                            <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={platformSettings?.platform_maintenance_mode?.value || 'false'}
                              onValueChange={(value) => {
                                const newSettings = { ...platformSettings };
                                newSettings.platform_maintenance_mode.value = value;
                                setPlatformSettings(newSettings);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsUpdatingSettings(true);
                                updatePlatformSettingMutation.mutate({
                                  settingKey: 'platform_maintenance_mode',
                                  settingValue: platformSettings?.platform_maintenance_mode?.value || 'false'
                                });
                              }}
                              disabled={isUpdatingSettings}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings Summary */}
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Settings Summary
                      </CardTitle>
                      <CardDescription className="text-purple-100">
                        Current platform configuration overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Platform Fee:</span>
                          <span className="font-medium">{platformSettings?.platform_fee_percentage?.value || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Investment Range:</span>
                          <span className="font-medium">
                            ${platformSettings?.minimum_investment?.value || '25'} - ${platformSettings?.maximum_investment?.value || '100,000'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">KYC Required:</span>
                          <Badge variant={platformSettings?.kyc_required_for_investment?.value === 'true' ? 'default' : 'secondary'}>
                            {platformSettings?.kyc_required_for_investment?.value === 'true' ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">KYC Threshold:</span>
                          <span className="font-medium">${platformSettings?.kyc_required_amount_threshold?.value || '1,000'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">New Registrations:</span>
                          <Badge variant={platformSettings?.new_registrations_enabled?.value === 'true' ? 'default' : 'destructive'}>
                            {platformSettings?.new_registrations_enabled?.value === 'true' ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Maintenance Mode:</span>
                          <Badge variant={platformSettings?.platform_maintenance_mode?.value === 'true' ? 'destructive' : 'default'}>
                            {platformSettings?.platform_maintenance_mode?.value === 'true' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}