// Temporary file to fix investment modal structure
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Payment handler functions
  const handleUSDPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Create investment first
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

      const investmentResponse = await createInvestmentMutation.mutateAsync(investmentData);

      // Process Stripe payment
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: selectedAmount,
        investmentId: investmentResponse.id,
        currency: 'usd'
      });

      if (response.ok) {
        const { clientSecret } = await response.json();
        
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${clientSecret}`;
      }
      
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process USD payment",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleNairaPayment = async () => {
    if (!ngnAmount) {
      toast({
        title: "Currency Error",
        description: "Naira amount not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Create investment first
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

      const investmentResponse = await createInvestmentMutation.mutateAsync(investmentData);

      // Process Budpay payment
      const response = await apiRequest('POST', '/api/budpay-payment', {
        amount: Math.round(ngnAmount),
        investmentId: investmentResponse.id,
        email: user?.email || 'investor@fundry.com',
        currency: 'NGN'
      });

      if (response.ok) {
        const { authorization_url } = await response.json();
        
        // Open Budpay payment in popup
        const popup = window.open(
          authorization_url,
          'budpay-payment',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Monitor popup for completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setCurrentStep('confirmation');
            setIsProcessingPayment(false);
          }
        }, 1000);
      }
      
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process Naira payment",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  // Add the rest of the component logic here...
  // This is just a minimal fix to resolve the duplicate function error
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Investment Modal</DialogTitle>
        </DialogHeader>
        <div>
          <p>Investment modal content will be restored here...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}