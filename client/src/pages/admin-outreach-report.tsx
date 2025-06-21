import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar,
  FileDown,
  Target,
  Building,
  DollarSign
} from "lucide-react";
import { FundryLogo } from "@/components/ui/fundry-logo";
import { useToast } from "@/hooks/use-toast";

interface OutreachAnalytics {
  totalEmailsSent: number;
  totalEmailsOpened: number;
  openRate: number;
  foundersCount: number;
  investorsReached: number;
  campaignsInvolved: number;
  responseRate: number;
  emailGrowthRate: number;
  avgResponseTime: number;
  conversionRate: number;
  activeFounders: number;
  avgEmailsPerFounder: number;
}

interface CampaignOutreach {
  campaignTitle: string;
  founderName: string;
  emailsSent: number;
  emailsOpened: number;
  openRate: number;
  investorsReached: number;
  responses: number;
  lastSent: string;
}

export default function AdminOutreachReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const { toast } = useToast();

  // Build query parameters for API calls
  const getQueryParams = () => {
    const params = new URLSearchParams({ period: selectedPeriod });
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      params.append('startDate', customStartDate);
      params.append('endDate', customEndDate);
    }
    return params.toString();
  };

  // Fetch outreach analytics
  const { data: outreachAnalytics, isLoading: analyticsLoading } = useQuery<OutreachAnalytics>({
    queryKey: ['/api/admin/outreach-analytics', selectedPeriod, customStartDate, customEndDate],
    queryFn: async () => {
      const response = await fetch(`/api/admin/outreach-analytics?${getQueryParams()}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: selectedPeriod !== 'custom' || Boolean(customStartDate && customEndDate),
  });

  // Fetch campaign outreach data
  const { data: campaignOutreach, isLoading: campaignLoading } = useQuery<CampaignOutreach[]>({
    queryKey: ['/api/admin/campaign-outreach', selectedPeriod, customStartDate, customEndDate],
    queryFn: async () => {
      const response = await fetch(`/api/admin/campaign-outreach?${getQueryParams()}`);
      if (!response.ok) throw new Error('Failed to fetch campaign data');
      return response.json();
    },
    enabled: selectedPeriod !== 'custom' || Boolean(customStartDate && customEndDate),
  });

  const handleExportReport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `fundry-outreach-report-${selectedPeriod}-${timestamp}.json`;
    
    const reportData = {
      period: selectedPeriod,
      customDates: selectedPeriod === 'custom' ? { start: customStartDate, end: customEndDate } : null,
      analytics: outreachAnalytics,
      campaignDetails: campaignOutreach,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Outreach report has been downloaded successfully.",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm" className="text-fundry-navy hover:bg-fundry-navy/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleExportReport}
                variant="outline"
                className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-fundry-navy mb-2">Outreach Analytics Report</h1>
          <p className="text-gray-600 text-lg">Comprehensive analysis of founder-to-investor email outreach campaigns</p>
        </div>

        {/* Time Period Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-fundry-navy flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Report Time Period
            </CardTitle>
            <CardDescription>Select the time range for your outreach analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
              {[
                { key: 'today', label: 'Today' },
                { key: '7days', label: '7 Days' },
                { key: '1month', label: '1 Month' },
                { key: '3months', label: 'Quarter' },
                { key: '6months', label: '6 Months' },
                { key: '1year', label: '1 Year' },
                { key: 'all', label: 'All Time' },
                { key: 'custom', label: 'Custom' }
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key)}
                  className={selectedPeriod === period.key 
                    ? "bg-fundry-navy text-white" 
                    : "border-fundry-navy/30 text-fundry-navy hover:bg-fundry-navy/10"
                  }
                >
                  {period.label}
                </Button>
              ))}
            </div>
            
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
                  <Input 
                    id="endDate"
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-l-4 border-l-fundry-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Emails Sent</CardTitle>
              <Send className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : formatNumber((outreachAnalytics as any)?.totalEmailsSent || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                +{(outreachAnalytics as any)?.emailGrowthRate || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-fundry-navy">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Emails Opened</CardTitle>
              <Mail className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : formatNumber((outreachAnalytics as any)?.totalEmailsOpened || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {(outreachAnalytics as any)?.openRate || 0}% open rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-fundry-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Active Founders</CardTitle>
              <Users className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : formatNumber((outreachAnalytics as any)?.foundersCount || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Sending outreach emails
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-fundry-navy">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Investors Reached</CardTitle>
              <Target className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : formatNumber((outreachAnalytics as any)?.investorsReached || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Unique investor contacts
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-fundry-orange">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Campaigns Involved</CardTitle>
              <Building className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : formatNumber((outreachAnalytics as any)?.campaignsInvolved || 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Active campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-fundry-navy">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fundry-navy">Response Rate</CardTitle>
              <TrendingUp className="h-6 w-6 text-fundry-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fundry-navy">
                {analyticsLoading ? "..." : `${(outreachAnalytics as any)?.responseRate || 0}%`}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Investor engagement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-fundry-navy">Performance Metrics</CardTitle>
              <CardDescription>Key engagement and efficiency indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <Badge variant="secondary" className="bg-fundry-navy text-white">
                    {(outreachAnalytics as any)?.avgResponseTime || 0}h
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Conversion to Investment</span>
                  <Badge variant="secondary" className="bg-fundry-orange text-white">
                    {(outreachAnalytics as any)?.conversionRate || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Avg Emails per Founder</span>
                  <Badge variant="outline" className="border-fundry-navy text-fundry-navy">
                    {(outreachAnalytics as any)?.avgEmailsPerFounder || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-fundry-navy">Campaign Outreach Details</CardTitle>
              <CardDescription>Individual campaign email performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {campaignLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading campaign data...</p>
                  </div>
                ) : campaignOutreach && campaignOutreach.length > 0 ? (
                  campaignOutreach.map((campaign, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-fundry-navy">{campaign.campaignTitle}</h4>
                          <p className="text-sm text-gray-600">by {campaign.founderName}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="border-green-500 text-green-700 bg-green-50"
                        >
                          {campaign.openRate}% open rate
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Emails Sent</p>
                          <p className="font-semibold text-fundry-navy">{formatNumber(campaign.emailsSent)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Opened</p>
                          <p className="font-semibold text-green-600">{formatNumber(campaign.emailsOpened)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Investors Reached</p>
                          <p className="font-semibold text-orange-600">{formatNumber(campaign.investorsReached)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Responses</p>
                          <p className="font-semibold text-purple-600">{formatNumber(campaign.responses)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Last sent: {new Date(campaign.lastSent).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No outreach campaigns found for this period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-fundry-navy">Outreach Summary</CardTitle>
            <CardDescription>Overall platform outreach performance for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  {formatNumber((outreachAnalytics as any)?.totalEmailsSent || 0)}
                </div>
                <p className="text-sm text-blue-700">Total Emails Sent</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-900 mb-2">
                  {(outreachAnalytics as any)?.openRate || 0}%
                </div>
                <p className="text-sm text-green-700">Overall Open Rate</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-900 mb-2">
                  {formatNumber((outreachAnalytics as any)?.investorsReached || 0)}
                </div>
                <p className="text-sm text-purple-700">Unique Investors</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-900 mb-2">
                  {(outreachAnalytics as any)?.responseRate || 0}%
                </div>
                <p className="text-sm text-orange-700">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}