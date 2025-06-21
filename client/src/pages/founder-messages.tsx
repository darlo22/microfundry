import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  HelpCircle, 
  Bell, 
  Reply, 
  CheckCircle, 
  Clock, 
  User,
  ArrowLeft,
  Send,
  Eye,
  AlertCircle,
  Info,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface CampaignComment {
  id: number;
  campaignId: number;
  userId: string;
  content: string;
  isLeadInvestor: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  campaign: {
    title: string;
    companyName: string;
  };
}

interface CampaignQuestion {
  id: number;
  campaignId: number;
  userId: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  campaign: {
    title: string;
    companyName: string;
  };
  answeredByUser?: {
    firstName: string;
    lastName: string;
  };
}

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  adminUser?: {
    firstName: string;
    lastName: string;
  };
}

export default function FounderMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuestion, setSelectedQuestion] = useState<CampaignQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);

  // Fetch campaign comments for founder's campaigns
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/founder/${user?.id}/comments`],
    enabled: !!user?.id,
  });

  // Fetch campaign questions for founder's campaigns
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/founder/${user?.id}/questions`],
    enabled: !!user?.id,
  });

  // Fetch admin notifications for founder
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: [`/api/founder/${user?.id}/admin-notifications`],
    enabled: !!user?.id,
  });

  // Answer question mutation
  const answerQuestionMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      return apiRequest("PUT", `/api/questions/${questionId}/answer`, { answer });
    },
    onSuccess: () => {
      toast({
        title: "Answer Submitted",
        description: "Your answer has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/founder/${user?.id}/questions`] });
      setShowAnswerDialog(false);
      setAnswerText("");
      setSelectedQuestion(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark notification as read mutation
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/founder/${user?.id}/admin-notifications`] });
    },
  });

  const handleAnswerQuestion = (question: CampaignQuestion) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || "");
    setShowAnswerDialog(true);
  };

  const handleSubmitAnswer = () => {
    if (!selectedQuestion || !answerText.trim()) return;
    
    answerQuestionMutation.mutate({
      questionId: selectedQuestion.id,
      answer: answerText.trim(),
    });
  };

  const handleMarkAsRead = (notificationId: number) => {
    markNotificationReadMutation.mutate(notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security': return <AlertCircle className="h-4 w-4" />;
      case 'general': return <Info className="h-4 w-4" />;
      case 'update': return <Bell className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/founder-dashboard">
              <Button variant="outline" size="sm" className="text-slate-900 border-slate-600 hover:bg-slate-800 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/landing">
                <img 
                  src="/attached_assets/WhatsApp Image 2025-06-20 at 12.22.18_1750418617903.jpeg" 
                  alt="Fundry" 
                  className="h-12 w-auto cursor-pointer"
                />
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-fundry-orange to-fundry-navy p-6 rounded-2xl text-white shadow-xl">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Message Centre
            </h1>
            <p className="text-orange-100 mt-2">
              Manage campaign comments, answer investor questions, and view admin notifications
            </p>
          </div>
        </div>

        {/* Message Centre Tabs */}
        <Tabs defaultValue="comments" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700 p-1 rounded-xl">
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-300 px-6 py-3 rounded-lg font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Campaign Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="questions" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-300 px-6 py-3 rounded-lg font-medium"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Q&A ({questions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-300 px-6 py-3 rounded-lg font-medium"
            >
              <Bell className="h-4 w-4 mr-2" />
              Admin Notifications ({notifications.filter(n => !n.isRead).length})
            </TabsTrigger>
          </TabsList>

          {/* Campaign Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
              </div>
            ) : comments.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-200 mb-2">No Comments Yet</h3>
                  <p className="text-slate-400">
                    Comments from investors will appear here when they engage with your campaigns.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: CampaignComment) => (
                  <Card key={comment.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-fundry-orange to-orange-600 rounded-full p-2">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200">
                              {comment.user.firstName} {comment.user.lastName}
                            </h4>
                            <p className="text-sm text-slate-400">{comment.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.isLeadInvestor && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                              Lead Investor
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-fundry-orange">
                          {comment.campaign.companyName} - {comment.campaign.title}
                        </h5>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Questions & Answers Tab */}
          <TabsContent value="questions" className="space-y-4">
            {questionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
              </div>
            ) : questions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-200 mb-2">No Questions Yet</h3>
                  <p className="text-slate-400">
                    Questions from potential investors will appear here for you to answer.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question: CampaignQuestion) => (
                  <Card key={question.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2">
                            <HelpCircle className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200">
                              {question.user.firstName} {question.user.lastName}
                            </h4>
                            <p className="text-sm text-slate-400">{question.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {question.answer ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Answered
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-fundry-orange">
                          {question.campaign.companyName} - {question.campaign.title}
                        </h5>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h6 className="text-sm font-medium text-slate-300 mb-2">Question:</h6>
                        <p className="text-slate-300 leading-relaxed bg-slate-700 p-3 rounded-lg">
                          {question.question}
                        </p>
                      </div>
                      
                      {question.answer && (
                        <div>
                          <h6 className="text-sm font-medium text-slate-300 mb-2">Your Answer:</h6>
                          <p className="text-slate-300 leading-relaxed bg-green-50 p-3 rounded-lg border border-green-200">
                            {question.answer}
                          </p>
                          {question.answeredAt && (
                            <p className="text-xs text-slate-400 mt-2">
                              Answered {formatDistanceToNow(new Date(question.answeredAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleAnswerQuestion(question)}
                          className="bg-fundry-orange hover:bg-orange-600 text-white"
                          size="sm"
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          {question.answer ? "Edit Answer" : "Answer Question"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Admin Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {notificationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
              </div>
            ) : notifications.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-200 mb-2">No Notifications</h3>
                  <p className="text-slate-400">
                    Admin notifications and important platform updates will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification: AdminNotification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-slate-700 hover:border-slate-600 transition-colors ${
                      notification.isRead ? 'bg-slate-800' : 'bg-slate-750 border-l-4 border-l-fundry-orange'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${getPriorityColor(notification.priority)}`}>
                            {getCategoryIcon(notification.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-200">{notification.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-slate-400 border-slate-600">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              onClick={() => handleMarkAsRead(notification.id)}
                              variant="outline"
                              size="sm"
                              className="text-slate-300 border-slate-600 hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <div className="text-right">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {notification.adminUser && (
                              <p className="text-xs text-slate-500 mt-1">
                                From: {notification.adminUser.firstName} {notification.adminUser.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Answer Question Dialog */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border border-orange-200/50 shadow-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-fundry-navy flex items-center gap-2">
              <Reply className="h-5 w-5" />
              Answer Question
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-2">Question:</h6>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                  {selectedQuestion.question}
                </p>
              </div>
              
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h6>
                <Textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Provide a detailed answer to help the investor..."
                  className="min-h-[120px] resize-none text-gray-900 placeholder:text-gray-500"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAnswerDialog(false)}
                  disabled={answerQuestionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || answerQuestionMutation.isPending}
                  className="bg-fundry-orange hover:bg-orange-600 text-white"
                >
                  {answerQuestionMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit Answer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}