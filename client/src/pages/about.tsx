import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Users, Shield, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="About Fundry" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center">
              <ChartLine className="text-white" size={24} />
            </div>
            <span className="text-3xl font-bold text-fundry-navy">Fundry</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Democratizing Early-Stage Investment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building the future of startup fundraising by connecting founders 
            with their networks through simplified SAFE agreements.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Traditional fundraising is broken. Founders spend months chasing VCs while their 
              friends, family, and network—the people who believe in them most—have no easy 
              way to invest. Meanwhile, early supporters miss out on supporting the companies 
              they're passionate about.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Fundry bridges this gap by making it simple for founders to raise capital from 
              their existing networks through standardized SAFE agreements, transparent terms, 
              and a streamlined investment process.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency First</h3>
              <p className="text-gray-600">
                Every investment is backed by clear terms, standardized agreements, 
                and complete transparency in pricing and processes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Network-Powered</h3>
              <p className="text-gray-600">
                We believe the best investors are often the people who already know 
                and support the founder's vision and capabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Founder-Friendly</h3>
              <p className="text-gray-600">
                Our platform is designed to minimize the time founders spend on 
                fundraising so they can focus on building their business.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth-Oriented</h3>
              <p className="text-gray-600">
                We're committed to helping both founders and investors succeed 
                through education, tools, and ongoing support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How We're Different */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How We're Different</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-fundry-orange rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Private by Default</h3>
                  <p className="text-gray-600">
                    Campaigns are shared through private links, giving founders complete 
                    control over who sees their fundraising efforts.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-fundry-orange rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Standardized SAFE Agreements</h3>
                  <p className="text-gray-600">
                    We use proven SAFE agreement templates to ensure fair terms 
                    and reduce legal complexity for both parties.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-fundry-orange rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fair Pricing</h3>
                  <p className="text-gray-600">
                    No upfront costs. We only succeed when you do, with transparent 
                    fees that scale with your success.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              Have questions about Fundry or want to learn more about how we can 
              help with your fundraising journey?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:hello@fundry.com" 
                className="text-fundry-orange hover:text-orange-600 font-medium"
              >
                hello@fundry.com
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a 
                href="mailto:support@fundry.com" 
                className="text-fundry-orange hover:text-orange-600 font-medium"
              >
                support@fundry.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}