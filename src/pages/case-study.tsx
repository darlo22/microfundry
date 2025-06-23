import { useParams, useLocation } from "wouter";
import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Users, 
  TrendingUp, 
  Quote,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Check
} from "lucide-react";
import { Link } from "wouter";

export default function CaseStudy() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  // Company Logo Components
  const TechFlowLogo = () => (
    <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
        <path d="M8 12H16L20 20L16 28H8L12 20L8 12Z" fill="white"/>
        <path d="M24 12H32L28 20L32 28H24L20 20L24 12Z" fill="white" fillOpacity="0.8"/>
        <circle cx="20" cy="20" r="2" fill="white"/>
      </svg>
    </div>
  );

  const GreenEnergyLogo = () => (
    <div className="w-20 h-20 bg-green-600 rounded-xl flex items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
        <path d="M20 8L24 16H16L20 8Z" fill="white"/>
        <rect x="19" y="16" width="2" height="12" fill="white"/>
        <path d="M12 22C12 17 16 16 20 16C24 16 28 17 28 22" stroke="white" strokeWidth="1.5" fill="none"/>
        <circle cx="14" cy="24" r="1.5" fill="white"/>
        <circle cx="26" cy="24" r="1.5" fill="white"/>
      </svg>
    </div>
  );

  const HealthBridgeLogo = () => (
    <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
        <path d="M20 8V16H28V24H20V32H12V24H4V16H12V8H20Z" fill="white"/>
        <rect x="16" y="16" width="8" height="1.5" fill="#EF4444"/>
        <rect x="16" y="22.5" width="8" height="1.5" fill="#EF4444"/>
      </svg>
    </div>
  );

  const EduPlatformLogo = () => (
    <div className="w-20 h-20 bg-purple-600 rounded-xl flex items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
        <path d="M8 16L20 8L32 16V28L20 36L8 28V16Z" fill="white"/>
        <path d="M20 12L28 18V26L20 32L12 26V18L20 12Z" fill="#8B5CF6"/>
        <circle cx="20" cy="20" r="3" fill="white"/>
        <path d="M18 19L22 21M18 21L22 19" stroke="#8B5CF6" strokeWidth="1"/>
      </svg>
    </div>
  );

  const caseStudies = {
    "techflow-solutions": {
      company: "TechFlow Solutions",
      founder: "Sarah Chen",
      industry: "SaaS",
      raised: "$4,800",
      investors: 67,
      timeline: "45 days",
      logo: TechFlowLogo,
      description: "AI-powered workflow automation platform that raised seed funding to expand their engineering team and accelerate product development.",
      quote: "Fundry allowed us to raise from people who truly understood our vision. Our investors became our biggest advocates.",
      outcome: "Grew from 5 to 25 employees, launched enterprise features, acquired 150+ customers",
      fullStory: {
        challenge: "TechFlow Solutions was struggling to scale their AI-powered workflow automation platform. With limited engineering resources and increasing customer demand, they needed capital to expand their team and accelerate development of enterprise features.",
        solution: "Using Fundry's network-based approach, Sarah Chen connected with 67 investors who understood the SaaS and AI automation space. The private nature of the platform allowed detailed technical discussions about their algorithms and roadmap.",
        timeline: [
          { phase: "Week 1", event: "Campaign launch and initial investor outreach" },
          { phase: "Week 2", event: "First investor meetings and product demos" },
          { phase: "Week 3-4", event: "Due diligence and term negotiations" },
          { phase: "Week 5-6", event: "Final commitments and closing" }
        ],
        results: [
          "Hired 20 additional engineers and data scientists",
          "Launched enterprise-grade security features",
          "Acquired 150+ new customers within 6 months",
          "Increased ARR from $200K to $1.2M",
          "Filed 3 AI-related patents"
        ],
        founderBackground: "Sarah Chen, former Google engineer with 8 years in AI/ML. Previously led the automation team at a Fortune 500 company before founding TechFlow.",
        investorProfile: "Mix of angel investors from tech backgrounds, former startup founders, and early employees from successful SaaS companies."
      }
    },
    "greenenergy-innovations": {
      company: "GreenEnergy Innovations",
      founder: "Marcus Rodriguez",
      industry: "CleanTech",
      raised: "$5,000",
      investors: 89,
      timeline: "38 days",
      logo: GreenEnergyLogo,
      description: "Renewable energy storage solutions targeting residential and commercial markets through innovative battery technology.",
      quote: "The private nature of Fundry let us share sensitive IP details with trusted investors in our network.",
      outcome: "Secured partnerships with 3 major utility companies, filed 4 patents, started pilot programs",
      fullStory: {
        challenge: "GreenEnergy needed capital to scale production of their proprietary battery technology and establish partnerships with utility companies. Traditional VCs were hesitant due to the hardware component and long development cycles.",
        solution: "Marcus leveraged his network of energy industry professionals and environmental advocates through Fundry. The ability to share detailed technical specifications privately was crucial for attracting knowledgeable investors.",
        timeline: [
          { phase: "Week 1", event: "Campaign launch targeting energy sector professionals" },
          { phase: "Week 2", event: "Technical presentations to potential investors" },
          { phase: "Week 3-4", event: "Pilot program proposals and partnership discussions" },
          { phase: "Week 5", event: "Final investor commitments" }
        ],
        results: [
          "Secured partnerships with 3 major utility companies",
          "Filed 4 patents for battery technology",
          "Started pilot programs in 5 states",
          "Reduced battery costs by 30% through scale",
          "Expanded team from 8 to 25 employees"
        ],
        founderBackground: "Marcus Rodriguez, former Tesla energy engineer with PhD in Materials Science. 12 years experience in battery technology development.",
        investorProfile: "Energy industry executives, environmental impact investors, and technical angels with cleantech expertise."
      }
    },
    "healthbridge-analytics": {
      company: "HealthBridge Analytics",
      founder: "Dr. Emily Watson",
      industry: "HealthTech",
      raised: "$3,200",
      investors: 43,
      timeline: "28 days",
      logo: HealthBridgeLogo,
      description: "Medical data analytics platform helping hospitals reduce readmission rates through predictive modeling.",
      quote: "Our medical colleagues became investors because they understood the problem we're solving firsthand.",
      outcome: "Deployed in 12 hospitals, reduced readmissions by 23%, preparing for Series A",
      fullStory: {
        challenge: "HealthBridge needed funding to expand their analytics platform beyond the initial pilot hospitals. Traditional investors struggled to understand the complex healthcare regulations and technical requirements.",
        solution: "Dr. Watson tapped into her network of healthcare professionals, former colleagues, and medical practitioners who understood the real-world impact of reducing readmissions.",
        timeline: [
          { phase: "Week 1", event: "Campaign launch to medical network" },
          { phase: "Week 2", event: "Product demos at medical conferences" },
          { phase: "Week 3", event: "Due diligence with hospital administrators" },
          { phase: "Week 4", event: "Final commitments and regulatory review" }
        ],
        results: [
          "Deployed in 12 hospitals across 4 states",
          "Achieved 23% reduction in 30-day readmissions",
          "Processed over 100,000 patient records",
          "Earned HIPAA compliance certification",
          "Generated $2.1M in cost savings for partner hospitals"
        ],
        founderBackground: "Dr. Emily Watson, practicing physician and data scientist. Former Chief Medical Officer at regional hospital system with expertise in healthcare analytics.",
        investorProfile: "Healthcare professionals, hospital administrators, medical device executives, and healthcare-focused angel investors."
      }
    },
    "eduplatform": {
      company: "EduPlatform",
      founder: "James Kim",
      industry: "EdTech",
      raised: "$1,800",
      investors: 52,
      timeline: "35 days",
      logo: EduPlatformLogo,
      description: "Virtual learning platform connecting students with expert tutors for personalized STEM education.",
      quote: "Fundry's educator network became our investor base. They brought connections and credibility.",
      outcome: "Reached 10,000 students, partnered with 5 school districts, 95% customer satisfaction",
      fullStory: {
        challenge: "EduPlatform needed capital to expand their tutor network and develop advanced learning analytics. The education sector required credible endorsements from actual educators.",
        solution: "James leveraged his connections in the education community through Fundry, attracting investors who were also educators and understood the learning challenges firsthand.",
        timeline: [
          { phase: "Week 1", event: "Campaign launch to education network" },
          { phase: "Week 2", event: "Platform demos to teachers and administrators" },
          { phase: "Week 3-4", event: "Pilot program discussions with school districts" },
          { phase: "Week 5", event: "Investor commitments and advisory agreements" }
        ],
        results: [
          "Reached 10,000 students across 15 states",
          "Partnered with 5 major school districts",
          "Achieved 95% customer satisfaction rate",
          "Improved student test scores by average 18%",
          "Expanded tutor network to 500+ qualified educators"
        ],
        founderBackground: "James Kim, former high school STEM teacher and educational technology coordinator. Masters in Education Technology from Stanford.",
        investorProfile: "Teachers, school administrators, education consultants, and parents who were also professionals in other fields."
      }
    }
  };

  const caseStudy = caseStudies[params.id as keyof typeof caseStudies];

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Case Study Not Found" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Study Not Found</h1>
          <p className="text-gray-600 mb-8">The case study you're looking for doesn't exist.</p>
          <Link href="/success-stories">
            <Button>
              <ArrowLeft className="mr-2" size={16} />
              Back to Success Stories
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/case-study/${params.id}`;
  const shareText = `Check out how ${caseStudy.company} raised ${caseStudy.raised} in ${caseStudy.timeline} on Fundry`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialShare = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title={`${caseStudy.company} Case Study`} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/success-stories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2" size={16} />
              Back to Success Stories
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-fundry-orange to-orange-600 text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <caseStudy.logo />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{caseStudy.company}</h1>
                    <p className="text-xl opacity-90 mb-2">{caseStudy.founder}</p>
                    <Badge className="bg-white text-fundry-orange">
                      {caseStudy.industry}
                    </Badge>
                  </div>
                </div>
                
                {/* Social Share */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-fundry-orange"
                  >
                    {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                  </Button>
                  <a href={socialShare.twitter} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-fundry-orange">
                      <Twitter size={16} />
                    </Button>
                  </a>
                  <a href={socialShare.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-fundry-orange">
                      <Linkedin size={16} />
                    </Button>
                  </a>
                  <a href={socialShare.facebook} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-fundry-orange">
                      <Facebook size={16} />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="bg-white p-8 border-t">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-fundry-orange mb-2">{caseStudy.raised}</div>
                  <div className="text-gray-600">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-fundry-navy mb-2">{caseStudy.investors}</div>
                  <div className="text-gray-600">Investors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{caseStudy.timeline}</div>
                  <div className="text-gray-600">Timeline</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Challenge */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h2>
                <p className="text-gray-700 leading-relaxed">{caseStudy.fullStory.challenge}</p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Fundry Solution</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{caseStudy.fullStory.solution}</p>
                
                <div className="bg-fundry-orange bg-opacity-10 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Quote className="text-fundry-orange mt-1" size={24} />
                    <p className="text-gray-800 italic text-lg">"{caseStudy.quote}"</p>
                  </div>
                  <p className="text-gray-600 text-right mt-4">— {caseStudy.founder}, {caseStudy.company}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Timeline</h2>
                <div className="space-y-4">
                  {caseStudy.fullStory.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.phase}</div>
                        <div className="text-gray-600">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Results</h2>
                <div className="grid gap-4">
                  {caseStudy.fullStory.results.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <TrendingUp className="text-green-600 mt-1" size={20} />
                      <span className="text-gray-700">{result}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Founder Background */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Founder Background</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{caseStudy.fullStory.founderBackground}</p>
              </CardContent>
            </Card>

            {/* Investor Profile */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Investor Profile</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{caseStudy.fullStory.investorProfile}</p>
              </CardContent>
            </Card>

            {/* Share This Story */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Share This Story</h3>
                <div className="space-y-3">
                  <a href={socialShare.twitter} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Twitter className="mr-2" size={16} />
                      Share on Twitter
                    </Button>
                  </a>
                  <a href={socialShare.linkedin} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Linkedin className="mr-2" size={16} />
                      Share on LinkedIn
                    </Button>
                  </a>
                  <a href={socialShare.facebook} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Facebook className="mr-2" size={16} />
                      Share on Facebook
                    </Button>
                  </a>
                  <Button variant="outline" onClick={handleCopyLink} className="w-full justify-start">
                    {copied ? <Check className="mr-2" size={16} /> : <LinkIcon className="mr-2" size={16} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-fundry-orange text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Ready to Start Your Campaign?</h3>
                <p className="text-sm mb-4 opacity-90">Join successful founders who raised capital through their networks.</p>
                <Link href="/auth">
                  <Button variant="outline" className="bg-white text-fundry-orange hover:bg-gray-100 w-full">
                    Get Started Today
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}