import { useState } from 'react';
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
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

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

  const handleClose = () => {
    setCardholderName('');
    onClose();
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
          <p className="text-gray-600 mt-2">
            Investment Amount: <span className="font-bold text-lg">${investment.amount}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Stripe Card Element */}
          <Card className="border-2 border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Card Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 border border-gray-300 rounded-md bg-white">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </CardContent>
          </Card>

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
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handlePayment}
            disabled={isProcessing || processPaymentMutation.isPending || !stripe}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 min-w-[120px]"
          >
            {isProcessing || processPaymentMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              `Pay $${investment.amount}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}