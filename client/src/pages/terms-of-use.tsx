import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-navy-600 hover:text-navy-800">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Fundry
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Terms of Use</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Use</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: June 16, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Fundry ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Platform Services</h2>
              <p className="text-gray-700 mb-4">
                Fundry provides an equity crowdfunding platform that connects early-stage startups with potential investors through SAFE (Simple Agreement for Future Equity) agreements.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Campaign creation and management tools for founders</li>
                <li>Investment discovery and tracking for investors</li>
                <li>Secure document management and storage</li>
                <li>Payment processing and transaction handling</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">For Founders:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate and truthful information about your company</li>
                <li>Maintain maximum campaign funding limit of $5,000</li>
                <li>Comply with all applicable securities regulations</li>
                <li>Keep investors informed through regular updates</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">For Investors:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Meet minimum investment requirement of $25</li>
                <li>Understand investment risks and SAFE agreement terms</li>
                <li>Verify your eligibility to invest in private securities</li>
                <li>Conduct your own due diligence before investing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Fees and Payments</h2>
              <p className="text-gray-700 mb-4">
                Fundry charges a transparent fee structure:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Free for campaigns raising under $1,000</li>
                <li>5% platform fee for amounts above $1,000</li>
                <li>Payment processing fees may apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Investment Risks</h2>
              <p className="text-gray-700 mb-4">
                Investment in early-stage companies involves significant risk. You may lose your entire investment. Please review our Investment Disclaimer for detailed risk information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Providing false or misleading information</li>
                <li>Attempting to circumvent platform fees</li>
                <li>Engaging in market manipulation or fraud</li>
                <li>Violating securities laws or regulations</li>
                <li>Using the platform for illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Fundry is not liable for investment losses, company failures, or disputes between parties. The platform serves as a facilitator and does not provide investment advice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modifications</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes and continued use constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these terms, please contact us at legal@fundry.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}