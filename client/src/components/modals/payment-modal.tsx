import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { convertUsdToNgn, type ExchangeRate } from '@/lib/currency';

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
  const { user } = useAuth();
  
  const [isProcessingNaira, setIsProcessingNaira] = useState(false);
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const usdAmount = parseFloat(investment.amount);

  // Fetch exchange rate and convert to NGN
  useEffect(() => {
    if (isOpen && usdAmount > 0) {
      const fetchRate = async () => {
        setIsLoadingRate(true);
        try {
          const rate = await convertUsdToNgn(usdAmount);
          setExchangeRate(rate);
          setNgnAmount(rate.ngnAmount);
        } catch (error) {
          console.error('Exchange rate fetch error:', error);
          toast({
            title: "Exchange Rate Error",
            description: "Could not fetch current exchange rates. NGN payment may not be available.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingRate(false);
        }
      };
      fetchRate();
    }
  }, [isOpen, usdAmount, toast]);

  // Handle USD Stripe checkout redirect
  const handleUSDPayment = async () => {
    try {
      // Redirect to Stripe checkout session
      const response = await apiRequest('POST', '/api/create-checkout-session', {
        investmentId: investment.id,
        amount: usdAmount,
        currency: 'usd'
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('USD payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate USD payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle NGN Budpay payment
  const handleNGNPayment = async () => {
    if (!ngnAmount || !user?.email) {
      toast({
        title: "Payment Error",
        description: "Missing payment information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingNaira(true);

    try {
      // Get Budpay payment configuration
      const budpayResponse = await apiRequest('POST', '/api/budpay-payment', {
        investmentId: investment.id,
        amount: ngnAmount,
        currency: 'NGN',
        email: user.email,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      });

      if (budpayResponse.authorization_url) {
        // Open Budpay checkout
        if (typeof window !== 'undefined' && (window as any).BudPayCheckout) {
          (window as any).BudPayCheckout({
            key: import.meta.env.VITE_BUDPAY_PUBLIC_KEY,
            email: user.email,
            amount: ngnAmount * 100, // Convert to kobo
            currency: 'NGN',
            reference: budpayResponse.reference,
            callback: async (response: any) => {
              if (response.status === 'success') {
                try {
                  // Verify payment on backend
                  await apiRequest('POST', '/api/verify-budpay-payment', {
                    reference: response.reference,
                    investmentId: investment.id
                  });

                  toast({
                    title: "Payment Successful!",
                    description: `Your investment of ₦${ngnAmount.toLocaleString()} has been processed successfully.`,
                  });

                  // Refresh data
                  queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/investor-stats'] });
                  
                  onClose();
                } catch (verifyError: any) {
                  console.error('Payment verification error:', verifyError);
                  toast({
                    title: "Payment Verification Failed",
                    description: "Payment was processed but verification failed. Please contact support.",
                    variant: "destructive",
                  });
                }
              } else {
                toast({
                  title: "Payment Failed",
                  description: "Your payment was not successful. Please try again.",
                  variant: "destructive",
                });
              }
              setIsProcessingNaira(false);
            },
            onClose: () => {
              setIsProcessingNaira(false);
            }
          });
        } else {
          throw new Error('Budpay checkout not available');
        }
      } else {
        throw new Error('Failed to initialize Budpay payment');
      }
    } catch (error: any) {
      console.error('NGN payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate NGN payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessingNaira(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-2 border-orange-200/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="bg-gradient-to-r from-orange-500 to-orange-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-white text-center font-bold">
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Investment Summary */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-orange-900 mb-2">Investment Summary</h3>
                <div className="text-2xl font-bold text-orange-800">
                  ${usdAmount.toLocaleString()}
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  {investment.campaignTitle || 'Campaign Investment'}
                </p>
              </div>
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
              disabled={isProcessingNaira}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">$</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Pay with USD</div>
                  <div className="text-sm opacity-90">Powered by Stripe</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${usdAmount.toLocaleString()}</div>
                <div className="text-xs opacity-75">Credit/Debit Card</div>
              </div>
            </Button>

            {/* NGN Payment Button */}
            <Button
              onClick={handleNGNPayment}
              disabled={isProcessingNaira || isLoadingRate || !ngnAmount}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-between rounded-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">₦</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Pay with Naira</div>
                  <div className="text-sm opacity-90">Powered by Budpay</div>
                </div>
              </div>
              <div className="text-right">
                {isLoadingRate ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : ngnAmount ? (
                  <>
                    <div className="font-bold">₦{ngnAmount.toLocaleString()}</div>
                    <div className="text-xs opacity-75">
                      Rate: {exchangeRate?.rate ? `₦${exchangeRate.rate.toFixed(2)}/$` : 'N/A'}
                    </div>
                  </>
                ) : (
                  <div className="text-sm">Rate unavailable</div>
                )}
              </div>
            </Button>

            {isProcessingNaira && (
              <div className="text-center text-sm text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-2" />
                Processing Naira payment...
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. Choose your preferred currency above.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}