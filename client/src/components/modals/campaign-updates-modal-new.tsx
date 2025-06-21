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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-lg">
        <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Campaign Updates</DialogTitle>
              <p className="text-blue-100 mt-1">Latest news from your investments</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Updates Yet</h3>
              <p className="text-gray-400">The founder hasn't posted any updates for this campaign.</p>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Update Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {update.founder ? 
                          `${update.founder.firstName?.[0] || ''}${update.founder.lastName?.[0] || ''}` : 
                          'F'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {update.founder ? `${update.founder.firstName} ${update.founder.lastName}` : 'Founder'}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                        <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Everyone</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getBadgeColor(update.type)} capitalize px-3 py-1 text-xs font-medium rounded-full`}>
                      {update.type}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Update Content */}
                <div className="px-6 pb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{update.title}</h2>
                  
                  {/* Featured Media */}
                  {update.attachmentUrls && update.attachmentUrls.length > 0 && (
                    <div className="mb-4">
                      {update.attachmentUrls.map((url, index) => {
                        const fileName = url.split('/').pop() || `attachment-${index + 1}`;
                        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(fileName);
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                        if (isVideo) {
                          return (
                            <div key={index} className="rounded-lg overflow-hidden bg-gray-900 mb-4">
                              <video
                                controls
                                className="w-full"
                                style={{ maxHeight: '400px' }}
                              >
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          );
                        } else if (isImage) {
                          return (
                            <div key={index} className="rounded-lg overflow-hidden mb-4">
                              <img
                                src={url}
                                alt={`Update ${index + 1}`}
                                className="w-full h-auto"
                                style={{ maxHeight: '500px', objectFit: 'cover' }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  <div className="prose max-w-none text-gray-700">
                    <p className="leading-relaxed whitespace-pre-wrap">{update.content}</p>
                  </div>
                </div>

                {/* Engagement Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => toggleLike(update.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${likedUpdates.has(update.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm font-medium">
                        {likedUpdates.has(update.id) ? '3' : '2'}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => toggleReplies(update.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">0</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Eye className="h-5 w-5" />
                      <span className="text-sm font-medium">416</span>
                    </div>
                  </div>
                </div>

                {/* Reply Section */}
                {showReplies.has(update.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="mt-4">
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-300 text-gray-600 text-sm">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyTexts[update.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({
                              ...prev,
                              [update.id]: e.target.value
                            }))}
                            className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={!replyTexts[update.id]?.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}