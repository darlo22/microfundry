import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
  const [isLoadingUSD, setIsLoadingUSD] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Reset state and fetch exchange rate when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Payment modal opened - resetting all state');
      // Reset all state when modal opens
      setIsProcessingNaira(false);
      setIsProcessingStripe(false);
      setIsLoadingUSD(false);
      setCardholderName(user?.email ? user.email.split('@')[0] : '');
      setShowStripeForm(false);
      setClientSecret('');
      
      setIsLoadingRate(true);
      convertUsdToNgn(Number(investment.amount))
        .then(({ ngn, rate }) => {
          setNgnAmount(ngn);
          setExchangeRate(rate);
          console.log('Exchange rate loaded:', rate);
        })
        .catch((error) => {
          console.warn('Failed to fetch exchange rate:', error);
          // Use fallback rate
          const fallbackNgn = Number(investment.amount) * 1650;
          setNgnAmount(fallbackNgn);
          setExchangeRate({
            usdToNgn: 1650,
            source: 'Fallback',
            lastUpdated: new Date()
          });
        })
        .finally(() => {
          setIsLoadingRate(false);
        });
    } else {
      // Clean up when modal closes
      console.log('Payment modal closed - cleaning up state');
      resetModalToPaymentSelection();
    }
  }, [isOpen, investment.amount, user?.email]);

  const resetModalToPaymentSelection = () => {
    setIsProcessingNaira(false);
    setIsProcessingStripe(false);
    setIsLoadingUSD(false);
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
      toast({
        title: "Payment in Progress",
        description: "Please wait for the current payment to complete.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('USD Payment clicked - showing form immediately');
    setShowStripeForm(true);
    setIsLoadingUSD(true);
    
    try {
      console.log('Creating payment intent for investment:', investment.id, 'amount:', investment.amount);
      
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: Number(investment.amount),
        investmentId: investment.id
      });
      
      const data = await response.json();
      console.log('Payment intent created:', data);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        console.log('Client secret set, form ready for payment');
      } else {
        throw new Error('No client secret received from server');
      }
      
    } catch (error: any) {
      console.error('Payment setup error:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to setup payment. Please try again.",
        variant: "destructive",
      });
      setShowStripeForm(false);
    } finally {
      setIsLoadingUSD(false);
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
      // Create payment request with backend using direct API approach
      const paymentData = {
        campaignId: investment.campaignId,
        amount: parseFloat(investment.amount),
        currency: 'NGN',
        ngnAmount: ngnAmount,
        email: user?.email || '',
        reference: `inv_${investment.id}_${Date.now()}`,
        paymentMethod: 'budpay',
        investmentId: investment.id
      };

      console.log('Creating Budpay payment link:', paymentData);

      // Call backend to create Budpay payment link
      const response = await apiRequest('POST', '/api/create-budpay-payment', paymentData);
      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Open Budpay payment page in a new window
        const paymentWindow = window.open(
          result.paymentUrl,
          'budpay-payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
          throw new Error('Popup blocked. Please allow popups for payment processing.');
        }

        // Poll for payment completion
        const pollPaymentStatus = async () => {
          try {
            const statusResponse = await apiRequest('GET', `/api/check-payment-status/${result.reference}`);
            const statusResult = await statusResponse.json();
            
            if (statusResult.success && statusResult.status === 'success') {
              // Payment successful
              toast({
                title: "Payment Successful!",
                description: `Your investment of ₦${ngnAmount.toLocaleString('en-NG')} has been processed successfully.`,
              });
              
              queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
              paymentWindow.close();
              onClose();
              setIsProcessingNaira(false);
              return;
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
          
          // Continue polling if payment window is still open
          if (!paymentWindow.closed) {
            setTimeout(pollPaymentStatus, 3000);
          } else {
            // Payment window closed, stop processing
            setIsProcessingNaira(false);
            toast({
              title: "Payment Window Closed",
              description: "Payment was cancelled or completed. Please check your investment status.",
            });
          }
        };

        // Start polling after a short delay
        setTimeout(pollPaymentStatus, 2000);

      } else {
        throw new Error(result.message || 'Failed to create payment link');
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
      console.log('Starting Stripe payment process...');
      
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
        throw new Error(paymentMethodError.message || 'Card validation failed');
      }

      console.log('Payment method created successfully');

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (error) {
        console.error('Stripe payment error:', error);
        throw new Error(error.message || 'Payment confirmation failed');
      }

      console.log('Payment intent status:', paymentIntent?.status);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, updating backend...');
        
        // Update investment status in backend
        const updateResponse = await apiRequest('PATCH', `/api/investments/${investment.id}`, {
          status: 'paid',
          paymentStatus: 'completed'
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update investment status');
        }

        console.log('Backend updated successfully');

        toast({
          title: "Payment Successful!",
          description: `Your investment of $${investment.amount} has been processed successfully.`,
        });
        
        // Clear all states and close modal
        resetModalToPaymentSelection();
        
        // Comprehensive cache invalidation to update all related data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/investments'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/investor-stats'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/founder-stats'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] }),
        ]);
        
        console.log('All caches invalidated, closing modal');
        onClose();
        
      } else {
        console.log('Payment not completed, status:', paymentIntent?.status);
        throw new Error("Payment was not completed successfully");
      }
      
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      // Always reset modal state on any error
      resetModalToPaymentSelection();
      
      toast({
        title: "Payment Failed",
        description: error.message || "Payment could not be processed. Please try again or use a different payment method.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4 sm:pb-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
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
              
              {/* USD Payment Button - Mobile Responsive */}
              <Button
                onClick={handleUSDPayment}
                disabled={isProcessingNaira}
                className="w-full p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold">$</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Pay with USD</div>
                    <div className="text-xs sm:text-sm opacity-90">Powered by Stripe</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-base sm:text-lg">${investment.amount}</span>
                </div>
              </Button>

              {/* NGN Payment Button - Mobile Responsive */}
              <Button
                onClick={handleNairaPayment}
                disabled={isProcessingNaira || !ngnAmount}
                className="w-full p-3 sm:p-4 bg-green-600 hover:bg-green-700 text-white text-base sm:text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold">₦</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Pay with Naira</div>
                    <div className="text-xs sm:text-sm opacity-90">Powered by Budpay</div>
                  </div>
                </div>
                <div className="text-right">
                  {isProcessingNaira ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs sm:text-sm font-bold">💳</div>
                Complete Payment
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm">Cardholder Name</Label>
                  <Input
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Enter cardholder name"
                    autoComplete="cc-name"
                    disabled={isProcessingStripe}
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Card Information</Label>
                  <div className="p-2 sm:p-3 border border-gray-300 rounded-md bg-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Button
                    onClick={() => {
                      setShowStripeForm(false);
                      setCardholderName('');
                      setClientSecret('');
                    }}
                    variant="outline"
                    className="w-full sm:flex-1 text-sm"
                    disabled={isProcessingStripe}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStripePayment}
                    disabled={isProcessingStripe}
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    {isProcessingStripe ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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