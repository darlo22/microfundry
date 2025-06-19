import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { convertUsdToNgn, type ExchangeRate } from '@/lib/currency';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: {
    id: number;
    amount: string;
    campaignId: number;
    campaignTitle?: string;
  };
}

export default function PaymentModal({ isOpen, onClose, investment }: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [isProcessingNaira, setIsProcessingNaira] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Reset state and fetch exchange rate when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setIsProcessingNaira(false);
      setIsProcessingStripe(false);
      setCardholderName('');
      setShowStripeForm(false);
      setClientSecret('');
      
      setIsLoadingRate(true);
      convertUsdToNgn(Number(investment.amount))
        .then(({ ngn, rate }) => {
          setNgnAmount(ngn);
          setExchangeRate(rate);
        })
        .catch((error) => {
          console.warn('Failed to fetch exchange rate:', error);
          // Use fallback rate
          setNgnAmount(Number(investment.amount) * 1650);
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
  }, [isOpen, investment.amount]);

  const resetModalToPaymentSelection = () => {
    setIsProcessingNaira(false);
    setIsProcessingStripe(false);
    setShowStripeForm(false);
    setCardholderName('');
    setClientSecret('');
  };

  const handleClose = () => {
    resetModalToPaymentSelection();
    onClose();
  };

  const handleUSDPayment = async () => {
    // Prevent simultaneous processing with NGN payment
    if (isProcessingNaira) {
      return;
    }
    
    try {
      // Get payment intent from backend
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: investment.amount,
        investmentId: investment.id
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setShowStripeForm(true);
    } catch (error: any) {
      console.error('Payment setup error:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to setup payment",
        variant: "destructive",
      });
    }
  };

  const handleNairaPayment = async () => {
    if (!ngnAmount) {
      toast({
        title: "Currency Error",
        description: "Unable to calculate Naira amount. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingNaira(true);
    
    try {
      // Initialize BudPay checkout
      if (typeof window !== 'undefined' && window.BudPayCheckout) {
        window.BudPayCheckout({
          key: import.meta.env.VITE_BUDPAY_PUBLIC_KEY,
          email: user?.email || '',
          amount: Math.round(ngnAmount * 100), // Convert to kobo
          currency: 'NGN',
          reference: `inv_${investment.id}_${Date.now()}`,
          callback: async function(response: any) {
            try {
              // Verify payment with backend
              const verifyResponse = await apiRequest('POST', '/api/verify-budpay-payment', {
                reference: response.reference,
                investmentId: investment.id
              });

              if (verifyResponse.ok) {
                toast({
                  title: "Payment Successful!",
                  description: `Your investment of ₦${ngnAmount.toLocaleString('en-NG')} has been processed successfully.`,
                });
                
                queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
                queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
                onClose();
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment Verification Failed",
                description: "Payment was processed but verification failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          onClose: function() {
            setIsProcessingNaira(false);
          }
        });
      } else {
        throw new Error('BudPay checkout not available');
      }
    } catch (error: any) {
      console.error('Naira payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process Naira payment",
        variant: "destructive",
      });
      setIsProcessingNaira(false);
    }
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Payment System Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!cardholderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the cardholder name.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingStripe(true);
    
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: cardholderName,
          email: user?.email,
        },
      });

      if (paymentMethodError) {
        console.error('Payment method error:', paymentMethodError);
        resetModalToPaymentSelection();
        toast({
          title: "Card Error",
          description: `${paymentMethodError.message}. Please try a different payment method.`,
          variant: "destructive",
        });
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (error) {
        console.error('Stripe payment error:', error);
        resetModalToPaymentSelection();
        toast({
          title: "Card Payment Failed",
          description: `${error.message}. Please try a different payment method.`,
          variant: "destructive",
        });
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update investment status in backend
        await apiRequest('PATCH', `/api/investments/${investment.id}`, {
          status: 'paid'
        });

        toast({
          title: "Payment Successful!",
          description: `Your investment of $${investment.amount} has been processed successfully.`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
        onClose();
      } else {
        resetModalToPaymentSelection();
        toast({
          title: "Payment Incomplete",
          description: "Payment was not completed. Please try again or use a different payment method.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      resetModalToPaymentSelection();
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again or use a different payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingStripe(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            Complete Payment
          </DialogTitle>
          <div className="mt-3 space-y-1">
            <p className="text-gray-600">
              Investment Amount: <span className="font-bold text-lg">${investment.amount}</span>
            </p>
            {isLoadingRate ? (
              <p className="text-sm text-gray-500">
                <span className="inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                Loading Naira equivalent...
              </p>
            ) : ngnAmount && exchangeRate ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Naira Equivalent: <span className="font-semibold text-green-700">₦{ngnAmount.toLocaleString('en-NG')}</span>
                </p>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Exchange Rate:</span>
                  <span className="text-sm text-gray-600">$1 = ₦{exchangeRate.usdToNgn.toLocaleString('en-NG')}</span>
                </div>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Investment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Investment Amount:</span>
                  <span className="font-medium">${investment.amount}</span>
                </div>
                {ngnAmount && (
                  <div className="flex justify-between">
                    <span>Naira Equivalent:</span>
                    <span className="font-medium">₦{ngnAmount.toLocaleString('en-NG')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection or Stripe Form */}
          {!showStripeForm ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">💳</div>
                Choose Payment Method
              </h3>
              
              {/* USD Payment Button */}
              <Button
                onClick={handleUSDPayment}
                disabled={isProcessingNaira}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">$</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base">Pay with USD</div>
                    <div className="text-sm opacity-90">Powered by Stripe</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">${investment.amount}</span>
                </div>
              </Button>

              {/* NGN Payment Button */}
              <Button
                onClick={handleNairaPayment}
                disabled={isProcessingNaira || !ngnAmount}
                className="w-full p-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">₦</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base">Pay with Naira</div>
                    <div className="text-sm opacity-90">Powered by Budpay</div>
                  </div>
                </div>
                <div className="text-right">
                  {isProcessingNaira ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : ngnAmount ? (
                    <span className="font-bold text-lg">₦{ngnAmount.toLocaleString('en-NG')}</span>
                  ) : (
                    <span className="text-sm opacity-75">Loading...</span>
                  )}
                </div>
              </Button>
            </div>
          ) : (
            /* Stripe Form */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">💳</div>
                Complete Payment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Cardholder Name</Label>
                  <Input
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Enter cardholder name"
                    autoComplete="cc-name"
                    disabled={isProcessingStripe}
                  />
                </div>
                
                <div>
                  <Label>Card Information</Label>
                  <div className="p-3 border border-gray-300 rounded-md bg-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowStripeForm(false);
                      setCardholderName('');
                      setClientSecret('');
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isProcessingStripe}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStripePayment}
                    disabled={isProcessingStripe}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingStripe ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    {isProcessingStripe ? 'Processing...' : `Pay $${investment.amount}`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted. You can complete your investment payment later via your dashboard.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}