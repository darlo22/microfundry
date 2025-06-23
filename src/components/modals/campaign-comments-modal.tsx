import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Crown, User, Calendar, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CampaignCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
}

interface CampaignComment {
  id: number;
  campaignId: number;
  userId: string;
  content: string;
  isLeadInvestor: boolean;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function CampaignCommentsModal({ isOpen, onClose, campaignId, campaignTitle }: CampaignCommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaign comments
  const { data: comments = [], isLoading } = useQuery<CampaignComment[]>({
    queryKey: [`/api/campaigns/${campaignId}/comments`],
    enabled: isOpen && !!campaignId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to comment");
      }
      return apiRequest("POST", `/api/campaigns/${campaignId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/comments`] });
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been shared with other investors.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  // Sort comments - lead investors first, then by date
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isLeadInvestor && !b.isLeadInvestor) return -1;
    if (!a.isLeadInvestor && b.isLeadInvestor) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-green-50/70 to-blue-50/50 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4 bg-gradient-to-r from-green-600 to-blue-500 text-white -m-6 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">What People Say</DialogTitle>
              <p className="text-green-100 text-sm">{campaignTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
                <p className="text-gray-500">Be the first to share your thoughts about this campaign.</p>
              </div>
            ) : (
              sortedComments.map((comment) => (
                <Card key={comment.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-green-200">
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-blue-100 text-green-700 font-semibold">
                          {getInitials(comment.user?.firstName, comment.user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {comment.user?.firstName} {comment.user?.lastName}
                          </span>
                          {comment.isLeadInvestor && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Lead Investor
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add Comment Section */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts about this campaign..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    {addCommentMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Sign in to join the conversation</p>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  Sign In to Comment
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}