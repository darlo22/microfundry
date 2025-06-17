import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, TrendingUp, DollarSign, Mail, Phone, Calendar, Filter, Download, Eye, Send, X, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 11, 2025, 05_42_54 AM (1)_1750153181796.png";

interface Investment {
  id: number;
  amount: string;
  status: "pending" | "committed" | "paid";
  createdAt: string;
  investor: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface InvestorProfile {
  id: string;
  name: string;
  email: string;
  totalInvested: string;
  investmentCount: number;
  firstInvestment: string;
  status: "active" | "committed" | "pending";
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  location: string;
  phone?: string;
}

export default function FounderInvestors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    content: "",
    messageType: "general",
    recipients: "all"
  });
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  // File attachment handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fetch all investments for founder's campaigns
  const { data: investments = [], isLoading } = useQuery({
    queryKey: [`/api/investments/founder/${user?.id}`],
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const formData = new FormData();
      
      // Add text fields
      formData.append('subject', messageData.subject);
      formData.append('content', messageData.content);
      formData.append('messageType', messageData.messageType);
      formData.append('recipients', JSON.stringify(messageData.recipients));
      
      // Add file attachments
      messageData.attachments?.forEach((file: File, index: number) => {
        formData.append(`attachment_${index}`, file);
      });
      
      return await fetch("/api/investor-messages", {
        method: "POST",
        body: formData, // Don't set Content-Type header for FormData
      }).then(res => {
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the selected investors.",
      });
      setShowComposeModal(false);
      setMessageForm({
        subject: "",
        content: "",
        messageType: "general",
        recipients: "all"
      });
      setSelectedInvestors([]);
      setAttachments([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process investments to create investor profiles
  const investorProfiles: InvestorProfile[] = Array.isArray(investments) 
    ? (investments as any[])
        .filter(investment => investment.status === 'committed' || investment.status === 'paid' || investment.status === 'completed')
        .reduce((profiles: InvestorProfile[], investment: any) => {
        const existingProfile = profiles.find(p => p.email === investment.investor.email);
        
        if (existingProfile) {
          existingProfile.totalInvested = (parseFloat(existingProfile.totalInvested) + parseFloat(investment.amount)).toString();
          existingProfile.investmentCount += 1;
          if (new Date(investment.createdAt) < new Date(existingProfile.firstInvestment)) {
            existingProfile.firstInvestment = investment.createdAt;
          }
        } else {
          profiles.push({
            id: investment.investor.email,
            name: `${investment.investor.firstName} ${investment.investor.lastName}`,
            email: investment.investor.email,
            totalInvested: investment.amount,
            investmentCount: 1,
            firstInvestment: investment.createdAt,
            status: investment.status === "paid" || investment.status === "completed" ? "active" : investment.status,
            riskProfile: parseFloat(investment.amount) > 5000 ? "Aggressive" : parseFloat(investment.amount) > 1000 ? "Moderate" : "Conservative",
            location: "Not provided",
          });
        }
        
        return profiles;
      }, [])
    : [];

  // Filter and sort investors
  const filteredInvestors = investorProfiles
    .filter(investor => {
      const matchesSearch = investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          investor.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || investor.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return parseFloat(b.totalInvested) - parseFloat(a.totalInvested);
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
        default:
          return new Date(b.firstInvestment).getTime() - new Date(a.firstInvestment).getTime();
      }
    });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "committed": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Conservative": return "bg-green-100 text-green-800";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Aggressive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalInvestors = investorProfiles.length;
  const totalInvested = investorProfiles.reduce((sum, investor) => sum + parseFloat(investor.totalInvested), 0);
  const activeInvestors = investorProfiles.filter(i => i.status === "active").length;
  const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0;



  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading investor data...</div>
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
                className="h-12 w-auto"
              />
            </div>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investors</h1>
          <p className="text-gray-600">Manage and track your investor relationships</p>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-fundry-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investors</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvestors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Investors</p>
                <p className="text-2xl font-bold text-gray-900">{activeInvestors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageInvestment.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search investors by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="committed">Committed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Recent First</SelectItem>
                    <SelectItem value="amount">Investment Amount</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investor List */}
          <div className="grid gap-4">
            {filteredInvestors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Investors Found</h3>
                  <p className="text-gray-600">
                    {totalInvestors === 0 
                      ? "You haven't received any investments yet. Share your campaign to attract investors."
                      : "No investors match your current search criteria."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInvestors.map((investor) => (
                <Card key={investor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-fundry-orange rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                          <p className="text-sm text-gray-600">{investor.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(investor.status)}>
                              {investor.status}
                            </Badge>
                            <Badge className={getRiskColor(investor.riskProfile)}>
                              {investor.riskProfile}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(investor.totalInvested)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {investor.investmentCount} investment{investor.investmentCount !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {new Date(investor.firstInvestment).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Investor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced analytics and detailed investor insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investor Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication Hub</h3>
                <p className="text-gray-600">
                  Send updates, newsletters, and messages to your investors from here.
                </p>
                <Button 
                  className="mt-4 bg-fundry-orange hover:bg-orange-600"
                  onClick={() => setShowComposeModal(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Compose Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Modal */}
      <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-fundry-orange" />
              Compose Message to Investors
            </DialogTitle>
            <DialogDescription>
              Send updates, announcements, or messages to your investors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Message Type */}
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select 
                value={messageForm.messageType} 
                onValueChange={(value) => setMessageForm(prev => ({ ...prev, messageType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Update</SelectItem>
                  <SelectItem value="milestone">Milestone Achievement</SelectItem>
                  <SelectItem value="financial">Financial Update</SelectItem>
                  <SelectItem value="announcement">Important Announcement</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select 
                value={messageForm.recipients} 
                onValueChange={(value) => setMessageForm(prev => ({ ...prev, recipients: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Investors ({investorProfiles.length})</SelectItem>
                  <SelectItem value="active">Active Investors Only</SelectItem>
                  <SelectItem value="committed">Committed Investors Only</SelectItem>
                  <SelectItem value="selected">Selected Investors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject..."
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Write your message to investors..."
                value={messageForm.content}
                onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="flex items-center space-x-2 text-gray-600 hover:text-fundry-orange transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium">Add Files</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Images, Videos, PDFs, Documents (Max 10MB each)
                  </p>
                </label>
              </div>

              {/* Show attached files */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {(messageForm.subject || messageForm.content || attachments.length > 0) && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Preview</h4>
                <div className="space-y-2">
                  {messageForm.subject && (
                    <div>
                      <span className="text-xs text-gray-500">Subject:</span>
                      <p className="font-medium">{messageForm.subject}</p>
                    </div>
                  )}
                  {messageForm.content && (
                    <div>
                      <span className="text-xs text-gray-500">Message:</span>
                      <p className="text-sm whitespace-pre-wrap">{messageForm.content}</p>
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Attachments:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {attachments.map((file, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {getFileIcon(file.type)} {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button variant="outline" onClick={() => setShowComposeModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Ensure we have valid investor profiles
                const profiles = investorProfiles || [];
                
                let recipientEmails: string[] = [];
                
                if (messageForm.recipients === "all") {
                  recipientEmails = profiles.map(p => p.email);
                } else if (messageForm.recipients === "active") {
                  recipientEmails = profiles.filter(p => p.status === "active").map(p => p.email);
                } else if (messageForm.recipients === "committed") {
                  recipientEmails = profiles.filter(p => p.status === "committed").map(p => p.email);
                } else {
                  recipientEmails = selectedInvestors || [];
                }
                
                // Validate recipients before sending
                if (recipientEmails.length === 0) {
                  toast({
                    title: "No Recipients",
                    description: "Please select recipients or ensure you have investors to message.",
                    variant: "destructive",
                  });
                  return;
                }

                const messageData = {
                  subject: messageForm.subject.trim(),
                  content: messageForm.content.trim(),
                  messageType: messageForm.messageType,
                  recipients: recipientEmails,
                  attachments: attachments
                };
                
                console.log('Sending message with data:', messageData);
                sendMessageMutation.mutate(messageData);
              }}
              disabled={
                !messageForm.subject.trim() || 
                !messageForm.content.trim() || 
                sendMessageMutation.isPending
              }
              className="bg-fundry-orange hover:bg-orange-600"
            >
              {sendMessageMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}