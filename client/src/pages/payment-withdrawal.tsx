import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";

// Helper function to get banking fields based on country
const getBankingFieldsForCountry = (country: string) => {
  const countryConfig: Record<string, { fields: string[]; labels: Record<string, string> }> = {
    "United States": {
      fields: ["bankAccount", "routingNumber"],
      labels: {
        bankAccount: "Account Number",
        routingNumber: "Routing Number"
      }
    },
    "United Kingdom": {
      fields: ["bankAccount", "sortCode"],
      labels: {
        bankAccount: "Account Number",
        sortCode: "Sort Code"
      }
    },
    "Canada": {
      fields: ["bankAccount", "transitNumber"],
      labels: {
        bankAccount: "Account Number",
        transitNumber: "Transit Number"
      }
    },
    "Australia": {
      fields: ["bankAccount", "bsb"],
      labels: {
        bankAccount: "Account Number",
        bsb: "BSB Number"
      }
    },
    "Germany": {
      fields: ["iban", "swiftCode"],
      labels: {
        iban: "IBAN",
        swiftCode: "SWIFT/BIC Code"
      }
    },
    "France": {
      fields: ["iban", "swiftCode"],
      labels: {
        iban: "IBAN",
        swiftCode: "SWIFT/BIC Code"
      }
    },
    "Italy": {
      fields: ["iban", "swiftCode"],
      labels: {
        iban: "IBAN",
        swiftCode: "SWIFT/BIC Code"
      }
    },
    "Spain": {
      fields: ["iban", "swiftCode"],
      labels: {
        iban: "IBAN",
        swiftCode: "SWIFT/BIC Code"
      }
    },
    "Netherlands": {
      fields: ["iban", "swiftCode"],
      labels: {
        iban: "IBAN",
        swiftCode: "SWIFT/BIC Code"
      }
    },
    "Japan": {
      fields: ["bankAccount", "bankName", "swiftCode"],
      labels: {
        bankAccount: "Account Number",
        bankName: "Bank Name",
        swiftCode: "SWIFT Code"
      }
    },
    "Singapore": {
      fields: ["bankAccount", "swiftCode"],
      labels: {
        bankAccount: "Account Number",
        swiftCode: "SWIFT Code"
      }
    },
    "India": {
      fields: ["bankAccount", "swiftCode", "bankName"],
      labels: {
        bankAccount: "Account Number",
        swiftCode: "SWIFT Code",
        bankName: "Bank Name"
      }
    }
  };

  return countryConfig[country] || {
    fields: ["bankAccount", "swiftCode"],
    labels: {
      bankAccount: "Account Number",
      swiftCode: "SWIFT Code"
    }
  };
};

