import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, XCircle, Eye, FileText, User, Building, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { FundryLogo } from '@/components/ui/fundry-logo';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface KYCRequest {
  id: string;
  userId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewMessage?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  professionalInfo: {
    employmentStatus: string;
    incomeLevel: string;
    investmentExperience: string;
    riskTolerance: string;
  };
  documents: {
    governmentId: string[];
    utilityBill: string[];
    otherDocuments: string[];
  };
  activeCampaign?: {
    id: number;
    title: string;
    fundingGoal: string;
    tier: string;
    recommendedDocs: string;
  };
}

export default function AdminKYCManagement() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewMessage, setReviewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: kycRequests, isLoading } = useQuery({
    queryKey: ['/api/admin/kyc-requests'],
    queryFn: () => apiRequest('/api/admin/kyc-requests').then(res => res.json())
  });

  const reviewKYCMutation = useMutation({
    mutationFn: async ({ requestId, action, message }: { requestId: string; action: 'approve' | 'reject'; message: string }) => {
      const response = await apiRequest('POST', `/api/admin/kyc-requests/${requestId}/review`, {
        action,
        message
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-requests'] });
      setReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewMessage('');
      toast({
        title: "KYC Request Updated",
        description: `Request has been ${reviewAction}d successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update KYC request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleReview = () => {
    if (!selectedRequest || !reviewMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a review message.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    reviewKYCMutation.mutate({
      requestId: selectedRequest.id,
      action: reviewAction,
      message: reviewMessage.trim()
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending Review', color: 'text-yellow-600' },
      under_review: { variant: 'default' as const, text: 'Under Review', color: 'text-blue-600' },
      approved: { variant: 'default' as const, text: 'Approved', color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, text: 'Rejected', color: 'text-red-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const getTierRecommendations = (tier: string) => {
    const recommendations = {
      'tier1': 'Basic: Government ID only',
      'tier2': 'Standard: Government ID + Utility Bill',
      'tier3': 'Enhanced: Government ID + Utility Bill + Bank Statement + Professional References'
    };
    return recommendations[tier as keyof typeof recommendations] || 'Standard verification required';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <FundryLogo className="h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
          <p className="text-gray-600 mt-2">Review and manage Know Your Customer verification requests</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-800">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {kycRequests?.filter((req: KYCRequest) => req.status === 'pending' || req.status === 'under_review').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-900">
                    {kycRequests?.filter((req: KYCRequest) => req.status === 'approved').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-800">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">
                    {kycRequests?.filter((req: KYCRequest) => req.status === 'rejected').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900">{kycRequests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification Requests</CardTitle>
            <CardDescription>
              Review submitted KYC documents and personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!kycRequests || kycRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No KYC requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Founder</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Goal Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {kycRequests.map((request: KYCRequest) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                              {request.personalInfo.firstName.charAt(0)}{request.personalInfo.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.personalInfo.firstName} {request.personalInfo.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{request.personalInfo.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="py-4 px-4">
                          {request.activeCampaign ? (
                            <div>
                              <p className="font-medium text-gray-900">{request.activeCampaign.title}</p>
                              <p className="text-xs text-gray-600">Tier {request.activeCampaign.tier}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">No active campaign</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {request.activeCampaign ? (
                            <span className="font-medium text-gray-900">{request.activeCampaign.fundingGoal}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {(request.status === 'pending' || request.status === 'under_review') && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setReviewAction('approve');
                                    setReviewModalOpen(true);
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setReviewAction('reject');
                                    setReviewModalOpen(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KYC Details Modal */}
      <Dialog open={!!selectedRequest && !reviewModalOpen} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-fundry-orange" />
              KYC Verification Details
            </DialogTitle>
            <DialogDescription>
              Complete information submitted for KYC verification
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-gray-900">{selectedRequest.personalInfo.firstName} {selectedRequest.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{selectedRequest.personalInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-gray-900">{selectedRequest.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-gray-900">{selectedRequest.personalInfo.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-gray-900">
                      {selectedRequest.personalInfo.address}, {selectedRequest.personalInfo.city}, {selectedRequest.personalInfo.state} {selectedRequest.personalInfo.zipCode}, {selectedRequest.personalInfo.country}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Professional & Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employment Status</Label>
                    <p className="text-gray-900">{selectedRequest.professionalInfo.employmentStatus}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Income Level</Label>
                    <p className="text-gray-900">{selectedRequest.professionalInfo.incomeLevel}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Investment Experience</Label>
                    <p className="text-gray-900">{selectedRequest.professionalInfo.investmentExperience}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Risk Tolerance</Label>
                    <p className="text-gray-900">{selectedRequest.professionalInfo.riskTolerance}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Information */}
              {selectedRequest.activeCampaign && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Active Campaign
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Campaign Title</Label>
                        <p className="text-gray-900">{selectedRequest.activeCampaign.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Funding Goal</Label>
                        <p className="text-gray-900">{selectedRequest.activeCampaign.fundingGoal}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Recommended Documents</Label>
                        <p className="text-gray-900">{getTierRecommendations(selectedRequest.activeCampaign.tier)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Government Issued ID</Label>
                    <p className="text-gray-900">{selectedRequest.documents.governmentId.length} file(s) uploaded</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Utility Bill</Label>
                    <p className="text-gray-900">{selectedRequest.documents.utilityBill.length} file(s) uploaded</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Other Documents</Label>
                    <p className="text-gray-900">{selectedRequest.documents.otherDocuments.length} file(s) uploaded</p>
                  </div>
                </CardContent>
              </Card>

              {/* Review History */}
              {selectedRequest.reviewMessage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Review History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                      {selectedRequest.reviewedAt && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Reviewed:</span>
                          <span className="text-gray-900 ml-2">{new Date(selectedRequest.reviewedAt).toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Review Message</Label>
                        <p className="text-gray-900 mt-1">{selectedRequest.reviewMessage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} KYC Request
            </DialogTitle>
            <DialogDescription>
              Provide a message for the founder regarding this KYC review decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewMessage">Review Message</Label>
              <Textarea
                id="reviewMessage"
                placeholder={
                  reviewAction === 'approve'
                    ? "Your KYC verification has been approved. You can now access all platform features."
                    : "Please provide specific reasons for rejection and what the founder needs to do to resubmit."
                }
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleReview}
              disabled={isProcessing || !reviewMessage.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'} Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}