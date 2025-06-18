import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import type { Campaign } from "@shared/schema";
import FundryLogo from "@/components/ui/fundry-logo";
import { SafeDocumentViewer } from "./safe-document-viewer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CampaignWithStats extends Campaign {
  totalRaised: string;
  investorCount: number;
  progressPercent: number;
}

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

type InvestmentStep = 'amount' | 'auth' | 'safe-review' | 'terms' | 'signature' | 'payment' | 'confirmation';

interface InvestorDetails {
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
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [investorDetails, setInvestorDetails] = useState<InvestorDetails>({
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSafeViewer, setShowSafeViewer] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Initialize Stripe
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

  // Stripe Payment Form Component
  const StripePaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const handlePayment = async () => {
      if (!stripe || !elements) {
        toast({
          title: "Payment Error",
          description: "Payment system not ready. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsPaymentProcessing(true);

      try {
        // Create payment intent on server
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: calculateTotal(selectedAmount),
          campaignId: campaign.id,
          investorId: user?.id
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username,
              email: user?.email,
            },
          },
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else if (paymentIntent.status === 'succeeded') {
          // Create investment record
          await createInvestmentMutation.mutateAsync({
            campaignId: campaign.id,
            amount: selectedAmount,
            paymentIntentId: paymentIntent.id,
            status: 'paid'
          });

          toast({
            title: "Payment Successful",
            description: "Your investment has been processed successfully!",
          });

          setCurrentStep('confirmation');
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Error",
          description: "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsPaymentProcessing(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4">Payment Details</h4>
          <div className="bg-white p-4 rounded border">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4">Investment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Company:</span>
              <span className="font-medium">{campaign.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Investment Amount:</span>
              <span className="font-medium">${selectedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span className="font-medium">${calculateFee(selectedAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal(selectedAmount)}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={!stripe || isPaymentProcessing}
          className="w-full bg-blue-900 hover:bg-blue-800"
        >
          {isPaymentProcessing ? 'Processing Payment...' : `Pay $${calculateTotal(selectedAmount)}`}
        </Button>
      </div>
    );
  };

  // Store investment context in localStorage when modal opens
  useEffect(() => {
    if (isOpen && campaign) {
      const investmentContext = {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        selectedAmount,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem('investmentContext', JSON.stringify(investmentContext));
    }
  }, [isOpen, campaign, selectedAmount, currentStep]);

  // Restore investment context when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const storedContext = localStorage.getItem('investmentContext');
      if (storedContext) {
        try {
          const context = JSON.parse(storedContext);
          // Check if context is recent (within 30 minutes) and matches current campaign
          const isRecent = Date.now() - context.timestamp < 30 * 60 * 1000;
          const isMatchingCampaign = context.campaignId === campaign?.id;
          
          if (isRecent && isMatchingCampaign && context.currentStep === 'auth') {
            setSelectedAmount(context.selectedAmount || 0);
            setCurrentStep('safe-review');
            
            toast({
              title: "Welcome back!",
              description: "Continuing your investment process...",
            });
          }
        } catch (error) {
          console.error('Error parsing investment context:', error);
        }
      }
    }
  }, [isAuthenticated, isLoading, campaign, toast]);

  // Clear investment context when modal closes
  useEffect(() => {
    if (!isOpen) {
      localStorage.removeItem('investmentContext');
    }
  }, [isOpen]);

  const minimumInvestment = 25;
  const maximumInvestment = 5000;
  const presetAmounts = [100, 250, 500, 1000, 2500];

  const createInvestmentMutation = useMutation({
    mutationFn: async (investmentData: any) => {
      return await apiRequest('POST', '/api/investments', investmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      setCurrentStep('confirmation');
    },
    onError: (error) => {
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to process investment",
        variant: "destructive",
      });
    }
  });

  const handleAmountSelection = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAmount(value);
    setSelectedAmount(numValue);
  };

  const calculateFee = (amount: number) => {
    return amount > 1000 ? Math.round(amount * 0.05) : 0;
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  const handleNextStep = () => {
    const stepOrder: InvestmentStep[] = ['amount', 'auth', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentStep === 'amount' && selectedAmount < minimumInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${minimumInvestment}`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 'amount' && selectedAmount > maximumInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Maximum investment is $${maximumInvestment}`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 'auth' && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 'terms' && !agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 'signature' && !signatureData.trim()) {
      toast({
        title: "Signature Required",
        description: "Please provide your digital signature",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 'payment') {
      handlePayment();
      return;
    }

    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const stepOrder: InvestmentStep[] = ['amount', 'auth', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleAuth = async () => {
    if (authMode === 'signin') {
      await handleSignIn();
    } else {
      await handleSignUp();
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: authData.email,
        password: authData.password
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Signed In Successfully",
        description: "Welcome back! Proceeding with your investment.",
      });
      setCurrentStep('safe-review');
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignUp = async () => {
    if (authData.password !== authData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        email: authData.email,
        password: authData.password,
        firstName: authData.firstName,
        lastName: authData.lastName,
        userType: 'investor'
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Fundry! Proceeding with your investment.",
      });
      setCurrentStep('safe-review');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const investmentData = {
        campaignId: campaign.id,
        amount: selectedAmount.toString(),
        status: 'committed',
        investorDetails: {
          ...investorDetails,
          signature: signatureData,
          agreedToTerms,
          investmentDate: new Date().toISOString()
        }
      };

      await createInvestmentMutation.mutateAsync(investmentData);
      
      toast({
        title: "Investment Successful!",
        description: `You have successfully committed $${selectedAmount} to ${campaign.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const generateSafeAgreement = (campaign: CampaignWithStats, amount: number) => {
    return `SIMPLE AGREEMENT FOR FUTURE EQUITY

Company: ${campaign.title}
Investor: ${user?.firstName} ${user?.lastName}
Email: ${user?.email}
Investment Amount: $${amount}
Discount Rate: ${campaign.discountRate || 20}.00%
Valuation Cap: $${(campaign.valuationCap || 1000000).toLocaleString()}.00
Date: ${new Date().toLocaleDateString()}

This agreement represents the investor's commitment to invest in ${campaign.title} under the terms of a Simple Agreement for Future Equity (SAFE).

Investment Terms:
- Investment Amount: $${amount}
- Discount Rate: ${campaign.discountRate || 20}.00%
- Valuation Cap: $${(campaign.valuationCap || 1000000).toLocaleString()}.00
- Pro Rata Rights: Included

The investment will convert to equity shares upon the next qualifying financing round or liquidity event.

ARTICLE 1: DEFINITIONS

1.1 "Change in Control" means (a) a transaction or series of related transactions in which any "person" or "group" becomes the beneficial owner of more than 50% of the outstanding voting securities of the Company, or (b) any reorganization, merger or consolidation of the Company.

1.2 "Company Capitalization" means the sum, as of immediately prior to the Equity Financing, of (a) all shares of Capital Stock issued and outstanding, assuming exercise or conversion of all outstanding vested and unvested options, warrants and other convertible securities, but excluding this Safe and all other Safes.

1.3 "Conversion Price" means either: (a) the Safe Price or (b) the Discount Price, whichever calculation results in a greater number of shares of Safe Preferred Stock.

1.4 "Discount Price" means the price per share of the Standard Preferred Stock sold in the Equity Financing multiplied by the Discount Rate.

1.5 "Discount Rate" means ${campaign.discountRate || 20}.00%.

1.6 "Dissolution Event" means (a) a voluntary termination of operations, (b) a general assignment for the benefit of the Company's creditors or (c) any other liquidation, dissolution or winding up of the Company.

1.7 "Equity Financing" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells Preferred Stock at a fixed valuation.

1.8 "Initial Public Offering" means the closing of the Company's first firm commitment underwritten initial public offering of Common Stock pursuant to a registration statement filed under the Securities Act.

1.9 "Liquidity Event" means a Change in Control, a Dissolution Event or an Initial Public Offering.

1.10 "Pro Rata Rights" means a contractual right, but not the obligation, of the Investor to purchase its pro rata share of Private Securities that the Company may issue after the Safe is executed.

1.11 "Safe Price" means $${((amount / (campaign.valuationCap || 1000000)) * 1000000).toFixed(6)} per share.

1.12 "Valuation Cap" means $${(campaign.valuationCap || 1000000).toLocaleString()}.00.

ARTICLE 2: CONVERSION EVENTS

2.1 Equity Financing. If there is an Equity Financing before the expiration or termination of this Safe, the Company will automatically issue to the Investor either: (a) a number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Conversion Price or (b) at the option of the Investor, shares of Standard Preferred Stock.

2.2 Liquidity Event. If there is a Liquidity Event before the expiration or termination of this Safe, the Investor will, at the Investor's option, either: (a) receive a cash payment equal to the Purchase Amount or (b) automatically receive from the Company a number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.

2.3 Dissolution Event. If there is a Dissolution Event before this Safe expires or terminates, the Investor will receive a cash payment equal to the Purchase Amount, due and payable to the Investor immediately prior to, or concurrent with, the consummation of the Dissolution Event.

ARTICLE 3: COMPANY REPRESENTATIONS

3.1 The Company is a corporation duly organized, validly existing and in good standing under the laws of its jurisdiction of incorporation.

3.2 The execution, delivery and performance by the Company of this Safe is within the power of the Company and has been duly authorized by all necessary corporate actions on the part of the Company.

3.3 This Safe constitutes a legal, valid and binding obligation of the Company, enforceable against the Company in accordance with its terms.

ARTICLE 4: INVESTOR REPRESENTATIONS

4.1 The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform the Investor's obligations hereunder.

4.2 This Safe constitutes valid and binding obligations of the Investor, enforceable in accordance with its terms.

4.3 The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D under the Securities Act.

4.4 The Investor has been advised that this Safe and the underlying securities have not been registered under the Securities Act, or any state securities laws and, therefore, cannot be resold unless they are registered under the Securities Act and applicable state securities laws or unless an exemption from such registration requirements is available.

ARTICLE 5: ADDITIONAL PROVISIONS

5.1 Pro Rata Rights. The Investor shall have Pro Rata Rights, provided the Investor's Purchase Amount is not less than $${Math.max(1000, amount)}.

5.2 Entire Agreement. This Safe constitutes the full and complete understanding and agreement between the parties with respect to the subject matter hereof, and supersedes all prior understandings and agreements relating to such subject matter.

5.3 Notices. Any notice required or permitted by this Safe will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page.

5.4 Governing Law. This Safe and all rights and obligations hereunder are governed by the laws of the State of Delaware, without regard to the conflicts of law provisions of such jurisdiction.

5.5 Binding Effect. This Safe shall be binding upon and inure to the benefit of the parties and their successors and assigns.

5.6 Severability. If one or more provisions of this Safe are held to be unenforceable under applicable law, the parties agree to renegotiate such provision in good faith.

5.7 Amendment. This Safe may be amended, modified or waived with the written consent of the Company and the Investor.

ARTICLE 6: SIGNATURE

IN WITNESS WHEREOF, the undersigned have executed this Safe as of the date first written above.

COMPANY: ${campaign.title}

By: _________________________
Name: [Founder Name]
Title: Chief Executive Officer

INVESTOR: ${user?.firstName} ${user?.lastName}

Email: ${user?.email}
Investment Amount: $${amount}
Date: ${new Date().toLocaleDateString()}

Investor Signature:
Date: ${new Date().toLocaleDateString()}

This is a legally binding agreement. Please consult with legal counsel before proceeding.

IMPORTANT NOTICE: This investment involves significant risk and may result in the loss of the entire investment amount. The investor should consult with legal and financial advisors before executing this agreement.`;
  };

  const downloadSafeAgreement = (content: string, companyName: string, amount: number) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAFE_Agreement_${companyName}_$${amount}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (step: InvestmentStep) => {
    switch (step) {
      case 'amount': return DollarSign;
      case 'auth': return User;
      case 'safe-review': return FileText;
      case 'terms': return Shield;
      case 'signature': return PenTool;
      case 'payment': return CreditCard;
      case 'confirmation': return CheckCircle;
      default: return DollarSign;
    }
  };

  const getStepTitle = (step: InvestmentStep) => {
    switch (step) {
      case 'amount': return 'Investment Amount';
      case 'auth': return 'Authentication';
      case 'safe-review': return 'SAFE Agreement Review';
      case 'terms': return 'Terms & Conditions';
      case 'signature': return 'Digital Signature';
      case 'payment': return 'Payment';
      case 'confirmation': return 'Confirmation';
      default: return '';
    }
  };

  const getStepNumber = (step: InvestmentStep) => {
    const steps: InvestmentStep[] = ['amount', 'auth', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  const renderProgressIndicator = () => {
    const steps = ['amount', 'auth', 'safe-review', 'terms', 'signature', 'payment', 'confirmation'];
    const currentStepIndex = steps.indexOf(currentStep);

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStepIndex ? 'bg-fundry-orange text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const Icon = getStepIcon(currentStep);
    const stepNumber = getStepNumber(currentStep);

    switch (currentStep) {
      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Investment Amount</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Select how much you'd like to invest</p>
            </div>
            
            {renderProgressIndicator()}
            
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

      case 'auth':
        if (isAuthenticated) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Authenticated</h3>
                <p className="text-gray-600">Step {stepNumber} of 7: You're signed in as {user?.email}</p>
              </div>
              
              {renderProgressIndicator()}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Welcome back, {user?.firstName}! You can proceed with your investment.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Sign in or create an account to continue</p>
            </div>
            
            {renderProgressIndicator()}
            
            <div className="flex justify-center mb-6">
              <FundryLogo className="h-8" />
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={authMode === 'signin' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signin')}
                className={authMode === 'signin' ? 'bg-fundry-orange hover:bg-orange-600' : ''}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant={authMode === 'signup' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signup')}
                className={authMode === 'signup' ? 'bg-fundry-orange hover:bg-orange-600' : ''}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            <div className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={authData.firstName}
                        onChange={(e) => setAuthData({...authData, firstName: e.target.value})}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={authData.lastName}
                        onChange={(e) => setAuthData({...authData, lastName: e.target.value})}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  placeholder="Enter your password"
                />
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={authData.confirmPassword}
                    onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <Button
                onClick={handleAuth}
                disabled={isAuthenticating}
                className="w-full bg-fundry-orange hover:bg-orange-600"
              >
                {isAuthenticating ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </Button>
            </div>
          </div>
        );

      case 'safe-review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SAFE Agreement Review</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Review your investment terms with populated investor details</p>
            </div>
            
            {renderProgressIndicator()}
            
            {/* Investor Details Populated in SAFE Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Investor Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Full Name:</span>
                  <span className="ml-2 font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <div>
                  <span className="text-blue-700">Email:</span>
                  <span className="ml-2 font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="text-blue-700">Investment Amount:</span>
                  <span className="ml-2 font-medium">${selectedAmount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Date:</span>
                  <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
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
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Review and accept the investment terms</p>
            </div>
            
            {renderProgressIndicator()}
            
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
              <h4 className="font-semibold mb-4">Investment Terms and Conditions</h4>
              <div className="space-y-4 text-sm">
                <p>By proceeding with this investment, you acknowledge and agree to the following:</p>
                
                <div className="space-y-2">
                  <h5 className="font-medium">1. Investment Risk</h5>
                  <p>You understand that investing in early-stage companies involves significant risk and may result in total loss of your investment.</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">2. SAFE Agreement</h5>
                  <p>This investment is structured as a Simple Agreement for Future Equity (SAFE) and will convert to equity upon qualifying events.</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">3. Liquidity</h5>
                  <p>Your investment may be illiquid and you may not be able to sell or transfer your interest for an extended period.</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">4. Platform Fees</h5>
                  <p>Fundry charges a 5% platform fee for investments over $1,000. No fees apply to investments under $1,000.</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">5. Regulatory Compliance</h5>
                  <p>You represent that you meet all applicable investor qualifications and regulatory requirements.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-fundry-orange border-gray-300 rounded focus:ring-fundry-orange"
              />
              <Label htmlFor="agree-terms" className="text-sm">
                I have read, understood, and agree to the terms and conditions
              </Label>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Signature</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Provide your digital signature to finalize the agreement</p>
            </div>
            
            {renderProgressIndicator()}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="signature">Digital Signature</Label>
                <Input
                  id="signature"
                  value={signatureData}
                  onChange={(e) => setSignatureData(e.target.value)}
                  placeholder="Type your full name as your digital signature"
                />
                <p className="text-xs text-gray-500 mt-1">
                  By typing your name, you are providing a legally binding digital signature
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Signature Preview</h4>
                <p className="text-sm text-blue-800">
                  Digitally signed by: <span className="font-medium">{signatureData || '[Your signature will appear here]'}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-fundry-orange mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Complete your investment payment</p>
            </div>
            
            {renderProgressIndicator()}
            
            <Elements stripe={stripePromise}>
              <StripePaymentForm />
            </Elements>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Successful!</h3>
              <p className="text-gray-600">Step {stepNumber} of 7: Your investment has been processed</p>
            </div>
            
            {renderProgressIndicator()}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">Congratulations!</h4>
              <p className="text-green-800 mb-4">
                You have successfully committed ${selectedAmount} to {campaign.title}. Your investment is now active and you will receive updates on the company's progress.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Investment ID:</span>
                  <span className="font-medium">#{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You can track your investment progress in your investor dashboard.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  setLocation('/investor-dashboard');
                }}
                className="bg-fundry-orange hover:bg-orange-600"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'amount':
        return selectedAmount >= minimumInvestment && selectedAmount <= maximumInvestment;
      case 'auth':
        return isAuthenticated;
      case 'safe-review':
        return true;
      case 'terms':
        return agreedToTerms;
      case 'signature':
        return signatureData.trim().length > 0;
      case 'payment':
        return true;
      case 'confirmation':
        return false;
      default:
        return false;
    }
  };

  const handleClose = () => {
    setCurrentStep('amount');
    setSelectedAmount(0);
    setCustomAmount('');
    setInvestorDetails({
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      investmentExperience: '',
      accreditedInvestor: false
    });
    setAuthData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
    setAuthMode('signin');
    setAgreedToTerms(false);
    setSignatureData('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {getStepTitle(currentStep)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 'amount' || currentStep === 'confirmation'}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            
            {currentStep !== 'confirmation' && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || isProcessingPayment || createInvestmentMutation.isPending}
                className="bg-fundry-orange hover:bg-orange-600"
              >
                {currentStep === 'payment' ? 
                  (isProcessingPayment ? 'Processing...' : 'Commit Investment') : 
                  'Next'
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}