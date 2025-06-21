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
  CreditCard, 
  CheckCircle, 
  Download,
  LogIn,
  UserPlus
} from "lucide-react";
import type { CampaignWithStats } from "@/lib/types";
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
        ← Back to Payment Options
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

  // Exchange rate fetching
  useEffect(() => {
    if (selectedAmount > 0) {
      setIsLoadingRate(true);
      convertUsdToNgn(selectedAmount)
        .then((result) => {
          setNgnAmount(result.ngnAmount);
          setExchangeRate(result.exchangeRate);
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

  // Handle authentication success
  const handleAuthSuccess = () => {
    localStorage.removeItem('investmentContext');
    setCurrentStep('safe-review');
  };

  // Reset modal state on close
  const handleClose = () => {
    setCurrentStep('amount');
    setSelectedAmount(0);
    setCustomAmount('');
    setShowStripeForm(false);
    setClientSecret('');
    setCardholderName('');
    onClose();
  };

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
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
      setCurrentStep('signature');
    } else if (currentStep === 'signature') {
      setCurrentStep('payment');
    }
  };

  // Handle USD payment
  const handleUSDPayment = () => {
    if (!createdInvestment) {
      // Create investment first
      createInvestmentMutation.mutate({
        campaignId: campaign.id,
        amount: selectedAmount,
        status: 'committed'
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
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold py-3"
              >
                Return to Campaign
              </Button>
            </div>
          )}

          {/* Add other step content here as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
}