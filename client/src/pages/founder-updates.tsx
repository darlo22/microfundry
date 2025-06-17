import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Send, Calendar, Users, TrendingUp, MessageSquare, Eye, Trash2, ArrowLeft, LogOut, ThumbsUp, Reply, Share2, Heart } from "lucide-react";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 11, 2025, 05_42_54 AM (1)_1750153181796.png";

interface CampaignUpdate {
  id: number;
  campaignId: number;
  title: string;
  content: string;
  type: "milestone" | "progress" | "announcement" | "financial";
  createdAt: string;
  campaign: {
    title: string;
  };
}

export default function FounderUpdates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<CampaignUpdate | null>(null);
  
  // State for interactive features
  const [likedUpdates, setLikedUpdates] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Form state for new/edit update
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    type: "progress" as "milestone" | "progress" | "announcement" | "financial",
    campaignId: "",
  });

  // Fetch founder's campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ["/api/campaigns/founder", user?.id],
    enabled: !!user?.id,
  });

  // Fetch campaign updates
  const { data: updates = [], isLoading: updatesLoading } = useQuery<CampaignUpdate[]>({
    queryKey: ["/api/campaign-updates/founder", user?.id],
    enabled: !!user?.id,
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/campaign-updates", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Update Published",
        description: "Your campaign update has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-updates/founder", user?.id] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to Publish",
        description: "There was an error publishing your update. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/campaign-updates/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Update Modified",
        description: "Your campaign update has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-updates/founder", user?.id] });
      setEditingUpdate(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to Update",
        description: "There was an error updating your update. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteUpdateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/campaign-updates/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Update Deleted",
        description: "Your campaign update has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-updates/founder", user?.id] });
    },
    onError: () => {
      toast({
        title: "Failed to Delete",
        description: "There was an error deleting your update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setUpdateForm({
      title: "",
      content: "",
      type: "progress",
      campaignId: "",
    });
  };

  // Handler functions for interactive features
  const handleLike = (updateId: number) => {
    console.log('Like button clicked for update:', updateId);
    const isLiked = likedUpdates.has(updateId);
    const newLikedUpdates = new Set(likedUpdates);
    
    if (isLiked) {
      newLikedUpdates.delete(updateId);
      setLikeCounts(prev => ({
        ...prev,
        [updateId]: Math.max(0, (prev[updateId] || 0) - 1)
      }));
    } else {
      newLikedUpdates.add(updateId);
      setLikeCounts(prev => ({
        ...prev,
        [updateId]: (prev[updateId] || 0) + 1
      }));
    }
    
    setLikedUpdates(newLikedUpdates);
    
    toast({
      title: isLiked ? "Like Removed" : "Update Liked",
      description: isLiked ? "You removed your like from this update." : "You liked this update!",
    });
  };

  const handleReply = (updateId: number) => {
    console.log('Reply button clicked for update:', updateId);
    setReplyingTo(updateId);
    setReplyText("");
  };

  const handleSubmitReply = (updateId: number) => {
    console.log('Submit reply clicked for update:', updateId);
    if (!replyText.trim()) return;

    toast({
      title: "Reply Posted",
      description: "Your reply has been posted successfully.",
    });
    
    setReplyingTo(null);
    setReplyText("");
  };

  const handleShare = (update: CampaignUpdate) => {
    console.log('Share button clicked for update:', update.id);
    const shareData = {
      title: `${update.title} - Campaign Update`,
      text: `Check out this update from ${update.campaign.title}: ${update.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        handleCopyLink(update);
      });
    } else {
      handleCopyLink(update);
    }
  };

  const handleCopyLink = (update: CampaignUpdate) => {
    console.log('Copying link for update:', update.id);
    const updateUrl = `${window.location.origin}/updates/${update.id}`;
    navigator.clipboard.writeText(updateUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Update link has been copied to your clipboard.",
      });
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateForm.campaignId) {
      toast({
        title: "Campaign Required",
        description: "Please select a campaign for this update.",
        variant: "destructive",
      });
      return;
    }

    if (editingUpdate) {
      updateUpdateMutation.mutate({
        id: editingUpdate.id,
        data: updateForm,
      });
    } else {
      createUpdateMutation.mutate(updateForm);
    }
  };

  const handleEdit = (update: CampaignUpdate) => {
    setEditingUpdate(update);
    setUpdateForm({
      title: update.title,
      content: update.content,
      type: update.type,
      campaignId: update.campaignId.toString(),
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this update? This action cannot be undone.")) {
      deleteUpdateMutation.mutate(id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "milestone": return "bg-green-100 text-green-800";
      case "progress": return "bg-blue-100 text-blue-800";
      case "announcement": return "bg-purple-100 text-purple-800";
      case "financial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "milestone": return <TrendingUp className="h-4 w-4" />;
      case "progress": return <Calendar className="h-4 w-4" />;
      case "announcement": return <MessageSquare className="h-4 w-4" />;
      case "financial": return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Filter updates by selected campaign
  const filteredUpdates = selectedCampaign && selectedCampaign !== "all"
    ? updates.filter((update: CampaignUpdate) => update.campaignId.toString() === selectedCampaign)
    : updates;

  if (campaignsLoading || updatesLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading updates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <Button
              variant="ghost"
              onClick={() => setLocation("/founder-dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            {/* Center: Fundry Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setLocation("/landing")}
            >
              <img 
                src={fundryLogoNew} 
                alt="Fundry" 
                className="h-12 w-auto"
              />
            </div>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Updates</h1>
            <p className="text-gray-600">Keep your investors informed with regular updates</p>
          </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-fundry-orange hover:bg-orange-600"
              onClick={() => {
                setEditingUpdate(null);
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUpdate ? "Edit Update" : "Create New Update"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign</Label>
                <Select 
                  value={updateForm.campaignId} 
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, campaignId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Update Type</Label>
                <Select 
                  value={updateForm.type} 
                  onValueChange={(value: any) => setUpdateForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select update type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress Update</SelectItem>
                    <SelectItem value="milestone">Milestone Achieved</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="financial">Financial Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Update title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={updateForm.content}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your progress, achievements, or important news with your investors..."
                  rows={8}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUpdateMutation.isPending || updateUpdateMutation.isPending}
                  className="bg-fundry-orange hover:bg-orange-600"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {editingUpdate ? "Update" : "Publish"} Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-fundry-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Updates</p>
                <p className="text-2xl font-bold text-gray-900">{updates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {updates.filter((update: CampaignUpdate) => 
                    new Date(update.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Views</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Filter by campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((campaign: any) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <div className="space-y-6">
        {filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Updates Yet</h3>
              <p className="text-gray-600 mb-6">
                Keep your investors engaged by sharing regular updates about your progress.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-fundry-orange hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Update
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredUpdates.map((update: CampaignUpdate) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(update.type)}>
                      {getTypeIcon(update.type)}
                      <span className="ml-1 capitalize">{update.type}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {update.campaign.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(update)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(update.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {update.title}
                </h3>
                
                <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">
                  {update.content}
                </div>

                {/* Interactive Buttons Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Reply Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(update.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>

                      {/* Like Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(update.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          likedUpdates.has(update.id)
                            ? 'text-red-600 hover:text-red-700 bg-red-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedUpdates.has(update.id) ? 'fill-current' : ''}`} />
                        Like ({likeCounts[update.id] || 12})
                      </Button>

                      {/* Share Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(update)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        234 views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        8 replies
                      </span>
                    </div>
                  </div>

                  {/* Reply Input Section */}
                  {replyingTo === update.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(update.id)}
                          disabled={!replyText.trim()}
                          className="bg-fundry-orange hover:bg-orange-600"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}