import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, AlertTriangle, Shield, FileText, Users } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Terms of Use" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <Scale className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📄 Fundry Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Effective Date: June 17, 2025
          </p>
          <p className="text-gray-600 mt-2">
            Welcome to Fundry ("Platform," "we," "us," or "our"). By accessing or using Fundry, you agree to be bound by these Terms of Service.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-3 text-red-600" size={24} />
              Important Investment Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-red-700">
              <p className="font-semibold">Investing in early-stage companies is highly speculative and risky.</p>
              <ul className="space-y-1 text-sm">
                <li>• You may lose the entire amount of your investment</li>
                <li>• Investments are illiquid and long-term</li>
                <li>• No returns or profits are guaranteed</li>
                <li>• Fundry provides no financial, legal, or investment advice</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Fundry ("Platform," "we," "us," or "our"). Fundry is a technology platform that enables startup founders to privately invite individuals within their personal networks to support their business by contributing small investments in exchange for future equity via simple agreements.
              </p>
              <p className="text-gray-700">
                By accessing or using Fundry, you ("User," "Investor," "Founder") agree to be bound by these Terms of Service ("Terms"). If you do not agree with these Terms, you may not use Fundry.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2️⃣ Eligibility</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• You must be at least 18 years old and legally capable of entering into binding contracts</li>
                <li>• You must not be prohibited from using Fundry under the laws of your jurisdiction</li>
                <li>• Founders must be authorized to represent their startup or business entity</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3️⃣ Platform Role</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry provides technical tools to facilitate private fundraising</li>
                <li>• Fundry is not a broker, investment adviser, financial adviser, or licensed securities dealer</li>
                <li>• Fundry does not participate in the negotiation, structuring, valuation, or underwriting of any investment opportunity</li>
                <li>• All investment decisions are made entirely at the discretion of Users</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4️⃣ Private Invitation Model</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry facilitates private campaigns that are intended to remain within personal networks</li>
                <li>• Campaigns are not publicly marketed, listed, or solicited to the general public</li>
                <li>• Campaign links are to be shared privately by Founders with personal contacts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5️⃣ Investment Process</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Investments made through Fundry are governed by standardized agreements such as SAFE (Simple Agreement for Future Equity)</li>
                <li>• These agreements do not provide immediate ownership but represent a contractual right to convert into equity upon specific triggering events</li>
                <li>• Fundry generates these agreements automatically, but the legal obligation exists solely between the Founder and the Investor</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6️⃣ Investor Risk Disclosure & Disclaimer</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Acknowledgment:</h3>
              <p className="text-gray-700 mb-4">
                Investing in early-stage companies is highly speculative and risky. By using Fundry, you agree and acknowledge that:
              </p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• You may lose the entire amount of your investment</li>
                <li>• Investments made are illiquid and long-term</li>
                <li>• No returns or profits are guaranteed</li>
                <li>• Fundry provides no financial, legal, or investment advice</li>
                <li>• You are solely responsible for your investment decisions</li>
                <li>• Fundry does not verify the accuracy of information provided by Founders</li>
                <li>• Fundry is not responsible for the performance, success, or failure of any startup or investment</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Disclaimer:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry is not regulated as a broker-dealer, securities exchange, or financial adviser</li>
                <li>• All investments are made at your own discretion and risk</li>
                <li>• Fundry operates under private, invitation-only structures that may not be subject to full securities regulations</li>
                <li>• Users are responsible for complying with any applicable laws in their jurisdiction</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7️⃣ Founder Responsibilities</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Founders must provide truthful, accurate, and complete information in their campaigns</li>
                <li>• Founders are solely responsible for fulfilling any obligations related to their campaigns</li>
                <li>• Founders are responsible for ensuring that their campaign does not violate any applicable laws</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8️⃣ Fees and Payment Processing</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry may charge service fees on funds raised, as outlined during campaign creation</li>
                <li>• Fundry may partner with third-party payment processors to handle fund collection</li>
                <li>• Users authorize Fundry and its payment partners to process transactions as required</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9️⃣ User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Misrepresent any information</li>
                <li>• Use Fundry for any illegal, fraudulent, or prohibited activity</li>
                <li>• Circumvent or manipulate any platform functions</li>
                <li>• Share campaign links publicly in violation of platform rules</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔟 Account Suspension or Termination</h2>
              <p className="text-gray-700">
                Fundry may suspend, limit, or terminate any user account at its sole discretion if violations of these Terms or applicable laws occur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣1️⃣ Limitation of Liability</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry is not liable for any loss, financial or otherwise, resulting from your use of the platform</li>
                <li>• Fundry is not liable for any failure of Founders or startups to perform as expected</li>
                <li>• Fundry is not responsible for any errors, omissions, or inaccuracies in campaign materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣2️⃣ No Professional Relationship</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Use of Fundry does not create any fiduciary, advisory, or client relationship</li>
                <li>• Fundry does not act as your agent or representative</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣3️⃣ Jurisdiction and Governing Law</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• These Terms are governed by the laws of the United States</li>
                <li>• Any legal claims shall be resolved in the courts located in San Francisco, California</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣4️⃣ Amendments</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry reserves the right to update or modify these Terms at any time</li>
                <li>• Continued use of the platform after modifications constitutes acceptance of the new Terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣5️⃣ Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms, along with any linked legal disclosures, risk acknowledgments, privacy policies, and investor agreements, constitute the full agreement between you and Fundry.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-fundry-orange text-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Agreement Acknowledgment</h2>
              <p className="text-lg">
                By using Fundry, you acknowledge that you have read, understand, and agree to these Terms of Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For urgent legal matters, please mark your communication as "Legal - Terms of Service" 
                for expedited handling.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}