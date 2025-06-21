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
  Wallet,
  Clock,
  TrendingUp,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";
import { COUNTRIES_AND_STATES } from "@/data/countries-states";

// Bank data by country
const BANKS_BY_COUNTRY: Record<string, string[]> = {
  "United States": [
    "JPMorgan Chase Bank",
    "Bank of America",
    "Wells Fargo Bank",
    "Citibank",
    "U.S. Bank",
    "PNC Bank",
    "Goldman Sachs Bank",
    "Truist Bank",
    "Capital One Bank",
    "TD Bank",
    "Bank of New York Mellon",
    "HSBC Bank USA",
    "American Express Bank",
    "Morgan Stanley Bank"
  ],
  "United Kingdom": [
    "Barclays Bank",
    "HSBC UK Bank",
    "Lloyds Bank",
    "NatWest Bank",
    "Santander UK",
    "Royal Bank of Scotland",
    "TSB Bank",
    "Nationwide Building Society",
    "Metro Bank",
    "Starling Bank",
    "Monzo Bank",
    "Revolut",
    "First Direct",
    "Halifax"
  ],
  "Canada": [
    "Royal Bank of Canada (RBC)",
    "Toronto-Dominion Bank (TD)",
    "Bank of Nova Scotia (Scotiabank)",
    "Bank of Montreal (BMO)",
    "Canadian Imperial Bank of Commerce (CIBC)",
    "National Bank of Canada",
    "Desjardins Group",
    "HSBC Bank Canada",
    "Laurentian Bank",
    "Canadian Western Bank",
    "Tangerine Bank",
    "President's Choice Financial"
  ],
  "Nigeria": [
    "Access Bank",
    "Zenith Bank",
    "Guaranty Trust Bank (GTBank)",
    "United Bank for Africa (UBA)",
    "First Bank of Nigeria",
    "Fidelity Bank",
    "Ecobank Nigeria",
    "Stanbic IBTC Bank",
    "Sterling Bank",
    "Union Bank of Nigeria",
    "Wema Bank",
    "FCMB (First City Monument Bank)",
    "Polaris Bank",
    "Keystone Bank",
    "Unity Bank",
    "Jaiz Bank",
    "Providus Bank",
    "Kuda Bank",
    "Opay",
    "PalmPay"
  ],
  "Australia": [
    "Commonwealth Bank of Australia",
    "Westpac Banking Corporation",
    "Australia and New Zealand Banking Group (ANZ)",
    "National Australia Bank (NAB)",
    "Macquarie Bank",
    "ING Bank Australia",
    "HSBC Bank Australia",
    "Citigroup Australia",
    "Bank of Queensland",
    "Bendigo and Adelaide Bank",
    "Suncorp Bank",
    "AMP Bank"
  ],
  "Germany": [
    "Deutsche Bank",
    "Commerzbank",
    "DZ Bank",
    "KfW",
    "Landesbank Baden-Württemberg",
    "Bayerische Landesbank",
    "Norddeutsche Landesbank",
    "ING-DiBa",
    "Santander Consumer Bank",
    "Targobank",
    "Postbank",
    "Comdirect Bank",
    "Consorsbank",
    "N26",
    "Deutsche Kreditbank"
  ],
  "France": [
    "BNP Paribas",
    "Crédit Agricole",
    "Société Générale",
    "Banque Populaire",
    "Caisse d'Épargne",
    "Crédit Mutuel",
    "La Banque Postale",
    "HSBC France",
    "ING Direct France",
    "Boursorama Banque",
    "Hello bank!",
    "Crédit du Nord",
    "LCL",
    "Banque Palatine"
  ],
  "India": [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Bank of India",
    "Indian Bank",
    "Central Bank of India",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "IndusInd Bank",
    "Yes Bank",
    "IDFC First Bank",
    "Federal Bank",
    "South Indian Bank",
    "Karur Vysya Bank"
  ],
  "South Africa": [
    "Standard Bank",
    "FirstRand Bank",
    "ABSA Bank",
    "Nedbank",
    "Investec Bank",
    "Capitec Bank",
    "African Bank",
    "Bidvest Bank",
    "Discovery Bank",
    "TymeBank",
    "Bank Zero",
    "Ubank"
  ],
  "Brazil": [
    "Banco do Brasil",
    "Itaú Unibanco",
    "Bradesco",
    "Caixa Econômica Federal",
    "Santander Brasil",
    "BTG Pactual",
    "Banco Safra",
    "Banco Votorantim",
    "Banco Original",
    "Inter Bank",
    "C6 Bank",
    "Nubank",
    "Next",
    "Neon"
  ]
};

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

  // Bank selection state
  const [customBankName, setCustomBankName] = useState("");
  const [showCustomBankInput, setShowCustomBankInput] = useState(false);

  // KYC form state
  const [kycData, setKycData] = useState({
    dateOfBirth: "",
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
  const [viewSafeModalOpen, setViewSafeModalOpen] = useState(false);
  const [selectedSafeAgreement, setSelectedSafeAgreement] = useState<any>(null);

  // Fetch user's withdrawal data and KYC status
  const { data: withdrawalInfo, isLoading: withdrawalLoading } = useQuery({
    queryKey: ["/api/withdrawal-info"],
    enabled: !!user?.id,
  });

  const { data: kycStatus, isLoading: kycLoading } = useQuery({
    queryKey: ["/api/kyc-status", user?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/kyc-status/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user?.id,
  });

  const { data: safeAgreements, isLoading: safeAgreementsLoading } = useQuery({
    queryKey: ["/api/safe-agreements"],
    enabled: !!user?.id,
  });

  // Fetch withdrawal settings for banner display
  const { data: withdrawalSettings } = useQuery({
    queryKey: ["/api/withdrawal-settings"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/kyc-status", user?.id] });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-white via-orange-50/50 to-blue-50/30 shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/founder-dashboard")}
                className="flex items-center gap-1 sm:gap-2 text-fundry-navy hover:text-fundry-orange transition-colors duration-300 p-2 sm:p-3 rounded-xl hover:bg-orange-50"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6 sm:h-8 bg-orange-200" />
              <div className="cursor-pointer" onClick={() => setLocation("/landing")}>
                <img src={fundryLogoNew} alt="Fundry" className="h-8 sm:h-12 hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Page Title Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-fundry-navy via-blue-800 to-fundry-navy p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-200/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-fundry-orange to-orange-600 rounded-xl shadow-lg">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Payment Withdrawal</h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage your earnings, KYC verification, and investment documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Withdrawal Requirements Banner */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-gradient-to-r from-fundry-orange to-orange-600 rounded-xl shadow-md">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-fundry-navy mb-3">Withdrawal Requirements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/70 p-3 sm:p-4 rounded-xl border border-orange-200/50">
                      <p className="text-sm font-semibold text-fundry-navy mb-1">KYC Status</p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {kycStatus?.status === "verified" ? "✅ Verified" : "❌ Verification Required"}
                      </p>
                    </div>
                    <div className="bg-white/70 p-3 sm:p-4 rounded-xl border border-orange-200/50">
                      <p className="text-sm font-semibold text-fundry-navy mb-1">Minimum Amount</p>
                      <p className="text-xs sm:text-sm text-gray-700">${withdrawalSettings?.minWithdrawalAmount || "25.00"}</p>
                    </div>
                    <div className="bg-white/70 p-3 sm:p-4 rounded-xl border border-orange-200/50 sm:col-span-2 lg:col-span-1">
                      <p className="text-sm font-semibold text-fundry-navy mb-1">Campaign Goal</p>
                      <p className="text-xs sm:text-sm text-gray-700">Min {withdrawalSettings?.minCampaignGoalPercentage || "20"}% completion</p>
                    </div>
                  </div>
                  {kycStatus?.status !== "verified" && (
                    <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-xl">
                      <p className="text-xs sm:text-sm text-amber-800 font-medium">
                        📋 Complete KYC verification below to unlock withdrawal functionality
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="withdrawal" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 border-2 border-orange-200 rounded-2xl p-1">
            <TabsTrigger value="withdrawal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white text-fundry-navy font-semibold rounded-xl transition-all duration-300">
              Withdrawal
            </TabsTrigger>
            <TabsTrigger value="kyc" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white text-fundry-navy font-semibold rounded-xl transition-all duration-300">
              KYC Verification
            </TabsTrigger>
            <TabsTrigger value="safe" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fundry-orange data-[state=active]:to-orange-600 data-[state=active]:text-white text-fundry-navy font-semibold rounded-xl transition-all duration-300">
              SAFE Agreements
            </TabsTrigger>
          </TabsList>

          {/* Withdrawal Tab */}
          <TabsContent value="withdrawal" className="space-y-6 sm:space-y-8">
            {/* Modern Account Balance */}
            <div className="bg-gradient-to-r from-white via-blue-50/30 to-orange-50/20 border-2 border-blue-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-fundry-navy via-blue-800 to-fundry-navy p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-fundry-orange to-orange-600 rounded-xl shadow-lg">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Account Balance</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Available Balance */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-2xl p-4 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-center mb-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                        <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-2">Available Balance</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">
                      ${withdrawalInfo?.availableBalance || "0.00"}
                    </p>
                  </div>

                  {/* Pending Withdrawals */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-center mb-3">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-amber-700 mb-2">Pending Withdrawals</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600">
                      ${withdrawalInfo?.pendingWithdrawals || "0.00"}
                    </p>
                  </div>

                  {/* Total Earnings */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 sm:p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-center mb-3">
                      <div className="p-2 bg-gradient-to-r from-fundry-navy to-blue-700 rounded-xl">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">Total Earnings</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                      ${withdrawalInfo?.totalEarnings || "0.00"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <Button 
                    className="bg-gradient-to-r from-fundry-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                    <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Request Withdrawal</span>
                  </Button>
                </div>
              </div>
            </div>

            <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/30 to-blue-50/20 border-2 border-orange-200">
                <DialogHeader className="bg-gradient-to-r from-fundry-navy to-blue-800 -m-6 mb-4 p-6 rounded-t-lg">
                  <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-fundry-orange to-orange-600 rounded-xl">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    Request Withdrawal
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    withdrawalMutation.mutate(withdrawalData);
                  }}
                  className="space-y-4 p-6"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-xl p-4">
                    <Label htmlFor="amount" className="text-sm font-semibold text-emerald-700">Withdrawal Amount</Label>
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
                      className="mt-2 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                      Available: ${withdrawalInfo?.availableBalance || "0.00"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-4">
                    <Label htmlFor="country" className="text-sm font-semibold text-blue-700">Country</Label>
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
                        // Reset bank selection state
                        setShowCustomBankInput(false);
                        setCustomBankName("");
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

                  {/* Bank Name Dropdown with Country-Specific Banks */}
                  {withdrawalData.country && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-2 border-purple-200 rounded-xl p-4">
                      <Label htmlFor="bankName" className="text-sm font-semibold text-purple-700">Bank Name</Label>
                      <Select
                        value={showCustomBankInput ? "custom" : withdrawalData.bankName}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setShowCustomBankInput(true);
                            setWithdrawalData(prev => ({ ...prev, bankName: customBankName }));
                          } else {
                            setShowCustomBankInput(false);
                            setWithdrawalData(prev => ({ ...prev, bankName: value }));
                          }
                        }}
                      >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {BANKS_BY_COUNTRY[withdrawalData.country]?.map((bank) => (
                                  <SelectItem key={bank} value={bank}>
                                    {bank}
                                  </SelectItem>
                                )) || null}
                                <SelectItem value="custom">Other (Enter manually)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Custom Bank Name Input */}
                        {showCustomBankInput && (
                          <div>
                            <Label htmlFor="customBankName">Enter Bank Name</Label>
                            <Input
                              id="customBankName"
                              value={customBankName}
                              onChange={(e) => {
                                setCustomBankName(e.target.value);
                                setWithdrawalData(prev => ({ ...prev, bankName: e.target.value }));
                              }}
                              placeholder="Enter your bank name"
                              required
                            />
                          </div>
                        )}

                        {/* Dynamic Banking Fields Based on Country */}
                        {withdrawalData.country && (() => {
                          const bankingConfig = getBankingFieldsForCountry(withdrawalData.country);
                          return bankingConfig.fields.filter(field => field !== 'bankName').map((field) => {
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

            <Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/30 to-blue-50/20 border-2 border-orange-200">
                <DialogHeader className="bg-gradient-to-r from-fundry-navy to-blue-800 -m-6 mb-4 p-6 rounded-t-lg">
                  <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-fundry-orange to-orange-600 rounded-xl">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    Request Withdrawal
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    withdrawalMutation.mutate(withdrawalData);
                  }}
                  className="space-y-4 p-6"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-xl p-4">
                    <Label htmlFor="amount" className="text-sm font-semibold text-emerald-700">Withdrawal Amount</Label>
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
                      className="mt-2 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                      Available: ${withdrawalInfo?.availableBalance || "0.00"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-4">
                    <Label htmlFor="country" className="text-sm font-semibold text-blue-700">Country</Label>
                    <Select
                      value={withdrawalData.country}
                      onValueChange={(value) => {
                        setWithdrawalData(prev => ({ 
                          ...prev, 
                          country: value,
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
                        setShowCustomBankInput(false);
                        setCustomBankName("");
                      }}
                    >
                      <SelectTrigger className="mt-2">
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

                  {withdrawalData.country && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-2 border-purple-200 rounded-xl p-4">
                      <Label htmlFor="bankName" className="text-sm font-semibold text-purple-700">Bank Name</Label>
                      <Select
                        value={showCustomBankInput ? "custom" : withdrawalData.bankName}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setShowCustomBankInput(true);
                            setWithdrawalData(prev => ({ ...prev, bankName: customBankName }));
                          } else {
                            setShowCustomBankInput(false);
                            setWithdrawalData(prev => ({ ...prev, bankName: value }));
                          }
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {BANKS_BY_COUNTRY[withdrawalData.country]?.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          )) || null}
                          <SelectItem value="custom">Other (Enter manually)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showCustomBankInput && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-xl p-4">
                      <Label htmlFor="customBankName" className="text-sm font-semibold text-amber-700">Enter Bank Name</Label>
                      <Input
                        id="customBankName"
                        value={customBankName}
                        onChange={(e) => {
                          setCustomBankName(e.target.value);
                          setWithdrawalData(prev => ({ ...prev, bankName: e.target.value }));
                        }}
                        placeholder="Enter your bank name"
                        required
                        className="mt-2 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {withdrawalData.country && (() => {
                    const bankingConfig = getBankingFieldsForCountry(withdrawalData.country);
                    return bankingConfig.fields.filter(field => field !== 'bankName').map((field) => {
                      const fieldKey = field as keyof typeof withdrawalData;
                      return (
                        <div key={field} className="bg-gradient-to-r from-slate-50 to-gray-100 border-2 border-slate-200 rounded-xl p-4">
                          <Label htmlFor={field} className="text-sm font-semibold text-slate-700">{bankingConfig.labels[field]}</Label>
                          <Input
                            id={field}
                            value={withdrawalData[fieldKey] as string}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={bankingConfig.labels[field]}
                            required
                            className="mt-2 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                          />
                        </div>
                      );
                    });
                  })()}

                  <div className="bg-gradient-to-r from-pink-50 to-rose-100 border-2 border-pink-200 rounded-xl p-4">
                    <Label htmlFor="accountType" className="text-sm font-semibold text-pink-700">Account Type</Label>
                    <Select
                      value={withdrawalData.accountType}
                      onValueChange={(value) => setWithdrawalData(prev => ({ ...prev, accountType: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-teal-100 border-2 border-cyan-200 rounded-xl p-4">
                    <Label htmlFor="memo" className="text-sm font-semibold text-cyan-700">Memo (Optional)</Label>
                    <Input
                      id="memo"
                      value={withdrawalData.memo}
                      onChange={(e) => setWithdrawalData(prev => ({ ...prev, memo: e.target.value }))}
                      placeholder="Notes about this withdrawal"
                      className="mt-2 border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setWithdrawalModalOpen(false)}
                      className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={withdrawalMutation.isPending}
                      className="bg-gradient-to-r from-fundry-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {withdrawalMutation.isPending ? "Processing..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

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
                       kycStatus?.status ? String(kycStatus.status).charAt(0).toUpperCase() + String(kycStatus.status).slice(1) : "Not Started"}
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
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-blue-50">
                      <DialogHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mb-4">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-fundry-navy">Identity Verification</DialogTitle>
                        <p className="text-gray-600 mt-2">Complete your verification to access withdrawal features</p>
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
                        className="space-y-6 bg-white rounded-lg p-6 shadow-sm"
                      >
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                            <h3 className="text-lg font-semibold text-fundry-navy">Personal Information</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="dateOfBirth" className="text-fundry-navy font-medium">Date of Birth</Label>
                              <Input
                                id="dateOfBirth"
                                type="date"
                                value={kycData.dateOfBirth}
                                onChange={(e) => setKycData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                            <h3 className="text-lg font-semibold text-fundry-navy">Address Information</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="address" className="text-fundry-navy font-medium">Street Address</Label>
                              <Input
                                id="address"
                                value={kycData.address}
                                onChange={(e) => setKycData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter your full street address"
                                className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="city" className="text-fundry-navy font-medium">City</Label>
                                <Input
                                  id="city"
                                  value={kycData.city}
                                  onChange={(e) => setKycData(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="Enter your city"
                                  className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="state" className="text-fundry-navy font-medium">State</Label>
                                <Input
                                  id="state"
                                  value={kycData.state}
                                  onChange={(e) => setKycData(prev => ({ ...prev, state: e.target.value }))}
                                  placeholder="Enter your state"
                                  className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="zipCode" className="text-fundry-navy font-medium">ZIP Code</Label>
                              <Input
                                id="zipCode"
                                value={kycData.zipCode}
                                onChange={(e) => setKycData(prev => ({ ...prev, zipCode: e.target.value }))}
                                placeholder="Enter your ZIP code"
                                className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Professional & Financial Information Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                            <h3 className="text-lg font-semibold text-fundry-navy">Professional & Financial Information</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="employmentStatus" className="text-fundry-navy font-medium">Employment Status</Label>
                              <Select
                                value={kycData.employmentStatus}
                                onValueChange={(value) => setKycData(prev => ({ ...prev, employmentStatus: value }))}
                              >
                                <SelectTrigger className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange">
                                  <SelectValue placeholder="Select your employment status" />
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
                              <Label htmlFor="annualIncome" className="text-fundry-navy font-medium">Annual Income</Label>
                              <Select
                                value={kycData.annualIncome}
                                onValueChange={(value) => setKycData(prev => ({ ...prev, annualIncome: value }))}
                              >
                                <SelectTrigger className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange">
                                  <SelectValue placeholder="Select your income range" />
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
                              <Label htmlFor="investmentExperience" className="text-fundry-navy font-medium">Investment Experience</Label>
                              <Select
                                value={kycData.investmentExperience}
                                onValueChange={(value) => setKycData(prev => ({ ...prev, investmentExperience: value }))}
                              >
                                <SelectTrigger className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange">
                                  <SelectValue placeholder="Select your experience level" />
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
                              <Label htmlFor="riskTolerance" className="text-fundry-navy font-medium">Risk Tolerance</Label>
                              <Select
                                value={kycData.riskTolerance}
                                onValueChange={(value) => setKycData(prev => ({ ...prev, riskTolerance: value }))}
                              >
                                <SelectTrigger className="mt-1 border-gray-300 focus:border-fundry-orange focus:ring-fundry-orange">
                                  <SelectValue placeholder="Select your risk tolerance" />
                                </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conservative">Conservative</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="aggressive">Aggressive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          </div>
                        </div>

                        {/* Document Upload Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                            <h3 className="text-lg font-semibold text-fundry-navy">Document Upload</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-fundry-orange transition-colors">
                              <Label htmlFor="governmentId" className="text-fundry-navy font-medium">Government Issued ID</Label>
                              <Input
                                id="governmentId"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setKycData(prev => ({ ...prev, governmentId: files }));
                                }}
                                className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Upload driver's license, passport, or state ID (Max size: 2MB)
                              </p>
                            </div>

                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-fundry-orange transition-colors">
                              <Label htmlFor="utilityBill" className="text-fundry-navy font-medium">Utility Bill / Proof of Address</Label>
                              <Input
                                id="utilityBill"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setKycData(prev => ({ ...prev, utilityBill: files }));
                                }}
                                className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Upload recent utility bill or bank statement (Max size: 2MB)
                              </p>
                            </div>

                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-fundry-orange transition-colors">
                              <Label htmlFor="otherDocuments" className="text-fundry-navy font-medium">Other Documents (Optional)</Label>
                              <Input
                                id="otherDocuments"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setKycData(prev => ({ ...prev, otherDocuments: files }));
                                }}
                                className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-fundry-orange file:text-white hover:file:bg-orange-600"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Additional supporting documents (Max size: 2MB each)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setKycModalOpen(false)}
                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={kycMutation.isPending}
                            className="px-6 py-2 bg-fundry-orange hover:bg-orange-600 text-white font-medium shadow-lg"
                          >
                            {kycMutation.isPending ? "Submitting..." : "Complete Verification"}
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
                      {safeAgreementsLoading ? (
                        <div className="animate-pulse space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                          ))}
                        </div>
                      ) : safeAgreements && safeAgreements.length > 0 ? (
                        safeAgreements.map((agreement: any) => (
                          <div key={agreement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                    <FileText className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{agreement.companyName}</h4>
                                    <p className="text-sm text-gray-600">
                                      SAFE Agreement • ${parseFloat(agreement.investmentAmount).toLocaleString()} Investment
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-11">
                                  <p>Investor: {agreement.investorName} ({agreement.investorEmail})</p>
                                  <p>Date: {new Date(agreement.agreementDate).toLocaleDateString()}</p>
                                  <p>Discount Rate: {agreement.discountRate}% • Valuation Cap: ${(agreement.valuationCap / 1000000).toFixed(1)}M</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSafeAgreement(agreement);
                                    setViewSafeModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-fundry-orange hover:bg-orange-600"
                                  onClick={() => {
                                    // Generate and download complete SAFE agreement
                                    const safeContent = `SIMPLE AGREEMENT FOR FUTURE EQUITY

This Simple Agreement for Future Equity ("SAFE") is entered into on ${new Date(agreement.agreementDate).toLocaleDateString()} between:

COMPANY: ${agreement.companyName}
INVESTOR: ${agreement.investorName}
INVESTMENT AMOUNT: $${parseFloat(agreement.investmentAmount).toLocaleString()}
VALUATION CAP: $${agreement.valuationCap.toLocaleString()}
DISCOUNT RATE: ${agreement.discountRate}%

ARTICLE 1: DEFINITIONS

1.1 "Company" means ${agreement.companyName}, a company incorporated under applicable laws.
1.2 "Investor" means ${agreement.investorName}.
1.3 "Purchase Amount" means $${parseFloat(agreement.investmentAmount).toLocaleString()}.
1.4 "Valuation Cap" means $${agreement.valuationCap.toLocaleString()}.
1.5 "Discount Rate" means ${agreement.discountRate}%.

ARTICLE 2: INVESTMENT TERMS

2.1 Investment: The Investor agrees to invest $${parseFloat(agreement.investmentAmount).toLocaleString()} in the Company.
2.2 Future Equity: This investment will convert to equity shares upon a qualifying financing round.
2.3 Conversion Price: The lower of (a) the Valuation Cap divided by the Company's fully-diluted shares, or (b) the Discount Rate applied to the price per share in the qualifying financing.

ARTICLE 3: CONVERSION EVENTS

3.1 Equity Financing: Upon a qualifying equity financing round of at least $1,000,000, this SAFE will automatically convert to the same class of shares sold in such financing.
3.2 Liquidity Event: Upon a sale, merger, or IPO, the Investor will receive the greater of (a) the Purchase Amount, or (b) the proceeds from the converted shares.
3.3 Dissolution: Upon dissolution, the Investor receives the Purchase Amount before any distributions to common shareholders.

ARTICLE 4: INVESTOR RIGHTS

4.1 Information Rights: The Company will provide quarterly financial statements and annual reports.
4.2 Inspection Rights: The Investor may inspect Company books and records upon reasonable notice.
4.3 Pro Rata Rights: The Investor has the right to participate in future financing rounds pro rata to their ownership percentage.

ARTICLE 5: COMPANY REPRESENTATIONS

5.1 The Company is duly incorporated and in good standing.
5.2 The Company has the authority to enter into this agreement.
5.3 All material information provided to the Investor is accurate and complete.
5.4 The Company will use the investment funds for business operations.

ARTICLE 6: MISCELLANEOUS

6.1 Governing Law: This agreement is governed by the laws of the jurisdiction where the Company is incorporated.
6.2 Amendment: This agreement may only be amended in writing signed by both parties.
6.3 Severability: If any provision is invalid, the remainder of the agreement remains in effect.

SIGNATURES:

Company: ${agreement.companyName}
By: _________________________
Name: [Founder Name]
Title: Chief Executive Officer
Date: ${new Date(agreement.agreementDate).toLocaleDateString()}

Investor: ${agreement.investorName}
Signature: _________________________
Date: ${new Date(agreement.agreementDate).toLocaleDateString()}

---
This agreement represents a binding legal contract. Both parties should seek independent legal counsel before signing.`;
                                    
                                    const blob = new Blob([safeContent], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `SAFE_Agreement_${agreement.companyName.replace(/\s+/g, '_')}_${agreement.id}.txt`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                    
                                    toast({
                                      title: "Download Started",
                                      description: "Your SAFE agreement is being downloaded.",
                                    });
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No SAFE agreements yet</p>
                          <p className="text-sm mt-1">SAFE agreements will appear here when you receive investments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SAFE Agreement Viewer Modal */}
        <Dialog open={viewSafeModalOpen} onOpenChange={setViewSafeModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50">
            <DialogHeader className="text-center pb-4 sm:pb-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-fundry-orange rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-fundry-navy">
                SAFE Agreement
              </DialogTitle>
              {selectedSafeAgreement && (
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {selectedSafeAgreement.companyName} • ${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()} Investment
                </p>
              )}
            </DialogHeader>
            
            {selectedSafeAgreement && (
              <div className="bg-white rounded-lg p-4 sm:p-8 shadow-sm font-serif">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4">
                    SIMPLE AGREEMENT FOR FUTURE EQUITY
                  </h1>
                  <p className="text-base sm:text-lg text-gray-700">
                    <strong>{selectedSafeAgreement.companyName}</strong>
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6 text-gray-800 leading-relaxed text-sm sm:text-base">
                  <div>
                    <p className="mb-4">
                      This Simple Agreement for Future Equity ("SAFE") is entered into on{" "}
                      <strong>{new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()}</strong> between:
                    </p>
                    
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <p className="text-sm sm:text-base"><strong>COMPANY:</strong> {selectedSafeAgreement.companyName}</p>
                          <p className="text-sm sm:text-base"><strong>INVESTOR:</strong> {selectedSafeAgreement.investorName}</p>
                          <p className="text-sm sm:text-base"><strong>INVESTMENT AMOUNT:</strong> ${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()}</p>
                          <p className="text-sm sm:text-base"><strong>VALUATION CAP:</strong> ${selectedSafeAgreement.valuationCap.toLocaleString()}</p>
                          <p className="text-sm sm:text-base"><strong>DISCOUNT RATE:</strong> {selectedSafeAgreement.discountRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 1: DEFINITIONS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>1.1 "Company" means {selectedSafeAgreement.companyName}, a company incorporated under applicable laws.</p>
                      <p>1.2 "Investor" means {selectedSafeAgreement.investorName}.</p>
                      <p>1.3 "Purchase Amount" means ${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()}.</p>
                      <p>1.4 "Valuation Cap" means ${selectedSafeAgreement.valuationCap.toLocaleString()}.</p>
                      <p>1.5 "Discount Rate" means {selectedSafeAgreement.discountRate}%.</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 2: INVESTMENT TERMS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>2.1 Investment: The Investor agrees to invest ${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()} in the Company.</p>
                      <p>2.2 Future Equity: This investment will convert to equity shares upon a qualifying financing round.</p>
                      <p>2.3 Conversion Price: The lower of (a) the Valuation Cap divided by the Company's fully-diluted shares, or (b) the Discount Rate applied to the price per share in the qualifying financing.</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 3: CONVERSION EVENTS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>3.1 Equity Financing: Upon a qualifying equity financing round of at least $1,000,000, this SAFE will automatically convert to the same class of shares sold in such financing.</p>
                      <p>3.2 Liquidity Event: Upon a sale, merger, or IPO, the Investor will receive the greater of (a) the Purchase Amount, or (b) the proceeds from the converted shares.</p>
                      <p>3.3 Dissolution: Upon dissolution, the Investor receives the Purchase Amount before any distributions to common shareholders.</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 4: INVESTOR RIGHTS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>4.1 Information Rights: The Company will provide quarterly financial statements and annual reports.</p>
                      <p>4.2 Inspection Rights: The Investor may inspect Company books and records upon reasonable notice.</p>
                      <p>4.3 Pro Rata Rights: The Investor has the right to participate in future financing rounds pro rata to their ownership percentage.</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 5: COMPANY REPRESENTATIONS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>5.1 The Company is duly incorporated and in good standing.</p>
                      <p>5.2 The Company has the authority to enter into this agreement.</p>
                      <p>5.3 All material information provided to the Investor is accurate and complete.</p>
                      <p>5.4 The Company will use the investment funds for business operations.</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-fundry-navy">ARTICLE 6: MISCELLANEOUS</h2>
                    <div className="space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                      <p>6.1 Governing Law: This agreement is governed by the laws of the jurisdiction where the Company is incorporated.</p>
                      <p>6.2 Amendment: This agreement may only be amended in writing signed by both parties.</p>
                      <p>6.3 Severability: If any provision is invalid, the remainder of the agreement remains in effect.</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 sm:pt-6 mt-6 sm:mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-fundry-navy">SIGNATURES</h2>
                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                      <div className="space-y-3 sm:space-y-4">
                        <p className="text-sm sm:text-base"><strong>Company:</strong> {selectedSafeAgreement.companyName}</p>
                        <div className="border-b border-gray-300 h-6 sm:h-8"></div>
                        <p className="text-sm sm:text-base">Name: [Founder Name]</p>
                        <p className="text-sm sm:text-base">Title: Chief Executive Officer</p>
                        <p className="text-sm sm:text-base">Date: {new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <p className="text-sm sm:text-base"><strong>Investor:</strong> {selectedSafeAgreement.investorName}</p>
                        <div className="border-b border-gray-300 h-6 sm:h-8"></div>
                        <p className="text-sm sm:text-base">Date: {new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
                    <p className="text-yellow-800 text-xs sm:text-sm">
                      <strong>Important:</strong> This agreement represents a binding legal contract. Both parties should seek independent legal counsel before signing.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setViewSafeModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-fundry-orange hover:bg-orange-600 w-full sm:w-auto"
                    onClick={() => {
                      // Generate and download complete SAFE agreement
                      const safeContent = `SIMPLE AGREEMENT FOR FUTURE EQUITY

This Simple Agreement for Future Equity ("SAFE") is entered into on ${new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()} between:

COMPANY: ${selectedSafeAgreement.companyName}
INVESTOR: ${selectedSafeAgreement.investorName}
INVESTMENT AMOUNT: $${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()}
VALUATION CAP: $${selectedSafeAgreement.valuationCap.toLocaleString()}
DISCOUNT RATE: ${selectedSafeAgreement.discountRate}%

ARTICLE 1: DEFINITIONS

1.1 "Company" means ${selectedSafeAgreement.companyName}, a company incorporated under applicable laws.
1.2 "Investor" means ${selectedSafeAgreement.investorName}.
1.3 "Purchase Amount" means $${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()}.
1.4 "Valuation Cap" means $${selectedSafeAgreement.valuationCap.toLocaleString()}.
1.5 "Discount Rate" means ${selectedSafeAgreement.discountRate}%.

ARTICLE 2: INVESTMENT TERMS

2.1 Investment: The Investor agrees to invest $${parseFloat(selectedSafeAgreement.investmentAmount).toLocaleString()} in the Company.
2.2 Future Equity: This investment will convert to equity shares upon a qualifying financing round.
2.3 Conversion Price: The lower of (a) the Valuation Cap divided by the Company's fully-diluted shares, or (b) the Discount Rate applied to the price per share in the qualifying financing.

ARTICLE 3: CONVERSION EVENTS

3.1 Equity Financing: Upon a qualifying equity financing round of at least $1,000,000, this SAFE will automatically convert to the same class of shares sold in such financing.
3.2 Liquidity Event: Upon a sale, merger, or IPO, the Investor will receive the greater of (a) the Purchase Amount, or (b) the proceeds from the converted shares.
3.3 Dissolution: Upon dissolution, the Investor receives the Purchase Amount before any distributions to common shareholders.

ARTICLE 4: INVESTOR RIGHTS

4.1 Information Rights: The Company will provide quarterly financial statements and annual reports.
4.2 Inspection Rights: The Investor may inspect Company books and records upon reasonable notice.
4.3 Pro Rata Rights: The Investor has the right to participate in future financing rounds pro rata to their ownership percentage.

ARTICLE 5: COMPANY REPRESENTATIONS

5.1 The Company is duly incorporated and in good standing.
5.2 The Company has the authority to enter into this agreement.
5.3 All material information provided to the Investor is accurate and complete.
5.4 The Company will use the investment funds for business operations.

ARTICLE 6: MISCELLANEOUS

6.1 Governing Law: This agreement is governed by the laws of the jurisdiction where the Company is incorporated.
6.2 Amendment: This agreement may only be amended in writing signed by both parties.
6.3 Severability: If any provision is invalid, the remainder of the agreement remains in effect.

SIGNATURES:

Company: ${selectedSafeAgreement.companyName}
By: _________________________
Name: [Founder Name]
Title: Chief Executive Officer
Date: ${new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()}

Investor: ${selectedSafeAgreement.investorName}
Signature: _________________________
Date: ${new Date(selectedSafeAgreement.agreementDate).toLocaleDateString()}

---
This agreement represents a binding legal contract. Both parties should seek independent legal counsel before signing.`;
                      
                      const blob = new Blob([safeContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `SAFE_Agreement_${selectedSafeAgreement.companyName.replace(/\s+/g, '_')}_${selectedSafeAgreement.id}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Download Started",
                        description: "Your SAFE agreement is being downloaded.",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Agreement
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}