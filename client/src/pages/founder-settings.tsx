import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { User, Building2, Bell, Shield, CreditCard, Key, Mail, Phone, MapPin, Save, AlertTriangle, ArrowLeft, LogOut, Eye, EyeOff, Monitor, Smartphone, Tablet } from "lucide-react";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";
import { COUNTRIES_AND_STATES, type Country } from "@/data/countries-states";
import TwoFactorSetupModal from "@/components/modals/two-factor-setup-modal";

export default function FounderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch user profile and business profile
  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    enabled: !!user?.id,
  });

  const { data: businessProfile, isLoading: businessLoading } = useQuery({
    queryKey: ["/api/business-profile", user?.id],
    enabled: !!user?.id,
  });

  // Get 2FA status
  const { data: twoFactorStatus } = useQuery<{
    enabled: boolean;
    method: string | null;
    backupCodesCount: number;
  }>({
    queryKey: ['/api/2fa/status'],
    enabled: !!user?.id,
  });

  // Form states
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    bio: "",
  });

  // Get selected country data for state options
  const selectedCountry = COUNTRIES_AND_STATES.find(c => c.code === personalData.country);
  const availableStates = selectedCountry?.states || [];

  const [businessData, setBusinessData] = useState({
    companyName: "",
    website: "",
    industry: "",
    founded: "",
    employees: "",
    description: "",
    address: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    investmentAlerts: true,
    campaignUpdates: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  const [security, setSecurity] = useState({
    passwordLastChanged: "2024-01-15",
  });

  // Security modal states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [viewSessionsOpen, setViewSessionsOpen] = useState(false);
  const [enable2FAOpen, setEnable2FAOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password change form
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

  // Update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/business-profile/${user?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Business Profile Updated",
        description: "Your business profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile", user?.id] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update business profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/user/notifications", data);
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Security mutations
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/user/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
      setChangePasswordOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSecurity(prev => ({ ...prev, passwordLastChanged: new Date().toISOString().split('T')[0] }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggle2FAMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("PUT", "/api/user/2fa", { enabled });
    },
    onSuccess: (_, enabled) => {
      toast({
        title: "Success",
        description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully!`,
      });
      setSecurity(prev => ({ ...prev, twoFactorEnabled: enabled }));
      setEnable2FAOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when user/business data loads
  useState(() => {
    if (userProfile && typeof userProfile === 'object') {
      setPersonalData({
        firstName: (userProfile as any).firstName || "",
        lastName: (userProfile as any).lastName || "",
        email: (userProfile as any).email || "",
        phone: (userProfile as any).phone || "",
        country: (userProfile as any).country || "",
        state: (userProfile as any).state || "",
        bio: (userProfile as any).bio || "",
      });
    }
  });

  useState(() => {
    if (businessProfile && typeof businessProfile === 'object') {
      setBusinessData({
        companyName: (businessProfile as any).companyName || "",
        website: (businessProfile as any).website || "",
        industry: (businessProfile as any).industry || "",
        founded: (businessProfile as any).founded || "",
        employees: (businessProfile as any).employees || "",
        description: (businessProfile as any).description || "",
        address: (businessProfile as any).address || "",
      });
    }
  });

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(personalData);
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessMutation.mutate(businessData);
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notifications);
  };

  if (userLoading || businessLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <Button
              variant="ghost"
              onClick={() => setLocation("/founder-dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            {/* Center: Fundry Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setLocation("/landing")}
            >
              <img 
                src={fundryLogoNew} 
                alt="Fundry" 
                className="h-36 w-auto"
              />
            </div>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account, business profile, and preferences</p>
        </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={personalData.country}
                      onValueChange={(value) => {
                        setPersonalData(prev => ({ 
                          ...prev, 
                          country: value,
                          state: "" // Reset state when country changes
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES_AND_STATES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province/Region</Label>
                    <Select
                      value={personalData.state}
                      onValueChange={(value) => setPersonalData(prev => ({ ...prev, state: value }))}
                      disabled={!personalData.country || availableStates.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !personalData.country 
                            ? "Select country first" 
                            : availableStates.length === 0 
                              ? "No states available" 
                              : "Select state"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={personalData.bio}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell investors about your background and experience..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="bg-fundry-orange hover:bg-orange-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={businessData.companyName}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={businessData.website}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={businessData.industry}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded</Label>
                    <Input
                      id="founded"
                      value={businessData.founded}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, founded: e.target.value }))}
                      placeholder="2023"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employees">Employees</Label>
                    <Input
                      id="employees"
                      value={businessData.employees}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, employees: e.target.value }))}
                      placeholder="1-10, 11-50, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={businessData.description}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your company, mission, and what makes it unique..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Your business address..."
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updateBusinessMutation.isPending}
                  className="bg-fundry-orange hover:bg-orange-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateBusinessMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Investment Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when you receive new investments</p>
                    </div>
                    <Switch
                      checked={notifications.investmentAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, investmentAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Campaign Updates</Label>
                      <p className="text-sm text-gray-600">Updates about your campaign performance</p>
                    </div>
                    <Switch
                      checked={notifications.campaignUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, campaignUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Weekly summary of your fundraising progress</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Tips, best practices, and platform updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateNotificationsMutation.isPending}
                  className="bg-fundry-orange hover:bg-orange-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      {twoFactorStatus?.enabled 
                        ? `Protected with ${twoFactorStatus.method === 'app' ? 'authenticator app' : 'email'} 2FA`
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                    {twoFactorStatus?.enabled && (
                      <p className="text-xs text-gray-500">
                        {twoFactorStatus.backupCodesCount} backup codes remaining
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={twoFactorStatus?.enabled ? "default" : "secondary"}>
                      {twoFactorStatus?.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEnable2FAOpen(true)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {twoFactorStatus?.enabled ? "Manage 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-600">
                      Last changed on {new Date(security.passwordLastChanged).toLocaleDateString()}
                    </p>
                  </div>
                  <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Key className="mr-2 h-4 w-4" />
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
                          <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-gray-600">Manage devices that are logged into your account</p>
                  </div>
                  <Dialog open={viewSessionsOpen} onOpenChange={setViewSessionsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
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
                              setViewSessionsOpen(false);
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

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Plan</h3>
                <p className="text-gray-600 mb-6">
                  You're currently on the free plan. Fundry charges a 5% platform fee on successful fundraising above $1,000.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Platform Fee:</strong> 5% on amounts raised above $1,000<br />
                      <strong>Payment Processing:</strong> Standard payment processing fees apply<br />
                      <strong>Free Tier:</strong> No fees on the first $1,000 raised
                    </p>
                  </div>
                  <Button className="bg-fundry-orange hover:bg-orange-600">
                    View Pricing Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal 
        isOpen={enable2FAOpen} 
        onClose={() => setEnable2FAOpen(false)} 
      />
      </div>
    </div>
  );
}