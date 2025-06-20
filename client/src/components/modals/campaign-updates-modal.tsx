import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, User, FileText, TrendingUp, DollarSign, Mail } from "lucide-react";
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
  founder?: {
    firstName: string;
    lastName: string;
  };
}

const updateTypeIcons = {
  milestone: TrendingUp,
  financial: DollarSign,
  general: FileText,
  announcement: Mail,
  newsletter: Mail,
};

const updateTypeColors = {
  milestone: "bg-green-100 text-green-800 border-green-200",
  financial: "bg-blue-100 text-blue-800 border-blue-200",
  general: "bg-gray-100 text-gray-800 border-gray-200",
  announcement: "bg-orange-100 text-orange-800 border-orange-200",
  newsletter: "bg-purple-100 text-purple-800 border-purple-200",
};

export function CampaignUpdatesModal({ isOpen, onClose, campaignId, campaignTitle }: CampaignUpdatesModalProps) {
  // Fetch campaign updates
  const { data: updates = [], isLoading } = useQuery<CampaignUpdate[]>({
    queryKey: [`/api/campaign-updates/${campaignId}`],
    enabled: isOpen && !!campaignId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white -m-6 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Campaign Updates</DialogTitle>
              <p className="text-blue-100 text-sm">{campaignTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
              <p className="text-gray-500">This campaign hasn't shared any updates with investors yet.</p>
            </div>
          ) : (
            updates.map((update) => {
              const IconComponent = updateTypeIcons[update.type as keyof typeof updateTypeIcons] || FileText;
              const colorClass = updateTypeColors[update.type as keyof typeof updateTypeColors] || "bg-gray-100 text-gray-800 border-gray-200";
              
              return (
                <Card key={update.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{update.founder?.firstName} {update.founder?.lastName}</span>
                            <span>•</span>
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${colorClass} font-medium`}>
                        {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="whitespace-pre-wrap leading-relaxed">{update.content}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}