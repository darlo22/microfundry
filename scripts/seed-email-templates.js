import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const neonConfig = { webSocketConstructor: ws };

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultTemplates = [
  {
    name: "Initial Business Partnership Inquiry",
    category: "introduction",
    subject: "Partnership Discussion with {name} - {company}",
    content: `Hi {name},

I hope this email finds you well. My name is [Your Name], and I'm the founder of [Your Company Name].

I came across your profile and was impressed by your business focus and experience in [relevant sector]. I believe our company would be a great fit for strategic partnership.

We're currently raising [funding amount] to [brief description of what the funding will achieve]. Here's what makes us unique:

• [Key differentiator 1]
• [Key differentiator 2]  
• [Key differentiator 3]

Our progress so far:
- [Key metric 1]
- [Key metric 2]
- [Key metric 3]

I'd love to share more details about our business partnership and learn about your collaboration criteria. Would you be open to a brief 15-minute call this week?

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Your Contact Information]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  },
  {
    name: "Follow-up After Demo",
    category: "followup",
    subject: "Thank you for your time - Next steps with {company}",
    content: `Hi {name},

Thank you for taking the time to review our pitch and ask such insightful questions during our demo session.

As discussed, I'm attaching the following materials for your review:
• Updated financial projections
• Technical roadmap
• Customer testimonials and case studies

Key highlights from our conversation:
- [Point 1 discussed]
- [Point 2 discussed]
- [How you addressed their concerns]

Based on your feedback, I wanted to emphasize [specific aspect they showed interest in].

I'm happy to arrange a follow-up call with our [CTO/other team member] to dive deeper into [specific technical/business area they inquired about].

What would be the best next step from your perspective?

Looking forward to hearing from you.

Best regards,
[Your Name]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  },
  {
    name: "Milestone Update to Investors",
    category: "update",
    subject: "Exciting Update: {company} Achieves Major Milestone",
    content: `Hi {name},

I wanted to share some exciting news about our progress at [Your Company].

🎉 We've just achieved a significant milestone: [specific achievement]

This represents [what this means for the business/growth/validation].

Other updates since we last spoke:
• [Update 1]
• [Update 2]
• [Update 3]

Looking ahead:
- [Next goal/milestone]
- [Timeline]
- [How this impacts the investment opportunity]

This milestone brings us closer to [long-term vision/goal] and validates our [business model/market approach].

I'd love to catch up and share more details about how this affects our growth trajectory and investment timeline.

Are you available for a quick call next week?

Thank you for your continued interest and support.

Best regards,
[Your Name]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  },
  {
    name: "Market Validation Story",
    category: "validation",
    subject: "Market Validation: Why Now is the Perfect Time for {company}",
    content: `Hi {name},

I wanted to share why the timing is perfect for investing in [Your Company] and our market opportunity.

Market Context:
The [your industry] market is experiencing unprecedented growth, with [relevant market statistics/trends]. This creates a unique window of opportunity for early-stage companies like ours.

Our Validation:
• Customer Discovery: [number] interviews revealed [key insight]
• Early Traction: [specific metrics showing demand]
• Industry Recognition: [awards, partnerships, media coverage]

Why This Matters for Investors:
1. [Benefit 1 - market timing]
2. [Benefit 2 - competitive advantage]
3. [Benefit 3 - scalability potential]

We're positioned to capture [percentage/share] of this growing market through our unique approach of [your solution].

Investment Opportunity:
We're raising [amount] to accelerate our growth during this optimal market window. Early investors will benefit from [specific advantages].

I'd appreciate the opportunity to share our detailed market analysis and growth projections with you.

Would you be interested in learning more?

Best regards,
[Your Name]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  },
  {
    name: "Social Proof and Traction",
    category: "traction",
    subject: "Growing Fast: {company}'s Latest Traction Update",
    content: `Hi {name},

I wanted to share our latest traction numbers and some exciting validation we've received.

Recent Growth Metrics:
• [Metric 1]: [specific number and % growth]
• [Metric 2]: [specific number and % growth]  
• [Metric 3]: [specific number and % growth]

Social Proof:
✓ [Customer testimonial or case study]
✓ [Industry partnership or recognition]
✓ [Media coverage or awards]

What Our Customers Are Saying:
"[Powerful customer quote that demonstrates value]" - [Customer Name, Title, Company]

This traction demonstrates:
1. Product-market fit in our target segment
2. Scalable business model with predictable growth
3. Strong customer satisfaction and retention

Investment Momentum:
We're seeing increased interest from investors who recognize our growth potential. Our current round is [percentage] filled, with [notable investors/advisors] already committed.

The opportunity to join at this stage won't last long. Our growth trajectory suggests the next funding round will be at a significantly higher valuation.

I'd love to discuss how you could be part of our success story.

Are you available for a brief call this week?

Best regards,
[Your Name]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  }
];

async function seedEmailTemplates() {
  try {
    console.log('Connecting to database...');
    
    // First, check if templates already exist
    const existingTemplates = await pool.query(
      'SELECT COUNT(*) as count FROM email_templates WHERE is_default = true'
    );
    
    if (existingTemplates.rows[0].count > 0) {
      console.log('Default email templates already exist. Skipping seed.');
      return;
    }

    console.log('Inserting default email templates...');
    
    for (const template of defaultTemplates) {
      await pool.query(`
        INSERT INTO email_templates (
          name, category, subject, content, variables, 
          is_public, is_default, created_by_id, usage_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        template.name,
        template.category,
        template.subject,
        template.content,
        JSON.stringify(template.variables),
        template.isPublic,
        template.isDefault,
        template.createdById,
        template.usage_count
      ]);
    }

    console.log(`Successfully inserted ${defaultTemplates.length} default email templates`);
    
    // Also create some sample investor directory entries
    console.log('Creating sample investor directory entries...');
    
    const sampleInvestors = [
      {
        name: "Sarah Chen",
        email: "sarah.chen@techfund.com",
        company: "TechFund Ventures",
        title: "Principal",
        location: "San Francisco, CA",
        bio: "Focused on early-stage SaaS and AI startups. Former product manager at Google.",
        linkedinUrl: "https://linkedin.com/in/sarahchen",
        investmentFocus: "SaaS, AI, B2B Software",
        minimumInvestment: 25000,
        maximumInvestment: 500000,
        tags: ["SaaS", "AI", "B2B"],
        source: "directory",
        isActive: true
      },
      {
        name: "Michael Rodriguez",
        email: "m.rodriguez@growthcapital.com", 
        company: "Growth Capital Partners",
        title: "Managing Director",
        location: "New York, NY",
        bio: "15+ years investing in fintech and healthcare technology companies.",
        linkedinUrl: "https://linkedin.com/in/mrodriguez",
        investmentFocus: "Fintech, HealthTech, Enterprise Software",
        minimumInvestment: 50000,
        maximumInvestment: 1000000,
        tags: ["Fintech", "HealthTech", "Enterprise"],
        source: "directory", 
        isActive: true
      },
      {
        name: "Emily Johnson",
        email: "emily@impactinvest.org",
        company: "Impact Investment Group",
        title: "Investment Manager",
        location: "Austin, TX",
        bio: "Passionate about sustainable technology and social impact startups.",
        linkedinUrl: "https://linkedin.com/in/emilyjohnson",
        investmentFocus: "CleanTech, Social Impact, Sustainability",
        minimumInvestment: 10000,
        maximumInvestment: 250000,
        tags: ["CleanTech", "Impact", "Sustainability"],
        source: "directory",
        isActive: true
      }
    ];

    for (const investor of sampleInvestors) {
      await pool.query(`
        INSERT INTO investor_directory (
          name, email, company, title, location, bio, linkedin_url,
          investment_focus, minimum_investment, maximum_investment, 
          tags, source, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (email) DO NOTHING
      `, [
        investor.name,
        investor.email,
        investor.company,
        investor.title,
        investor.location,
        investor.bio,
        investor.linkedinUrl,
        investor.investmentFocus,
        investor.minimumInvestment,
        investor.maximumInvestment,
        JSON.stringify(investor.tags),
        investor.source,
        investor.isActive
      ]);
    }

    console.log(`Successfully inserted ${sampleInvestors.length} sample investors`);
    console.log('Email template seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding email templates:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding function
seedEmailTemplates().catch(console.error);