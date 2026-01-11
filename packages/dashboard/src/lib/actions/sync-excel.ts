"use server";

import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

const EXCEL_PATH = path.resolve(process.cwd(), "../../data/job_tracker.xlsx");

interface ExcelApplicationRow {
    ID: string;
    Date: string;
    Platform: string;
    Company: string;
    Position: string;
    Location: string;
    Status: string;
    "Match Score": number;
    Resume: string;
    URL: string;
    Notes: string;
    "Screenshot Path"?: string;
    "Confirmation Screenshot Path"?: string;
}

export async function syncApplicationsFromExcel() {
    try {
        if (!fs.existsSync(EXCEL_PATH)) {
            throw new Error("Job tracker Excel file not found");
        }

        const fileBuffer = fs.readFileSync(EXCEL_PATH);
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheetName = "Applications";
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            throw new Error(`Sheet "${sheetName}" not found in workbook`);
        }

        const rows = XLSX.utils.sheet_to_json<ExcelApplicationRow>(worksheet);

        console.log(`Found ${rows.length} rows in Excel file`);

        for (const row of rows) {
            // 1. Upsert Job
            // We'll generate a consistent ID based on the URL or Company+Position if no ID exists,
            // but for now let's assume one job per application row.
            // Ideally, we should check if the job exists by URL.

            const jobId = `job_${nanoid()}`; // In a real scenario we might want to deduplicate jobs
            const applicationId = row.ID;

            // Extract Salary (very basic parsing if available in notes or description, 
            // but here we just take what we have. 
            // Realistically the Excel might not have all job details separate from application)

            // Check if job exists by URL to avoid duplicates if possible, 
            // but since we don't have a unique constraint on URL in the schema provided (only ID),
            // and we are syncing from a flat list, we'll try to match by Company + Title + Platform logic 
            // or just create a new job entry for every application for simplicity in this "sync" context
            // unless we can find a better way. 

            // actually, let's just create/update the application record.
            // But `applications` references `jobs`. So we MUST have a job.

            // Let's see if we can find an existing job with this URL?
            let existingJobId: string | null = null;
            if (row.URL) {
                try {
                    const result = await db.select({ id: jobs.id })
                        .from(jobs)
                        .where(sql`${jobs.url} = ${row.URL}`)
                        .limit(1);
                    if (result.length > 0) existingJobId = result[0].id;
                } catch (e) {
                    console.error("Error searching for job", e);
                }
            }

            if (!existingJobId) {
                existingJobId = jobId;
                await db.insert(jobs).values({
                    id: existingJobId,
                    company: row.Company || "Unknown",
                    title: row.Position || "Unknown",
                    platform: (row.Platform || "other").toLowerCase(),
                    url: row.URL || "",
                    location: row.Location,
                    savedAt: new Date(), // Set to now as we are just discovering it
                });
            }

            // 2. Upsert Application
            const appliedDate = row.Date ? new Date(row.Date) : new Date();

            // Map Excel status to DB status
            let status = (row.Status || "applied").toLowerCase();
            // valid: 'unapplied' | 'applied' | 'oa' | 'interview' | 'offer' | 'rejected'
            if (!['unapplied', 'applied', 'oa', 'interview', 'offer', 'rejected'].includes(status)) {
                // simple mapping fallback
                if (status.includes("interview")) status = "interview";
                else if (status.includes("reject")) status = "rejected";
                else if (status.includes("offer")) status = "offer";
                else if (status.includes("oa") || status.includes("assessment")) status = "oa";
                else status = "applied";
            }

            await db.insert(applications).values({
                id: applicationId,
                jobId: existingJobId,
                status: status,
                appliedAt: appliedDate,
                notes: row.Notes,
                resumeName: row.Resume,
                platform: (row.Platform || "other").toLowerCase(),
                applicationUrl: row.URL,
                location: row.Location,
                screenshotPath: row["Screenshot Path"], // Assuming these columns might exist or be added
                confirmationScreenshotPath: row["Confirmation Screenshot Path"],
                createdAt: new Date(),
            }).onConflictDoUpdate({
                target: applications.id,
                set: {
                    status: status,
                    notes: row.Notes,
                    resumeName: row.Resume,
                    location: row.Location,
                    screenshotPath: row["Screenshot Path"],
                    confirmationScreenshotPath: row["Confirmation Screenshot Path"],
                }
            });
        }

        revalidatePath("/applications");
        return { success: true, count: rows.length };
    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function syncApplicationsToExcel() {
    try {
        if (!fs.existsSync(EXCEL_PATH)) {
            throw new Error("Job tracker Excel file not found");
        }

        // 1. Fetch all applications from DB
        const allApplications = await db
            .select({
                id: applications.id,
                createdAt: applications.createdAt,
                platform: applications.platform,
                company: jobs.company,
                position: jobs.title,
                location: applications.location,
                status: applications.status,
                resumeName: applications.resumeName,
                url: applications.applicationUrl, // Prefer specific application URL
                jobUrl: jobs.url,
                notes: applications.notes,
                screenshotPath: applications.screenshotPath,
                confirmationScreenshotPath: applications.confirmationScreenshotPath,
                matchScore: jobs.matchScore,
                appliedAt: applications.appliedAt,
            })
            .from(applications)
            .leftJoin(jobs, sql`${applications.jobId} = ${jobs.id}`);

        // 2. Map to Excel format
        const rows: ExcelApplicationRow[] = allApplications.map((app) => ({
            ID: app.id,
            Date: app.appliedAt ? app.appliedAt.toISOString().split("T")[0] : "",
            Platform: app.platform || "other",
            Company: app.company || "Unknown",
            Position: app.position || "Unknown",
            Location: app.location || "",
            Status: app.status.charAt(0).toUpperCase() + app.status.slice(1), // Capitalize
            "Match Score": app.matchScore || 0,
            Resume: app.resumeName || "",
            URL: app.url || app.jobUrl || "",
            Notes: app.notes || "",
            "Screenshot Path": app.screenshotPath || "",
            "Confirmation Screenshot Path": app.confirmationScreenshotPath || "",
        }));

        // 3. Write to Excel
        const fileBuffer = fs.readFileSync(EXCEL_PATH);
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });

        // Create new worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(rows);

        // Replace "Applications" sheet
        workbook.Sheets["Applications"] = newWorksheet;

        // Write back to file
        XLSX.writeFile(workbook, EXCEL_PATH);

        return { success: true, count: rows.length };
    } catch (error) {
        console.error("Sync to Excel error:", error);
        return { success: false, error: (error as Error).message };
    }
}
