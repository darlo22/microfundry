import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Privacy Policy" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔐 Fundry Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Effective Date: June 17, 2025
          </p>
          <p className="text-gray-600 mt-2">
            Fundry ("we," "our," or "us") respects your privacy and is committed to protecting the personal information that you share with us when you use our platform ("Service").
          </p>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-3 text-fundry-orange" size={24} />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                <p className="text-sm text-gray-600">We encrypt all data and never sell your personal information</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">You can access, update, or delete your data at any time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimal Collection</h3>
                <p className="text-sm text-gray-600">We only collect data necessary for platform functionality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ Introduction</h2>
              <p className="text-gray-700 mb-4">
                Fundry ("we," "our," or "us") respects your privacy and is committed to protecting the personal information that you share with us when you use our platform ("Service"). This Privacy Policy explains how we collect, use, store, protect, and disclose your information.
              </p>
              <p className="text-gray-700">
                By using Fundry, you consent to the practices described in this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2️⃣ Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">A. Information You Provide to Us</h3>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• Full name</li>
                <li>• Email address</li>
                <li>• Password (encrypted)</li>
                <li>• Phone number (optional)</li>
                <li>• Country of residence</li>
                <li>• Business or startup information (for Founders)</li>
                <li>• Investment preferences</li>
                <li>• Payment information (limited to what is required for payment processors)</li>
                <li>• KYC (Know Your Customer) information (when required)</li>
                <li>• Uploaded documents (pitch decks, SAFE agreements, etc.)</li>
                <li>• IP address and device information</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">B. Information We Collect Automatically</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Login and usage data</li>
                <li>• Browser type and device information</li>
                <li>• Cookies and tracking data for session management and platform analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3️⃣ How We Use Your Information</h2>
              
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Create and maintain your account</li>
                <li>• Facilitate fundraising campaigns and investments</li>
                <li>• Generate and store legal investment agreements (e.g., SAFE)</li>
                <li>• Process payments and withdrawals via third-party payment processors</li>
                <li>• Provide customer support</li>
                <li>• Ensure compliance with applicable laws</li>
                <li>• Improve and personalize our platform and services</li>
                <li>• Send important notifications (transaction confirmations, legal documents, platform updates)</li>
                <li>• Administer security and fraud prevention measures</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4️⃣ Legal Basis for Processing</h2>
              
              <p className="text-gray-700 mb-4">
                Depending on your jurisdiction, we may process your information based on:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Your consent</li>
                <li>• Performance of a contract</li>
                <li>• Legal obligations</li>
                <li>• Legitimate business interests (platform operation, fraud prevention, security, customer support, etc.)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5️⃣ How We Share Your Information</h2>
              
              <p className="text-gray-700 mb-4 font-semibold">We do not sell your personal information.</p>
              
              <p className="text-gray-700 mb-4">We may share your information with:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Founders you invest in (investment and SAFE details only)</li>
                <li>• Third-party payment processors (for payment processing purposes)</li>
                <li>• Service providers who assist with technology, customer support, or platform operations</li>
                <li>• Legal or regulatory authorities where required by law, legal process, or to enforce our Terms of Service</li>
                <li>• Parties involved in a merger, acquisition, or sale of platform assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6️⃣ Third-Party Payment Processors</h2>
              
              <p className="text-gray-700">
                Fundry works with third-party payment processors to facilitate payments and withdrawals. We do not store full credit card numbers or full bank account details on our servers. Payment processors operate under their own privacy policies and security standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7️⃣ Data Retention</h2>
              
              <p className="text-gray-700 mb-4">We retain personal information:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• For as long as necessary to provide the service</li>
                <li>• To comply with legal and tax obligations</li>
                <li>• To enforce platform agreements and resolve disputes</li>
              </ul>
              
              <p className="text-gray-700 mt-4">
                Data may be anonymized or deleted upon your request, subject to legal requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8️⃣ Your Privacy Rights</h2>
              
              <p className="text-gray-700 mb-4">
                Depending on your jurisdiction, you may have rights to:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete certain personal information</li>
                <li>• Object to or restrict processing</li>
                <li>• Withdraw consent where processing is based on consent</li>
              </ul>
              
              <p className="text-gray-700">
                You may exercise these rights by contacting us at privacy@fundry.com.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9️⃣ Data Security</h2>
              
              <p className="text-gray-700 mb-4">
                We implement technical, administrative, and physical safeguards to protect your information, including:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• SSL encryption</li>
                <li>• Secure storage of legal documents and SAFE agreements</li>
                <li>• Secure authentication for account access</li>
                <li>• Restricted internal access to sensitive data</li>
              </ul>
              
              <p className="text-gray-700">
                While we take reasonable measures to protect your information, no system is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔟 International Data Transfers</h2>
              
              <p className="text-gray-700">
                If you are located outside of the country where Fundry operates, your information may be transferred to servers in other jurisdictions that may not have the same data protection laws. By using Fundry, you consent to such transfers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣1️⃣ Cookies & Tracking</h2>
              
              <p className="text-gray-700 mb-4">We may use cookies and similar technologies for:</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• Session management</li>
                <li>• Platform functionality</li>
                <li>• Security</li>
                <li>• Performance monitoring</li>
                <li>• User behavior analytics (non-personalized)</li>
              </ul>
              
              <p className="text-gray-700">
                You can manage cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣2️⃣ Children's Privacy</h2>
              
              <p className="text-gray-700">
                Fundry is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣3️⃣ Changes to This Privacy Policy</h2>
              
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify users of significant changes via email or platform notifications. Continued use of the platform after updates constitutes acceptance of the revised policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For urgent privacy concerns, please mark your communication as "Privacy Request" 
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