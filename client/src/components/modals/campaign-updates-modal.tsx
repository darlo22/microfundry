import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Users, Heart, MessageCircle, Eye, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CampaignUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
}

interface CampaignUpdate {
  id: number;
  founderId: string;
  campaignId: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  attachmentUrls?: string[];
  founder?: {
    firstName: string;
    lastName: string;
  };
}

interface UpdateReply {
  id: number;
  updateId: number;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}



export function CampaignUpdatesModal({ isOpen, onClose, campaignId, campaignTitle }: CampaignUpdatesModalProps) {
  const { data: updates = [], isLoading } = useQuery<CampaignUpdate[]>({
    queryKey: [`/api/campaign-updates/campaign/${campaignId}`],
    enabled: isOpen && !!campaignId,
  });

  const [likedUpdates, setLikedUpdates] = useState<Set<number>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<number>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  const toggleLike = (updateId: number) => {
    setLikedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
      } else {
        newSet.add(updateId);
      }
      return newSet;
    });
  };

  const toggleReplies = (updateId: number) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
      } else {
        newSet.add(updateId);
      }
      return newSet;
    });
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white -m-6 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Campaign Updates</DialogTitle>
              <p className="text-blue-100 text-sm">{campaignTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
              <p className="text-gray-500">This campaign hasn't shared any updates with investors yet.</p>
            </div>
          ) : (
            updates.map((update) => {
              const IconComponent = updateTypeIcons[update.type as keyof typeof updateTypeIcons] || FileText;
              const colorClass = updateTypeColors[update.type as keyof typeof updateTypeColors] || "bg-gray-100 text-gray-800 border-gray-200";
              
              return (
                <Card key={update.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{update.founder?.firstName} {update.founder?.lastName}</span>
                            <span>•</span>
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${colorClass} font-medium`}>
                        {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap leading-relaxed">{update.content}</p>
                    </div>

                    {/* Attachments Section */}
                    {update.attachmentUrls && update.attachmentUrls.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {update.attachmentUrls.map((url, index) => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                            const isVideo = /\.(mp4|mov|avi|webm)$/i.test(url);
                            const fileName = url.split('/').pop() || `attachment-${index + 1}`;
                            
                            if (isImage) {
                              return (
                                <div key={index} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                                </div>
                              );
                            } else if (isVideo) {
                              return (
                                <div key={index} className="relative">
                                  <video
                                    src={url}
                                    controls
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                    preload="metadata"
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <FileIcon className="h-8 w-8 text-orange-500 mr-3 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                    <p className="text-xs text-gray-500">Document</p>
                                  </div>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                                  >
                                    View
                                  </a>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {/* Replies Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View Replies
                        </Button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Textarea
                          placeholder="Write a reply to this update..."
                          className="mb-3 resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// UpdateReplies component for handling replies to campaign updates
interface UpdateRepliesProps {
  updateId: number;
}

function UpdateReplies({ updateId }: UpdateRepliesProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch replies for this update
  const { data: replies = [], isLoading: repliesLoading } = useQuery<UpdateReply[]>({
    queryKey: [`/api/campaign-updates/${updateId}/replies`],
    enabled: showReplies,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/campaign-updates/${updateId}/replies`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaign-updates/${updateId}/replies`] });
      setReplyText("");
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the founder",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    createReplyMutation.mutate(replyText.trim());
  };

  // Show replies section even if user is not authenticated, but limit functionality
  console.log('UpdateReplies component rendering for updateId:', updateId);
  console.log('User authentication status:', !!user);
  
  if (!user) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="text-gray-400 cursor-not-allowed"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            View Replies
          </Button>
        </div>
        <p className="text-sm text-gray-500 text-center py-2">
          Please sign in to view and post replies
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(!showReplies)}
          className="text-gray-600 hover:text-gray-800"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {showReplies ? 'Hide Replies' : 'View Replies'}
          {(replies as UpdateReply[]).length > 0 && !showReplies && (
            <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              {(replies as UpdateReply[]).length}
            </span>
          )}
        </Button>
      </div>

      {showReplies && (
        <div className="space-y-4">
          {/* Reply form */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <Textarea
              placeholder="Write a reply to this update..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="mb-3 resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || createReplyMutation.isPending}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {createReplyMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing replies */}
          {repliesLoading ? (
            <div className="text-center py-4 text-gray-500">Loading replies...</div>
          ) : (replies as UpdateReply[]).length > 0 ? (
            <div className="space-y-3">
              {(replies as UpdateReply[]).map((reply) => (
                <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {reply.user?.firstName} {reply.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(reply.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>
      )}
    </div>
  );
}