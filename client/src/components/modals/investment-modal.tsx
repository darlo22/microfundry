import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SafeAgreementModal from "./safe-agreement-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CampaignWithStats } from "@/lib/types";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

export default function InvestmentModal({ isOpen, onClose, campaign }: InvestmentModalProps) {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showSafeModal, setShowSafeModal] = useState(false);
  const [investmentData, setInvestmentData] = useState<any>(null);

  const presetAmounts = [50, 100, 250];
  const minimumInvestment = parseFloat(campaign.minimumInvestment);

  const calculateFee = (amount: number) => {
    return Math.round(amount * 0.025 * 100) / 100;
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  const createInvestmentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/investments", {
        campaignId: campaign.id,
        amount,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setInvestmentData(data);
      setShowSafeModal(true);
    },
    onError: (error) => {
      console.error("Error creating investment:", error);
      toast({
        title: "Error",
        description: "Failed to create investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePresetAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value) || 0;
    setSelectedAmount(amount);
  };

  const handleProceedToSafe = () => {
    if (selectedAmount < minimumInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${minimumInvestment}`,
        variant: "destructive",
      });
      return;
    }

    createInvestmentMutation.mutate(selectedAmount);
  };

  const handleSafeModalClose = () => {
    setShowSafeModal(false);
    onClose();
    // Reset form
    setSelectedAmount(0);
    setCustomAmount("");
    setInvestmentData(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedAmount(0);
      setCustomAmount("");
      setInvestmentData(null);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">
              Invest in {campaign.title}
            </DialogTitle>
            <p className="text-gray-600">Choose your investment amount</p>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Investment Amount
              </Label>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className={`p-3 text-center border-2 transition-colors ${
                      selectedAmount === amount 
                        ? "border-fundry-orange bg-fundry-orange-light" 
                        : "border-gray-300 hover:border-fundry-orange"
                    }`}
                    onClick={() => handlePresetAmountClick(amount)}
                  >
                    <div className="font-semibold">${amount}</div>
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <Input
                  type="number"
                  className="pl-8"
                  placeholder="Enter custom amount"
                  min={minimumInvestment}
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum investment: ${minimumInvestment}
              </p>
            </div>

            {/* Investment Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Investment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Amount:</span>
                    <span className="font-medium">${selectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (2.5%):</span>
                    <span className="font-medium">${calculateFee(selectedAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-semibold text-gray-900">
                      ${calculateTotal(selectedAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SAFE Agreement Preview */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">SAFE Agreement Terms</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Rate:</span>
                    <span className="font-medium">{campaign.discountRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valuation Cap:</span>
                    <span className="font-medium">
                      ${(parseFloat(campaign.valuationCap || "1000000")).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleProceedToSafe}
                className="w-full bg-fundry-orange hover:bg-orange-600"
                disabled={selectedAmount < minimumInvestment || createInvestmentMutation.isPending}
              >
                {createInvestmentMutation.isPending 
                  ? "Processing..." 
                  : "Proceed to SAFE Agreement"
                }
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSafeModal && investmentData && (
        <SafeAgreementModal
          isOpen={showSafeModal}
          onClose={handleSafeModalClose}
          investment={investmentData.investment}
          safeAgreement={investmentData.safeAgreement}
          campaign={campaign}
        />
      )}
    </>
  );
}
