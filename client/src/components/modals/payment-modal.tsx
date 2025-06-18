import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, User, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export default function PaymentModal({ isOpen, onClose, investment }: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [useNewCard, setUseNewCard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Card form data
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    saveCard: false
  });

  // Mock saved cards - in real implementation, fetch from user's saved cards
  const savedCards: SavedCard[] = [
    {
      id: 'card_1',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2027
    },
    {
      id: 'card_2',
      last4: '5555',
      brand: 'mastercard',
      expiryMonth: 8,
      expiryYear: 2026
    }
  ];

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('POST', `/api/investments/${investment.id}/process-payment`, paymentData);
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
    setIsProcessing(true);

    try {
      if (useNewCard) {
        // Validate card data
        if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv || !cardData.cardholderName) {
          toast({
            title: "Missing Information",
            description: "Please fill in all card details",
            variant: "destructive",
          });
          return;
        }

        // Process with new card
        await processPaymentMutation.mutateAsync({
          type: 'new_card',
          cardDetails: {
            number: cardData.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(cardData.expiryMonth),
            exp_year: parseInt(cardData.expiryYear),
            cvc: cardData.cvv,
            name: cardData.cardholderName
          },
          saveCard: cardData.saveCard
        });
      } else {
        // Process with saved card
        if (!selectedCardId) {
          toast({
            title: "No Card Selected",
            description: "Please select a saved card",
            variant: "destructive",
          });
          return;
        }

        await processPaymentMutation.mutateAsync({
          type: 'saved_card',
          cardId: selectedCardId
        });
      }
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      default:
        return '💳';
    }
  };

  const handleClose = () => {
    setCardData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      saveCard: false
    });
    setSelectedCardId('');
    setUseNewCard(true);
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
          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Payment Method
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={useNewCard ? "default" : "outline"}
                className={`h-auto p-4 justify-start ${useNewCard ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                onClick={() => setUseNewCard(true)}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">New Card</div>
                  <div className="text-sm opacity-75">Enter new card details</div>
                </div>
              </Button>
              
              {savedCards.length > 0 && (
                <Button
                  variant={!useNewCard ? "default" : "outline"}
                  className={`h-auto p-4 justify-start ${!useNewCard ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  onClick={() => setUseNewCard(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Saved Cards</div>
                    <div className="text-sm opacity-75">Use a previously saved card</div>
                  </div>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Card Details Form */}
          {useNewCard ? (
            <Card className="border-2 border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Card Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="mt-1 font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="MM"
                      value={cardData.expiryMonth}
                      onChange={(e) => setCardData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                      maxLength={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                      id="expiryYear"
                      placeholder="YYYY"
                      value={cardData.expiryYear}
                      onChange={(e) => setCardData(prev => ({ ...prev, expiryYear: e.target.value }))}
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={cardData.saveCard}
                    onChange={(e) => setCardData(prev => ({ ...prev, saveCard: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="saveCard" className="text-sm">
                    Save this card for future payments
                  </Label>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Select Saved Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedCards.map((card) => (
                  <Button
                    key={card.id}
                    variant={selectedCardId === card.id ? "default" : "outline"}
                    className={`w-full h-auto p-4 justify-start ${selectedCardId === card.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <span className="mr-3 text-xl">{getBrandIcon(card.brand)}</span>
                    <div className="text-left">
                      <div className="font-medium">•••• •••• •••• {card.last4}</div>
                      <div className="text-sm opacity-75">
                        Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We never store your complete card details.</p>
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
            disabled={isProcessing || processPaymentMutation.isPending}
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