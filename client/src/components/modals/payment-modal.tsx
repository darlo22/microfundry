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
  const [cardholderName, setCardholderName] = useState('');
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  // Fetch exchange rate when modal opens
  useEffect(() => {
    if (isOpen) {
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
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Process payment with the backend
      await processPaymentMutation.mutateAsync(paymentMethod.id);
      
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Naira payment via Budpay with separate state
  const [isProcessingNaira, setIsProcessingNaira] = useState(false);
  
  const handleNairaPayment = async () => {
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
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCardholderName('');
    onClose();
  };

  const handleUSDPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: parseFloat(investment.amount),
        investmentId: investment.id,
        currency: 'usd'
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process USD payment",
        variant: "destructive",
      });
      setIsProcessing(false);
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

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">💳</div>
              Choose Payment Method
            </h3>
            
            {/* USD Payment Button */}
            <Button
              onClick={handleUSDPayment}
              disabled={isProcessing}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto"
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
              onClick={handleNairaPaymentOriginal}
              disabled={isProcessing || !ngnAmount}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto"
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
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="font-bold text-lg">
                    {ngnAmount ? `₦${ngnAmount.toLocaleString('en-NG')}` : '...'}
                  </span>
                )}
              </div>
            </Button>
          </div>

          {/* Hidden Stripe Elements for USD processing */}
          <div className="hidden">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>

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
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || processPaymentMutation.isPending || !stripe}
              className="w-full bg-blue-900 hover:bg-blue-800"
            >
              {isProcessing || processPaymentMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay $${investment.amount} (USD)`
              )}
            </Button>
            
            {ngnAmount && !isLoadingRate && (
              <Button
                onClick={handleNairaPaymentOriginal}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processing Payment...' : `Pay ₦${ngnAmount.toLocaleString()} (NGN)`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}