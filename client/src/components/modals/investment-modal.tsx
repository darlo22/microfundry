import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  DollarSign, 
  User, 
  FileText, 
  Shield, 
  PenTool, 
  CheckCircle, 
  Download,
  LogIn,
  UserPlus
} from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";
import FundryLogo from "@/components/ui/fundry-logo";
import { SafeDocumentViewer } from "./safe-document-viewer";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

type InvestmentStep = 'amount' | 'auth' | 'safe-review' | 'terms' | 'signature' | 'confirmation';

interface InvestorDetails {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  investmentExperience: string;
  accreditedInvestor: boolean;
}

interface AuthFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export default function InvestmentModal({ isOpen, onClose, campaign }: InvestmentModalProps) {
  const [currentStep, setCurrentStep] = useState<InvestmentStep>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  const [authFormData, setAuthFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [investorDetails, setInvestorDetails] = useState<InvestorDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    investmentExperience: '',
    accreditedInvestor: false
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSafeViewer, setShowSafeViewer] = useState(false);
  const [createdInvestment, setCreatedInvestment] = useState<any>(null);

  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Helper function to get the current investment amount
  const getCurrentInvestmentAmount = (): number => {
    if (customAmount && parseFloat(customAmount) > 0) {
      return parseFloat(customAmount);
    }
    if (selectedAmount && selectedAmount > 0) {
      return selectedAmount;
    }
    return 0;
  };

