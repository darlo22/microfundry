import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { CampaignWithStats } from "@/lib/types";

interface SafeAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  safeAgreement: any;
  campaign: CampaignWithStats;
}

export default function SafeAgreementModal({ 
  isOpen, 
  onClose, 
  investment, 
  safeAgreement, 
  campaign 
}: SafeAgreementModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [agreementConsent, setAgreementConsent] = useState(false);
  const [accreditedInvestor, setAccreditedInvestor] = useState(false);

  const signInvestmentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/investments/${investment.id}/sign`, {
        signature: fullName,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Investment Successful!",
        description: "You will receive a confirmation email with your SAFE agreement.",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error signing investment:", error);
      toast({
        title: "Error",
        description: "Failed to sign investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignAgreement = () => {
    if (!fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full legal name.",
        variant: "destructive",
      });
      return;
    }

    if (!agreementConsent || !accreditedInvestor) {
      toast({
        title: "Missing Consent",
        description: "Please confirm all checkboxes to proceed.",
        variant: "destructive",
      });
      return;
    }

    signInvestmentMutation.mutate();
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `$${num.toLocaleString()}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canProceed = fullName.trim() && agreementConsent && accreditedInvestor;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            SAFE Agreement Review
          </DialogTitle>
          <p className="text-gray-600">Please review and sign your investment agreement</p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Agreement Document */}
          <Card className="bg-gray-50">
            <CardContent className="p-6 max-h-96 overflow-y-auto">
              <div className="bg-white p-8 shadow-sm">
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold">SIMPLE AGREEMENT FOR FUTURE EQUITY</h1>
                  <p className="text-gray-600 mt-2">(SAFE)</p>
                </div>

                <div className="space-y-6 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-semibold mb-2">AGREEMENT DETAILS</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Company:</strong> {campaign.title} Inc.
                      </div>
                      <div>
                        <strong>Investor:</strong> {user?.firstName} {user?.lastName}
                      </div>
                      <div>
                        <strong>Investment Amount:</strong> {formatCurrency(investment.amount)}
                      </div>
                      <div>
                        <strong>Agreement Date:</strong> {getCurrentDate()}
                      </div>
                      <div>
                        <strong>Discount Rate:</strong> {campaign.discountRate}%
                      </div>
                      <div>
                        <strong>Valuation Cap:</strong> {formatCurrency(campaign.valuationCap || "1000000")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">1. INVESTMENT</h3>
                    <p>The Investor agrees to invest the Investment Amount in the Company upon the execution of this Agreement.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2. CONVERSION EVENTS</h3>
                    <p>This SAFE will automatically convert into shares of the Company's preferred stock upon the occurrence of an Equity Financing or Liquidity Event, subject to the terms and conditions set forth herein.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">3. DISCOUNT RATE</h3>
                    <p>If this SAFE converts in connection with an Equity Financing, the Investor will receive a {campaign.discountRate}% discount on the price per share paid by new investors in such financing round.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">4. VALUATION CAP</h3>
                    <p>The conversion will be based on a pre-money valuation not to exceed {formatCurrency(campaign.valuationCap || "1000000")}, providing downside protection for the Investor.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">5. GOVERNING LAW</h3>
                    <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-800">Important Legal Notice</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    By signing this agreement, you acknowledge that you have read, understood, and agree to all terms and conditions. This is a legally binding document.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Signature Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Digital Signature</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Legal Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full legal name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreementConsent"
                      checked={agreementConsent}
                      onCheckedChange={setAgreementConsent}
                      className="mt-1"
                    />
                    <Label htmlFor="agreementConsent" className="text-sm text-gray-700 leading-relaxed">
                      I have read and agree to the terms of this SAFE Agreement. I understand this is a legally binding contract.
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="accreditedInvestor"
                      checked={accreditedInvestor}
                      onCheckedChange={setAccreditedInvestor}
                      className="mt-1"
                    />
                    <Label htmlFor="accreditedInvestor" className="text-sm text-gray-700 leading-relaxed">
                      I confirm that I am an accredited investor as defined by securities regulations.
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
            <Button
              onClick={handleSignAgreement}
              className="bg-fundry-orange hover:bg-orange-600"
              disabled={!canProceed || signInvestmentMutation.isPending}
            >
              {signInvestmentMutation.isPending 
                ? "Processing..." 
                : "Sign & Complete Investment"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
