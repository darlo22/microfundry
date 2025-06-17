import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";
import { Link } from "wouter";
import type { InvestmentWithCampaign } from "@/lib/types";

interface InvestmentCardProps {
  investment: InvestmentWithCampaign;
}

export default function InvestmentCard({ investment }: InvestmentCardProps) {
  // Guard against null/undefined investment or campaign data
  if (!investment || !investment.campaign) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
          <div className="w-12 h-12 bg-gradient-to-br from-fundry-orange to-orange-400 rounded-lg flex items-center justify-center">
            {investment.campaign?.logoUrl ? (
              <img 
                src={investment.campaign.logoUrl} 
                alt={investment.campaign?.title || 'Campaign'}
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <span className="text-white font-semibold">
                {investment.campaign?.title?.charAt(0) || 'C'}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{investment.campaign?.title || 'Unknown Campaign'}</h3>
              <Badge className={getStatusColor(investment.status)}>
                {investment.status === "completed" ? "Confirmed" : investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
              </Badge>
            </div>
            
            <div className="text-gray-600 mb-3">{investment.campaign?.shortPitch || 'No description available'}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Your Investment</p>
                <p className="font-semibold text-gray-900">{formatCurrency(investment.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Campaign Status</p>
                <p className="font-semibold text-gray-900">
                  {investment.campaign?.status?.charAt(0).toUpperCase() + investment.campaign?.status?.slice(1) || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Investment Date</p>
                <p className="font-semibold text-gray-900">{formatDate(investment.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className={`font-semibold ${
                  investment.paymentStatus === "completed" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {investment.paymentStatus.charAt(0).toUpperCase() + investment.paymentStatus.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          {investment.campaign?.status !== "cancelled" && investment.campaign?.id && (
            <Link href={`/campaign/${investment.campaign.id}`}>
              <Button className="bg-fundry-orange hover:bg-orange-600 text-sm">
                <Eye className="mr-2" size={16} />
                View Campaign
              </Button>
            </Link>
          )}
          
          {investment.agreementSigned && (
            <Button variant="outline" size="sm">
              <FileText className="mr-2" size={16} />
              SAFE Doc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
