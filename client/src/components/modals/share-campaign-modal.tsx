import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Share2, MessageCircle, Mail, Twitter, Facebook, Linkedin, Rocket, Star } from "lucide-react";

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignUrl: string;
  shortPitch: string;
}

export function ShareCampaignModal({ 
  isOpen, 
  onClose, 
  campaignTitle, 
  campaignUrl, 
  shortPitch 
}: ShareCampaignModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedAppeal, setCopiedAppeal] = useState(false);
  const { toast } = useToast();

  // Generate compelling investment appeal message
  const generateInvestmentAppeal = () => {
    const minInvestmentAmount = "$25";
    
    return `🚀 **${campaignTitle}** is building **${shortPitch}**.

They're raising their first $5,000 to get off the ground. Be one of their earliest backers and help bring this vision to life.

🔗 ${campaignUrl}

**Minimum investment: ${minInvestmentAmount} | Back now, own a piece of their future.**`;
  };

  const investmentAppeal = generateInvestmentAppeal();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Campaign link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = campaignUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Campaign link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAppeal = async () => {
    try {
      await navigator.clipboard.writeText(investmentAppeal);
      setCopiedAppeal(true);
      toast({
        title: "Investment appeal copied!",
        description: "Ready to share with your network",
      });
      setTimeout(() => setCopiedAppeal(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = investmentAppeal;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAppeal(true);
      toast({
        title: "Investment appeal copied!",
        description: "Ready to share with your network",
      });
      setTimeout(() => setCopiedAppeal(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: campaignTitle,
          text: shortPitch,
          url: campaignUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyLink();
    }
  };

  const encodedAppeal = encodeURIComponent(investmentAppeal);
  const encodedUrl = encodeURIComponent(campaignUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedAppeal}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(`Investment Opportunity: ${campaignTitle}`)}&body=${encodedAppeal}`,
    whatsapp: `https://wa.me/?text=${encodedAppeal}`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            <Share2 className="w-5 h-5 text-orange-600" />
            Share Campaign
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Investment Appeal Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <label className="text-lg font-semibold text-gray-900">Investment Appeal Message</label>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4">
              <Textarea 
                value={investmentAppeal}
                readOnly
                className="min-h-[140px] bg-white/80 border-orange-200 text-sm resize-none"
                placeholder="Generating compelling investment message..."
              />
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={handleCopyAppeal}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                >
                  {copiedAppeal ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied Appeal
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Investment Appeal
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Ready to share with your network</span>
                </div>
              </div>
            </div>
          </div>
          {/* Native Share Button (mobile) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <Button 
              onClick={handleNativeShare} 
              className="w-full flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share via Device
            </Button>
          )}

          {/* Copy Link Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Quick Share Link</label>
            <div className="flex gap-2">
              <Input 
                value={campaignUrl} 
                readOnly 
                className="flex-1 bg-white/80"
              />
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 hover:border-orange-500 hover:text-orange-600"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Share Investment Appeal</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.twitter, '_blank')}
                className="flex items-center gap-2 justify-start hover:border-blue-400 hover:text-blue-600"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.facebook, '_blank')}
                className="flex items-center gap-2 justify-start hover:border-blue-600 hover:text-blue-700"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.linkedin, '_blank')}
                className="flex items-center gap-2 justify-start hover:border-blue-700 hover:text-blue-800"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.email, '_blank')}
                className="flex items-center gap-2 justify-start hover:border-gray-600 hover:text-gray-700"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                Email
              </Button>
            </div>

            {/* WhatsApp for mobile */}
            <Button
              variant="outline"
              onClick={() => window.open(shareLinks.whatsapp, '_blank')}
              className="w-full flex items-center gap-2 justify-center hover:border-green-600 hover:text-green-700"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </Button>
          </div>

          {/* Campaign Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{campaignTitle}</h4>
            <p className="text-sm text-gray-600">{shortPitch}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}