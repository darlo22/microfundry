import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CreditCard, 
  CheckCircle, 
  Download,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import type { Campaign } from "@shared/schema";

interface CampaignWithStats extends Campaign {
  totalRaised: string;
  investorCount: number;
  progressPercent: number;
}
import FundryLogo from "@/components/ui/fundry-logo";
import { SafeDocumentViewer } from "./safe-document-viewer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { convertUsdToNgn, formatCurrency, type ExchangeRate } from "@/lib/currency";

// Global type declaration for Budpay
declare global {
  interface Window {
    BudPayCheckout: (config: any) => void;
  }
}

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
  initialAmount?: string;
  onAmountChange?: (amount: string) => void;
}

type InvestmentStep = 'amount' | 'auth' | 'safe-review' | 'terms' | 'signature' | 'payment' | 'confirmation';

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

export default function InvestmentModal({ isOpen, onClose, campaign, initialAmount, onAmountChange }: InvestmentModalProps) {
  const [currentStep, setCurrentStep] = useState<InvestmentStep>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authData, setAuthData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingNaira, setIsProcessingNaira] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showSafeViewer, setShowSafeViewer] = useState(false);
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [createdInvestment, setCreatedInvestment] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Investment creation mutation
  const createInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/investments', data);
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedInvestment(data.investment);
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
    }
  });

  // Authentication mutation
  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const response = await apiRequest('POST', endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        toast({
          title: "Authentication Successful",
          description: `Welcome${data.user.firstName ? `, ${data.user.firstName}` : ''}!`,
        });
        
        // Clear investment context and proceed
        localStorage.removeItem('investmentContext');
        setCurrentStep('safe-review');
        
        // Reload auth state
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  });

  // Exchange rate fetching
  useEffect(() => {
    if (selectedAmount > 0) {
      setIsLoadingRate(true);
      convertUsdToNgn(selectedAmount)
        .then((result) => {
          setNgnAmount(result.ngn);
          setExchangeRate(result.rate);
        })
        .catch((error) => {
          console.error('Failed to fetch exchange rate:', error);
        })
        .finally(() => {
          setIsLoadingRate(false);
        });
    }
  }, [selectedAmount]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      if (initialAmount) {
        const amount = parseFloat(initialAmount);
        if (!isNaN(amount)) {
          setSelectedAmount(amount);
          setCustomAmount(initialAmount);
        }
      }
      
      // Check for investment context in localStorage
      const investmentContext = localStorage.getItem('investmentContext');
      if (investmentContext) {
        try {
          const context = JSON.parse(investmentContext);
          if (context.campaignId === campaign.id) {
            setSelectedAmount(context.amount);
            setCurrentStep('safe-review');
          }
        } catch (error) {
          console.error('Failed to parse investment context:', error);
        }
      }
    }
  }, [isOpen, initialAmount, campaign.id]);

  // Reset modal state on close
  const handleClose = () => {
    setCurrentStep('amount');
    setSelectedAmount(0);
    setCustomAmount('');
    setShowStripeForm(false);
    setClientSecret('');
    setCardholderName('');
    setSignatureData('');
    setAgreedToTerms(false);
    onClose();
  };

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    if (onAmountChange) {
      onAmountChange(amount.toString());
    }
  };

  // Handle custom amount change
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 25) {
      setSelectedAmount(amount);
      if (onAmountChange) {
        onAmountChange(value);
      }
    }
  };

  // Handle authentication form submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'signup') {
      if (authData.password !== authData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      authMutation.mutate({
        email: authData.email,
        password: authData.password,
        firstName: authData.firstName,
        lastName: authData.lastName,
        userType: 'investor'
      });
    } else {
      authMutation.mutate({
        email: authData.email,
        password: authData.password,
        userType: 'investor'
      });
    }
  };

  // Proceed to next step
  const handleNextStep = () => {
    if (currentStep === 'amount') {
      if (selectedAmount < 25) {
        toast({
          title: "Minimum Investment Required",
          description: "The minimum investment amount is $25.",
          variant: "destructive",
        });
        return;
      }
      
      if (!isAuthenticated) {
        localStorage.setItem('investmentContext', JSON.stringify({
          campaignId: campaign.id,
          amount: selectedAmount
        }));
        setCurrentStep('auth');
      } else {
        setCurrentStep('safe-review');
      }
    } else if (currentStep === 'safe-review') {
      setCurrentStep('terms');
    } else if (currentStep === 'terms') {
      if (!agreedToTerms) {
        toast({
          title: "Terms Required",
          description: "Please agree to the terms and conditions to continue.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('signature');
    } else if (currentStep === 'signature') {
      if (!signatureData.trim()) {
        toast({
          title: "Signature Required",
          description: "Please provide your digital signature to continue.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('payment');
    }
  };

  // Handle back navigation
  const handlePreviousStep = () => {
    if (currentStep === 'auth' && isAuthenticated) {
      setCurrentStep('amount');
    } else if (currentStep === 'safe-review') {
      setCurrentStep(isAuthenticated ? 'amount' : 'auth');
    } else if (currentStep === 'terms') {
      setCurrentStep('safe-review');
    } else if (currentStep === 'signature') {
      setCurrentStep('terms');
    } else if (currentStep === 'payment') {
      setCurrentStep('signature');
    }
  };

  // Handle USD payment
  const handleUSDPayment = () => {
    if (!createdInvestment) {
      // Create investment first
      createInvestmentMutation.mutate({
        campaignId: campaign.id,
        amount: selectedAmount,
        status: 'committed',
        investorDetails: {
          ...investorDetails,
          signature: signatureData,
          agreedToTerms,
          investmentDate: new Date().toISOString()
        }
      });
    }

    // Get client secret for Stripe
    apiRequest('POST', '/api/create-payment-intent', { 
      amount: selectedAmount,
      investmentId: createdInvestment?.id 
    })
    .then(response => response.json())
    .then(data => {
      setClientSecret(data.clientSecret);
      setShowStripeForm(true);
    })
    .catch(error => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Handle NGN payment
  const handleNGNPayment = () => {
    if (!ngnAmount || !window.BudPayCheckout) {
      toast({
        title: "Payment System Not Ready",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    if (!createdInvestment) {
      // Create investment first
      createInvestmentMutation.mutate({
        campaignId: campaign.id,
        amount: selectedAmount,
        status: 'committed',
        investorDetails: {
          ...investorDetails,
          signature: signatureData,
          agreedToTerms,
          investmentDate: new Date().toISOString()
        }
      });
    }

    setIsProcessingNaira(true);

    try {
      window.BudPayCheckout({
        key: import.meta.env.VITE_BUDPAY_PUBLIC_KEY,
        email: user?.email || '',
        amount: Math.round(ngnAmount * 100),
        currency: 'NGN',
        reference: `inv_${Date.now()}_${campaign.id}`,
        callback: function(response: any) {
          if (response.status === 'success') {
            toast({
              title: "Payment Successful",
              description: `Investment of ₦${ngnAmount.toLocaleString()} confirmed`,
            });
            setCurrentStep('confirmation');
          } else {
            toast({
              title: "Payment Failed",
              description: "Your payment could not be processed. Please try again.",
              variant: "destructive",
            });
          }
          setIsProcessingNaira(false);
        },
        onClose: function() {
          setIsProcessingNaira(false);
        }
      });
    } catch (error) {
      setIsProcessingNaira(false);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset payment modal state
  const resetPaymentState = () => {
    setShowStripeForm(false);
    setClientSecret('');
    setCardholderName('');
  };

  // Generate SAFE Agreement content
  const generateSafeAgreement = (campaign: CampaignWithStats, amount: number) => {
    const discount = campaign.discountRate || 20;
    const valuationCap = campaign.valuationCap || 1000000;
    
    return `SAFE AGREEMENT

Investment Amount: $${amount.toLocaleString()}
Discount Rate: ${discount}%
Valuation Cap: $${valuationCap.toLocaleString()}

Company: ${campaign.title}
Investor: ${user?.firstName} ${user?.lastName}

This SAFE Agreement represents the terms of investment in ${campaign.title}.`;
  };

  // Generate step icons and titles
  const getStepIcon = (step: InvestmentStep) => {
    switch (step) {
      case 'amount': return <DollarSign className="w-5 h-5" />;
      case 'auth': return <User className="w-5 h-5" />;
      case 'safe-review': return <FileText className="w-5 h-5" />;
      case 'terms': return <Shield className="w-5 h-5" />;
      case 'signature': return <PenTool className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'confirmation': return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStepTitle = (step: InvestmentStep) => {
    switch (step) {
      case 'amount': return 'Investment Amount';
      case 'auth': return 'Account Verification';
      case 'safe-review': return 'SAFE Agreement Review';
      case 'terms': return 'Terms & Conditions';
      case 'signature': return 'Digital Signature';
      case 'payment': return 'Payment';
      case 'confirmation': return 'Confirmation';
    }
  };

  const getStepNumber = (step: InvestmentStep) => {
    const steps: InvestmentStep[] = ['amount', 'auth', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  const currentStepNumber = getStepNumber(currentStep);
  const totalSteps = isAuthenticated ? 6 : 7;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border border-orange-200/50 shadow-xl">
        <DialogHeader className="text-center pb-6 border-b border-orange-100">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <FundryLogo className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            {getStepTitle(currentStep)}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Step {currentStepNumber} of {totalSteps} • Investing in {campaign.title}
          </DialogDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-orange-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Back Button */}
          {currentStep !== 'amount' && currentStep !== 'confirmation' && (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {/* Step 1: Investment Amount */}
          {currentStep === 'amount' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How much would you like to invest?
                </h3>
                <p className="text-gray-600">
                  Minimum investment: $25
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[25, 50, 100, 250].map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => handleAmountSelect(amount)}
                    className="h-12 text-lg font-semibold"
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
                  min="25"
                  step="1"
                  placeholder="Enter amount (minimum $25)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              {selectedAmount > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ${selectedAmount.toLocaleString()}
                      </div>
                      {ngnAmount && (
                        <div className="text-lg text-gray-600">
                          ≈ ₦{ngnAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleNextStep}
                disabled={selectedAmount < 25}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3 text-lg"
              >
                Continue to {isAuthenticated ? 'SAFE Agreement' : 'Account Verification'}
              </Button>
            </div>
          )}

          {/* Step 2: Authentication */}
          {currentStep === 'auth' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign in or create an account to continue
                </h3>
                <p className="text-gray-600">
                  Secure your investment with account verification
                </p>
              </div>

              <div className="flex justify-center space-x-2 mb-6">
                <Button
                  variant={authMode === 'signin' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('signin')}
                  className="flex-1 max-w-xs"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('signup')}
                  className="flex-1 max-w-xs"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={authData.firstName}
                        onChange={(e) => setAuthData({...authData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={authData.lastName}
                        onChange={(e) => setAuthData({...authData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={authData.confirmPassword}
                        onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={authMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  {authMutation.isPending ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
            </div>
          )}

          {/* Step 3: SAFE Agreement Review */}
          {currentStep === 'safe-review' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Review Your SAFE Agreement
                </h3>
                <p className="text-gray-600">
                  Please review the terms of your investment
                </p>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-center">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Investment Amount:</span>
                      <div className="text-xl font-bold text-orange-600">${selectedAmount?.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>
                      <div className="font-semibold">{campaign.title}</div>
                    </div>
                    <div>
                      <span className="font-medium">Discount Rate:</span>
                      <div className="font-semibold">{campaign.discountRate || 20}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Valuation Cap:</span>
                      <div className="font-semibold">${(campaign.valuationCap || 1000000).toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button
                  onClick={() => setShowSafeViewer(true)}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full SAFE Agreement
                </Button>

                <Button
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  Continue to Terms & Conditions
                </Button>
              </div>

              {/* SAFE Document Viewer */}
              {showSafeViewer && (
                <SafeDocumentViewer
                  isOpen={showSafeViewer}
                  onClose={() => setShowSafeViewer(false)}
                  safeData={{
                    companyName: campaign.title,
                    investorName: `${user?.firstName} ${user?.lastName}`,
                    investorEmail: user?.email || '',
                    investmentAmount: selectedAmount,
                    discountRate: campaign.discountRate ? parseFloat(campaign.discountRate.toString()) : 20,
                    valuationCap: campaign.valuationCap ? parseFloat(campaign.valuationCap.toString()) : 1000000,
                    date: new Date().toLocaleDateString(),
                    agreementId: `${campaign.id}_${Date.now()}`
                  }}
                />
              )}
            </div>
          )}

          {/* Step 4: Terms & Conditions */}
          {currentStep === 'terms' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Terms & Conditions
                </h3>
                <p className="text-gray-600">
                  Please read and agree to the terms and conditions
                </p>
              </div>

              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="max-h-64 overflow-y-auto text-sm space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Investment Terms</h4>
                      <p>By investing in {campaign.title}, you agree to the terms outlined in the SAFE Agreement. This investment represents a potential future equity stake in the company.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Risk Disclosure</h4>
                      <p>Investment in early-stage companies involves significant risk. You may lose your entire investment. Please only invest amounts you can afford to lose.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Investor Accreditation</h4>
                      <p>By proceeding, you represent that you meet the investor qualifications and understand the risks associated with this investment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="agree-terms" className="text-sm">
                  I have read and agree to the terms and conditions, and I understand the risks associated with this investment.
                </Label>
              </div>

              <Button
                onClick={handleNextStep}
                disabled={!agreedToTerms}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
              >
                Continue to Digital Signature
              </Button>
            </div>
          )}

          {/* Step 5: Digital Signature */}
          {currentStep === 'signature' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Digital Signature
                </h3>
                <p className="text-gray-600">
                  Provide your digital signature to confirm your investment
                </p>
              </div>

              <Card className="border-gray-200">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="signature">Full Legal Name (Digital Signature)</Label>
                    <Input
                      id="signature"
                      placeholder="Enter your full legal name"
                      value={signatureData}
                      onChange={(e) => setSignatureData(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      By typing your name above, you are providing a legally binding digital signature.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2">Investment Summary</h4>
                    <div className="space-y-1">
                      <div>Investment Amount: <span className="font-semibold">${selectedAmount.toLocaleString()}</span></div>
                      <div>Company: <span className="font-semibold">{campaign.title}</span></div>
                      <div>Investor: <span className="font-semibold">{user?.firstName} {user?.lastName}</span></div>
                      <div>Date: <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleNextStep}
                disabled={!signatureData.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              {!showStripeForm ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Complete Your Investment
                    </h3>
                    <div className="text-2xl font-bold text-orange-600">
                      ${selectedAmount.toLocaleString()}
                    </div>
                    {ngnAmount && (
                      <div className="text-lg text-gray-600">
                        ≈ ₦{ngnAmount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleUSDPayment}
                      disabled={isProcessingPayment || isProcessingNaira}
                      className="h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay ${selectedAmount} (USD)
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleNGNPayment}
                      disabled={isProcessingNaira || isProcessingPayment || !ngnAmount}
                      className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessingNaira ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay ₦{ngnAmount?.toLocaleString()} (NGN)
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    cardholderName={cardholderName}
                    setCardholderName={setCardholderName}
                    onBack={resetPaymentState}
                    onSuccess={() => setCurrentStep('confirmation')}
                    selectedAmount={selectedAmount}
                  />
                </Elements>
              )}
            </div>
          )}

          {/* Step 7: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Investment Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Thank you for investing ${selectedAmount.toLocaleString()} in {campaign.title}
                </p>
              </div>

              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Investment Amount:</span>
                      <span className="font-semibold">${selectedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campaign:</span>
                      <span className="font-semibold">{campaign.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-green-600">Confirmed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    const safeContent = generateSafeAgreement(campaign, selectedAmount);
                    const blob = new Blob([safeContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `SAFE_Agreement_${campaign.title}_${selectedAmount}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SAFE Agreement
                </Button>

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  Return to Campaign
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  clientSecret, 
  cardholderName, 
  setCardholderName, 
  onBack,
  onSuccess,
  selectedAmount 
}: {
  clientSecret: string;
  cardholderName: string;
  setCardholderName: (name: string) => void;
  onBack: () => void;
  onSuccess: () => void;
  selectedAmount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        onBack(); // Return to payment selection
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: `Investment of $${selectedAmount} confirmed`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      onBack(); // Return to payment selection
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Payment Options
      </Button>

      <div>
        <Label htmlFor="cardholder-name">Cardholder Name</Label>
        <Input
          id="cardholder-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Enter name as it appears on card"
        />
      </div>

      <div>
        <Label>Card Information</Label>
        <div className="mt-2 p-4 border border-gray-200 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!cardholderName || !stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isProcessing ? "Processing..." : `Pay $${selectedAmount}`}
      </Button>
    </div>
  );
};