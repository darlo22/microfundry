import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Mail, 
  Users, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Search,
  UserPlus,
  TrendingUp,
  Eye,
  MessageCircle,
  Building,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Filter
} from "lucide-react";

interface InvestorDirectory {
  id: number;
  name: string;
  email: string;
  company?: string;
  title?: string;
  location?: string;
  bio?: string;
  linkedinUrl?: string;
  investmentFocus?: string;
  minimumInvestment?: number;
  maximumInvestment?: number;
  tags?: string[];
  source: 'directory' | 'platform';
}

interface EmailSettings {
  id: number;
  verifiedEmail: string;
  displayName: string;
  signature?: string;
  isVerified: boolean;
}

interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: string[];
}

interface EmailCampaign {
  id: number;
  subject: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  repliedCount: number;
  status: string;
  sentAt: string;
  campaignName?: string;
}

interface RateLimit {
  dailyLimit: number;
  used: number;
  remaining: number;
  canSend: boolean;
}

export default function FounderOutreach() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvestors, setSelectedInvestors] = useState<InvestorDirectory[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [emailSettings, setEmailSettings] = useState({
    verifiedEmail: "",
    displayName: "",
    signature: ""
  });

  // Fetch email settings
  const { data: currentEmailSettings } = useQuery({
    queryKey: ["/api/founder/email-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founder/email-settings");
      return response.json();
    },
  });

  // Fetch investor directory
  const { data: investors = [], isLoading: loadingInvestors } = useQuery({
    queryKey: ["/api/founder/investor-directory", sourceFilter, searchTerm],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/founder/investor-directory?source=${sourceFilter}&search=${searchTerm}`);
      return response.json();
    },
  });

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/founder/email-templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founder/email-templates");
      return response.json();
    },
  });

  // Fetch rate limit
  const { data: rateLimit } = useQuery({
    queryKey: ["/api/founder/email-rate-limit"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founder/email-rate-limit");
      return response.json();
    },
  });

  // Fetch email campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/founder/email-campaigns"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founder/email-campaigns");
      return response.json();
    },
  });

  // Fetch founder campaigns for selection
  const { data: founderCampaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/founder"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/campaigns/founder");
      return response.json();
    },
  });

  // Save email settings mutation
  const saveEmailSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/founder/email-settings", data),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Email settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/founder/email-settings"] });
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save email settings",
        variant: "destructive",
      });
    },
  });

  // Send email campaign mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/founder/email-campaigns", data),
    onSuccess: (data: any) => {
      toast({
        title: "Email Campaign Sent",
        description: `Successfully sent ${data.emails} personalized emails.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/founder/email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/founder/email-rate-limit"] });
      setSelectedInvestors([]);
      setEmailSubject("");
      setEmailMessage("");
      setIsComposeOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email campaign",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (currentEmailSettings) {
      setEmailSettings({
        verifiedEmail: currentEmailSettings.verifiedEmail || "",
        displayName: currentEmailSettings.displayName || "",
        signature: currentEmailSettings.signature || ""
      });
    }
  }, [currentEmailSettings]);

  const handleInvestorSelect = (investor: InvestorDirectory) => {
    if (selectedInvestors.find(i => i.email === investor.email)) {
      setSelectedInvestors(prev => prev.filter(i => i.email !== investor.email));
    } else {
      if (selectedInvestors.length >= 5) {
        toast({
          title: "Limit Reached",
          description: "You can select up to 5 investors per campaign.",
          variant: "destructive",
        });
        return;
      }
      setSelectedInvestors(prev => [...prev, investor]);
    }
  };

  const applyTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailMessage(template.content);
  };

  const generateCampaignEmail = (campaign: any) => {
    const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
    const fundingGoal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(campaign.fundingGoal);
    
    const subject = `Investment Opportunity: ${campaign.companyName} - ${campaign.title}`;
    const message = `Hi {name},

I hope this email finds you well.

I'm excited to share an investment opportunity with you for ${campaign.companyName}, a ${campaign.businessSector} startup that's revolutionizing the industry.

🚀 **Campaign Overview:**
• Company: ${campaign.companyName}
• Funding Goal: ${fundingGoal}
• Minimum Investment: $${campaign.minimumInvestment}
• Business Focus: ${campaign.businessSector}

💡 **Why This Matters:**
${campaign.description ? campaign.description.substring(0, 200) + '...' : 'This innovative company is positioned for significant growth and offers an exciting opportunity for early investors.'}

🔗 **View Full Campaign:** ${campaignUrl}

We're offering SAFE agreements with attractive terms for early investors. This is a limited-time opportunity to get in on the ground floor of what we believe will be a game-changing company.

I'd love to discuss this opportunity with you further. Would you be available for a brief call this week?

Best regards,
{signature}

P.S. Feel free to review all the details, including our business plan, financials, and team information at the campaign link above.`;

    setEmailSubject(subject);
    setEmailMessage(message);
    setSelectedCampaignId(campaign.id);
    toast({
      title: "Campaign Email Generated",
      description: `Email template created for ${campaign.companyName}`,
    });
  };

  const handleSendEmails = () => {
    if (!selectedInvestors.length) {
      toast({
        title: "No Recipients",
        description: "Please select at least one investor.",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }

    if (!rateLimit?.canSend) {
      toast({
        title: "Daily Limit Reached",
        description: "You have reached your daily email limit of 5 emails.",
        variant: "destructive",
      });
      return;
    }

    const recipients = selectedInvestors.map(inv => ({
      name: inv.name,
      email: inv.email,
      source: inv.source
    }));

    sendEmailMutation.mutate({
      subject: emailSubject,
      message: emailMessage,
      recipients
    });
  };

  const filteredInvestors = investors.filter((investor: InvestorDirectory) =>
    investor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-fundry-navy">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/founder-dashboard">
                <Button variant="ghost" size="sm" className="text-fundry-navy hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-fundry-navy">Investor Outreach</h1>
            </div>
            <div className="flex items-center space-x-3">
              {rateLimit && (
                <div className="text-sm text-fundry-navy">
                  {rateLimit.remaining} of {rateLimit.dailyLimit} emails remaining today
                </div>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-fundry-navy border-fundry-navy hover:bg-blue-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Email Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Email Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="verifiedEmail">Verified Email Address</Label>
                      <Input
                        id="verifiedEmail"
                        type="email"
                        value={emailSettings.verifiedEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, verifiedEmail: e.target.value }))}
                        placeholder="your.email@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={emailSettings.displayName}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="John Smith, CEO"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signature">Email Signature (Optional)</Label>
                      <Textarea
                        id="signature"
                        value={emailSettings.signature}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, signature: e.target.value }))}
                        placeholder="Best regards,&#10;John Smith&#10;CEO, Your Company"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => saveEmailSettingsMutation.mutate(emailSettings)}
                      disabled={saveEmailSettingsMutation.isPending}
                      className="w-full"
                    >
                      {saveEmailSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border-orange-200">
            <TabsTrigger value="compose" className="data-[state=active]:bg-fundry-orange data-[state=active]:text-white text-orange-100 hover:text-white">Compose Campaign</TabsTrigger>
            <TabsTrigger value="directory" className="data-[state=active]:bg-fundry-orange data-[state=active]:text-white text-orange-100 hover:text-white">Investor Directory</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-fundry-orange data-[state=active]:text-white text-orange-100 hover:text-white">Campaign Analytics</TabsTrigger>
          </TabsList>

          {/* Compose Campaign Tab */}
          <TabsContent value="compose" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Investor Selection */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="flex items-center text-white">
                      <Users className="h-5 w-5 mr-2 text-fundry-orange" />
                      Select Investors ({selectedInvestors.length}/5)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search investors by name, email, or company..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="directory">Admin Directory</SelectItem>
                          <SelectItem value="platform">Platform Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedInvestors.length > 0 && (
                      <div className="border border-orange-300 rounded-lg p-4 bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                        <h4 className="font-medium text-sm mb-2 text-orange-100">Selected Recipients:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedInvestors.map((investor) => (
                            <Badge
                              key={investor.email}
                              className="cursor-pointer bg-fundry-orange text-white hover:bg-orange-600"
                              onClick={() => handleInvestorSelect(investor)}
                            >
                              {investor.name} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {loadingInvestors ? (
                        <div className="text-center py-8">Loading investors...</div>
                      ) : (
                        filteredInvestors.map((investor: InvestorDirectory) => (
                          <div
                            key={investor.email}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                              selectedInvestors.find(i => i.email === investor.email)
                                ? 'bg-gradient-to-r from-fundry-orange/30 to-fundry-navy/30 border-fundry-orange shadow-md'
                                : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-fundry-orange/50'
                            }`}
                            onClick={() => handleInvestorSelect(investor)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-white">{investor.name}</h4>
                                  <Badge className={investor.source === 'directory' ? 'bg-fundry-orange text-white' : 'bg-fundry-navy text-white'}>
                                    {investor.source === 'directory' ? 'Directory' : 'Platform'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-orange-100">{investor.email}</p>
                                {investor.company && (
                                  <p className="text-sm text-orange-200 flex items-center mt-1">
                                    <Building className="h-3 w-3 mr-1 text-fundry-orange" />
                                    {investor.company}
                                    {investor.title && ` • ${investor.title}`}
                                  </p>
                                )}
                                {investor.location && (
                                  <p className="text-sm text-orange-200 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1 text-fundry-orange" />
                                    {investor.location}
                                  </p>
                                )}
                              </div>
                              <Checkbox
                                checked={selectedInvestors.some(i => i.email === investor.email)}
                                className="data-[state=checked]:bg-fundry-orange data-[state=checked]:border-fundry-orange"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Composition */}
                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="flex items-center text-white">
                      <Mail className="h-5 w-5 mr-2 text-fundry-orange" />
                      Compose Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-white">
                    {/* Campaign Selection */}
                    <div>
                      <Label htmlFor="campaign" className="text-white">Select Campaign (Optional)</Label>
                      <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Choose a campaign to auto-generate email content" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Campaign Selected</SelectItem>
                          {founderCampaigns.map((campaign: any) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.companyName} - {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCampaignId && (
                        <Button
                          onClick={() => {
                            const campaign = founderCampaigns.find((c: any) => c.id.toString() === selectedCampaignId);
                            if (campaign) generateCampaignEmail(campaign);
                          }}
                          className="mt-2 bg-fundry-orange/20 hover:bg-fundry-orange/30 text-white border border-fundry-orange/40"
                          size="sm"
                        >
                          Generate Campaign Email
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-white">Subject Line</Label>
                      <Input
                        id="subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Partnership opportunity with {name}"
                        className="bg-white/10 border-white/20 text-white placeholder:text-orange-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-white">Message</Label>
                      <Textarea
                        id="message"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Hi {name},&#10;&#10;I hope this email finds you well..."
                        rows={8}
                        className="bg-white/10 border-white/20 text-white placeholder:text-orange-200"
                      />
                      <p className="text-xs text-orange-200 mt-1">
                        Use {"{name}"} to personalize with recipient's name
                      </p>
                    </div>
                    <Button
                      onClick={handleSendEmails}
                      disabled={!selectedInvestors.length || !emailSubject.trim() || !emailMessage.trim() || sendEmailMutation.isPending || !rateLimit?.canSend}
                      className="w-full bg-fundry-orange hover:bg-orange-600 text-white"
                    >
                      {sendEmailMutation.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Email Campaign ({selectedInvestors.length} recipients)
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Templates & Rate Limit */}
              <div className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="text-white">Daily Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    {rateLimit && (
                      <div className="space-y-3">
                        <Progress value={(rateLimit.used / rateLimit.dailyLimit) * 100} className="bg-white/20" />
                        <div className="flex justify-between text-sm">
                          <span>Used: {rateLimit.used}</span>
                          <span>Limit: {rateLimit.dailyLimit}</span>
                        </div>
                        <p className="text-xs text-orange-200">
                          Daily limit resets at midnight
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="text-white">Email Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    <div className="space-y-3">
                      {templates.map((template: EmailTemplate) => (
                        <div
                          key={template.id}
                          className="border border-white/20 rounded-lg p-3 cursor-pointer hover:bg-white/20 hover:border-fundry-orange/50 transition-all duration-300"
                          onClick={() => applyTemplate(template)}
                        >
                          <h4 className="font-medium text-sm text-white">{template.name}</h4>
                          <p className="text-xs text-orange-200">{template.category}</p>
                          <p className="text-xs text-orange-100 mt-1 truncate">{template.subject}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory">
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white">Complete Investor Directory</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investors.map((investor: InvestorDirectory) => (
                    <div key={investor.email} className="border border-white/20 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{investor.name}</h4>
                        <Badge className={investor.source === 'directory' ? 'bg-fundry-orange text-white' : 'bg-fundry-navy text-white'}>
                          {investor.source === 'directory' ? 'Directory' : 'Platform'}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-100 mb-2">{investor.email}</p>
                      {investor.company && (
                        <p className="text-sm text-orange-200 mb-1">{investor.company}</p>
                      )}
                      {investor.bio && (
                        <p className="text-xs text-orange-200 line-clamp-2">{investor.bio}</p>
                      )}
                      {investor.linkedinUrl && (
                        <a
                          href={investor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-fundry-orange hover:text-orange-300 hover:underline flex items-center mt-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="text-white">Email Campaign History</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    <div className="space-y-4">
                      {campaigns.map((campaign: EmailCampaign) => (
                        <div key={campaign.id} className="border border-white/20 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white">{campaign.subject}</h4>
                            <Badge className={campaign.status === 'sent' ? 'bg-fundry-orange text-white' : 'bg-fundry-navy text-white'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-orange-200">Sent</p>
                              <p className="font-medium text-white">{campaign.sentCount}</p>
                            </div>
                            <div>
                              <p className="text-orange-200">Delivered</p>
                              <p className="font-medium text-white">{campaign.deliveredCount}</p>
                            </div>
                            <div>
                              <p className="text-orange-200">Opened</p>
                              <p className="font-medium text-white">{campaign.openedCount}</p>
                            </div>
                            <div>
                              <p className="text-orange-200">Replied</p>
                              <p className="font-medium text-white">{campaign.repliedCount}</p>
                            </div>
                          </div>
                          {campaign.sentAt && (
                            <p className="text-xs text-orange-100 mt-2">
                              Sent: {new Date(campaign.sentAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                    <CardTitle className="text-white">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-fundry-orange">
                          {campaigns.reduce((sum: number, c: EmailCampaign) => sum + c.sentCount, 0)}
                        </p>
                        <p className="text-sm text-orange-200">Total Emails Sent</p>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-400">
                          {campaigns.reduce((sum: number, c: EmailCampaign) => sum + c.repliedCount, 0)}
                        </p>
                        <p className="text-sm text-orange-200">Total Replies</p>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">
                          {campaigns.length > 0 
                            ? Math.round((campaigns.reduce((sum: number, c: EmailCampaign) => sum + c.openedCount, 0) / campaigns.reduce((sum: number, c: EmailCampaign) => sum + c.sentCount, 0)) * 100)
                            : 0}%
                        </p>
                        <p className="text-sm text-orange-200">Average Open Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}