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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { User, Building2, Bell, Shield, CreditCard, Key, Mail, Phone, MapPin, Save, AlertTriangle } from "lucide-react";

export default function FounderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile and business profile
  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    enabled: !!user?.id,
  });

  const { data: businessProfile, isLoading: businessLoading } = useQuery({
    queryKey: ["/api/business-profile", user?.id],
    enabled: !!user?.id,
  });

  // Form states
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

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
    twoFactorEnabled: false,
    passwordLastChanged: "2024-01-15",
  });

  // Update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/user/profile", "PUT", data);
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
      return apiRequest(`/api/business-profile/${user?.id}`, "PUT", data);
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
      return apiRequest("/api/user/notifications", "PUT", data);
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

  // Initialize form data when user/business data loads
  useState(() => {
    if (userProfile) {
      setPersonalData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        bio: userProfile.bio || "",
      });
    }
  });

  useState(() => {
    if (businessProfile) {
      setBusinessData({
        companyName: businessProfile.companyName || "",
        website: businessProfile.website || "",
        industry: businessProfile.industry || "",
        founded: businessProfile.founded || "",
        employees: businessProfile.employees || "",
        description: businessProfile.description || "",
        address: businessProfile.address || "",
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={personalData.phone}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={personalData.location}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State, Country"
                    />
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
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={security.twoFactorEnabled ? "default" : "secondary"}>
                      {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {security.twoFactorEnabled ? "Disable" : "Enable"}
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
                  <Button variant="outline" size="sm">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-gray-600">Manage devices that are logged into your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
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
    </div>
  );
}