import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HelpCircle, MessageSquare, User, Calendar, Send, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CampaignQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
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
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  answeredByUser?: {
    firstName: string;
    lastName: string;
  };
}

export function CampaignQuestionsModal({ isOpen, onClose, campaignId, campaignTitle }: CampaignQuestionsModalProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaign questions
  const { data: questions = [], isLoading } = useQuery<CampaignQuestion[]>({
    queryKey: [`/api/campaigns/${campaignId}/questions`],
    enabled: isOpen && !!campaignId,
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to ask a question");
      }
      return apiRequest("POST", `/api/campaigns/${campaignId}/questions`, { question });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/questions`] });
      setNewQuestion("");
      toast({
        title: "Question Submitted",
        description: "Your question has been sent to the founder for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit question",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    addQuestionMutation.mutate(newQuestion.trim());
  };

  // Sort questions - answered first, then by date
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.answer && !b.answer) return -1;
    if (!a.answer && b.answer) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-purple-50/70 to-blue-50/50 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white -m-6 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Ask A Question</DialogTitle>
              <p className="text-purple-100 text-sm">{campaignTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : sortedQuestions.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-500">Be the first to ask the founder a question about this campaign.</p>
              </div>
            ) : (
              sortedQuestions.map((questionItem) => (
                <Card key={questionItem.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    {/* Question */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-10 w-10 border-2 border-purple-200">
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 font-semibold">
                          {getInitials(questionItem.user?.firstName, questionItem.user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {questionItem.user?.firstName} {questionItem.user?.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                            Question
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(questionItem.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          <HelpCircle className="h-4 w-4 inline mr-2 text-purple-600" />
                          {questionItem.question}
                        </p>
                      </div>
                    </div>

                    {/* Answer */}
                    {questionItem.answer && (
                      <div className="ml-14 border-l-2 border-green-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            {questionItem.answeredByUser?.firstName} {questionItem.answeredByUser?.lastName}
                          </span>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Founder
                          </Badge>
                          {questionItem.answeredAt && (
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(questionItem.answeredAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg">
                          {questionItem.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Ask Question Section */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask the founder a question about this campaign..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={!newQuestion.trim() || addQuestionMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                  >
                    {addQuestionMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Ask Question
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Sign in to ask a question</p>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  Sign In to Ask Question
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}