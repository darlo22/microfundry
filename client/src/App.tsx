import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
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
import CampaignView from "@/pages/campaign-view";
import EmailVerification from "@/pages/email-verification";
import InvestmentSuccess from "@/pages/investment-success";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
          <Route path="/payment-withdrawal" component={PaymentWithdrawal} />
          <Route path="/investor-dashboard" component={InvestorDashboard} />
          <Route path="/investor/dashboard" component={InvestorDashboard} />
        </>
      )}
      
      {/* Root path handling */}
      <Route path="/">
        <Landing />
      </Route>
      
      {/* Catch all routes */}
      <Route>
        {!isAuthenticated ? <Landing /> : <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
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
