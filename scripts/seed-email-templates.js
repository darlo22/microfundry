import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const neonConfig = { webSocketConstructor: ws };

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultTemplates = [
  {
    name: "Initial Investment Inquiry",
    category: "introduction",
    subject: "Quick question about {company}",
    content: `Hi {name},

Hope you're doing well. I'm reaching out because I noticed your work with companies in our space.

I'm building something that might interest you - we're working on solving a real problem in [industry]. We've been quietly making progress and thought you might want to take a look.

A few quick details:
- We've got some early traction with customers
- The team has relevant experience
- We're looking to grow with the right partners

Would love to hear your thoughts if you have a moment. No pressure at all - just thought it might be worth a conversation.

Thanks for your time.

Best,
[Your Name]`,
    variables: ["name", "company"],
    isPublic: true,
    isDefault: true,
    createdById: null,
    usage_count: 0
  },
  {
    name: "Follow-up After Demo",
    category: "followup",
    subject: "Thanks for the chat - {name}",
    content: `Hi {name},

Thanks for taking the time to chat yesterday. Really appreciated your questions about the technical side.

As promised, I've put together some additional info based on what we discussed:
- The financial model you asked about
- Some customer feedback we've received
- Technical details on the implementation

I think the point you raised about scalability was spot on - we've actually been working on exactly that challenge.

Happy to jump on another call if it would be helpful, or feel free to reach out if you have any other questions.

Thanks again for your time.

Best,
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
    subject: "Quick update - {name}",
    content: `Hi {name},

Hope you're well. Wanted to give you a quick update on how things are going.

We hit a pretty good milestone last week - managed to get our first paying customers signed up. It's been a long time coming, so feels good to see it happen.

Few other things worth mentioning:
- The team is coming together nicely
- We're starting to see some real traction
- Learning a lot from early user feedback

Still plenty of work ahead, but feels like we're moving in the right direction.

Thought you might be interested to hear how things are progressing. Happy to chat more if you'd like to hear the details.

Best,
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
    subject: "Thought you'd find this interesting - {name}",
    content: `Hi {name},

Hope this finds you well. I've been thinking about our conversation and thought you might find this interesting.

We've been talking to a lot of people in our space recently, and the feedback has been pretty consistent - there's definitely a need for what we're building.

A few things that stood out:
- Most people we spoke with have this exact problem
- They're currently using workarounds that don't really work
- Several mentioned they'd pay for a good solution

It's been validating to hear that we're onto something real. We're still early, but the signs are encouraging.

I remember you mentioning your interest in this space. Would love to share what we've learned if you're curious.

No pressure at all - just thought it might be worth a chat.

Best,
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
    subject: "Some good news to share - {name}",
    content: `Hi {name},

Hope you're having a good week. Wanted to share some positive news from our end.

Things have been picking up lately:
- We've got a few more customers on board
- The feedback has been really encouraging
- Some interesting conversations happening with potential partners

One customer told us we solved a problem they'd been dealing with for months. That kind of feedback makes all the late nights worth it.

Still early days, but it feels like we're building something people actually want.

Thought you might be interested to hear how things are developing. Would love to catch up sometime if you're free.

Hope all is well with you.

Best,
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
    
    // Update existing templates with new spam-filter-friendly content
    console.log('Updating email templates with spam-filter-friendly content...');
    
    for (const template of defaultTemplates) {
      // First try to update existing template
      const updateResult = await pool.query(`
        UPDATE email_templates 
        SET subject = $1, content = $2, updated_at = NOW()
        WHERE name = $3 AND is_default = true
      `, [
        template.subject,
        template.content,
        template.name
      ]);

      // If no rows were updated, insert new template
      if (updateResult.rowCount === 0) {
        await pool.query(`
          INSERT INTO email_templates (
            name, category, subject, content, variables, 
            is_public, is_default, created_by, usage_count
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
        console.log(`Inserted new template: ${template.name}`);
      } else {
        console.log(`Updated existing template: ${template.name}`);
      }
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