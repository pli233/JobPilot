import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  skills: text("skills"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  platform: text("platform").notNull(), // 'linkedin' | 'indeed' | 'glassdoor'
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  locationType: text("location_type"), // 'remote' | 'hybrid' | 'onsite'
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  url: text("url").notNull(),
  description: text("description"),
  easyApply: integer("easy_apply", { mode: "boolean" }),
  matchScore: real("match_score"),
  savedAt: integer("saved_at", { mode: "timestamp" }).notNull(),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id").references(() => jobs.id),
  resumeId: text("resume_id").references(() => resumes.id),
  status: text("status").notNull(), // 'unapplied' | 'applied' | 'oa' | 'interview' | 'offer' | 'rejected'
  appliedAt: integer("applied_at", { mode: "timestamp" }),
  notes: text("notes"),
  screenshotPath: text("screenshot_path"),
  confirmationScreenshotPath: text("confirmation_screenshot_path"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  // Extended fields for better tracking
  resumeName: text("resume_name"), // Name of the resume file used
  platform: text("platform"), // 'greenhouse' | 'lever' | 'workday' | 'linkedin' | 'other'
  applicationUrl: text("application_url"), // Direct URL to application
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  location: text("location"),
  locationType: text("location_type"), // 'remote' | 'hybrid' | 'onsite'
  // Voluntary Self-Identification (for record keeping)
  demographicsSubmitted: integer("demographics_submitted", { mode: "boolean" }).default(false),
});

export const qaTemplates = sqliteTable("qa_templates", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  questionPattern: text("question_pattern").notNull(),
  answerTemplate: text("answer_template").notNull(),
  usageCount: integer("usage_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Types
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type QATemplate = typeof qaTemplates.$inferSelect;
export type NewQATemplate = typeof qaTemplates.$inferInsert;
