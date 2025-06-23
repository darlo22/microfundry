import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Users, Heart, MessageCircle, Eye, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
  const { toast } = useToast();

  const toggleLike = (updateId: number) => {
    setLikedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
        toast({ title: "Removed like" });
      } else {
        newSet.add(updateId);
        toast({ title: "Liked!" });
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${update.title} - ${campaignTitle}`,
          text: update.content.substring(0, 100) + '...',
          url: window.location.href
        });
        toast({ title: "Shared successfully!" });
      } catch {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-500 text-white';
      case 'financial': return 'bg-green-500 text-white';
      case 'announcement': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl p-0 rounded-2xl">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white">Campaign Updates</DialogTitle>
                <p className="text-blue-100 mt-2 text-lg">{campaignTitle}</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {updates.length} Updates
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-24 w-24 text-gray-300 mx-auto mb-8" />
              <h3 className="text-2xl font-semibold text-gray-500 mb-4">No Updates Yet</h3>
              <p className="text-gray-400 text-lg">The founder hasn't posted any updates for this campaign.</p>
            </div>
          ) : (
            <div className="p-8 space-y-10">
              {updates.map((update) => (
                <div key={update.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                  
                  {/* LARGE MEDIA SECTION - Takes 2/3 of space */}
                  {update.attachmentUrls && update.attachmentUrls.length > 0 && (
                    <div className="relative h-[500px] bg-gradient-to-br from-gray-900 to-black">
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
                              style={{ minHeight: '500px' }}
                            >
                              <source src={url} type="video/mp4" />
                            </video>
                          ) : null}
                        </div>
                      ))}
                      
                      {/* Floating Badge */}
                      <div className="absolute top-6 right-6">
                        <Badge className={`${getBadgeColor(update.type)} px-4 py-2 text-sm font-bold shadow-2xl backdrop-blur-sm rounded-full`}>
                          {update.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* CONTENT SECTION */}
                  <div className="p-8">
                    {/* Author Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 ring-4 ring-purple-200 shadow-lg">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold text-xl">
                            {update.founder ? 
                              `${update.founder.firstName?.[0] || ''}${update.founder.lastName?.[0] || ''}` : 
                              'F'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl">
                            {update.founder ? `${update.founder.firstName} ${update.founder.lastName}` : 'Founder'}
                          </h3>
                          <div className="flex items-center space-x-3 text-gray-500 mt-1">
                            <span className="font-medium">{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">All Investors</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-3">
                        <MoreHorizontal className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Update Title & Content */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{update.title}</h2>
                      <div className="prose prose-xl max-w-none">
                        <p className="text-gray-700 leading-relaxed text-xl whitespace-pre-wrap font-medium">{update.content}</p>
                      </div>
                    </div>

                    {/* Enhanced Engagement Bar */}
                    <div className="border-t-2 border-gray-100 pt-6">
                      <div className="flex items-center justify-between">
                        {/* Stats */}
                        <div className="flex items-center space-x-8 text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5" />
                            <span className="font-bold text-lg">{Math.floor(Math.random() * 500) + 150}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span className="font-bold text-lg">{likedUpdates.has(update.id) ? '46' : '45'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-bold text-lg">12</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => toggleLike(update.id)}
                            className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 font-bold ${
                              likedUpdates.has(update.id) 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-lg' 
                                : 'hover:bg-gray-100 text-gray-600 hover:shadow-lg'
                            }`}
                          >
                            <Heart 
                              className={`h-5 w-5 ${
                                likedUpdates.has(update.id) ? 'fill-current' : ''
                              }`} 
                            />
                            <span>Like</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => toggleReplies(update.id)}
                            className="flex items-center space-x-3 px-6 py-3 rounded-full hover:bg-blue-50 text-blue-600 hover:shadow-lg transition-all duration-300 font-bold"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>Reply</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleShare(update)}
                            className="flex items-center space-x-3 px-6 py-3 rounded-full hover:bg-green-50 text-green-600 hover:shadow-lg transition-all duration-300 font-bold"
                          >
                            <Share2 className="h-5 w-5" />
                            <span>Share</span>
                          </Button>
                        </div>
                      </div>

                      {/* Reply Section */}
                      {showReplies.has(update.id) && (
                        <div className="mt-8 space-y-6">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                            <Textarea
                              placeholder="Write a thoughtful reply..."
                              value={replyTexts[update.id] || ''}
                              onChange={(e) => setReplyTexts(prev => ({
                                ...prev,
                                [update.id]: e.target.value
                              }))}
                              className="min-h-[120px] resize-none border-0 bg-white shadow-lg focus:ring-2 focus:ring-purple-500 rounded-xl text-lg"
                            />
                            <div className="flex justify-between items-center mt-6">
                              <span className="text-gray-500 font-medium">
                                {(replyTexts[update.id] || '').length}/500 characters
                              </span>
                              <div className="flex space-x-3">
                                <Button 
                                  variant="outline" 
                                  size="lg"
                                  onClick={() => toggleReplies(update.id)}
                                  className="px-6 py-3 rounded-xl font-bold"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="lg" 
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                                  disabled={!(replyTexts[update.id] || '').trim()}
                                >
                                  Post Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}