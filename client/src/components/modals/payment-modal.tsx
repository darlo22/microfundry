import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { convertUsdToNgn, formatCurrency, type ExchangeRate } from '@/lib/currency';

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

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function PaymentModal({ isOpen, onClose, investment }: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingNaira, setIsProcessingNaira] = useState(false);
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
      setIsProcessing(false);
      setIsProcessingNaira(false);
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

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('POST', `/api/investments/${investment.id}/process-payment`, {
        paymentMethodId,
        cardholderName
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: `Your investment of $${investment.amount} has been processed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    }
  });

  const handlePayment = async () => {
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
        description: "Please enter the cardholder name",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // First create payment intent
      const paymentIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(investment.amount),
          investmentId: investment.id
        })
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await paymentIntentResponse.json();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: user?.email,
          },
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update investment status on backend
        await apiRequest('PUT', `/api/investments/${investment.id}/status`, {
          status: 'paid'
        });

        toast({
          title: "Payment Successful!",
          description: `Payment of $${investment.amount} completed successfully`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
        
        onClose();
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  
  const handleNairaPayment = async () => {
    // Prevent simultaneous processing with USD payment
    if (isProcessing) {
      return;
    }
    
    if (!ngnAmount) {
      toast({
        title: "Currency Error",
        description: "Naira amount not available",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingNaira(true);

    try {
      // Create Budpay payment configuration for modal
      const budpayConfig = {
        key: import.meta.env.VITE_BUDPAY_PUBLIC_KEY,
        email: user?.email || 'investor@fundry.com',
        amount: ngnAmount, // Amount in Naira (not kobo for modal)
        currency: 'NGN',
        ref: `pay_${investment.id}_${Date.now()}`,
        callback: async (response: any) => {
          console.log('Budpay modal callback:', response);
          if (response.status === 'success') {
            // Process the payment on the backend
            const backendResponse = await apiRequest('POST', '/api/budpay-payment', {
              campaignId: investment.campaignId,
              amount: investment.amount,
              ngnAmount: ngnAmount,
              budpayReference: response.reference,
              budpayTransactionId: response.trans,
              paymentMethod: 'budpay'
            });

            const result = await backendResponse.json();

            if (result.success) {
              toast({
                title: "Payment Successful!",
                description: `Payment of ₦${ngnAmount.toLocaleString()} completed successfully`,
              });
              
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
              
              onClose();
            } else {
              throw new Error(result.message || 'Payment verification failed');
            }
          } else {
            throw new Error('Payment was cancelled or failed');
          }
        },
        onClose: () => {
          setIsProcessingNaira(false);
        }
      };

      // Create Budpay payment using backend API instead of frontend widget
      console.log('Creating Budpay payment via backend API...');
      
      const paymentResponse = await fetch('/api/create-budpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: investment.campaignId,
          amount: investment.amount,
          ngnAmount: ngnAmount,
          email: user?.email || '',
          reference: `pay_${investment.id}_${Date.now()}`,
          paymentMethod: 'budpay',
          investorDetails: {}
        })
      });

      const paymentResult = await paymentResponse.json();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Failed to create payment');
      }

      console.log('Budpay payment URL:', paymentResult.paymentUrl);
      
      // Open payment URL in a popup window
      const popup = window.open(
        paymentResult.paymentUrl,
        'budpay-payment',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsProcessing(false);
          
          // Refresh investment data
          queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
          queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
          
          toast({
            title: "Payment Window Closed",
            description: "Please check your investment status in the dashboard.",
          });
          
          onClose();
        }
      }, 1000);

    } catch (error: any) {
      console.error('Budpay payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive",
      });
      setIsProcessingNaira(false);
    }
  };

  const handleClose = () => {
    setCardholderName('');
    onClose();
  };

  const handleUSDPayment = async () => {
    // Prevent simultaneous processing with NGN payment
    if (isProcessingNaira) {
      return;
    }
    
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
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
        description: "Please enter the cardholder name",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
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
        console.error('Payment method error:', paymentMethodError);
        
        // Immediately reset processing state and form
        setIsProcessing(false);
        setShowStripeForm(false);
        setCardholderName('');
        setClientSecret('');
        
        toast({
          title: "Card Error",
          description: `${paymentMethodError.message}. Please try a different payment method.`,
          variant: "destructive",
        });
        return;
      }

      // Confirm payment intent with the payment method
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (error) {
        console.error('Stripe payment error:', error);
        
        // Immediately reset processing state and form to allow retry
        setIsProcessing(false);
        setShowStripeForm(false);
        setCardholderName('');
        setClientSecret('');
        
        toast({
          title: "Card Payment Failed",
          description: `${error.message}. Please try a different payment method.`,
          variant: "destructive",
        });
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update investment status on backend
        await apiRequest('PUT', `/api/investments/${investment.id}/status`, {
          status: 'paid'
        });

        toast({
          title: "Payment Successful!",
          description: `Payment of $${investment.amount} completed successfully`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
        
        onClose();
      } else {
        // Immediately reset processing state and form for incomplete payments
        setIsProcessing(false);
        setShowStripeForm(false);
        setCardholderName('');
        setClientSecret('');
        
        toast({
          title: "Payment Incomplete",
          description: "Payment was not completed. Please try again or use a different payment method.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      // Immediately reset processing state and form for any other errors
      setIsProcessing(false);
      setShowStripeForm(false);
      setCardholderName('');
      setClientSecret('');
      
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again or use a different payment method.",
        variant: "destructive",
      });
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
                <p className="text-xs text-gray-500">
                  Rate: $1 = ₦{exchangeRate.usdToNgn.toLocaleString('en-NG')} ({exchangeRate.source})
                </p>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investment Summary */}
          <Card className="border-2 border-orange-100 bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">$</div>
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">USD Amount:</span>
                <span className="font-bold text-xl text-gray-900">${investment.amount}</span>
              </div>
              
              {isLoadingRate ? (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">NGN Equivalent:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </div>
              ) : ngnAmount && exchangeRate ? (
                <>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">NGN Equivalent:</span>
                    <span className="font-bold text-xl text-green-700">₦{ngnAmount.toLocaleString('en-NG')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Exchange Rate:</span>
                    <span className="text-sm text-gray-600">$1 = ₦{exchangeRate.usdToNgn.toLocaleString('en-NG')}</span>
                  </div>
                </>
              ) : null}
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
                disabled={isProcessing || isProcessingNaira}
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
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="font-bold text-lg">${investment.amount}</span>
                  )}
                </div>
              </Button>

              {/* NGN Payment Button */}
              <Button
                onClick={handleNairaPayment}
                disabled={isProcessingNaira || isProcessing || !ngnAmount}
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
                  ) : (
                    <span className="font-bold text-lg">
                      {ngnAmount ? `₦${ngnAmount.toLocaleString('en-NG')}` : '...'}
                    </span>
                  )}
                </div>
              </Button>
            </div>
          ) : (
            /* Stripe Payment Form */
            <Card className="border-2 border-blue-100 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">$</div>
                  Pay ${investment.amount} with USD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    type="text"
                    placeholder="Enter cardholder name"
                    value={cardholderName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('Cardholder name input:', newValue);
                      setCardholderName(newValue);
                    }}
                    onBlur={(e) => console.log('Cardholder name on blur:', e.target.value)}
                    disabled={isProcessing}
                    autoComplete="cc-name"
                    className="w-full bg-white border-gray-300 focus:border-blue-500"
                    required
                    data-testid="cardholder-name-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Card Information</Label>
                  <div className="p-3 border border-gray-300 rounded-md bg-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowStripeForm(false);
                      setIsProcessing(false);
                      setCardholderName('');
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStripePayment}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : `Pay $${investment.amount}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We use Stripe for secure payment processing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing || isProcessingNaira}
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}