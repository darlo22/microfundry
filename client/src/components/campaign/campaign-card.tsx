import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit, Share, Clock } from "lucide-react";
import { Link } from "wouter";
import type { CampaignWithStats } from "@/lib/types";

interface CampaignCardProps {
  campaign: CampaignWithStats;
  isFounder?: boolean;
  onEdit?: (campaign: CampaignWithStats) => void;
  onShare?: (campaign: CampaignWithStats) => void;
}

export default function CampaignCard({ campaign, isFounder = false, onEdit, onShare }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "closed":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      case "funded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const formatCurrency = (amount: string | undefined) => {
    if (!amount || amount === undefined || amount === null) {
      return "$0";
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return "$0";
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="border border-slate-600 rounded-lg p-6 hover:shadow-xl transition-shadow bg-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {campaign.logoUrl && (
            <div className="w-16 h-16 bg-white border-2 border-slate-500 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src={campaign.logoUrl} 
                alt={campaign.title}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{campaign.title}</h3>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status === "active" && campaign.deadline && new Date(campaign.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                  ? "Closing Soon" 
                  : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)
                }
              </Badge>
            </div>
            
            <p className="text-slate-300 mb-3">{campaign.shortPitch}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-400">Raised</p>
                <p className="text-xl font-bold text-white">{formatCurrency(campaign.totalRaised)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Goal</p>
                <p className="text-xl font-bold text-white">{formatCurrency(campaign.fundingGoal)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Investors</p>
                <p className="text-xl font-bold text-white">{campaign.investorCount || 0}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Progress</span>
                <span className="text-sm font-medium text-white">{campaign.progressPercent}%</span>
              </div>
              <Progress value={campaign.progressPercent} className="h-2" />
            </div>

            {campaign.deadline && (
              <div className="flex items-center text-sm text-amber-400">
                <Clock className="mr-2" size={16} />
                <span>Deadline: {formatDate(campaign.deadline)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          <Link href={`/campaign/${campaign.id}`}>
            <Button className="bg-fundry-orange hover:bg-orange-600 text-white">
              <Eye className="mr-2" size={16} />
              View
            </Button>
          </Link>
          
          {isFounder && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onEdit?.(campaign)}
                className="bg-fundry-navy border-2 border-white text-white hover:border-white hover:text-white"
              >
                <Edit className="mr-2" size={16} />
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onShare?.(campaign)}
                className="border-slate-500 text-slate-300 hover:border-fundry-orange hover:text-fundry-orange bg-transparent"
              >
                <Share className="mr-2" size={16} />
                Share
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
