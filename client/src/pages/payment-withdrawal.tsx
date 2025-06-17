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
import { apiRequest } from "@/lib/queryClient";
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
import fundryLogoNew from "@assets/ChatGPT Image Jun 11, 2025, 05_42_54 AM (1)_1750153181796.png";

export default function PaymentWithdrawal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Withdrawal form state
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    bankAccount: "",
    routingNumber: "",
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
    documents: [] as File[],
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
      setWithdrawalData({ amount: "", bankAccount: "", routingNumber: "", accountType: "checking", memo: "" });
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
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'documents') {
          data[key].forEach((file: File) => formData.append('documents', file));
        } else {
          formData.append(key, data[key]);
        }
      });
      return apiRequest("POST", "/api/kyc-submit", formData);
    },
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for review.",
      });
      setKycModalOpen(false);
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
              <img src={fundryLogoNew} alt="Fundry" className="h-8" />
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/logout")}
              className="flex items-center gap-2"
            >
              Logout
            </Button>
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
                  <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-fundry-orange hover:bg-orange-600">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Request Withdrawal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
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
                          <Label htmlFor="bankAccount">Bank Account Number</Label>
                          <Input
                            id="bankAccount"
                            value={withdrawalData.bankAccount}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, bankAccount: e.target.value }))}
                            placeholder="Account number"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            value={withdrawalData.routingNumber}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, routingNumber: e.target.value }))}
                            placeholder="Routing number"
                            required
                          />
                        </div>

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
                      {kycStatus?.status ? kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1) : "Not Started"}
                    </span></p>
                    {kycStatus?.lastUpdated && (
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(kycStatus.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

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

                        <div>
                          <Label htmlFor="documents">Required Documents</Label>
                          <Input
                            id="documents"
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setKycData(prev => ({ 
                              ...prev, 
                              documents: Array.from(e.target.files || []) 
                            }))}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload ID, proof of address, and income verification (PDF, JPG, PNG)
                          </p>
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