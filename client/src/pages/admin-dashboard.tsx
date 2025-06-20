import { useState, useEffect } from "react";
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
  Clock,
  X,
  Star,
  Save
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Check admin authentication on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
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
        
        // If not authenticated or not admin, redirect to login
        setLocation("/admin-login");
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setLocation("/admin-login");
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
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/admin/withdrawals'],
    enabled: !!adminUser && activeTab === "withdrawals"
  });

  // Investments query for all admin sections
  const { data: investments, isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/admin/investments'],
    enabled: !!adminUser && (activeTab === "safes" || activeTab === "transactions" || activeTab === "overview")
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Fundry Admin Centre</h1>
              <p className="text-sm text-gray-600">Platform oversight and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Admin: {adminUser.firstName} {adminUser.lastName}
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
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
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button 
              variant={activeTab === "users" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button 
              variant={activeTab === "founders" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("founders")}
            >
              <User className="w-4 h-4 mr-2" />
              Founder Management
            </Button>
            <Button 
              variant={activeTab === "investors" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("investors")}
            >
              <Users className="w-4 h-4 mr-2" />
              Investor Management
            </Button>
            <Button 
              variant={activeTab === "campaigns" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("campaigns")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Campaign Oversight
            </Button>
            <Button 
              variant={activeTab === "transactions" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("transactions")}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Transactions & Withdrawals
            </Button>
            <Button 
              variant={activeTab === "safes" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("safes")}
            >
              <FileText className="w-4 h-4 mr-2" />
              SAFE Agreements
            </Button>
            <Button 
              variant={activeTab === "content" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("content")}
            >
              <Bell className="w-4 h-4 mr-2" />
              Content & Announcements
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start"
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
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Real-time platform statistics and activity</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeCampaigns || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats?.totalFundsRaised || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all campaigns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(stats?.totalFounders || 0) + (stats?.totalInvestors || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalFounders || 0} founders, {stats?.totalInvestors || 0} investors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SAFE Agreements</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalSafes || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Generated agreements
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Admin Activity</CardTitle>
                  <CardDescription>Latest administrative actions on the platform</CardDescription>
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
                              return <Activity className="w-4 h-4 text-blue-500" />;
                            case 'User Management':
                              return <Users className="w-4 h-4 text-green-500" />;
                            case 'System Monitoring':
                              return <TrendingUp className="w-4 h-4 text-purple-500" />;
                            case 'Data Fix':
                              return <Settings className="w-4 h-4 text-orange-500" />;
                            case 'Email Configuration':
                              return <Mail className="w-4 h-4 text-indigo-500" />;
                            case 'Security Review':
                              return <Shield className="w-4 h-4 text-red-500" />;
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
                <h2 className="text-3xl font-bold text-gray-900">Founder Management</h2>
                <p className="text-gray-600">Manage all founder accounts, KYC status, and campaigns</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Founders</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalFounders || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Registered founder accounts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats?.activeCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently fundraising
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {users?.filter(user => user.userType === 'founder').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verified founders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Founders</CardTitle>
                  <CardDescription>Manage founder accounts and their startups</CardDescription>
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
                              <span className="text-sm font-medium text-blue-600">
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
                                  inv.investorId === parseInt(user.id) && inv.paymentStatus === 'completed'
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

              <Card className="mb-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest investment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investments && investments.length > 0 ? 
                        investments.slice(0, 10).map((investment: Investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                              {new Date(investment.createdAt).toLocaleDateString()} at {new Date(investment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(parseFloat(investment.amount))}</p>
                            <Badge variant={
                              investment.paymentStatus === 'completed' ? 'default' : 
                              investment.paymentStatus === 'pending' || investment.paymentStatus === 'processing' ? 'secondary' : 'destructive'
                            }>
                              {investment.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      )) : <p className="text-gray-500 text-center py-4">No transactions found</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Requests</CardTitle>
                    <CardDescription>Pending founder withdrawal requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-500 text-center py-4">No withdrawal requests found</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Analytics</CardTitle>
                  <CardDescription>Payment method breakdown and platform fees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium text-lg">USD Payments</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {investments?.filter((inv: Investment) => inv.paymentStatus === 'completed').length || 0}
                      </p>
                      <p className="text-sm text-gray-500">Via Stripe</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium text-lg">NGN Payments</h3>
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-gray-500">Via Budpay</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-medium text-lg">Platform Fees</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(0)}
                      </p>
                      <p className="text-sm text-gray-500">Total collected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                <h2 className="text-3xl font-bold text-gray-900">Withdrawal Management</h2>
                <p className="text-gray-600">Review and approve founder withdrawal requests</p>
              </div>

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

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-gray-600">Configure platform-wide settings and policies</p>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Limits</CardTitle>
                    <CardDescription>Set minimum and maximum investment amounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Minimum Investment</label>
                        <p className="text-2xl font-bold text-green-600">$25</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Maximum Campaign Goal</label>
                        <p className="text-2xl font-bold text-blue-600">$100,000</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Fees</CardTitle>
                    <CardDescription>Current fee structure for the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Standard Fee</label>
                        <p className="text-2xl font-bold text-fundry-orange">0%</p>
                        <p className="text-sm text-gray-600">For all investors</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Processing Fee</label>
                        <p className="text-2xl font-bold text-gray-600">Stripe/Budpay</p>
                        <p className="text-sm text-gray-600">Payment processing only</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}