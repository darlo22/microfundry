import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Eye, MessageCircle, FileText, User, Building } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: kycRequests = [], isLoading, refetch } = useQuery<KYCRequest[]>({
    queryKey: ['/api/admin/kyc-requests'],
    enabled: !!adminUser
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, action, message }: { requestId: string; action: 'approve' | 'reject'; message: string }) => {
      const response = await apiRequest('POST', `/api/admin/kyc-requests/${requestId}/review`, {
        action,
        message
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-requests'] });
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewMessage('');
      toast({
        title: "Review Completed Successfully",
        description: `KYC request has been ${data.status}. The founder has been notified and withdrawal restrictions ${data.status === 'approved' ? 'have been lifted' : 'remain in place'}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed", 
        description: error.message || "Failed to process KYC review",
        variant: "destructive"
      });
    }
  });

  const handleReview = () => {
    if (!selectedRequest || !reviewAction || !reviewMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a review message",
        variant: "destructive"
      });
      return;
    }

    reviewMutation.mutate({
      requestId: selectedRequest.id,
      action: reviewAction,
      message: reviewMessage.trim()
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return <Badge className="bg-green-100 text-green-800">Tier 1 (&lt; $1,000)</Badge>;
      case 'tier2':
        return <Badge className="bg-yellow-100 text-yellow-800">Tier 2 ($1,000 - $50,000)</Badge>;
      case 'tier3':
        return <Badge className="bg-red-100 text-red-800">Tier 3 (&gt; $50,000)</Badge>;
      default:
        return <Badge variant="secondary">No Active Campaign</Badge>;
    }
  };

  const filteredRequests = kycRequests.filter((request: KYCRequest) => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-fundry-orange" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
                <p className="text-sm text-gray-600">Review and approve identity verification requests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {kycRequests.filter((req: KYCRequest) => req.status === 'pending' || req.status === 'under_review').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved</p>
                  <p className="text-2xl font-bold text-green-900">
                    {kycRequests.filter((req: KYCRequest) => req.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">
                    {kycRequests.filter((req: KYCRequest) => req.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {kycRequests.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All Requests
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'under_review' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('under_review')}
                size="sm"
              >
                Under Review
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
                size="sm"
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KYC Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification Requests</CardTitle>
            <CardDescription>
              Review identity verification submissions from founders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No KYC requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request: KYCRequest) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {request.personalInfo.firstName} {request.personalInfo.lastName}
                            </span>
                          </div>
                          {getStatusBadge(request.status)}
                          {request.activeCampaign && getTierBadge(request.activeCampaign.tier)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span> {request.personalInfo.email}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{' '}
                            {format(new Date(request.submittedAt), 'MMM dd, yyyy')}
                          </div>
                          {request.activeCampaign && (
                            <div className="flex items-center space-x-1">
                              <Building className="w-3 h-3" />
                              <span className="font-medium">Campaign:</span> {request.activeCampaign.title}
                            </div>
                          )}
                        </div>

                        {request.activeCampaign && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-sm">
                              <span className="font-medium text-blue-700">Maximum Campaign Goal:</span>{' '}
                              <span className="text-blue-900">{request.activeCampaign.fundingGoal}</span>
                            </div>
                            <div className="text-sm mt-1">
                              <span className="font-medium text-blue-700">Recommended Documents:</span>{' '}
                              <span className="text-blue-900">{request.activeCampaign.recommendedDocs}</span>
                            </div>
                          </div>
                        )}

                        {request.reviewMessage && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Review Message:</span>{' '}
                              <span className="text-gray-900">{request.reviewMessage}</span>
                            </div>
                            {request.reviewedAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                Reviewed on {format(new Date(request.reviewedAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-fundry-orange" />
              <span>KYC Verification Review</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Review the submitted documents and personal information
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-fundry-orange" />
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Full Name:</span> {selectedRequest.personalInfo.firstName} {selectedRequest.personalInfo.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedRequest.personalInfo.email}</div>
                  <div><span className="font-medium">Date of Birth:</span> {selectedRequest.personalInfo.dateOfBirth}</div>
                  <div><span className="font-medium">Phone:</span> {selectedRequest.personalInfo.phone}</div>
                  <div><span className="font-medium">Address:</span> {selectedRequest.personalInfo.address}</div>
                  <div><span className="font-medium">City:</span> {selectedRequest.personalInfo.city}</div>
                  <div><span className="font-medium">State:</span> {selectedRequest.personalInfo.state}</div>
                  <div><span className="font-medium">ZIP Code:</span> {selectedRequest.personalInfo.zipCode}</div>
                  <div><span className="font-medium">Country:</span> {selectedRequest.personalInfo.country}</div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Professional & Financial Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Employment Status:</span> {selectedRequest.professionalInfo.employmentStatus}</div>
                  <div><span className="font-medium">Income Level:</span> {selectedRequest.professionalInfo.incomeLevel}</div>
                  <div><span className="font-medium">Investment Experience:</span> {selectedRequest.professionalInfo.investmentExperience}</div>
                  <div><span className="font-medium">Risk Tolerance:</span> {selectedRequest.professionalInfo.riskTolerance}</div>
                </div>
              </div>

              {/* Active Campaign Information */}
              {selectedRequest.activeCampaign && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Building className="w-5 h-5 text-green-600" />
                    <span>Active Campaign Information</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div><span className="font-medium">Campaign Title:</span> {selectedRequest.activeCampaign.title}</div>
                    <div><span className="font-medium">Maximum Funding Goal:</span> {selectedRequest.activeCampaign.fundingGoal}</div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">KYC Tier:</span>
                      {getTierBadge(selectedRequest.activeCampaign.tier)}
                    </div>
                    <div><span className="font-medium">Recommended Documents:</span> {selectedRequest.activeCampaign.recommendedDocs}</div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Submitted Documents</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Government Issued ID:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedRequest.documents.governmentId.length} document(s) uploaded
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Utility Bill:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedRequest.documents.utilityBill.length} document(s) uploaded
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Other Documents:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedRequest.documents.otherDocuments.length} document(s) uploaded
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Actions */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'under_review') && (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span>Review Decision</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Button
                        variant={reviewAction === 'approve' ? 'default' : 'outline'}
                        onClick={() => setReviewAction('approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant={reviewAction === 'reject' ? 'default' : 'outline'}
                        onClick={() => setReviewAction('reject')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Message {reviewAction && <span className="text-red-500">*</span>}
                      </label>
                      <Textarea
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        placeholder={
                          reviewAction === 'approve'
                            ? "Provide approval details and any additional instructions..."
                            : reviewAction === 'reject'
                            ? "Explain the reason for rejection and what needs to be corrected..."
                            : "Select an action above to provide review feedback..."
                        }
                        rows={4}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            {selectedRequest && (selectedRequest.status === 'pending' || selectedRequest.status === 'under_review') && (
              <Button
                onClick={handleReview}
                disabled={!reviewAction || !reviewMessage.trim() || reviewMutation.isPending}
                className="bg-fundry-orange hover:bg-orange-600 text-white"
              >
                {reviewMutation.isPending ? 'Processing...' : 'Submit Review'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={false} onOpenChange={() => setReviewAction(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 backdrop-blur-sm border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-fundry-orange" />
              <span>Confirm Review Decision</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {reviewAction === 'approve' ? 'approve' : 'reject'} this KYC verification request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}