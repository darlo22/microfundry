import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  CreditCard, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Shield, 
  Clock,
  Signature,
  ArrowRight,
  ArrowLeft,
  Download,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

type InvestmentStep = 'auth' | 'investor-details' | 'amount' | 'safe-review' | 'terms' | 'signature' | 'payment' | 'confirmation';

export default function InvestmentModal({ isOpen, onClose, campaign }: InvestmentModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<InvestmentStep>(isAuthenticated ? 'investor-details' : 'auth');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [riskDisclosureAccepted, setRiskDisclosureAccepted] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'budpay' | 'commitment'>('stripe');
  const [investmentData, setInvestmentData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Authentication state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  
  // Investor details state
  const [investorDetails, setInvestorDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    accreditedInvestor: false,
    investmentExperience: ""
  });

  const presetAmounts = [25, 50, 100, 250, 500, 1000];
  const minimumInvestment = parseFloat(campaign.minimumInvestment);
  const maximumInvestment = 5000;

  const calculateFee = (amount: number) => {
    return amount > 1000 ? Math.round(amount * 0.05 * 100) / 100 : 0;
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  const generateSafeAgreement = (campaign: CampaignWithStats, amount: number) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
SIMPLE AGREEMENT FOR FUTURE EQUITY

THIS CERTIFIES THAT in exchange for the payment by the undersigned investor ("Investor") of $${amount.toLocaleString()} (the "Purchase Amount") on or about ${currentDate}, ${campaign.title} (the "Company"), hereby issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms described below.

INVESTMENT TERMS:
• Investment Amount: $${amount.toLocaleString()}
• Discount Rate: ${campaign.discountRate}%
• Valuation Cap: $${parseFloat(campaign.valuationCap || "1000000").toLocaleString()}
• Date of Agreement: ${currentDate}

CONVERSION EVENTS:
This investment will automatically convert to equity shares upon:
1. Next qualifying financing round (Series A or later)
2. Liquidity event (acquisition, merger, or IPO)
3. Company dissolution

INVESTOR RIGHTS:
• Right to receive shares at a discount during conversion
• Pro-rata rights in future financing rounds
• Information rights as specified in company bylaws

COMPANY INFORMATION:
• Legal Name: ${campaign.title}
• Business Description: ${campaign.shortPitch}
• Registered Address: [To be completed upon signing]

This agreement is governed by the laws of Delaware and represents a legally binding contract between the Investor and the Company.

Generated on: ${currentDate}
Platform: Fundry Investment Platform
    `.trim();
  };

  const downloadSafeAgreement = (content: string, companyName: string, amount: number) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAFE_Agreement_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_$${amount}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Authentication mutations
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", {
        username: credentials.email,
        password: credentials.password
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('investor-details');
      toast({
        title: "Successfully signed in",
        description: "Welcome back! Please complete your investor details.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sign in failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/register", {
        ...credentials,
        userType: 'investor'
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('investor-details');
      toast({
        title: "Account created successfully",
        description: "Welcome to Fundry! Please complete your investor details.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Email may already be in use.",
        variant: "destructive",
      });
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/investments", data);
      return response.json();
    },
    onSuccess: (data) => {
      setInvestmentData(data);
      if (selectedPaymentMethod === 'commitment') {
        setCurrentStep('confirmation');
      } else {
        setCurrentStep('payment');
      }
    },
    onError: (error) => {
      toast({
        title: "Investment Error",
        description: "Failed to process investment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleAmountSelection = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value) || 0;
    setSelectedAmount(amount);
  };

  const validateAmount = () => {
    if (selectedAmount < minimumInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${minimumInvestment}`,
        variant: "destructive",
      });
      return false;
    }
    if (selectedAmount > maximumInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Maximum investment is $${maximumInvestment}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleAuth = () => {
    if (authMode === 'signin') {
      if (authEmail && authPassword) {
        loginMutation.mutate({ email: authEmail, password: authPassword });
      } else {
        toast({
          title: "Missing Information",
          description: "Please enter your email and password.",
          variant: "destructive",
        });
      }
    } else {
      if (authUsername && authEmail && authPassword) {
        registerMutation.mutate({ username: authUsername, email: authEmail, password: authPassword });
      } else {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    }
  };

  const validateInvestorDetails = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !investorDetails[field as keyof typeof investorDetails]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'auth':
        handleAuth();
        break;
      case 'investor-details':
        if (validateInvestorDetails()) {
          setCurrentStep('amount');
        }
        break;
      case 'amount':
        if (validateAmount()) {
          setCurrentStep('safe-review');
        }
        break;
      case 'safe-review':
        setCurrentStep('terms');
        break;
      case 'terms':
        if (termsAccepted && riskDisclosureAccepted) {
          setCurrentStep('signature');
        } else {
          toast({
            title: "Terms Required",
            description: "Please accept all terms and conditions to proceed.",
            variant: "destructive",
          });
        }
        break;
      case 'signature':
        if (digitalSignature.trim()) {
          processInvestment();
        } else {
          toast({
            title: "Signature Required",
            description: "Please provide your digital signature.",
            variant: "destructive",
          });
        }
        break;
      case 'payment':
        handlePayment();
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'investor-details':
        setCurrentStep('auth');
        break;
      case 'amount':
        setCurrentStep('investor-details');
        break;
      case 'safe-review':
        setCurrentStep('amount');
        break;
      case 'terms':
        setCurrentStep('safe-review');
        break;
      case 'signature':
        setCurrentStep('terms');
        break;
      case 'payment':
        setCurrentStep('signature');
        break;
    }
  };

  const processInvestment = () => {
    setIsProcessing(true);
    createInvestmentMutation.mutate({
      campaignId: campaign.id,
      amount: selectedAmount,
      paymentMethod: selectedPaymentMethod,
      digitalSignature,
      termsAccepted,
      riskDisclosureAccepted,
    });
  };

  const handlePayment = () => {
    setIsProcessing(true);
    if (selectedPaymentMethod === 'stripe') {
      toast({
        title: "Processing Payment",
        description: "Redirecting to Stripe for secure payment...",
      });
      setTimeout(() => {
        setCurrentStep('confirmation');
        setIsProcessing(false);
      }, 2000);
    } else if (selectedPaymentMethod === 'budpay') {
      toast({
        title: "Processing Payment",
        description: "Redirecting to Budpay for secure payment...",
      });
      setTimeout(() => {
        setCurrentStep('confirmation');
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Investment Successful",
      description: "Your investment has been processed successfully!",
    });
    onClose();
    setLocation('/investor/dashboard');
  };

  const resetModal = () => {
    setCurrentStep('amount');
    setSelectedAmount(0);
    setCustomAmount('');
    setTermsAccepted(false);
    setRiskDisclosureAccepted(false);
    setDigitalSignature('');
    setSelectedPaymentMethod('stripe');
    setInvestmentData(null);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'auth': return 'Sign In or Create Account';
      case 'investor-details': return 'Investor Information';
      case 'amount': return 'Investment Amount';
      case 'safe-review': return 'SAFE Agreement Review';
      case 'terms': return 'Terms & Conditions';
      case 'signature': return 'Digital Signature';
      case 'payment': return 'Payment Method';
      case 'confirmation': return 'Investment Confirmed';
      default: return 'Investment';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Investment Amount</h3>
              <p className="text-gray-600">Min: ${minimumInvestment} • Max: ${maximumInvestment}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelection(amount)}
                  className={selectedAmount === amount ? "bg-fundry-orange hover:bg-orange-600" : ""}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`Minimum $${minimumInvestment}`}
                min={minimumInvestment}
                max={maximumInvestment}
              />
            </div>

            {selectedAmount > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Investment Amount:</span>
                  <span className="font-semibold">${selectedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee ({selectedAmount > 1000 ? '5%' : 'Free'}):</span>
                  <span className="font-semibold">${calculateFee(selectedAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal(selectedAmount)}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'safe-review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SAFE Agreement Review</h3>
              <p className="text-gray-600">Please review the investment terms</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Investment Amount</Label>
                  <p className="text-lg font-semibold">${selectedAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Discount Rate</Label>
                  <p className="text-lg font-semibold">{campaign.discountRate}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Valuation Cap</Label>
                  <p className="text-lg font-semibold">${(parseFloat(campaign.valuationCap || "1000000")).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Investment Type</Label>
                  <p className="text-lg font-semibold">SAFE Agreement</p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center mb-4">
                <Shield className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">
                  Your investment will convert to equity upon the next qualifying financing round or liquidity event.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Generate SAFE agreement PDF with current investment details
                    const safeContent = generateSafeAgreement(campaign, selectedAmount);
                    downloadSafeAgreement(safeContent, campaign.title, selectedAmount);
                  }}
                  className="flex items-center gap-2 border-fundry-orange text-fundry-orange hover:bg-fundry-orange hover:text-white"
                >
                  <Download className="w-4 h-4" />
                  Download SAFE Agreement
                </Button>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-gray-600">Please accept the following terms to continue</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <Label htmlFor="terms" className="font-medium">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                  <p className="text-gray-600 mt-1">
                    By investing, you agree to Fundry's terms and the specific SAFE agreement terms for this campaign.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="risk-disclosure"
                  checked={riskDisclosureAccepted}
                  onCheckedChange={(checked) => setRiskDisclosureAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <Label htmlFor="risk-disclosure" className="font-medium">
                    I acknowledge the Investment Risk Disclosure
                  </Label>
                  <p className="text-gray-600 mt-1">
                    I understand that investing in startups involves risk, including potential total loss of investment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  This investment is subject to a 48-hour cooling-off period during which you may cancel.
                </p>
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Signature className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Signature</h3>
              <p className="text-gray-600">Please provide your digital signature to finalize the agreement</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="signature">Type your full legal name as your digital signature</Label>
                <Input
                  id="signature"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Enter your full legal name"
                  className="mt-2"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  By typing your name above, you are providing a legally binding electronic signature under the Electronic Signatures in Global and National Commerce Act.
                </p>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h3>
              <p className="text-gray-600">Choose how you'd like to complete your investment</p>
            </div>

            <div className="space-y-4">
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'stripe' ? 'border-fundry-orange bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPaymentMethod('stripe')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Credit Card (Stripe)</p>
                      <p className="text-sm text-gray-600">Instant processing via Stripe</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-fundry-orange">
                    {selectedPaymentMethod === 'stripe' && (
                      <div className="w-2 h-2 bg-fundry-orange rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'budpay' ? 'border-fundry-orange bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPaymentMethod('budpay')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Bank Transfer (Budpay)</p>
                      <p className="text-sm text-gray-600">Direct bank transfer via Budpay</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-fundry-orange">
                    {selectedPaymentMethod === 'budpay' && (
                      <div className="w-2 h-2 bg-fundry-orange rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'commitment' ? 'border-fundry-orange bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPaymentMethod('commitment')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium">Investment Commitment</p>
                      <p className="text-sm text-gray-600">Commit now, pay later when called</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-fundry-orange">
                    {selectedPaymentMethod === 'commitment' && (
                      <div className="w-2 h-2 bg-fundry-orange rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total to Pay:</span>
                <span>${selectedPaymentMethod === 'commitment' ? '0 (Commitment)' : calculateTotal(selectedAmount)}</span>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Confirmed!</h3>
              <p className="text-gray-600">
                {selectedPaymentMethod === 'commitment' 
                  ? 'Your investment commitment has been recorded successfully.'
                  : 'Your payment has been processed and investment is confirmed.'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Campaign:</span>
                <span className="font-semibold">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Investment Amount:</span>
                <span className="font-semibold">${selectedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold capitalize">{selectedPaymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-green-600">
                  {selectedPaymentMethod === 'commitment' ? 'Committed' : 'Paid'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                You will receive a confirmation email with your investment details and SAFE agreement documents.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {['amount', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'].map((step, index) => {
                const stepOrder = ['amount', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const isActive = index <= currentIndex;
                const isCurrent = step === currentStep;
                
                return (
                  <div key={step} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive 
                          ? 'bg-fundry-orange text-white' 
                          : 'bg-gray-200 text-gray-600'
                      } ${isCurrent ? 'ring-2 ring-fundry-orange ring-offset-2' : ''}`}
                    >
                      {index + 1}
                    </div>
                    {index < 5 && (
                      <div 
                        className={`w-8 h-0.5 ${
                          index < currentIndex ? 'bg-fundry-orange' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-600">
              Step {['amount', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'].indexOf(currentStep) + 1} of 6
            </p>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 'amount' || currentStep === 'confirmation' || isProcessing}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep === 'confirmation' ? (
                <Button
                  onClick={handleComplete}
                  className="bg-fundry-orange hover:bg-orange-600 flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  disabled={isProcessing || (currentStep === 'amount' && selectedAmount < minimumInvestment)}
                  className="bg-fundry-orange hover:bg-orange-600 flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {currentStep === 'payment' ? 'Complete Payment' : 'Continue'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}