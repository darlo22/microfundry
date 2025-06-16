import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Share2, MessageCircle, Mail, Twitter, Facebook, Linkedin } from "lucide-react";

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
  const { toast } = useToast();

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

  const shareText = `Check out "${campaignTitle}" on Fundry: ${shortPitch}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(campaignUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(campaignTitle)}&body=${encodedText}%20${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Campaign
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Campaign Link</label>
            <div className="flex gap-2">
              <Input 
                value={campaignUrl} 
                readOnly 
                className="flex-1"
              />
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.twitter, '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.facebook, '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.linkedin, '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareLinks.email, '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                Email
              </Button>
            </div>

            {/* WhatsApp for mobile */}
            <Button
              variant="outline"
              onClick={() => window.open(shareLinks.whatsapp, '_blank')}
              className="w-full flex items-center gap-2 justify-center"
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