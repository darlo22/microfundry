import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, TrendingUp, Users, Award, ArrowRight } from "lucide-react";

export default function SuccessStories() {
  const successStories = [
    {
      company: "TechFlow Solutions",
      founder: "Sarah Chen",
      industry: "SaaS",
      raised: "$480,000",
      investors: 67,
      timeline: "45 days",
      description: "AI-powered workflow automation platform that raised seed funding to expand their engineering team and accelerate product development.",
      quote: "Fundry allowed us to raise from people who truly understood our vision. Our investors became our biggest advocates.",
      outcome: "Grew from 5 to 25 employees, launched enterprise features, acquired 150+ customers",
      image: "/api/placeholder/300/200"
    },
    {
      company: "GreenEnergy Innovations",
      founder: "Marcus Rodriguez",
      industry: "CleanTech",
      raised: "$750,000",
      investors: 89,
      timeline: "38 days",
      description: "Renewable energy storage solutions targeting residential and commercial markets through innovative battery technology.",
      quote: "The private nature of Fundry let us share sensitive IP details with trusted investors in our network.",
      outcome: "Secured partnerships with 3 major utility companies, filed 4 patents, started pilot programs",
      image: "/api/placeholder/300/200"
    },
    {
      company: "HealthBridge Analytics",
      founder: "Dr. Emily Watson",
      industry: "HealthTech",
      raised: "$320,000",
      investors: 43,
      timeline: "28 days",
      description: "Medical data analytics platform helping hospitals reduce readmission rates through predictive modeling.",
      quote: "Our medical colleagues became investors because they understood the problem we're solving firsthand.",
      outcome: "Deployed in 12 hospitals, reduced readmissions by 23%, preparing for Series A",
      image: "/api/placeholder/300/200"
    },
    {
      company: "EduPlatform",
      founder: "James Kim",
      industry: "EdTech",
      raised: "$180,000",
      investors: 52,
      timeline: "35 days",
      description: "Virtual learning platform connecting students with expert tutors for personalized STEM education.",
      quote: "Fundry's educator network became our investor base. They brought connections and credibility.",
      outcome: "Reached 10,000 students, partnered with 5 school districts, 95% customer satisfaction",
      image: "/api/placeholder/300/200"
    }
  ];

  const metrics = [
    { label: "Total Raised", value: "$12.5M+", icon: TrendingUp },
    { label: "Successful Campaigns", value: "156", icon: Award },
    { label: "Active Investors", value: "2,400+", icon: Users },
    { label: "Average Time to Close", value: "42 days", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Success Stories" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real founders who successfully raised capital through their networks 
            on Fundry and achieved remarkable growth.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-3">
                  <metric.icon className="text-white" size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stories */}
        <div className="space-y-12 mb-16">
          {successStories.map((story, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Image */}
                  <div className="md:col-span-2 bg-gradient-to-br from-fundry-orange to-orange-600 p-8 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">{story.company.charAt(0)}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{story.company}</h3>
                      <p className="opacity-90">{story.founder}</p>
                      <Badge className="bg-white text-fundry-orange mt-2">
                        {story.industry}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-3 p-8">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-fundry-orange">{story.raised}</div>
                        <div className="text-sm text-gray-600">Raised</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-fundry-navy">{story.investors}</div>
                        <div className="text-sm text-gray-600">Investors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{story.timeline}</div>
                        <div className="text-sm text-gray-600">Timeline</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-6">{story.description}</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <Quote className="text-fundry-orange mt-1" size={20} />
                        <p className="text-gray-700 italic">"{story.quote}"</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Outcomes:</h4>
                      <p className="text-gray-700">{story.outcome}</p>
                    </div>

                    <Button variant="outline" className="text-fundry-orange border-fundry-orange hover:bg-fundry-orange hover:text-white">
                      Read Full Case Study
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What Founders Are Saying
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Quote className="text-white" size={24} />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The speed and simplicity of Fundry allowed us to focus on building 
                  our product instead of chasing investors."
                </p>
                <div className="font-semibold text-gray-900">Alex Thompson</div>
                <div className="text-sm text-gray-600">Founder, DataSync Pro</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-fundry-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <Quote className="text-white" size={24} />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Our investors became our advisors because they were already 
                  believers in our mission from day one."
                </p>
                <div className="font-semibold text-gray-900">Lisa Martinez</div>
                <div className="text-sm text-gray-600">CEO, GreenTech Solutions</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Quote className="text-white" size={24} />
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The transparency and standardized terms made it easy for 
                  our network to understand and participate."
                </p>
                <div className="font-semibold text-gray-900">David Park</div>
                <div className="text-sm text-gray-600">Founder, AI Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Breakdown */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Success Across Industries
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-fundry-orange mb-2">32%</div>
                <div className="text-gray-700 font-medium">Technology</div>
                <div className="text-sm text-gray-600">SaaS, AI, Mobile Apps</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fundry-navy mb-2">24%</div>
                <div className="text-gray-700 font-medium">Healthcare</div>
                <div className="text-sm text-gray-600">MedTech, Digital Health</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">18%</div>
                <div className="text-gray-700 font-medium">Sustainability</div>
                <div className="text-sm text-gray-600">CleanTech, GreenTech</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">26%</div>
                <div className="text-gray-700 font-medium">Other</div>
                <div className="text-sm text-gray-600">FinTech, EdTech, E-commerce</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-fundry-navy to-blue-800 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join the growing community of successful founders who chose 
              Fundry to raise capital from their networks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-fundry-orange hover:bg-orange-600">
                Start Your Campaign
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fundry-navy">
                Schedule a Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}