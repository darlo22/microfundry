import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Shield, 
  Zap, 
  Heart,
  Award,
  TrendingUp,
  Globe,
  ArrowRight
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We build trust through transparent processes, clear terms, and honest communication with all our users.",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe the best investments come from people who know and believe in the entrepreneurs they support.",
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: "Simplicity",
      description: "Complex financial processes should be simple to understand and execute. We remove friction from fundraising.",
      color: "bg-purple-500"
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "Great ideas deserve funding regardless of geography, connections, or background. We democratize access to capital.",
      color: "bg-fundry-orange"
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former VP at Sequoia Capital, 10+ years in venture capital",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "Ex-Stripe engineering, built financial infrastructure at scale",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Legal & Compliance",
      background: "Securities attorney, former SEC counsel specializing in startup law",
      image: "/api/placeholder/150/150"
    },
    {
      name: "James Kim",
      role: "Head of Product",
      background: "Former product lead at Robinhood, expert in financial UX",
      image: "/api/placeholder/150/150"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Sarah and Marcus start Fundry with a vision to democratize startup fundraising"
    },
    {
      year: "2024",
      title: "Platform Launch",
      description: "Beta launch with 50 founding members, first $1M in transactions processed"
    },
    {
      year: "2024",
      title: "Legal Framework",
      description: "Partnership with top securities law firm to ensure full compliance"
    },
    {
      year: "2024",
      title: "Growth Milestone",
      description: "500+ successful campaigns, $12M+ raised, 2,400+ active investors"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="About Us" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Fundry
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            We're building the future of startup fundraising by connecting entrepreneurs 
            with their networks through simple, standardized investment tools.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-700 mb-6">
                We believe that great ideas shouldn't be limited by access to traditional venture capital. 
                Every entrepreneur should have the opportunity to raise capital from the people who know 
                them best and believe in their vision.
              </p>
              <p className="text-gray-600">
                Fundry makes it possible for founders to raise capital from their personal and professional 
                networks using simple, standardized SAFE agreements. We're democratizing access to startup 
                capital while maintaining the highest standards of legal compliance and investor protection.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${value.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <value.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-16 bg-gradient-to-r from-fundry-navy to-blue-800 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Impact by the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">$12.5M+</div>
                <div className="text-lg opacity-90">Total Raised</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-lg opacity-90">Successful Campaigns</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2,400+</div>
                <div className="text-lg opacity-90">Active Investors</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">42</div>
                <div className="text-lg opacity-90">Days Avg. Campaign</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-fundry-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-fundry-orange font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.background}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Our Journey
            </h2>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{milestone.year}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-700">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why We Built This */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Why We Built Fundry
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">The Problem</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Traditional VC funding is inaccessible to most entrepreneurs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Network-based fundraising lacks proper tools and legal structure</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Complex legal processes create barriers for both founders and investors</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Great ideas go unfunded due to lack of connections</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Solution</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Simple platform for network-based fundraising</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Standardized SAFE agreements for all investments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Transparent pricing with free tier for smaller campaigns</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Full legal compliance and investor protection</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors and Advisors */}
        <Card className="mb-16">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Backed by Industry Leaders
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-16 h-16 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Top VCs</h3>
                <p className="text-gray-600 text-sm">
                  Backed by leading venture capital firms who understand the future of fundraising
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Industry Experts</h3>
                <p className="text-gray-600 text-sm">
                  Advised by successful entrepreneurs, legal experts, and fintech leaders
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-white" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Global Vision</h3>
                <p className="text-gray-600 text-sm">
                  Building the infrastructure for startup funding worldwide
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-fundry-orange to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Join the Future of Fundraising
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Whether you're an entrepreneur with a vision or an investor looking to support 
              innovation, Fundry provides the tools you need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-fundry-orange hover:bg-gray-100">
                Start Your Campaign
                <ArrowRight className="ml-2" size={16} />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fundry-orange">
                Browse Opportunities
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Join thousands of founders and investors building the future together
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}