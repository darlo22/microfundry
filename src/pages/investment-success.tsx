import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function InvestmentSuccess() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session_id');
    const campaign = params.get('campaign_id');
    
    if (session && campaign) {
      setSessionId(session);
      setCampaignId(campaign);
    } else {
      toast({
        title: "Invalid Access",
        description: "This page can only be accessed after a successful payment.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [navigate, toast]);

  const { data: paymentDetails, isLoading } = useQuery({
    queryKey: ['payment-success', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetch(`/api/payment-success/${sessionId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch payment details');
      return response.json();
    },
    enabled: !!sessionId,
  });

  const handleDownloadAgreement = async () => {
    try {
      const response = await fetch(`/api/investments/${paymentDetails.investmentId}/safe-agreement`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to download agreement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `SAFE_Agreement_${paymentDetails.campaignTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your SAFE agreement is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download agreement. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Processing your investment...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid payment session.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Investment Successful!
            </h1>
            <p className="text-gray-600">
              Your investment has been processed and confirmed.
            </p>
          </div>

          {/* Investment Details */}
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-blue-600 text-white">
              <CardTitle className="text-xl">Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Campaign</span>
                <span className="text-gray-600">{paymentDetails.campaignTitle}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Investment Amount</span>
                <span className="text-green-600 font-semibold">
                  {formatCurrency(paymentDetails.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Platform Fee</span>
                <span className="text-gray-600">
                  {formatCurrency(paymentDetails.platformFee)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold">Total Paid</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(paymentDetails.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Download Your SAFE Agreement</p>
                  <p className="text-sm text-gray-600">
                    Your investment is governed by a SAFE agreement. Download and keep this document for your records.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Track Your Investment</p>
                  <p className="text-sm text-gray-600">
                    Monitor your investment progress and receive updates from the founder in your investor dashboard.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Stay Updated</p>
                  <p className="text-sm text-gray-600">
                    You'll receive email notifications about important milestones and company updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadAgreement}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download SAFE Agreement
            </Button>
            <Button
              onClick={() => navigate('/investor-dashboard')}
              className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>
              Questions about your investment? Contact us at{' '}
              <a href="mailto:support@microfundry.com" className="text-blue-600 hover:underline">
                support@microfundry.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}