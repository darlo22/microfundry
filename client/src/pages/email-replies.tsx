import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Mail, 
  Star, 
  Archive, 
  Search, 
  Filter, 
  Reply, 
  MoreHorizontal,
  ArrowLeft,
  Eye,
  EyeOff,
  MessageCircle,
  Calendar,
  User,
  Building,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FundryLogo } from "@/components/ui/fundry-logo";

interface EmailReply {
  id: number;
  outreachEmailId: number;
  campaignId: number;
  senderEmail: string;
  senderName: string;
  subject: string;
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'interested';
  category: 'interest' | 'question' | 'rejection' | 'meeting_request' | 'follow_up' | 'other';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  isArchived: boolean;
  isStarred: boolean;
  tags: string[];
  receivedAt: string;
  respondedAt: string | null;
  campaignTitle: string;
}

interface EmailReplyStats {
  totalReplies: number;
  unreadReplies: number;
  starredReplies: number;
  respondedReplies: number;
  recentReplies: number;
  responseRate: number;
  repliesByCategory: Array<{ category: string; count: number }>;
  repliesBySentiment: Array<{ sentiment: string; count: number }>;
}

export default function EmailReplies() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseSubject, setResponseSubject] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email replies with filters
  const { data: repliesData, isLoading: repliesLoading } = useQuery({
    queryKey: ['/api/email-replies', { 
      status: activeTab === 'all' ? undefined : activeTab,
      category: filterCategory === 'all' ? undefined : filterCategory,
      priority: filterPriority === 'all' ? undefined : filterPriority,
      search: searchTerm || undefined
    }],
    enabled: true,
  });

  // Fetch email reply stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/email-replies/stats'],
    enabled: true,
  });

  const stats: EmailReplyStats = statsData || {
    totalReplies: 0,
    unreadReplies: 0,
    starredReplies: 0,
    respondedReplies: 0,
    recentReplies: 0,
    responseRate: 0,
    repliesByCategory: [],
    repliesBySentiment: []
  };

  const replies: EmailReply[] = repliesData?.replies || [];

  // Update reply mutation
  const updateReplyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PATCH", `/api/email-replies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-replies/stats'] });
      toast({ title: "Reply updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update reply", variant: "destructive" });
    },
  });

  // Send response mutation
  const sendResponseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("POST", `/api/email-replies/${id}/respond`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-replies/stats'] });
      setReplyModalOpen(false);
      setResponseText("");
      setResponseSubject("");
      setSelectedReply(null);
      toast({ title: "Response sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send response", variant: "destructive" });
    },
  });

  const handleToggleRead = (reply: EmailReply) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { isRead: !reply.isRead }
    });
  };

  const handleToggleStar = (reply: EmailReply) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { isStarred: !reply.isStarred }
    });
  };

  const handleToggleArchive = (reply: EmailReply) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { isArchived: !reply.isArchived }
    });
  };

  const handleUpdateCategory = (reply: EmailReply, category: string) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { category }
    });
  };

  const handleUpdatePriority = (reply: EmailReply, priority: string) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { priority }
    });
  };

  const handleUpdateSentiment = (reply: EmailReply, sentiment: string) => {
    updateReplyMutation.mutate({
      id: reply.id,
      data: { sentiment }
    });
  };

  const handleSendResponse = () => {
    if (!selectedReply || !responseText.trim() || !responseSubject.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    sendResponseMutation.mutate({
      id: selectedReply.id,
      data: {
        subject: responseSubject,
        message: responseText
      }
    });
  };

  const openReplyModal = (reply: EmailReply) => {
    setSelectedReply(reply);
    setResponseSubject(`Re: ${reply.subject}`);
    setResponseText("");
    setReplyModalOpen(true);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'interest': return 'bg-emerald-100 text-emerald-800';
      case 'meeting_request': return 'bg-purple-100 text-purple-800';
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'rejection': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Header */}
      <div className="bg-fundry-navy shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/founder-dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <FundryLogo className="h-8" />
              <h1 className="text-xl font-semibold text-white">Email Responses & Replies</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Replies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReplies}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unreadReplies}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Starred</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.starredReplies}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-green-600">{stats.respondedReplies}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent (30d)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recentReplies}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.responseRate}%</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search replies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="meeting_request">Meeting Request</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All Replies</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {repliesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading email replies...</p>
              </div>
            ) : replies.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No replies found</h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' 
                      ? "You haven't received any email replies yet."
                      : `No ${activeTab} replies found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <Card key={reply.id} className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow ${reply.isRead ? '' : 'ring-2 ring-blue-200'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{reply.senderName || reply.senderEmail}</span>
                              <span className="text-sm text-gray-500">{reply.senderEmail}</span>
                            </div>
                            {reply.campaignTitle && (
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{reply.campaignTitle}</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`text-lg font-medium mb-2 ${reply.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {reply.subject}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {reply.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getSentimentColor(reply.sentiment)}>
                              {reply.sentiment}
                            </Badge>
                            <Badge className={getCategoryColor(reply.category)}>
                              {reply.category?.replace('_', ' ') || 'uncategorized'}
                            </Badge>
                            <Badge className={getPriorityColor(reply.priority)}>
                              {reply.priority} priority
                            </Badge>
                            {reply.tags && reply.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-gray-400" />
                                {reply.tags.slice(0, 2).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {reply.tags.length > 2 && (
                                  <span className="text-xs text-gray-500">+{reply.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(reply.receivedAt).toLocaleDateString()}
                            </div>
                            {reply.respondedAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Responded {new Date(reply.respondedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRead(reply)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {reply.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(reply)}
                            className={reply.isStarred ? "text-yellow-500 hover:text-yellow-600" : "text-gray-500 hover:text-gray-700"}
                          >
                            <Star className="h-4 w-4" fill={reply.isStarred ? "currentColor" : "none"} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReplyModal(reply)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleToggleArchive(reply)}>
                                <Archive className="h-4 w-4 mr-2" />
                                {reply.isArchived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdatePriority(reply, reply.priority === 'high' ? 'medium' : 'high')}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Set {reply.priority === 'high' ? 'Medium' : 'High'} Priority
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reply Modal */}
        <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-fundry-navy">
                Reply to {selectedReply?.senderName || selectedReply?.senderEmail}
              </DialogTitle>
            </DialogHeader>
            
            {selectedReply && (
              <div className="space-y-4">
                {/* Original Message Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-2">Original Message:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {selectedReply.subject}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {selectedReply.message}
                  </p>
                </div>

                {/* Response Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="response-subject">Subject</Label>
                    <Input
                      id="response-subject"
                      value={responseSubject}
                      onChange={(e) => setResponseSubject(e.target.value)}
                      placeholder="Reply subject..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="response-message">Message</Label>
                    <Textarea
                      id="response-message"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setReplyModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendResponse}
                      disabled={sendResponseMutation.isPending || !responseText.trim() || !responseSubject.trim()}
                      className="bg-fundry-orange hover:bg-orange-600"
                    >
                      {sendResponseMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}