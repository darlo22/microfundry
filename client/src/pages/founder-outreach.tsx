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
  Plus,
  Building,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Edit,
  Target,
  Trash2,
  Filter,
  RefreshCw
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
  const [emailRecipients, setEmailRecipients] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("none");
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [showInvestorList, setShowInvestorList] = useState(true);
  const [emailSettings, setEmailSettings] = useState({
    verifiedEmail: "",
    displayName: "",
    signature: ""
  });
  const [isEmailSettingsSaved, setIsEmailSettingsSaved] = useState(false);

  // Fetch email settings
  const { data: currentEmailSettings } = useQuery({
    queryKey: ["/api/founder/email-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founder/email-settings");
      return response.json();
    },
  });

  // Fetch investor directory with pagination
  const { data: investorData, isLoading: loadingInvestors } = useQuery({
    queryKey: ["/api/founder/investor-directory", sourceFilter, searchTerm, currentPage],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/founder/investor-directory?source=${sourceFilter}&search=${searchTerm}&page=${currentPage}&limit=30`);
      return response.json();
    },
  });

  const investors = investorData?.investors || [];
  const pagination = investorData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  };

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
      setIsEmailSettingsSaved(true);
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
      setEmailRecipients("");
      setShowInvestorList(true);
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

  // Reset pagination when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sourceFilter]);

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

  // Count actual email recipients from the text field
  const getRecipientCount = () => {
    if (!emailRecipients.trim()) return 0;
    return emailRecipients.split(',').filter(email => email.trim().length > 0).length;
  };

  const emailTemplateVariations = [
    {
      subject: `Investment Opportunity: {companyName} - {title}`,
      message: `Hi {name},

I hope this email finds you well.

I'm excited to share an investment opportunity with you for {companyName}, a {businessSector} startup that's revolutionizing the industry.

🚀 **Campaign Overview:**
• Company: {companyName}
• Funding Goal: {fundingGoal}
• Minimum Investment: {minimumInvestment}
• Business Focus: {businessSector}

💡 **Why This Matters:**
{description}

🔗 **View Full Campaign:** {campaignUrl}

We're offering SAFE agreements with attractive terms for early investors. This is a limited-time opportunity to get in on the ground floor of what we believe will be a game-changing company.

I'd love to discuss this opportunity with you further. Would you be available for a brief call this week?

Best regards,
{signature}

P.S. Feel free to review all the details, including our business plan, financials, and team information at the campaign link above.`
    },
    {
      subject: `Exclusive Early Investment - {companyName} Funding Round`,
      message: `Dear {name},

I'm reaching out with an exclusive opportunity to join {companyName}'s early funding round.

**About {companyName}:**
{companyName} is disrupting the {businessSector} space with innovative solutions that address real market needs.

**Investment Highlights:**
✅ Target Raise: {fundingGoal}
✅ Minimum Entry: {minimumInvestment}
✅ Secured via SAFE Agreement
✅ Early Investor Benefits Available

**What Sets Us Apart:**
{description}

**Ready to Learn More?**
Review our complete pitch: {campaignUrl}

This round is moving quickly, and we're prioritizing investors who align with our vision and can add strategic value beyond capital.

Would you be interested in a 15-minute conversation to explore this opportunity?

Best,
{signature}`
    },
    {
      subject: `{companyName} Seeks Strategic Investors - {businessSector} Innovation`,
      message: `Hello {name},

I hope you're doing well. I'm writing to introduce {companyName} and our current funding initiative.

**The Opportunity:**
{companyName} is transforming {businessSector} through {description}

**Key Details:**
• Raising: {fundingGoal}
• Investment Starting At: {minimumInvestment}
• Structure: SAFE Agreement
• Stage: Early Growth Phase

**Why Now?**
The {businessSector} market is experiencing significant growth, and we're positioned to capture substantial market share with our differentiated approach.

**Next Steps:**
I invite you to review our full campaign materials at: {campaignUrl}

If this aligns with your investment thesis, I'd welcome the opportunity to discuss how you could participate in our growth story.

Looking forward to your thoughts.

Regards,
{signature}

---
{companyName} | Building the Future of {businessSector}`
    },
    {
      subject: `Partner with {companyName} - Transforming {businessSector}`,
      message: `Hi {name},

I'm excited to connect with you about {companyName}, where we're building the next generation of {businessSector} solutions.

**Our Mission:**
{description}

**Investment Overview:**
💰 Funding Goal: {fundingGoal}
🎯 Minimum Investment: {minimumInvestment}
📋 Terms: SAFE Agreement
🚀 Use of Funds: Accelerating growth & market expansion

**Why {companyName}?**
• Experienced founding team
• Proven market demand
• Scalable business model
• Clear path to profitability

**Take a Deeper Look:**
Complete campaign details: {campaignUrl}

I believe {companyName} represents a compelling investment opportunity, and I'd value your perspective on our approach.

Are you available for a brief discussion this week?

Best regards,
{signature}

P.S. Early investors receive additional benefits and preferred access to future rounds.`
    },
    {
      subject: `Investment Alert: {companyName} ({businessSector}) Now Accepting Investors`,
      message: `{name},

Quick introduction - I'm the founder of {companyName}, and we're currently raising our seed round.

**The Bottom Line:**
We're solving critical problems in {businessSector} and need strategic investors to scale our solution.

**Fast Facts:**
→ Target: {fundingGoal}
→ Minimum: {minimumInvestment}
→ Structure: SAFE
→ Traction: [Insert key metric]

**The Problem We're Solving:**
{description}

**Why This Matters to You:**
The {businessSector} market is ripe for disruption, and first-mover advantage is critical.

**Full Details Here:** {campaignUrl}

I respect your time, so I'll be direct: we're looking for investors who see the potential in {businessSector} innovation and want to be part of building something significant.

Interested in a 10-minute call to explore fit?

{signature}
Founder, {companyName}`
    }
  ];

  const generateCampaignEmail = (campaign: any, templateIndex: number = 0) => {
    const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
    const fundingGoal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(campaign.fundingGoal);
    
    const minimumInvestment = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(campaign.minimumInvestment || 25);
    
    const template = emailTemplateVariations[templateIndex];
    const subject = template.subject
      .replace('{companyName}', campaign.companyName)
      .replace('{title}', campaign.title)
      .replace('{businessSector}', campaign.businessSector);
    
    const message = template.message
      .replace(/{companyName}/g, campaign.companyName)
      .replace(/{businessSector}/g, campaign.businessSector)
      .replace(/{fundingGoal}/g, fundingGoal)
      .replace(/{minimumInvestment}/g, minimumInvestment)
      .replace(/{campaignUrl}/g, campaignUrl)
      .replace(/{description}/g, campaign.description ? campaign.description.substring(0, 200) + '...' : 'This innovative company is positioned for significant growth and offers an exciting opportunity for early investors.');

    setEmailSubject(subject);
    setEmailMessage(message);
    setSelectedCampaignId(campaign.id.toString());
    setCurrentTemplateIndex(templateIndex);
    
    toast({
      title: "Campaign Email Generated",
      description: `Email template ${templateIndex + 1} created for ${campaign.companyName}`,
    });
  };

  const regenerateEmail = () => {
    if (selectedCampaignId && selectedCampaignId !== "none") {
      const campaign = founderCampaigns.find((c: any) => c.id.toString() === selectedCampaignId);
      if (campaign) {
        const nextIndex = (currentTemplateIndex + 1) % emailTemplateVariations.length;
        generateCampaignEmail(campaign, nextIndex);
      }
    }
  };

  const handleSendEmails = () => {
    // Parse email recipients from the text field
    const emailList = emailRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please enter email addresses or select investors.",
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

    // Create recipients from email list
    const recipients = emailList.map(email => ({
      name: email.split('@')[0], // Use email prefix as name if no name available
      email: email,
      source: 'manual'
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
                    {!isEmailSettingsSaved ? (
                      <Button 
                        onClick={() => saveEmailSettingsMutation.mutate(emailSettings)}
                        disabled={saveEmailSettingsMutation.isPending}
                        className="w-full"
                      >
                        {saveEmailSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          disabled
                          className="w-full bg-green-600 hover:bg-green-600 cursor-default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Email Verified
                        </Button>
                        <Button 
                          onClick={() => {
                            setIsEmailSettingsSaved(false);
                            setEmailSettings({
                              verifiedEmail: "",
                              displayName: "",
                              signature: ""
                            });
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Email
                        </Button>
                      </div>
                    )}
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
                {showInvestorList && (
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
                        <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Filter by source" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="all" className="text-fundry-navy hover:bg-gray-100">All Sources</SelectItem>
                          <SelectItem value="directory" className="text-fundry-navy hover:bg-gray-100">Admin Directory</SelectItem>
                          <SelectItem value="platform" className="text-fundry-navy hover:bg-gray-100">Platform Users</SelectItem>
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
                        investors.map((investor: InvestorDirectory) => (
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
                    
                    {/* Pagination Controls - Always show when pagination exists */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm text-orange-100">
                        <div>
                          Showing {Math.min((pagination.currentPage - 1) * 30 + 1, pagination.totalCount)} - {Math.min(pagination.currentPage * 30, pagination.totalCount)} of {pagination.totalCount.toLocaleString()} investors
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={!pagination.hasPrev || loadingInvestors}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-1 text-white">
                            Page {pagination.currentPage} of {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={!pagination.hasNext || loadingInvestors}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

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
                          <SelectItem value="none">No Campaign Selected</SelectItem>
                          {founderCampaigns.map((campaign: any) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.companyName} - {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCampaignId && selectedCampaignId !== "none" && (
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
                    
                    {/* Email Recipients Field */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="recipients" className="text-white">Email Recipients</Label>
                        <Button
                          onClick={() => {
                            const emails = selectedInvestors.map(inv => inv.email).join(', ');
                            setEmailRecipients(emails);
                            setShowInvestorList(false);
                          }}
                          disabled={selectedInvestors.length === 0}
                          variant="outline"
                          size="sm"
                          className="bg-fundry-orange/20 hover:bg-fundry-orange/30 text-white border border-fundry-orange/40 text-xs"
                        >
                          Use Selected ({selectedInvestors.length})
                        </Button>
                      </div>
                      <Textarea
                        id="recipients"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        placeholder="Enter email addresses separated by commas (e.g., investor1@email.com, investor2@email.com)"
                        className="bg-white/10 border-white/20 text-white placeholder:text-orange-200 min-h-[80px]"
                        rows={3}
                      />
                      <p className="text-xs text-orange-200 mt-1">
                        Enter email addresses manually or click "Use Selected" to populate from your investor selection
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subject" className="text-white">Subject Line</Label>
                        {emailSubject && selectedCampaignId && selectedCampaignId !== "none" && (
                          <Button
                            onClick={regenerateEmail}
                            variant="outline"
                            size="sm"
                            className="bg-fundry-navy/20 hover:bg-fundry-navy/30 text-white border border-fundry-navy/40 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate Draft
                          </Button>
                        )}
                      </div>
                      <Input
                        id="subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Partnership opportunity with {name}"
                        className="bg-white/10 border-white/20 text-white placeholder:text-orange-200"
                      />
                      {emailSubject && selectedCampaignId && selectedCampaignId !== "none" && (
                        <p className="text-xs text-orange-200 mt-1 flex items-center">
                          <span className="mr-1">✨</span>
                          AI-generated campaign email draft. Click "Regenerate Draft" for alternative versions.
                        </p>
                      )}
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
                      disabled={getRecipientCount() === 0 || !emailSubject.trim() || !emailMessage.trim() || sendEmailMutation.isPending || !rateLimit?.canSend}
                      className="w-full bg-fundry-orange hover:bg-orange-600 text-white"
                    >
                      {sendEmailMutation.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Email Campaign ({getRecipientCount()} recipients)
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

                {/* Campaign-Specific Templates */}
                {founderCampaigns.length > 0 && (
                  <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                    <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                      <CardTitle className="flex items-center text-white">
                        <Target className="h-5 w-5 mr-2 text-fundry-orange" />
                        Campaign-Specific Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-white">
                      <div className="space-y-3">
                        {founderCampaigns.map((campaign: any) => (
                          <div
                            key={campaign.id}
                            className="border border-white/20 rounded-lg p-3 cursor-pointer hover:bg-white/20 hover:border-fundry-orange/50 transition-all duration-300"
                            onClick={() => generateCampaignEmail(campaign)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-sm text-white">{campaign.companyName}</h4>
                                <p className="text-xs text-orange-200">{campaign.title}</p>
                                <p className="text-xs text-orange-100 mt-1">
                                  Auto-generates investment opportunity email with campaign link
                                </p>
                              </div>
                              <Badge className="bg-fundry-orange/20 text-fundry-orange border border-fundry-orange/30">
                                Campaign
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-fundry-orange/10 border border-fundry-orange/30 rounded-lg">
                        <p className="text-xs text-orange-200">
                          💡 <strong>Pro Tip:</strong> Campaign templates automatically include your campaign link, 
                          funding details, and compelling investment messaging tailored to your specific startup.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                {/* Search and Filter Controls */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search investors by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-orange-200"
                    />
                  </div>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all" className="text-fundry-navy hover:bg-gray-100">All Sources</SelectItem>
                      <SelectItem value="directory" className="text-fundry-navy hover:bg-gray-100">Admin Directory</SelectItem>
                      <SelectItem value="platform" className="text-fundry-navy hover:bg-gray-100">Platform Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loadingInvestors ? (
                  <div className="text-center py-8">Loading investors...</div>
                ) : (
                  <>
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

                    {/* Pagination Controls */}
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm text-orange-100">
                        <div>
                          Showing {Math.min((pagination.currentPage - 1) * 30 + 1, pagination.totalCount)} - {Math.min(pagination.currentPage * 30, pagination.totalCount)} of {pagination.totalCount.toLocaleString()} investors
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={!pagination.hasPrev || loadingInvestors}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-1 text-white">
                            Page {pagination.currentPage} of {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={!pagination.hasNext || loadingInvestors}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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