import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import MinimalTest from "@/components/minimal-test";
import Home from "@/pages/home";
import About from "@/pages/about";
import Pricing from "@/pages/pricing";
import BrowseCampaigns from "@/pages/browse-campaigns";
import HowItWorks from "@/pages/how-it-works";
import SuccessStories from "@/pages/success-stories";
import CaseStudy from "@/pages/case-study";
import Resources from "@/pages/resources";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import CookiePolicy from "@/pages/cookie-policy";
import InvestmentDisclaimer from "@/pages/investment-disclaimer";
import SafeAgreementTemplate from "@/pages/safe-agreement-template";
import InvestorAccreditation from "@/pages/investor-accreditation";
import FounderDashboard from "@/pages/founder-dashboard";
import FounderInvestors from "@/pages/founder-investors";
import FounderAnalytics from "@/pages/founder-analytics";
import FounderSettings from "@/pages/founder-settings";
import FounderUpdates from "@/pages/founder-updates";
import FounderMessages from "@/pages/founder-messages";
import FounderOutreach from "@/pages/founder-outreach";
import PaymentWithdrawal from "@/pages/payment-withdrawal";
import InvestorDashboard from "@/pages/investor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import AdminKYCManagement from "@/pages/admin-kyc-management";
import AdminInvestorOutreach from "@/pages/admin-investor-outreach";
import AdminOutreachReport from "@/pages/admin-outreach-report";
import EmailReplies from "@/pages/email-replies";
import CampaignView from "@/pages/campaign-view";
import EmailVerification from "@/pages/email-verification";
import InvestmentSuccess from "@/pages/investment-success";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  console.log('Router component initializing');
  
  const { isAuthenticated, isLoading, user } = useAuth();
  console.log('Auth hook called successfully:', { isAuthenticated, isLoading, user: user?.id });

  // Render content immediately, don't wait for auth check
  // This prevents infinite loading on public pages

  return (
    <Switch>
      {/* Public routes always accessible */}
      <Route path="/landing" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/browse-campaigns" component={BrowseCampaigns} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/case-study/:id" component={CaseStudy} />
      <Route path="/resources" component={Resources} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/investment-disclaimer" component={InvestmentDisclaimer} />
      <Route path="/safe-agreement-template" component={SafeAgreementTemplate} />
      <Route path="/investor-accreditation" component={InvestorAccreditation} />
      <Route path="/verify-email" component={EmailVerification} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/investment-success" component={InvestmentSuccess} />
      <Route path="/campaign/:id" component={CampaignView} />
      <Route path="/campaigns/:id" component={CampaignView} />
      <Route path="/c/:privateLink" component={CampaignView} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin-kyc-management" component={AdminKYCManagement} />
      <Route path="/admin/investor-outreach" component={AdminInvestorOutreach} />
      <Route path="/admin/outreach-report" component={AdminOutreachReport} />
      
      {/* Authenticated routes */}
      {isAuthenticated && (
        <>
          <Route path="/founder-dashboard" component={FounderDashboard} />
          <Route path="/founder/dashboard" component={FounderDashboard} />
          <Route path="/founder/campaigns" component={FounderDashboard} />
          <Route path="/founder/investors" component={FounderInvestors} />
          <Route path="/founder/analytics" component={FounderAnalytics} />
          <Route path="/founder/settings" component={FounderSettings} />
          <Route path="/founder/updates" component={FounderUpdates} />
          <Route path="/founder/messages" component={FounderMessages} />
          <Route path="/founder/outreach" component={FounderOutreach} />
          <Route path="/founder-outreach" component={FounderOutreach} />
          <Route path="/founder/email-replies" component={EmailReplies} />
          <Route path="/email-replies" component={EmailReplies} />
          <Route path="/payment-withdrawal" component={PaymentWithdrawal} />
          <Route path="/investor-dashboard" component={InvestorDashboard} />
          <Route path="/investor/dashboard" component={InvestorDashboard} />
        </>
      )}
      
      {/* Root path handling */}
      <Route path="/">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-fundry-orange to-fundry-navy bg-clip-text text-transparent">
                  Fundry
                </span>
              </h1>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Raise Your First $5,000 From Friends & Family
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                The easiest way for early-stage founders to get their first investors and build momentum for larger funding rounds.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                <p className="text-gray-600">Track campaign performance and investor engagement with detailed insights.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Launch Fast</h3>
                <p className="text-gray-600">Create campaigns in minutes with our guided setup process.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
                <p className="text-gray-600">Your data and investments are protected with enterprise-grade security.</p>
              </div>
            </div>
            
            <div className="space-x-4">
              <button className="bg-fundry-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Started
              </button>
              <button className="bg-fundry-navy hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </Route>
      
      {/* Catch all routes */}
      <Route>
        {!isAuthenticated ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Fundry</h1>
              <p className="text-gray-600">Micro-investment platform for startups</p>
            </div>
          </div>
        ) : <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
  console.log('App component initializing');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
