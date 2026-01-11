#!/usr/bin/env python3
"""
Batch Apply Runner - Automated job application script
Processes unapplied Software Engineer positions from the database
"""

import sqlite3
import time
import json
import sys
from pathlib import Path
from datetime import datetime

# Database path
DB_PATH = Path("/Users/peiyuanli/Documents/GitHub/JobPilot/data/db/jobpilot.db")
PROJECT_ROOT = Path("/Users/peiyuanli/Documents/GitHub/JobPilot")

def get_unapplied_jobs(limit=None):
    """Fetch all unapplied software engineer jobs from database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = """
    SELECT j.id, j.title, j.company, j.location, j.url, j.platform, j.match_score
    FROM jobs j
    INNER JOIN applications a ON j.id = a.job_id
    WHERE a.status = 'unapplied'
    AND j.company != 'Unknown'
    AND (j.title LIKE '%Software Engineer%' OR j.title LIKE '%Backend%' OR j.title LIKE '%Full Stack%'
         OR j.title LIKE '%AI%' OR j.title LIKE '%Engineer%')
    ORDER BY j.match_score DESC, j.id ASC
    """

    if limit:
        query += f" LIMIT {limit}"

    cursor.execute(query)
    jobs = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jobs

def update_application_status(job_id, status, notes="", screenshot_path=""):
    """Update application status in database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE applications
    SET status = ?, notes = ?, applied_at = ?
    WHERE job_id = ?
    """, (status, notes, int(time.time()), job_id))

    conn.commit()
    conn.close()

def format_job_info(job):
    """Format job info for display"""
    return f"""
    ID: {job['id']}
    Title: {job['title']}
    Company: {job['company']}
    Location: {job['location']}
    URL: {job['url']}
    Platform: {job['platform']}
    Match Score: {job['match_score']}
    """

def main():
    print("=" * 80)
    print("JobPilot Batch Apply Runner")
    print("=" * 80)
    print(f"Database: {DB_PATH}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Fetch jobs
    jobs = get_unapplied_jobs()
    print(f"Found {len(jobs)} unapplied Software Engineer positions")
    print()

    if not jobs:
        print("No unapplied jobs found. Exiting.")
        return

    # Show first few jobs
    print("Sample of jobs to apply (first 5):")
    for job in jobs[:5]:
        print(format_job_info(job))

    print(f"\nTotal jobs to process: {len(jobs)}")
    print("\nNOTE: Full batch apply requires browser automation and user confirmation.")
    print("Next step: Use the apply workflow to process each job.")
    print("\nJobs are ready in the database for batch processing.")

    # Generate a file with job URLs for reference
    urls_file = PROJECT_ROOT / "batch_apply_urls.txt"
    with open(urls_file, 'w') as f:
        f.write("Unapplied Software Engineer Jobs - URLs\n")
        f.write("=" * 80 + "\n\n")
        for i, job in enumerate(jobs, 1):
            f.write(f"{i}. {job['company']} - {job['title']}\n")
            f.write(f"   URL: {job['url']}\n")
            f.write(f"   Location: {job['location']}\n")
            f.write(f"   Match Score: {job['match_score']}\n\n")

    print(f"\nSaved job URLs to: {urls_file}")

if __name__ == "__main__":
    main()
