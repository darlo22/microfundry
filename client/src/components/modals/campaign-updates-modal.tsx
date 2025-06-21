import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Users, Heart, MessageCircle, Eye, Share2, MoreHorizontal, Play, Pause } from "lucide-react";
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
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleLike = (updateId: number) => {
    setLikedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
        toast({
          title: "Removed like",
          description: "You unliked this update",
        });
      } else {
        newSet.add(updateId);
        toast({
          title: "Liked!",
          description: "You liked this update",
        });
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

  const handleShare = async (update: CampaignUpdate) => {
    const shareData = {
      title: `${update.title} - ${campaignTitle}`,
      text: update.content.substring(0, 100) + '...',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Update shared via device sharing",
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Update link copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Update link copied to clipboard",
      });
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-500 text-white';
      case 'financial':
        return 'bg-green-500 text-white';
      case 'announcement':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRandomViews = (updateId: number) => {
    if (!viewCounts[updateId]) {
      setViewCounts(prev => ({
        ...prev,
        [updateId]: Math.floor(Math.random() * 500) + 50
      }));
    }
    return viewCounts[updateId] || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Campaign Updates</DialogTitle>
                <p className="text-blue-100 mt-1">{campaignTitle}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white px-3 py-1">
              {updates.length} Updates
            </Badge>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-500 mb-3">No Updates Yet</h3>
              <p className="text-gray-400">The founder hasn't posted any updates for this campaign.</p>
            </div>
          ) : (
            <div className="space-y-8 p-6">
              {updates.map((update) => (
                <Card key={update.id} className="overflow-hidden border-0 shadow-lg">
                  {/* Media Section - Takes 2/3 of the space */}
                  {update.attachmentUrls && update.attachmentUrls.length > 0 && (
                    <div className="relative h-96 bg-black">
                      {update.attachmentUrls.map((url, index) => (
                        <div key={index} className="h-full">
                          {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={url} 
                              alt="Update media" 
                              className="w-full h-full object-cover"
                            />
                          ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video 
                              controls 
                              className="w-full h-full object-cover"
                              poster=""
                            >
                              <source src={url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : null}
                        </div>
                      ))}
                      
                      {/* Overlay Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getBadgeColor(update.type)} px-3 py-1 text-sm font-medium shadow-lg`}>
                          {update.type}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {update.founder ? 
                              `${update.founder.firstName?.[0] || ''}${update.founder.lastName?.[0] || ''}` : 
                              'F'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {update.founder ? `${update.founder.firstName} ${update.founder.lastName}` : 'Founder'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>All Investors</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Update Content */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{update.title}</h2>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{update.content}</p>
                      </div>
                    </div>

                    {/* Social Engagement Bar */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">{getRandomViews(update.id).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span className="font-medium">{likedUpdates.has(update.id) ? '24' : '23'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">8</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(update.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                              likedUpdates.has(update.id) 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                likedUpdates.has(update.id) ? 'fill-current' : ''
                              }`} 
                            />
                            <span className="font-medium">Like</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReplies(update.id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-blue-50 text-blue-600"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">Reply</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(update)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-green-50 text-green-600"
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="font-medium">Share</span>
                          </Button>
                        </div>
                      </div>

                      {/* Reply Section */}
                      {showReplies.has(update.id) && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <Textarea
                              placeholder="Write a thoughtful reply..."
                              value={replyTexts[update.id] || ''}
                              onChange={(e) => setReplyTexts(prev => ({
                                ...prev,
                                [update.id]: e.target.value
                              }))}
                              className="min-h-[100px] resize-none border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 rounded-lg"
                            />
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm text-gray-500">
                                {(replyTexts[update.id] || '').length}/500 characters
                              </span>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleReplies(update.id)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                                  disabled={!(replyTexts[update.id] || '').trim()}
                                >
                                  Post Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Sample Replies */}
                          <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-green-500 text-white text-sm">JD</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">John Doe</span>
                                    <span className="text-gray-400 text-xs">2 hours ago</span>
                                  </div>
                                  <p className="text-gray-700 text-sm mt-1">Great progress! Looking forward to the next milestone.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}