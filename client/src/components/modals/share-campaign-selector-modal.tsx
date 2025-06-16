import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShareCampaignModal } from "./share-campaign-modal";
import { Share2, Copy, Check, Eye, DollarSign } from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

interface ShareCampaignSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: CampaignWithStats[];
}

export function ShareCampaignSelectorModal({ 
  isOpen, 
  onClose, 
  campaigns 
}: ShareCampaignSelectorModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithStats | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuickCopy = async (campaign: CampaignWithStats) => {
    const shareUrl = `${window.location.origin}/c/${campaign.privateLink}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(campaign.privateLink);
      toast({
        title: "Link Copied!",
        description: `${campaign.title} campaign link copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(campaign.privateLink);
      toast({
        title: "Link Copied!",
        description: `${campaign.title} campaign link copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleAdvancedShare = (campaign: CampaignWithStats) => {
    setSelectedCampaign(campaign);
    setShowShareModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <>
      <Dialog open={isOpen && !showShareModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Campaigns
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">
              Select a campaign to share with potential investors. You can quickly copy the link or use advanced sharing options.
            </p>

            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Share2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns to share</h3>
                <p className="text-gray-500">Create your first campaign to start sharing with investors.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{campaign.shortPitch}</p>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Raised:</span>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(campaign.totalRaised)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Goal:</span>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(campaign.fundingGoal)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Investors:</span>
                              <div className="font-medium text-gray-900">
                                {campaign.investorCount}
                              </div>
                            </div>
                          </div>
                        </div>

                        {campaign.logoUrl && (
                          <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center ml-4 overflow-hidden shadow-sm">
                            <img 
                              src={campaign.logoUrl} 
                              alt={campaign.title}
                              className="w-full h-full object-contain p-2"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleQuickCopy(campaign)}
                          variant="outline"
                          className="flex items-center gap-2 flex-1"
                        >
                          {copied === campaign.privateLink ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Quick Copy Link
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleAdvancedShare(campaign)}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                        >
                          <Share2 className="w-4 h-4" />
                          Advanced Share
                        </Button>

                        <Button
                          onClick={() => window.open(`/campaign/${campaign.id}`, '_blank')}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Private Link: /c/{campaign.privateLink}</div>
                          <div>Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">Sharing Tips</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Share private links with serious investors only</li>
                <li>• Use advanced sharing for social media and email campaigns</li>
                <li>• Track engagement through your analytics dashboard</li>
                <li>• Always include a personal message when sharing</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Share Modal */}
      {selectedCampaign && (
        <ShareCampaignModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedCampaign(null);
          }}
          campaignTitle={selectedCampaign.title}
          campaignUrl={`${window.location.origin}/c/${selectedCampaign.privateLink}`}
          shortPitch={selectedCampaign.shortPitch}
        />
      )}
    </>
  );
}