import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FundryLogo } from '@/components/ui/fundry-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MailOpen, 
  Archive, 
  Reply, 
  Search, 
  Filter,
  ArrowLeft,
  Heart,
  MessageSquare,
  TrendingUp,
  Clock,
  Tag,
  MoreVertical,
  Eye,
  Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EmailReply {
  id: number;
  originalEmailId: number;
  senderEmail: string;
  senderName: string;
  subject: string;
  content: string;
  isRead: boolean;
  replyType: 'interested' | 'not_interested' | 'request_info' | 'question' | 'other';
  tags: string[];
  receivedAt: string;
  readAt: string | null;
  archivedAt: string | null;
  originalSubject: string;
  originalRecipient: string;
  campaignName: string;
}

interface ReplyStats {
  total: number;
  unread: number;
  interested: number;
  notInterested: number;
  requestInfo: number;
  questions: number;
  archived: number;
}

export default function FounderInbox() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTypeFilter, setReplyTypeFilter] = useState('all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email replies with filters
  const { data: repliesData, isLoading: repliesLoading } = useQuery({
    queryKey: ['/api/founder/email-replies', selectedTab, replyTypeFilter, searchQuery, currentPage],
    queryFn: () => apiRequest('GET', `/api/founder/email-replies?status=${selectedTab}&replyType=${replyTypeFilter}&page=${currentPage}&limit=20`),
  });

  // Fetch reply statistics
  const { data: stats } = useQuery<ReplyStats>({
    queryKey: ['/api/founder/email-replies/stats'],
    queryFn: () => apiRequest('GET', '/api/founder/email-replies/stats'),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (replyId: number) => apiRequest('PATCH', `/api/founder/email-replies/${replyId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies/stats'] });
      toast({
        title: 'Success',
        description: 'Email marked as read',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark email as read',
        variant: 'destructive',
      });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: ({ replyId, archived }: { replyId: number; archived: boolean }) => 
      apiRequest('PATCH', `/api/founder/email-replies/${replyId}/archive`, { archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies/stats'] });
      toast({
        title: 'Success',
        description: 'Email archived successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to archive email',
        variant: 'destructive',
      });
    },
  });

  // Update reply type mutation
  const updateReplyMutation = useMutation({
    mutationFn: ({ replyId, replyType, tags }: { replyId: number; replyType?: string; tags?: string[] }) => 
      apiRequest('PATCH', `/api/founder/email-replies/${replyId}`, { replyType, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies/stats'] });
      toast({
        title: 'Success',
        description: 'Reply updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update reply',
        variant: 'destructive',
      });
    },
  });

  // Simulate reply mutation (for testing)
  const simulateReplyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/founder/email-replies/simulate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/founder/email-replies/stats'] });
      toast({
        title: 'Success',
        description: 'Test reply created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create test reply',
        variant: 'destructive',
      });
    },
  });

  const replies = repliesData?.replies || [];
  const pagination = repliesData?.pagination;

  const handleViewReply = (reply: EmailReply) => {
    setSelectedReply(reply);
    setIsViewModalOpen(true);
    if (!reply.isRead) {
      markAsReadMutation.mutate(reply.id);
    }
  };

  const getReplyTypeColor = (type: string) => {
    switch (type) {
      case 'interested': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'request_info': return 'bg-blue-100 text-blue-800';
      case 'question': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReplyTypeLabel = (type: string) => {
    switch (type) {
      case 'interested': return 'Interested';
      case 'not_interested': return 'Not Interested';
      case 'request_info': return 'Request Info';
      case 'question': return 'Question';
      default: return 'Other';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/founder-dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <FundryLogo className="h-8" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateReplyMutation.mutate({
                  originalEmailId: 1,
                  senderEmail: 'investor@example.com',
                  senderName: 'Sarah Wilson',
                  subject: 'Re: Investment Opportunity in TechFlow',
                  content: 'Hi, I\'m very interested in learning more about your investment opportunity. Could you send me more details about your business model and financials?',
                  replyType: 'interested'
                })}
                disabled={simulateReplyMutation.isPending}
              >
                Create Test Reply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Inbox</h1>
          <p className="text-gray-600">Manage replies from potential investors</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MailOpen className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Unread</p>
                    <p className="text-2xl font-bold">{stats.unread}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Interested</p>
                    <p className="text-2xl font-bold">{stats.interested}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Not Interested</p>
                    <p className="text-2xl font-bold">{stats.notInterested}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Questions</p>
                    <p className="text-2xl font-bold">{stats.questions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Info Requests</p>
                    <p className="text-2xl font-bold">{stats.requestInfo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Archive className="w-5 h-5" />
                  <div>
                    <p className="text-sm opacity-90">Archived</p>
                    <p className="text-2xl font-bold">{stats.archived}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="unread">Unread</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid w-full grid-cols-2 mt-2">
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Reply Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reply Type</label>
                  <Select value={replyTypeFilter} onValueChange={setReplyTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="request_info">Request Info</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email List */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Email Replies ({replies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {repliesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No email replies found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Email replies from potential investors will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply: EmailReply) => (
                      <div
                        key={reply.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          reply.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => handleViewReply(reply)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {reply.senderName || reply.senderEmail}
                              </h3>
                              {!reply.isRead && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  New
                                </Badge>
                              )}
                              <Badge className={getReplyTypeColor(reply.replyType)}>
                                {getReplyTypeLabel(reply.replyType)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{reply.subject}</p>
                            
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {reply.content}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>From: {reply.senderEmail}</span>
                              {reply.campaignName && (
                                <span>Campaign: {reply.campaignName}</span>
                              )}
                              <span>{formatDistanceToNow(new Date(reply.receivedAt))} ago</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewReply(reply);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  archiveMutation.mutate({ 
                                    replyId: reply.id, 
                                    archived: !reply.archivedAt 
                                  });
                                }}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  {reply.archivedAt ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage >= pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Reply Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email Reply</span>
              </DialogTitle>
              <DialogDescription>
                View and manage email reply from potential investor
              </DialogDescription>
            </DialogHeader>
            
            {selectedReply && (
              <div className="space-y-6">
                {/* Reply Header */}
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedReply.senderName || selectedReply.senderEmail}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedReply.senderEmail}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getReplyTypeColor(selectedReply.replyType)}>
                        {getReplyTypeLabel(selectedReply.replyType)}
                      </Badge>
                      <Select 
                        value={selectedReply.replyType} 
                        onValueChange={(value) => 
                          updateReplyMutation.mutate({ replyId: selectedReply.id, replyType: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="request_info">Request Info</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Subject:</strong> {selectedReply.subject}</p>
                    <p><strong>Original Email:</strong> {selectedReply.originalSubject}</p>
                    <p><strong>Campaign:</strong> {selectedReply.campaignName}</p>
                    <p><strong>Received:</strong> {format(new Date(selectedReply.receivedAt), 'PPpp')}</p>
                  </div>
                </div>

                {/* Reply Content */}
                <div>
                  <h4 className="font-semibold mb-3">Message Content</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedReply.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => 
                        archiveMutation.mutate({ 
                          replyId: selectedReply.id, 
                          archived: !selectedReply.archivedAt 
                        })
                      }
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      {selectedReply.archivedAt ? 'Unarchive' : 'Archive'}
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        window.location.href = `mailto:${selectedReply.senderEmail}?subject=Re: ${selectedReply.subject}`;
                      }}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply via Email
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