import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Activity, 
  MessageSquare, 
  Settings, 
  Shield, 
  UserPlus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Mail,
  LogOut,
  Search,
  Filter,
  UserCog,
  Bell,
  Calendar
} from "lucide-react";

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
    email: string;
  };
  campaign?: {
    id: number;
    title?: string;
    companyName?: string;
  };
}

interface TeamMember {
  id: number;
  email: string;
  fullName: string;
  role: string;
  department: string;
  responsibilities: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [inviteTeamModalOpen, setInviteTeamModalOpen] = useState(false);

  // Selected items
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
    phone: "",
    country: "",
    state: ""
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    role: "admin",
    department: "operations",
    responsibilities: "",
    tempPassword: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
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

  // API Queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!adminUser
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!adminUser && activeTab === "users"
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/admin/campaigns'],
    enabled: !!adminUser && activeTab === "campaigns"
  });

  const { data: investments, isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/admin/investments'],
    enabled: !!adminUser && (activeTab === "safes" || activeTab === "transactions" || activeTab === "overview")
  });

  const { data: teamMembers, isLoading: teamMembersLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/admin/team-members'],
    enabled: !!adminUser && activeTab === "team-management"
  });

  // Mutations
  const inviteTeamMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/invite-team-member", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      setInviteTeamModalOpen(false);
      setInviteForm({
        email: "",
        fullName: "",
        role: "admin",
        department: "operations",
        responsibilities: "",
        tempPassword: ""
      });
      toast({
        title: "Team Member Invited",
        description: "Team member invitation sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Invitation Failed",
        description: "Failed to send team member invitation.",
        variant: "destructive",
      });
    }
  });

  const resetTeamPasswordMutation = useMutation({
    mutationFn: async (data: { memberId: number; email: string }) => {
      return apiRequest("POST", "/api/admin/reset-team-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "Password reset email sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Reset Failed",
        description: "Failed to reset team member password.",
        variant: "destructive",
      });
    }
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiRequest("DELETE", `/api/admin/team-members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      toast({
        title: "Team Member Removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Removal Failed",
        description: "Failed to remove team member.",
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleInviteTeamMember = () => {
    if (!inviteForm.email || !inviteForm.fullName || !inviteForm.tempPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    inviteTeamMemberMutation.mutate(inviteForm);
  };

  const handleResetTeamMemberPassword = (member: TeamMember) => {
    resetTeamPasswordMutation.mutate({
      memberId: member.id,
      email: member.email
    });
  };

  const handleRemoveTeamMember = (member: TeamMember) => {
    removeTeamMemberMutation.mutate(member.id);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setLocation("/admin-login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminUser.firstName}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="safes">SAFE Agreements</TabsTrigger>
            <TabsTrigger value="team-management">Team</TabsTrigger>
            <TabsTrigger value="platform-settings">Platform Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalFounders + stats?.totalInvestors || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.totalFundsRaised || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SAFE Agreements</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSafes || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team-management" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <Dialog open={inviteTeamModalOpen} onOpenChange={setInviteTeamModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Invite New Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join the admin team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          placeholder="admin@fundry.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={inviteForm.fullName}
                          onChange={(e) => setInviteForm({...inviteForm, fullName: e.target.value})}
                          placeholder="John Smith"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({...inviteForm, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select value={inviteForm.department} onValueChange={(value) => setInviteForm({...inviteForm, department: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="customer_support">Customer Support</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="responsibilities">Responsibilities</Label>
                      <Textarea
                        id="responsibilities"
                        value={inviteForm.responsibilities}
                        onChange={(e) => setInviteForm({...inviteForm, responsibilities: e.target.value})}
                        placeholder="Describe key responsibilities..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="tempPassword">Temporary Password</Label>
                      <Input
                        id="tempPassword"
                        type="password"
                        value={inviteForm.tempPassword}
                        onChange={(e) => setInviteForm({...inviteForm, tempPassword: e.target.value})}
                        placeholder="Temporary password for first login"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setInviteTeamModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInviteTeamMember}
                      disabled={inviteTeamMemberMutation.isPending}
                    >
                      {inviteTeamMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage admin team members and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCog className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={member.role === 'super_admin' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                              <span className="text-xs text-gray-500">·</span>
                              <span className="text-xs text-gray-500">{member.department}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetTeamMemberPassword(member)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset Password
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.fullName} from the team? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveTeamMember(member)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                    {(!teamMembers || teamMembers.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        No team members found. Start by inviting your first team member.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage founders and investors on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.userType === 'founder' ? 'default' : 'secondary'}>
                                {user.userType}
                              </Badge>
                              <Badge variant={user.isEmailVerified ? 'default' : 'destructive'}>
                                {user.isEmailVerified ? 'Verified' : 'Unverified'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Monitor and manage all fundraising campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns?.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{campaign.companyName}</p>
                            <p className="text-sm text-gray-600">Goal: {campaign.fundingGoal} | Raised: {campaign.amountRaised}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                {campaign.status}
                              </Badge>
                              <span className="text-xs text-gray-500">by {campaign.founderName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Management</CardTitle>
                <CardDescription>Track and manage all investment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {investmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments?.map((investment) => (
                      <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">${investment.amount}</p>
                            <p className="text-sm text-gray-600">
                              {investment.investor?.firstName} {investment.investor?.lastName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={investment.status === 'paid' ? 'default' : 'secondary'}>
                                {investment.status}
                              </Badge>
                              <Badge variant={investment.paymentStatus === 'completed' ? 'default' : 'destructive'}>
                                {investment.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SAFE Agreements Tab */}
          <TabsContent value="safes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SAFE Agreement Management</CardTitle>
                <CardDescription>Monitor all SAFE agreements and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Total SAFE Agreements</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalSafes || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Completed Agreements</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {investments?.filter(i => i.paymentStatus === 'completed').length || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900">Pending Agreements</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {investments?.filter(i => i.paymentStatus === 'pending').length || 0}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">SAFE agreement details and management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Settings Tab */}
          <TabsContent value="platform-settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fee Structure Card */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Platform Fee Structure</CardTitle>
                  <CardDescription className="text-orange-600">
                    Configure commission rates and fee thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Free Tier (≤ $1,000)</span>
                      <Badge className="bg-green-100 text-green-800">0% Fee</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Standard Tier (&gt; $1,000)</span>
                      <Badge className="bg-orange-100 text-orange-800">5% Fee</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Fee Structure
                  </Button>
                </CardContent>
              </Card>

              {/* KYC Management Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">KYC Management</CardTitle>
                  <CardDescription className="text-blue-600">
                    Manage verification thresholds and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Basic KYC (≤ $1,000)</span>
                      <Badge className="bg-green-100 text-green-800">Email Only</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Full KYC (&gt; $1,000)</span>
                      <Badge className="bg-blue-100 text-blue-800">Full Verification</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Configure KYC Settings
                  </Button>
                </CardContent>
              </Card>

              {/* General Settings Card */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">General Platform Settings</CardTitle>
                  <CardDescription className="text-green-600">
                    Platform-wide configurations and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Max Campaign Goal</span>
                      <Badge className="bg-green-100 text-green-800">$100,000</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">Min Investment</span>
                      <Badge className="bg-green-100 text-green-800">$25</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Summary Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">Admin Summary</CardTitle>
                  <CardDescription className="text-purple-600">
                    Quick overview of platform status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <p className="text-2xl font-bold text-purple-600">{stats?.totalFounders || 0}</p>
                      <p className="text-sm text-gray-600">Founders</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <p className="text-2xl font-bold text-purple-600">{stats?.totalInvestors || 0}</p>
                      <p className="text-sm text-gray-600">Investors</p>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Activity className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Comprehensive platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Total Revenue</h3>
                    <p className="text-2xl font-bold text-blue-600">${stats?.totalFundsRaised || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Active Users</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {(stats?.totalFounders || 0) + (stats?.totalInvestors || 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900">Success Rate</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.activeCampaigns ? Math.round((stats.activeCampaigns / stats.totalCampaigns) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900">Avg Investment</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      ${investments?.length ? Math.round(investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) / investments.length) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}