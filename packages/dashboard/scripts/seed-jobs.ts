// Seed script to add jobs to database
// Run with: npx tsx scripts/seed-jobs.ts

import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import path from "path";

const dbPath = path.resolve(__dirname, "../../../data/db/jobpilot.db");
const db = new Database(dbPath);

const jobs = [
  {
    platform: "indeed",
    title: "Junior Web Developer",
    company: "HOMESHOWOFF INC",
    location: "Vaughan, ON L4K 0B3",
    locationType: "onsite",
    salaryMin: null,
    salaryMax: null,
    url: "https://ca.indeed.com/viewjob?jk=junior-web-dev-homeshowoff",
    description: "WordPress, Shopify, Extranet, Intranet, Internet, Servers, Communication software, Image editing software, Project management software, HTML editing software",
    easyApply: true,
  },
  {
    platform: "indeed",
    title: "Software Quality Assurance Engineer",
    company: "ZenaTech, Inc.",
    location: "Toronto, ON M5E 1K3",
    locationType: "onsite",
    salaryMin: 55000,
    salaryMax: 60000,
    url: "https://ca.indeed.com/viewjob?jk=software-qa-zenatech",
    description: "Minimum of 2 years of hands-on experience in software quality assurance. Solid understanding of the software development lifecycle (SDLC) and Agile/Scrum",
    easyApply: true,
  },
  {
    platform: "indeed",
    title: "Backend / Django Developer",
    company: "Coulter Software Inc.",
    location: "Ontario",
    locationType: "remote",
    salaryMin: 55000,
    salaryMax: 80000,
    url: "https://ca.indeed.com/viewjob?jk=backend-django-coulter",
    description: "Proven experience with Django is a must. Your ability to come up with workable and valid solutions along with clear and concise code will be a key skill.",
    easyApply: true,
  },
  {
    platform: "indeed",
    title: "Senior Backend Developer",
    company: "TransCrypts",
    location: "Toronto, ON M5J 2N8",
    locationType: "onsite",
    salaryMin: 86428,
    salaryMax: 196846,
    url: "https://ca.indeed.com/viewjob?jk=senior-backend-transcrypts",
    description: "Supabase (Postgres + Auth + RLS). Supabase Edge Functions (TypeScript / Deno-style runtime). We're looking for someone who takes immediate ownership",
    easyApply: true,
  },
  {
    platform: "indeed",
    title: "Java Developer",
    company: "Citi",
    location: "Mississauga, ON L5B 3P7",
    locationType: "onsite",
    salaryMin: 94300,
    salaryMax: 141500,
    url: "https://ca.indeed.com/viewjob?jk=java-developer-citi",
    description: "Extensive experience system analysis and in programming of software applications. Serve as advisor or coach to new or lower level analysts.",
    easyApply: false,
  },
  {
    platform: "indeed",
    title: "Senior DevOps Engineer",
    company: "Snaplii",
    location: "Etobicoke, ON M9C 5K8",
    locationType: "onsite",
    salaryMin: 130000,
    salaryMax: 230000,
    url: "https://ca.indeed.com/viewjob?jk=devops-snaplii",
    description: "The ideal candidate will be a deep technical expert focused on enhancing system reliability, scalability, security, and, critically, cost efficiency.",
    easyApply: true,
  },
  {
    platform: "indeed",
    title: "Software Development Manager, Payments",
    company: "Clio",
    location: "Toronto, ON",
    locationType: "hybrid",
    salaryMin: 172000,
    salaryMax: 258000,
    url: "https://ca.indeed.com/viewjob?jk=sdm-payments-clio",
    description: "A strong background in hands-on software development. Demonstrated success in people leadership in software development, particularly with large scale SaaS",
    easyApply: false,
  },
  {
    platform: "indeed",
    title: "Lead QA Automation Engineer",
    company: "Accommodations Plus International",
    location: "Markham, ON",
    locationType: "onsite",
    salaryMin: null,
    salaryMax: null,
    url: "https://ca.indeed.com/viewjob?jk=qa-automation-api",
    description: "Work cross-functionally with engineering, product, and DevOps to embed quality into the software development lifecycle. Exposure to mobile testing is a plus.",
    easyApply: false,
  },
];

// Drop and recreate table to ensure clean schema
db.exec(`DROP TABLE IF EXISTS jobs`);
db.exec(`
  CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    location_type TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    url TEXT NOT NULL,
    description TEXT,
    easy_apply INTEGER DEFAULT 0,
    match_score REAL,
    saved_at INTEGER NOT NULL
  )
`);

// Insert jobs
const insert = db.prepare(`
  INSERT OR REPLACE INTO jobs (id, platform, title, company, location, location_type, salary_min, salary_max, url, description, easy_apply, saved_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const job of jobs) {
  insert.run(
    nanoid(),
    job.platform,
    job.title,
    job.company,
    job.location,
    job.locationType,
    job.salaryMin,
    job.salaryMax,
    job.url,
    job.description,
    job.easyApply ? 1 : 0,
    Date.now() // Unix timestamp in milliseconds
  );
}

console.log(`Seeded ${jobs.length} jobs to database`);
db.close();
