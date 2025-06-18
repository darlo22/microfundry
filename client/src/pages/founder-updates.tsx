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
import { Plus, Edit, Send, Calendar, Users, TrendingUp, MessageSquare, Eye, Trash2, ArrowLeft, LogOut, ThumbsUp, Reply, Share2, Heart, Upload, X, Image, Video, FileIcon, Paperclip } from "lucide-react";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";

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

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

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

  // Fetch interactions for each update
  const { data: interactions = {} } = useQuery<Record<number, any>>({
    queryKey: ["/api/campaign-updates/interactions", updates.map(u => u.id)],
    enabled: updates.length > 0,
    queryFn: async () => {
      const interactionData: Record<number, any> = {};
      await Promise.all(
        updates.map(async (update) => {
          try {
            const response = await fetch(`/api/campaign-updates/${update.id}/interactions`);
            if (response.ok) {
              interactionData[update.id] = await response.json();
            }
          } catch (error) {
            console.error(`Failed to fetch interactions for update ${update.id}:`, error);
          }
        })
      );
      return interactionData;
    },
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
    setAttachedFiles([]);
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (updateId: number) => {
      const response = await apiRequest(`/api/campaign-updates/${updateId}/like`, "POST");
      return response.json();
    },
    onSuccess: (data: any, updateId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-updates/interactions"] });
      
      const newLikedUpdates = new Set(likedUpdates);
      if (data.liked) {
        newLikedUpdates.add(updateId);
      } else {
        newLikedUpdates.delete(updateId);
      }
      setLikedUpdates(newLikedUpdates);
      setLikeCounts(prev => ({ ...prev, [updateId]: data.count }));
      
      toast({
        title: data.liked ? "Update Liked" : "Like Removed",
        description: data.liked ? "You liked this update!" : "You removed your like from this update.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ updateId, content }: { updateId: number; content: string }) => {
      const response = await apiRequest(`/api/campaign-updates/${updateId}/reply`, "POST", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-updates/interactions"] });
      setReplyingTo(null);
      setReplyText("");
      
      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (updateId: number) => {
      const response = await apiRequest(`/api/campaign-updates/${updateId}/share`, "POST");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Update Shared",
        description: "This update has been shared successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record share. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handler functions for interactive features
  const handleLike = (updateId: number) => {
    likeMutation.mutate(updateId);
  };

  const handleReply = (updateId: number) => {
    setReplyingTo(updateId);
    setReplyText("");
  };

  const handleSubmitReply = (updateId: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ updateId, content: replyText });
  };

  const handleShare = (update: CampaignUpdate) => {
    const shareData = {
      title: `${update.title} - Campaign Update`,
      text: `Check out this update from ${update.campaign.title}: ${update.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => {
        shareMutation.mutate(update.id);
      }).catch(() => {
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
                className="h-32 w-auto"
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
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingUpdate ? "Edit Update" : "Create New Update"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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

                {/* File Attachments Section */}
                <div className="space-y-4">
                  <Label>Attachments</Label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-fundry-orange bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supports: Images, Videos, PDFs, Documents (Max 10MB each)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="mx-auto"
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>

                  {/* Attached Files Display */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.type)}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                        disabled={likeMutation.isPending}
                        className={`flex items-center gap-2 transition-colors ${
                          likedUpdates.has(update.id)
                            ? 'text-red-600 hover:text-red-700 bg-red-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedUpdates.has(update.id) ? 'fill-current' : ''}`} />
                        Like ({interactions[update.id]?.likes || likeCounts[update.id] || 12})
                      </Button>

                      {/* Share Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(update)}
                        disabled={shareMutation.isPending}
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
                        {Math.floor(Math.random() * 200) + 50} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {interactions[update.id]?.replies || 3} replies
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
                          disabled={!replyText.trim() || replyMutation.isPending}
                          className="bg-fundry-orange hover:bg-orange-600"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {replyMutation.isPending ? "Posting..." : "Post Reply"}
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