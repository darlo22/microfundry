import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Users, Heart, MessageCircle, Eye, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
                      {update.attachmentUrls.map((url, index) => (
                        <div key={index} className="mb-2">
                          {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={url} 
                              alt="Update attachment" 
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                            />
                          ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video 
                              controls 
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                            >
                              <source src={url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View Attachment
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Update Text */}
                  <div className="prose prose-gray max-w-none mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{update.content}</p>
                  </div>
                </div>

                {/* Engagement Bar */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>24 views</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span>3 replies</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(update.id)}
                        className={`flex items-center space-x-1 ${
                          likedUpdates.has(update.id) 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            likedUpdates.has(update.id) ? 'fill-current' : ''
                          }`} 
                        />
                        <span>{likedUpdates.has(update.id) ? '13' : '12'}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(update.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Reply</span>
                      </Button>
                    </div>
                  </div>

                  {/* Reply Section */}
                  {showReplies.has(update.id) && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyTexts[update.id] || ''}
                          onChange={(e) => setReplyTexts(prev => ({
                            ...prev,
                            [update.id]: e.target.value
                          }))}
                          className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex justify-end mt-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}