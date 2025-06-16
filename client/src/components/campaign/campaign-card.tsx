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
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "funded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {campaign.logoUrl && (
            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src={campaign.logoUrl} 
                alt={campaign.title}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status === "active" && campaign.deadline && new Date(campaign.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                  ? "Closing Soon" 
                  : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)
                }
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-3">{campaign.shortPitch}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Raised</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(campaign.totalRaised)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Goal</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(campaign.fundingGoal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Investors</p>
                <p className="text-xl font-bold text-gray-900">{campaign.investorCount}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{campaign.progressPercent}%</span>
              </div>
              <Progress value={campaign.progressPercent} className="h-2" />
            </div>

            {campaign.deadline && (
              <div className="flex items-center text-sm text-amber-600">
                <Clock className="mr-2" size={16} />
                <span>Deadline: {formatDate(campaign.deadline)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          <Link href={`/campaign/${campaign.id}`}>
            <Button className="bg-fundry-orange hover:bg-orange-600">
              <Eye className="mr-2" size={16} />
              View
            </Button>
          </Link>
          
          {isFounder && (
            <>
              <Button variant="outline">
                <Edit className="mr-2" size={16} />
                Edit
              </Button>
              <Button variant="outline">
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
