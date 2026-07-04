import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla", "Adobe", "Salesforce", "Oracle",
  "IBM", "Cisco", "Intel", "Spotify", "Uber", "Airbnb", "Razorpay", "Swiggy", "Zomato", "PhonePe",
  "Paytm", "Flipkart", "TCS", "Infosys", "Wipro", "HCL", "Cognizant", "Accenture", "Capgemini", "Deloitte",
  "PwC", "EY", "KPMG", "McKinsey", "BCG", "Bain", "Goldman Sachs", "JPMorgan", "Morgan Stanley", "Citi",
  "HSBC", "Barclays", "Standard Chartered", "Deutsche Bank", "Apollo Hospitals", "Fortis", "Max Healthcare",
  "Novartis", "Pfizer", "Johnson & Johnson", "Siemens", "GE Healthcare", "Philips", "Medtronic"
];

const locations = [
  "Remote", "Bangalore, India", "Hyderabad, India", "Pune, India", "Mumbai, India", "Delhi NCR, India",
  "Chennai, India", "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "London, UK",
  "Berlin, Germany", "Toronto, Canada", "Singapore", "Sydney, Australia", "Dubai, UAE"
];

const categories = [
  {
    titles: ["Software Engineer", "Backend Developer", "Frontend Developer", "Full Stack Developer", "Mobile Developer"],
    skills: [["React", "Node.js", "TypeScript"], ["Java", "Spring Boot", "Microservices"], ["Python", "Django", "PostgreSQL"], ["Go", "Kubernetes", "Docker"], ["Swift", "iOS", "Objective-C"], ["Kotlin", "Android", "Jetpack Compose"], ["Angular", "RxJS", "TypeScript"], ["C++", "System Design", "Linux"], ["C#", ".NET", "Azure"]],
    descPattern: "Build and scale high-performance applications. Collaborate with cross-functional teams to deliver robust software solutions. Write clean, maintainable code and participate in code reviews."
  },
  {
    titles: ["Data Scientist", "Machine Learning Engineer", "Data Analyst", "Data Engineer", "AI Researcher"],
    skills: [["Python", "Machine Learning", "TensorFlow"], ["SQL", "Tableau", "Data Analysis"], ["Spark", "Hadoop", "Scala"], ["PyTorch", "NLP", "Deep Learning"], ["R", "Statistics", "Data Visualization"], ["AWS", "Redshift", "ETL"], ["Snowflake", "dbt", "Airflow"]],
    descPattern: "Analyze large datasets to extract actionable insights. Build predictive models and machine learning pipelines. Work closely with product and engineering to integrate AI capabilities."
  },
  {
    titles: ["Product Manager", "Product Owner", "Technical Product Manager", "Growth Manager"],
    skills: [["Agile", "Scrum", "Product Roadmap"], ["Data Analytics", "A/B Testing", "User Research"], ["Jira", "Confluence", "Stakeholder Management"], ["Go-to-market Strategy", "Pricing", "Competitive Analysis"]],
    descPattern: "Drive the product vision, strategy, and execution. Work closely with engineering, design, and marketing to deliver impactful products that solve user problems."
  },
  {
    titles: ["UX Designer", "UI Designer", "Product Designer", "Graphic Designer", "Motion Designer"],
    skills: [["Figma", "Prototyping", "Wireframing"], ["Adobe Creative Suite", "Illustrator", "Photoshop"], ["User Research", "Usability Testing", "Interaction Design"], ["After Effects", "Animation", "Lottie"]],
    descPattern: "Create intuitive and beautiful user experiences. Conduct user research, build interactive prototypes, and design polished visual interfaces."
  },
  {
    titles: ["HR Manager", "Talent Acquisition Specialist", "HR Business Partner", "Technical Recruiter"],
    skills: [["Recruitment", "Sourcing", "Interviewing"], ["Employee Relations", "Performance Management", "HR Policies"], ["Workday", "ATS", "Onboarding"], ["Employer Branding", "Diversity & Inclusion"]],
    descPattern: "Manage the end-to-end employee lifecycle. Source top talent, ensure compliance with HR policies, and foster a positive workplace culture."
  },
  {
    titles: ["Marketing Manager", "Digital Marketer", "SEO Specialist", "Content Strategist"],
    skills: [["SEO", "Google Analytics", "Content Marketing"], ["Social Media", "Campaign Management", "Copywriting"], ["PPC", "Google Ads", "SEM"], ["Email Marketing", "HubSpot", "Marketing Automation"]],
    descPattern: "Develop and execute data-driven marketing campaigns to drive brand awareness and customer acquisition. Analyze campaign performance and optimize ROI."
  },
  {
    titles: ["Sales Executive", "Account Executive", "Business Development Manager", "Sales Engineer"],
    skills: [["B2B Sales", "Lead Generation", "CRM"], ["Salesforce", "Cold Calling", "Negotiation"], ["Technical Sales", "Product Demos", "Solution Selling"], ["Account Management", "Client Relations", "Renewals"]],
    descPattern: "Drive revenue growth by acquiring new customers and expanding existing accounts. Deliver persuasive pitches and negotiate enterprise contracts."
  },
  {
    titles: ["Financial Analyst", "Accountant", "Investment Banker", "Quantitative Analyst"],
    skills: [["Financial Modeling", "Excel", "Valuation"], ["Accounting", "GAAP", "Reconciliation"], ["Quantitative Analysis", "Python", "Derivatives"], ["Risk Management", "Compliance", "Auditing"]],
    descPattern: "Provide financial insights and analysis to support strategic decision making. Prepare financial reports, manage budgets, and evaluate investment opportunities."
  },
  {
    titles: ["DevOps Engineer", "Site Reliability Engineer", "Cloud Architect", "Security Engineer"],
    skills: [["AWS", "Terraform", "CI/CD"], ["Kubernetes", "Docker", "Linux"], ["Azure", "GCP", "Cloud Architecture"], ["Cybersecurity", "Penetration Testing", "Network Security"], ["Jenkins", "Ansible", "Monitoring"]],
    descPattern: "Design and maintain scalable cloud infrastructure. Automate deployment pipelines, ensure system reliability, and implement robust security protocols."
  },
  {
    titles: ["Biomedical Engineer", "Clinical Researcher", "Healthcare Administrator", "Pharmacist"],
    skills: [["Medical Devices", "FDA Compliance", "CAD"], ["Clinical Trials", "Data Collection", "Protocol Design"], ["Healthcare Management", "EMR", "Operations"], ["Pharmacology", "Patient Care", "Inventory Management"]],
    descPattern: "Support the development and delivery of cutting-edge healthcare solutions. Ensure compliance with industry regulations and improve patient outcomes."
  }
];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateJobs(count: number) {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const category = getRandomItem(categories);
    const title = getRandomItem(category.titles);
    const company = getRandomItem(companies);
    const location = getRandomItem(locations);
    const skills = getRandomItem(category.skills);
    
    // Add 1-2 random extra skills from other random categories just to mix it up slightly
    const extraSkillsCount = Math.floor(Math.random() * 2) + 1;
    const allSkillsFromCat = category.skills.flat();
    for (let j = 0; j < extraSkillsCount; j++) {
      const extraSkill = getRandomItem(allSkillsFromCat);
      if (!skills.includes(extraSkill)) {
        skills.push(extraSkill);
      }
    }

    // Generate random deadline between 5 and 60 days from now
    const daysToAdd = Math.floor(Math.random() * 55) + 5;
    const applicationDeadline = new Date();
    applicationDeadline.setDate(applicationDeadline.getDate() + daysToAdd);

    jobs.push({
      title,
      company,
      location,
      description: category.descPattern,
      requiredSkills: skills,
      applyLink: `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`,
      applicationDeadline,
      source: `${company} Careers`,
      isActive: true
    });
  }
  return jobs;
}

async function main() {
  console.log("Seeding massive mock jobs database...");
  
  // Clean existing jobs
  await prisma.job.deleteMany();
  
  // Generate 1000 jobs
  const newJobs = generateJobs(1000);
  console.log(`Generated ${newJobs.length} jobs in memory. Saving to database...`);
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < newJobs.length; i += batchSize) {
    const batch = newJobs.slice(i, i + batchSize);
    await prisma.job.createMany({
      data: batch
    });
    console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(newJobs.length / batchSize)}`);
  }

  console.log("Successfully seeded 1000 jobs to the database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