export default function PaymentWithdrawal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Withdrawal form state
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    country: "",
    bankAccount: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    sortCode: "",
    bsb: "",
    transitNumber: "",
    bankName: "",
    bankAddress: "",
    accountType: "checking",
    memo: "",
  });

  // KYC form state
  const [kycData, setKycData] = useState({
    dateOfBirth: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    employmentStatus: "",
    annualIncome: "",
    investmentExperience: "",
    riskTolerance: "",
    governmentId: [] as File[],
    utilityBill: [] as File[],
    otherDocuments: [] as File[],
  });

  // Modal states
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [safeModalOpen, setSafeModalOpen] = useState(false);

  // Fetch user's withdrawal data and KYC status
  const { data: withdrawalInfo, isLoading: withdrawalLoading } = useQuery({
    queryKey: ["/api/withdrawal-info", user?.id],
    enabled: !!user?.id,
  });

  const { data: kycStatus, isLoading: kycLoading } = useQuery({
    queryKey: ["/api/kyc-status", user?.id],
    enabled: !!user?.id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user?.id,
  });

  // Mutations
  const withdrawalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/withdrawal-request", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted and is being processed.",
      });
      setWithdrawalModalOpen(false);
      setWithdrawalData({ 
        amount: "", 
        country: "",
        bankAccount: "", 
        routingNumber: "", 
        swiftCode: "",
        iban: "",
        sortCode: "",
        bsb: "",
        transitNumber: "",
        bankName: "",
        bankAddress: "",
        accountType: "checking", 
        memo: "" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    },
  });

  const kycMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('KYC data being submitted:', data); // Debug log
      
      // Create a clean data object without File objects for JSON submission
      const cleanData = {
        ...data,
        governmentId: data.governmentId?.length > 0 ? `${data.governmentId.length} file(s)` : [],
        utilityBill: data.utilityBill?.length > 0 ? `${data.utilityBill.length} file(s)` : [],
        otherDocuments: data.otherDocuments?.length > 0 ? `${data.otherDocuments.length} file(s)` : []
      };
      
      return apiRequest("POST", "/api/kyc-submit", cleanData);
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for review.",
      });
      setKycModalOpen(false);
      
      // Invalidate KYC status cache to refresh the data immediately
      queryClient.invalidateQueries({ queryKey: ["/api/kyc-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "KYC Submission Failed",
        description: error.message || "Failed to submit KYC information.",
        variant: "destructive",
      });
    },
  });

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600";
      case "pending":
      case "under_review":
        return "text-yellow-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (withdrawalLoading || kycLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/founder-dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <img src={fundryLogoNew} alt="Fundry" className="h-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Withdrawal</h1>
          <p className="text-gray-600 mt-2">Manage your withdrawals, KYC verification, and SAFE agreements</p>
        </div>

        <Tabs defaultValue="withdrawal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger value="safe">SAFE Agreements</TabsTrigger>
          </TabsList>

          {/* Withdrawal Tab */}
          <TabsContent value="withdrawal" className="space-y-6">
            {/* Account Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${withdrawalInfo?.availableBalance || "0.00"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pending Withdrawals</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      ${withdrawalInfo?.pendingWithdrawals || "0.00"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${withdrawalInfo?.totalEarnings || "0.00"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    className="bg-fundry-orange hover:bg-orange-600"
                    onClick={() => {
                      if (kycStatus?.status !== "verified") {
                        toast({
                          title: "KYC Verification Required",
                          description: "Please complete your KYC verification below to request withdrawals.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setWithdrawalModalOpen(true);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Request Withdrawal
                  </Button>

                  <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Request Withdrawal</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          withdrawalMutation.mutate(withdrawalData);
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="amount">Withdrawal Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            max={withdrawalInfo?.availableBalance || 0}
                            value={withdrawalData.amount}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available: ${withdrawalInfo?.availableBalance || "0.00"}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={withdrawalData.country}
                            onValueChange={(value) => {
                              setWithdrawalData(prev => ({ 
                                ...prev, 
                                country: value,
                                // Reset banking fields when country changes
                                bankAccount: "",
                                routingNumber: "",
                                swiftCode: "",
                                iban: "",
                                sortCode: "",
                                bsb: "",
                                transitNumber: "",
                                bankName: "",
                                bankAddress: ""
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES_AND_STATES.map((country) => (
                                <SelectItem key={country.name} value={country.name}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Dynamic Banking Fields Based on Country */}
                        {withdrawalData.country && (() => {
                          const bankingConfig = getBankingFieldsForCountry(withdrawalData.country);
                          return bankingConfig.fields.map((field) => {
                            const fieldKey = field as keyof typeof withdrawalData;
                            return (
                              <div key={field}>
                                <Label htmlFor={field}>{bankingConfig.labels[field]}</Label>
                                <Input
                                  id={field}
                                  value={withdrawalData[fieldKey] as string}
                                  onChange={(e) => setWithdrawalData(prev => ({ ...prev, [field]: e.target.value }))}
                                  placeholder={bankingConfig.labels[field]}
                                  required
                                />
                              </div>
                            );
                          });
                        })()}

                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select
                            value={withdrawalData.accountType}
                            onValueChange={(value) => setWithdrawalData(prev => ({ ...prev, accountType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="savings">Savings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="memo">Memo (Optional)</Label>
                          <Input
                            id="memo"
                            value={withdrawalData.memo}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, memo: e.target.value }))}
                            placeholder="Notes about this withdrawal"
                          />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                          <Button type="button" variant="outline" onClick={() => setWithdrawalModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={withdrawalMutation.isPending}
                            className="bg-fundry-orange hover:bg-orange-600"
                          >
                            {withdrawalMutation.isPending ? "Processing..." : "Submit Request"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            {transaction.type === 'withdrawal' ? (
                              <Download className="h-4 w-4 text-red-600" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount}
                          </p>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Verification Tab */}
          <TabsContent value="kyc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  KYC Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-6">
                  {getKycStatusIcon(kycStatus?.status || "not_started")}
                  <div>
                    <p className="font-medium">Status: <span className={getKycStatusColor(kycStatus?.status || "not_started")}>
                      {kycStatus?.status === "under_review" ? "Under Review" : 
                       kycStatus?.status ? kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1) : "Not Started"}
                    </span></p>
                    {kycStatus?.lastUpdated && (
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(kycStatus.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Display submitted KYC information if available */}
                {(kycStatus?.status === "pending" || kycStatus?.status === "under_review") && kycStatus?.submittedData && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-3">Submitted KYC Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.dateOfBirth}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">SSN:</span>
                        <span className="ml-2 text-gray-600">****</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.address}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.city}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.state}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">ZIP Code:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.zipCode}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Employment Status:</span>
                        <span className="ml-2 text-gray-600 capitalize">{kycStatus.submittedData.employmentStatus?.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Annual Income:</span>
                        <span className="ml-2 text-gray-600">{kycStatus.submittedData.annualIncome}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Investment Experience:</span>
                        <span className="ml-2 text-gray-600 capitalize">{kycStatus.submittedData.investmentExperience}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Risk Tolerance:</span>
                        <span className="ml-2 text-gray-600 capitalize">{kycStatus.submittedData.riskTolerance}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">Government Issued ID - {kycStatus.submittedData.governmentId || 'Uploaded'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">Utility Bill - {kycStatus.submittedData.utilityBill || 'Uploaded'}</span>
                        </div>
                        {kycStatus.submittedData.otherDocuments && kycStatus.submittedData.otherDocuments.length > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-600">Additional Documents - {kycStatus.submittedData.otherDocuments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Status:</strong> Your KYC application is under review. You will receive an email notification once the verification is complete. This process typically takes 1-3 business days.
                      </p>
                    </div>
                  </div>
                )}

                {kycStatus?.status !== "verified" && (
                  <Dialog open={kycModalOpen} onOpenChange={setKycModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-fundry-orange hover:bg-orange-600">
                        <Upload className="mr-2 h-4 w-4" />
                        {kycStatus?.status === "pending" ? "Update KYC" : "Complete KYC"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>KYC Verification</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          
                          // Validate required fields
                          if (!kycData.dateOfBirth) {
                            toast({
                              title: "Validation Error",
                              description: "Date of birth is required",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          if (!kycData.ssn || kycData.ssn.length < 4) {
                            toast({
                              title: "Validation Error", 
                              description: "SSN (last 4 digits) is required",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          if (!kycData.address || !kycData.city || !kycData.state || !kycData.zipCode) {
                            toast({
                              title: "Validation Error",
                              description: "Complete address information is required",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          kycMutation.mutate(kycData);
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={kycData.dateOfBirth}
                              onChange={(e) => setKycData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="ssn">SSN (Last 4 digits)</Label>
                            <Input
                              id="ssn"
                              type="password"
                              maxLength={4}
                              value={kycData.ssn}
                              onChange={(e) => setKycData(prev => ({ ...prev, ssn: e.target.value }))}
                              placeholder="####"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={kycData.address}
                              onChange={(e) => setKycData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Street address"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={kycData.city}
                              onChange={(e) => setKycData(prev => ({ ...prev, city: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={kycData.state}
                              onChange={(e) => setKycData(prev => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              value={kycData.zipCode}
                              onChange={(e) => setKycData(prev => ({ ...prev, zipCode: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="employmentStatus">Employment Status</Label>
                            <Select
                              value={kycData.employmentStatus}
                              onValueChange={(value) => setKycData(prev => ({ ...prev, employmentStatus: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employed">Employed</SelectItem>
                                <SelectItem value="self-employed">Self-Employed</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="annualIncome">Annual Income</Label>
                            <Select
                              value={kycData.annualIncome}
                              onValueChange={(value) => setKycData(prev => ({ ...prev, annualIncome: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-50k">Under $50,000</SelectItem>
                                <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                                <SelectItem value="100k-200k">$100,000 - $200,000</SelectItem>
                                <SelectItem value="200k-500k">$200,000 - $500,000</SelectItem>
                                <SelectItem value="over-500k">Over $500,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="investmentExperience">Investment Experience</Label>
                            <Select
                              value={kycData.investmentExperience}
                              onValueChange={(value) => setKycData(prev => ({ ...prev, investmentExperience: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No experience</SelectItem>
                                <SelectItem value="beginner">Beginner (1-3 years)</SelectItem>
                                <SelectItem value="intermediate">Intermediate (3-7 years)</SelectItem>
                                <SelectItem value="advanced">Advanced (7+ years)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                            <Select
                              value={kycData.riskTolerance}
                              onValueChange={(value) => setKycData(prev => ({ ...prev, riskTolerance: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select tolerance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conservative">Conservative</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="aggressive">Aggressive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="governmentId">Government Issued ID</Label>
                            <Input
                              id="governmentId"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setKycData(prev => ({ ...prev, governmentId: files }));
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload driver's license, passport, or state ID (Max size: 2MB)
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="utilityBill">Utility Bill / Proof of Address</Label>
                            <Input
                              id="utilityBill"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setKycData(prev => ({ ...prev, utilityBill: files }));
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload recent utility bill or bank statement (Max size: 2MB)
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="otherDocuments">Other Documents (Optional)</Label>
                            <Input
                              id="otherDocuments"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setKycData(prev => ({ ...prev, otherDocuments: files }));
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Additional supporting documents (Max size: 2MB each)
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                          <Button type="button" variant="outline" onClick={() => setKycModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={kycMutation.isPending}
                            className="bg-fundry-orange hover:bg-orange-600"
                          >
                            {kycMutation.isPending ? "Submitting..." : "Submit KYC"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {kycStatus?.status === "verified" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">KYC Verification Complete</p>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Your identity has been verified. You can now access all platform features.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SAFE Agreements Tab */}
          <TabsContent value="safe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SAFE Agreements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* SAFE Agreement Template */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Standard SAFE Agreement Template</h3>
                        <p className="text-sm text-gray-600">Post-money valuation cap with discount</p>
                      </div>
                      <Dialog open={safeModalOpen} onOpenChange={setSafeModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Template
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>SAFE Agreement Template</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 text-sm">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">SIMPLE AGREEMENT FOR FUTURE EQUITY</h4>
                              <p className="text-gray-600">
                                This SAFE (Simple Agreement for Future Equity) is entered into between the Company and the Investor.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">1. DEFINITIONS</h4>
                              <div className="space-y-2 text-gray-700">
                                <p><strong>Company:</strong> The issuing startup company</p>
                                <p><strong>Investor:</strong> The person or entity purchasing this SAFE</p>
                                <p><strong>Purchase Amount:</strong> The amount invested by the Investor</p>
                                <p><strong>Valuation Cap:</strong> The maximum company valuation for conversion</p>
                                <p><strong>Discount Rate:</strong> The percentage discount on the price per share</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">2. INVESTMENT TERMS</h4>
                              <div className="space-y-2 text-gray-700">
                                <p>• <strong>Purchase Amount:</strong> $[AMOUNT]</p>
                                <p>• <strong>Valuation Cap:</strong> $[VALUATION_CAP]</p>
                                <p>• <strong>Discount Rate:</strong> [DISCOUNT]%</p>
                                <p>• <strong>Conversion Trigger:</strong> Next equity financing round of $1,000,000 or more</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">3. CONVERSION MECHANICS</h4>
                              <p className="text-gray-700">
                                This SAFE will convert into shares of the Company's preferred stock issued in the next equity 
                                financing round, at the lower of: (i) the Valuation Cap price, or (ii) the Discount Rate applied 
                                to the price paid by other investors in such round.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">4. INVESTOR RIGHTS</h4>
                              <div className="space-y-2 text-gray-700">
                                <p>• Right to receive company updates and financial reports</p>
                                <p>• Pro rata rights in future financing rounds</p>
                                <p>• Information rights regarding material company decisions</p>
                                <p>• Anti-dilution protection via valuation cap and discount</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">5. COMPANY OBLIGATIONS</h4>
                              <div className="space-y-2 text-gray-700">
                                <p>• Provide quarterly business updates to investors</p>
                                <p>• Maintain proper corporate records and governance</p>
                                <p>• Give notice of equity financing rounds</p>
                                <p>• Comply with securities laws and regulations</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">6. DISSOLUTION AND LIQUIDATION</h4>
                              <p className="text-gray-700">
                                In the event of a dissolution or liquidation of the Company, the Investor will receive 
                                either: (i) the Purchase Amount, or (ii) the amount payable on the number of shares 
                                that would have been issued upon conversion, whichever is greater.
                              </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800 text-sm">
                                <strong>Important:</strong> This is a template for educational purposes. 
                                All SAFE agreements should be reviewed by qualified legal counsel before execution.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* User's SAFE Agreements */}
                  <div>
                    <h3 className="font-medium mb-4">Your SAFE Agreements</h3>
                    <div className="space-y-3">
                      {/* This would show actual SAFE agreements from the API */}
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No SAFE agreements yet</p>
                        <p className="text-sm mt-1">SAFE agreements will appear here when you make investments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}