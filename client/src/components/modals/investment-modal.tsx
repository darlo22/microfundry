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
import { convertUsdToNgn, formatCurrency, type ExchangeRate } from "@/lib/currency";

// Global type declaration for Budpay
declare global {
  interface Window {
    BudPayCheckout: (config: any) => void;
  }
}


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
  const [showSafeViewer, setShowSafeViewer] = useState(false);
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Initialize Stripe
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

  // Budpay configuration
  const BUDPAY_PUBLIC_KEY = import.meta.env.VITE_BUDPAY_PUBLIC_KEY || 'pk_test_budpay_public_key';

  // Stripe Payment Form Component
  const StripePaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const handlePayment = async () => {
      if (!stripe || !elements) {
        toast({
          title: "Payment Error",
          description: "Payment system is not ready. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Validate cardholder name
      if (!cardholderName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter the cardholder name",
          variant: "destructive",
        });
        return;
      }

      setIsPaymentProcessing(true);

      try {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        // Create payment method with Stripe Elements
        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: user?.email,
          },
        });

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message);
        }

        // Create payment intent and investment in one call
        const paymentData = {
          campaignId: campaign.id,
          amount: selectedAmount.toString(),
          paymentMethodId: paymentMethod.id,
          investorDetails: {
            ...investorDetails,
            signature: signatureData,
            agreedToTerms,
            investmentDate: new Date().toISOString()
          }
        };

        const paymentResponse = await apiRequest('POST', '/api/create-payment-intent', paymentData);
        const result = await paymentResponse.json();

        if (result.success) {
          toast({
            title: "Payment Successful!",
            description: `You have successfully invested $${selectedAmount} in ${campaign.title}`,
          });
          setCurrentStep('confirmation');
        } else {
          throw new Error(result.message || 'Payment failed');
        }

      } catch (error: any) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Payment failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsPaymentProcessing(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-lg border">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholder-name" className="text-sm font-medium text-gray-700">
                Cardholder Name
              </Label>
              <Input
                id="cardholder-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Enter name as it appears on card"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                Card Information
              </Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-white">
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Payment</p>
                  <p>Your payment information is encrypted and secure. We use Stripe for secure payment processing.</p>
                </div>
              </div>
            </div>
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
              <div className="text-right">
                <div className="font-medium">${selectedAmount}</div>
                {ngnAmount && !isLoadingRate && (
                  <div className="text-sm text-gray-600">
                    ≈ ₦{ngnAmount.toLocaleString()}
                  </div>
                )}
                {isLoadingRate && (
                  <div className="text-sm text-gray-500">Converting...</div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <div className="text-right">
                <div>${selectedAmount}</div>
                {ngnAmount && !isLoadingRate && (
                  <div className="text-base font-normal text-gray-600">
                    ≈ ₦{ngnAmount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {exchangeRate && (
              <div className="text-xs text-gray-500 text-right border-t pt-2">
                Exchange rate: $1 = ₦{exchangeRate.usdToNgn} ({exchangeRate.source})
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={!stripe || isPaymentProcessing}
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            {isPaymentProcessing ? 'Processing Payment...' : `Pay $${selectedAmount} (USD)`}
          </Button>
          
          {ngnAmount && !isLoadingRate && (
            <Button
              onClick={handleNairaPayment}
              disabled={isPaymentProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPaymentProcessing ? 'Processing Payment...' : `Pay ₦${ngnAmount.toLocaleString()} (NGN)`}
            </Button>
          )}
        </div>
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

  // Fetch exchange rate when investment amount changes
  useEffect(() => {
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (amount > 0 && isOpen) {
      setIsLoadingRate(true);
      convertUsdToNgn(amount)
        .then(({ ngn, rate }) => {
          setNgnAmount(ngn);
          setExchangeRate(rate);
        })
        .catch((error) => {
          console.warn('Failed to fetch exchange rate:', error);
          // Use fallback rate
          setNgnAmount(amount * 1650);
          setExchangeRate({
            usdToNgn: 1650,
            source: 'Fallback',
            lastUpdated: new Date()
          });
        })
        .finally(() => {
          setIsLoadingRate(false);
        });
    }
  }, [selectedAmount, customAmount, isOpen]);

  const minimumInvestment = 25;
  const maximumInvestment = 5000;
  const presetAmounts = [100, 250, 500, 1000, 2500];

  const createInvestmentMutation = useMutation({
    mutationFn: async (investmentData: any) => {
      const response = await apiRequest('POST', '/api/investments', investmentData);
      return await response.json();
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

  // Handle Naira payment via Budpay
  const handleNairaPayment = async () => {
    console.log('Naira payment button clicked');
    console.log('NGN Amount:', ngnAmount);
    console.log('Selected Amount:', selectedAmount);
    
    if (!ngnAmount) {
      toast({
        title: "Currency Error",
        description: "Naira amount not available",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_BUDPAY_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description: "Budpay public key not configured",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    
    toast({
      title: "Initializing Payment",
      description: "Setting up Budpay checkout...",
    });

    try {
      // Create Budpay payment request
      const paymentData = {
        campaignId: campaign.id,
        amount: selectedAmount,
        currency: 'NGN',
        ngnAmount: ngnAmount,
        paymentMethod: 'budpay',
        investorDetails: {
          ...investorDetails,
          signature: signatureData,
          agreedToTerms,
          investmentDate: new Date().toISOString()
        }
      };

      // Initialize Budpay payment
      const budpayPaymentConfig = {
        key: import.meta.env.VITE_BUDPAY_PUBLIC_KEY,
        email: user?.email || investorDetails.firstName + '@example.com',
        amount: Math.round(ngnAmount * 100), // Convert to kobo
        currency: 'NGN',
        ref: `inv_${campaign.id}_${Date.now()}`,
        callback: async (response: any) => {
          console.log('Budpay callback response:', response);
          try {
            if (response.status === 'success') {
              toast({
                title: "Processing Payment",
                description: "Verifying payment with backend...",
              });

              // Process the payment on the backend
              const backendResponse = await apiRequest('POST', '/api/budpay-payment', {
                ...paymentData,
                budpayReference: response.reference,
                budpayTransactionId: response.trans
              });

              const result = await backendResponse.json();
              console.log('Backend verification result:', result);

              if (result.success) {
                toast({
                  title: "Payment Successful!",
                  description: `You have successfully invested ₦${ngnAmount.toLocaleString()} in ${campaign.title}`,
                });
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
                queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
                
                setCurrentStep('confirmation');
              } else {
                throw new Error(result.message || 'Payment verification failed');
              }
            } else {
              throw new Error('Payment was cancelled or failed');
            }
          } catch (error: any) {
            console.error('Payment callback error:', error);
            toast({
              title: "Payment Error",
              description: error.message || "Payment processing failed",
              variant: "destructive",
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onClose: () => {
          console.log('Budpay modal closed');
          setIsProcessingPayment(false);
        }
      };

      console.log('Budpay config:', budpayPaymentConfig);

      // Function to initialize Budpay
      const initializeBudpay = () => {
        console.log('Initializing Budpay checkout...');
        if (window.BudPayCheckout) {
          console.log('BudPayCheckout found, calling it...');
          window.BudPayCheckout(budpayPaymentConfig);
        } else {
          console.error('BudPayCheckout not found on window object');
          toast({
            title: "Payment Error",
            description: "Budpay checkout failed to load",
            variant: "destructive",
          });
          setIsProcessingPayment(false);
        }
      };

      // Load Budpay script and initialize payment
      if (window.BudPayCheckout) {
        console.log('Budpay script already loaded');
        initializeBudpay();
      } else {
        console.log('Loading Budpay script...');
        // Load Budpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.budpay.com/checkout.js';
        script.onload = () => {
          console.log('Budpay script loaded successfully');
          setTimeout(initializeBudpay, 100); // Small delay to ensure script is ready
        };
        script.onerror = () => {
          console.error('Failed to load Budpay script');
          toast({
            title: "Payment Error",
            description: "Failed to load Budpay payment system",
            variant: "destructive",
          });
          setIsProcessingPayment(false);
        };
        document.head.appendChild(script);
      }

    } catch (error: any) {
      console.error('Budpay payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

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
    return 0; // Platform fees removed
  };

  const calculateTotal = (amount: number) => {
    return amount; // No fees applied
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
      
      // Set investor details with firstName and lastName from auth form
      setInvestorDetails(prev => ({
        ...prev,
        firstName: authData.firstName,
        lastName: authData.lastName
      }));
      
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

1.11 "Safe Price" means $${(amount / parseFloat(campaign.valuationCap || "1000000") * 1000000).toFixed(6)} per share.

1.12 "Valuation Cap" means $${(parseFloat(campaign.valuationCap || "1000000")).toLocaleString()}.00.

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
      <div className="flex justify-center mb-4 px-2">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                index <= currentStepIndex ? 'bg-fundry-orange text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && <div className="w-2 sm:w-3 h-0.5 bg-gray-300 mx-1" />}
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
          <div className="space-y-4">
            <div className="text-center px-1">
              <Icon className="mx-auto h-8 w-8 text-fundry-orange mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Choose Investment Amount</h3>
              <p className="text-xs text-gray-600 break-words px-2">Step {stepNumber} of 7: Select how much you'd like to invest</p>
            </div>
            
            {renderProgressIndicator()}
            
            <div className="grid grid-cols-2 gap-2 px-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelection(amount)}
                  className={`text-sm px-3 py-2 ${selectedAmount === amount ? "bg-fundry-orange hover:bg-orange-600" : ""}`}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-1 px-2">
              <Label htmlFor="custom-amount" className="text-xs">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`Min $${minimumInvestment}`}
                min={minimumInvestment}
                max={maximumInvestment}
                className="text-xs h-8"
              />
            </div>

            {selectedAmount > 0 && (
              <div className="bg-gray-50 p-2 mx-2 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Investment Amount:</span>
                  <span>${selectedAmount}</span>
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

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6">
              <Button
                variant={authMode === 'signin' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signin')}
                className={`flex-1 sm:flex-none text-sm ${authMode === 'signin' ? 'bg-fundry-orange hover:bg-orange-600' : ''}`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant={authMode === 'signup' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signup')}
                className={`flex-1 sm:flex-none text-sm ${authMode === 'signup' ? 'bg-fundry-orange hover:bg-orange-600' : ''}`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            <div className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        value={authData.firstName}
                        onChange={(e) => setAuthData({...authData, firstName: e.target.value})}
                        placeholder="Enter your first name"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        value={authData.lastName}
                        onChange={(e) => setAuthData({...authData, lastName: e.target.value})}
                        placeholder="Enter your last name"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  placeholder="Enter your email"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  placeholder="Enter your password"
                  className="text-sm"
                />
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={authData.confirmPassword}
                    onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                    className="text-sm"
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Investor Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col sm:flex-row">
                  <span className="text-blue-700 min-w-fit">Full Name:</span>
                  <span className="ml-0 sm:ml-2 font-medium truncate">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-blue-700 min-w-fit">Email:</span>
                  <span className="ml-0 sm:ml-2 font-medium truncate">{user?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-blue-700 min-w-fit">Investment Amount:</span>
                  <span className="ml-0 sm:ml-2 font-medium">${selectedAmount}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-blue-700 min-w-fit">Date:</span>
                  <span className="ml-0 sm:ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Investment Amount</Label>
                  <p className="text-base font-semibold">${selectedAmount}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Discount Rate</Label>
                  <p className="text-base font-semibold">{campaign.discountRate}%</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Valuation Cap</Label>
                  <p className="text-base font-semibold">${(parseFloat(campaign.valuationCap || "1000000")).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Investment Type</Label>
                  <p className="text-base font-semibold">SAFE Agreement</p>
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
      <DialogContent className="sm:max-w-[450px] w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-base sm:text-lg">
            {getStepTitle(currentStep)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2 px-1 overflow-x-hidden">
          <div className="max-w-full">
            {renderStepContent()}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 'amount' || currentStep === 'confirmation'}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            {currentStep !== 'confirmation' && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || isProcessingPayment || createInvestmentMutation.isPending}
                className="bg-fundry-orange hover:bg-orange-600 w-full sm:w-auto"
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