  // Commit Investment Mutation
  const commitInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/investments', data);
      return response;
    },
    onSuccess: (data) => {
      setCreatedInvestment(data);
      toast({
        title: "Investment Committed!",
        description: "Redirecting to your dashboard to complete payment...",
      });
      
      // Store investment context for dashboard payment
      localStorage.setItem('investmentContext', JSON.stringify({
        investmentId: data.investment.id,
        amount: getCurrentInvestmentAmount(),
        campaignTitle: campaign.companyName
      }));
      
      // Redirect to investor dashboard after brief delay
      setTimeout(() => {
        onClose();
        setLocation('/investor-dashboard');
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    }
  });

  // Initialize custom amount when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setCurrentStep('amount');
      setSelectedAmount(null);
      setCustomAmount('');
      setShowCustomAmount(false);
    }
  }, [isOpen]);

  // Check for existing investment context when modal opens
  useEffect(() => {
    if (isOpen) {
      const context = localStorage.getItem('investmentContext');
      if (context) {
        const parsedContext = JSON.parse(context);
        toast({
          title: "Previous Investment Detected",
          description: "You have a pending investment. Please complete payment in your dashboard.",
          variant: "default",
        });
        // Clear the context after showing message
        localStorage.removeItem('investmentContext');
      }
    }
  }, [isOpen]);

  const minimumInvestment = 25;
  const maximumInvestment = 5000;
  const presetAmounts = [100, 250, 500, 1000, 2500];

  const steps: { id: InvestmentStep; title: string; icon: any }[] = [
    { id: 'amount', title: 'Investment Amount', icon: DollarSign },
    { id: 'auth', title: 'Authentication', icon: User },
    { id: 'safe-review', title: 'SAFE Agreement Review', icon: FileText },
    { id: 'terms', title: 'Terms & Conditions', icon: Shield },
    { id: 'signature', title: 'Digital Signature', icon: PenTool },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setShowCustomAmount(false);
  };

  const handleCustomAmountToggle = () => {
    setShowCustomAmount(true);
    setSelectedAmount(null);
  };

  const validateStep = (step: InvestmentStep): boolean => {
    switch (step) {
      case 'amount':
        const amount = getCurrentInvestmentAmount();
        return amount >= minimumInvestment && amount <= maximumInvestment;
      case 'auth':
        return isAuthenticated;
      case 'safe-review':
        return true;
      case 'terms':
        return agreedToTerms;
      case 'signature':
        return signatureData.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete this step",
        description: getStepValidationMessage(currentStep),
        variant: "destructive",
      });
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const getStepValidationMessage = (step: InvestmentStep): string => {
    switch (step) {
      case 'amount':
        return `Please select an amount between $${minimumInvestment} and $${maximumInvestment}`;
      case 'auth':
        return "Please sign in or create an account to continue";
      case 'terms':
        return "Please agree to the terms and conditions";
      case 'signature':
        return "Please provide your digital signature";
      default:
        return "Please complete the required information";
    }
  };

  const handleCommitInvestment = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your investment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const investmentData = {
        campaignId: campaign.id,
        amount: getCurrentInvestmentAmount().toString(),
        status: 'committed',
        paymentStatus: 'pending',
        investorDetails: {
          firstName: investorDetails.firstName || user.firstName || '',
          lastName: investorDetails.lastName || user.lastName || '',
          signature: signatureData,
          agreedToTerms: true,
          investmentDate: new Date().toISOString()
        }
      };

      await commitInvestmentMutation.mutateAsync(investmentData);
      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Investment commitment error:', error);
      toast({
        title: "Investment Failed",
        description: error.message || "There was an error committing your investment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Investment Amount</h3>
              <p className="text-gray-600">Choose your investment amount for {campaign.companyName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className="h-12 text-lg"
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount.toLocaleString()}
                </Button>
              ))}
              <Button
                variant={showCustomAmount ? "default" : "outline"}
                className="h-12 text-lg col-span-2"
                onClick={handleCustomAmountToggle}
              >
                Custom Amount
              </Button>
            </div>

            {showCustomAmount && (
              <div>
                <Label htmlFor="customAmount">Custom Amount ($)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Min: $${minimumInvestment}, Max: $${maximumInvestment}`}
                  min={minimumInvestment}
                  max={maximumInvestment}
                  className="mt-1"
                />
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              Minimum investment: ${minimumInvestment} • Maximum: ${maximumInvestment}
            </div>
          </div>
        );

      case 'auth':
        if (isAuthenticated) {
          return (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">You're signed in!</h3>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
              <p className="text-gray-600">Please sign in or create an account to continue</p>
            </div>

            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={authType === 'signin' ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setAuthType('signin')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant={authType === 'signup' ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setAuthType('signup')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {authType === 'signup' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={authFormData.firstName}
                          onChange={(e) => setAuthFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={authFormData.lastName}
                          onChange={(e) => setAuthFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authFormData.email}
                      onChange={(e) => setAuthFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authFormData.password}
                      onChange={(e) => setAuthFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  {authType === 'signup' && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={authFormData.confirmPassword}
                        onChange={(e) => setAuthFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => {
                      // Implementation would handle auth
                      toast({
                        title: "Authentication",
                        description: "Please use the main authentication system",
                      });
                    }}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? 'Processing...' : (authType === 'signin' ? 'Sign In' : 'Create Account')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'safe-review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">SAFE Agreement Review</h3>
              <p className="text-gray-600">Review the Simple Agreement for Future Equity terms</p>
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Investment Amount:</span>
                    <div className="text-lg font-bold text-blue-900">${getCurrentInvestmentAmount().toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Company:</span>
                    <div className="font-semibold">{campaign.companyName}</div>
                  </div>
                  <div>
                    <span className="font-medium">Discount Rate:</span>
                    <div className="font-semibold">{campaign.discountRate}%</div>
                  </div>
                  <div>
                    <span className="font-medium">Valuation Cap:</span>
                    <div className="font-semibold">${campaign.valuationCap?.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSafeViewer(true)}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                View SAFE Agreement
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Download SAFE agreement
                  const link = document.createElement('a');
                  link.href = `/api/campaigns/${campaign.id}/safe-agreement?amount=${getCurrentInvestmentAmount()}`;
                  link.download = `SAFE_Agreement_${campaign.companyName}.pdf`;
                  link.click();
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {showSafeViewer && (
              <SafeDocumentViewer
                isOpen={showSafeViewer}
                onClose={() => setShowSafeViewer(false)}
                investmentAmount={getCurrentInvestmentAmount()}
                user={user}
              />
            )}
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
              <p className="text-gray-600">Please review and accept the investment terms</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="max-h-64 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2">Investment Terms</h4>
                    <div className="text-sm space-y-2">
                      <p>• This investment is made under a Simple Agreement for Future Equity (SAFE)</p>
                      <p>• Investment amount: ${getCurrentInvestmentAmount().toLocaleString()}</p>
                      <p>• Discount rate: {campaign.discountRate}%</p>
                      <p>• Valuation cap: ${campaign.valuationCap?.toLocaleString()}</p>
                      <p>• This is a high-risk investment suitable only for sophisticated investors</p>
                      <p>• You may lose your entire investment</p>
                      <p>• There is no guarantee of returns</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="agreeTerms" className="text-sm">
                      I acknowledge that I have read, understood, and agree to the investment terms and conditions. 
                      I understand this is a high-risk investment and I may lose my entire investment.
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Digital Signature</h3>
              <p className="text-gray-600">Please provide your digital signature to complete the agreement</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signature">Full Legal Name (as signature)</Label>
                    <Input
                      id="signature"
                      value={signatureData}
                      onChange={(e) => setSignatureData(e.target.value)}
                      placeholder="Enter your full legal name"
                      className="mt-1 font-serif text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      By typing your name, you are providing a legal digital signature
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Legal Agreement</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Your digital signature confirms your agreement to invest ${getCurrentInvestmentAmount().toLocaleString()} 
                      in {campaign.companyName} under the terms of the SAFE agreement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Investment Committed!</h3>
              <p className="text-gray-600">
                Your investment of ${getCurrentInvestmentAmount().toLocaleString()} in {campaign.companyName} has been committed.
              </p>
            </div>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Investment Amount:</span>
                    <span className="font-semibold">${getCurrentInvestmentAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold text-orange-600">Committed - Payment Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Step:</span>
                    <span className="font-semibold">Complete payment in dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> You'll be redirected to your investor dashboard where you can complete 
                the payment using either USD (Stripe) or NGN (Budpay) payment options.
              </p>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-2 border-orange-200/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="relative bg-gradient-to-r from-orange-500 to-orange-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <FundryLogo className="h-8" />
            </div>
          </div>
          <DialogTitle className="text-white text-center text-xl font-bold">
            Investment Flow
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-center">
            Invest in {campaign.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-xs text-center ${isActive ? 'font-semibold' : ''}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            {currentStepIndex > 0 && currentStep !== 'confirmation' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            
            {currentStep === 'confirmation' ? (
              <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700">
                Close
              </Button>
            ) : currentStep === 'signature' ? (
              <Button
                onClick={handleCommitInvestment}
                disabled={!validateStep(currentStep) || isProcessingPayment}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  'Commit Investment'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}