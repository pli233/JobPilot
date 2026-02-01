"use client";

import { useState, useTransition } from "react";
import { JobList } from "@/components/jobs/job-list";
import { JobTable } from "@/components/jobs/job-table";
import { ApplyDialog } from "@/components/applications/apply-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Loader2, Sparkles, Zap, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/lib/supabase/types";
import { deleteJob } from "@/lib/actions/jobs";
import { createApplication } from "@/lib/actions/applications";
import { searchJobs } from "@/lib/actions/search";

interface JobSearchClientProps {
  initialJobs: Job[];
}

export function JobSearchClient({ initialJobs }: JobSearchClientProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlatforms, setSearchPlatforms] = useState<("indeed" | "glassdoor" | "linkedin")[]>(["indeed", "glassdoor"]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state for saved jobs
  const [filterQuery, setFilterQuery] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [locationType, setLocationType] = useState<string>("all");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isPending, startTransition] = useTransition();

  // Tab state
  const [activeTab, setActiveTab] = useState<"search" | "saved">("search");

  // View mode state for saved jobs
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Apply dialog state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleApply = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setApplyDialogOpen(true);
    }
  };

  const handleConfirmApply = async (data: { resumeId?: string; notes?: string }) => {
    if (!selectedJob) return;

    startTransition(async () => {
      const result = await createApplication({
        job_id: selectedJob.id,
        resume_id: data.resumeId || null,
        status: "applied",
        notes: data.notes || null,
        applied_at: new Date().toISOString(),
        company: selectedJob.company,
        position: selectedJob.title,
        platform: selectedJob.platform,
        application_url: selectedJob.url,
        location: selectedJob.location,
        location_type: selectedJob.location_type,
        salary_min: selectedJob.salary_min,
        salary_max: selectedJob.salary_max,
      });

      if (result) {
        toast.success(`Applied to ${selectedJob.title} at ${selectedJob.company}`);
        setApplyDialogOpen(false);
        setSelectedJob(null);
      } else {
        toast.error("Failed to submit application");
      }
    });
  };

  const handleSave = async (jobId: string) => {
    const job = searchResults.find((j) => j.id === jobId) || jobs.find((j) => j.id === jobId);
    if (!job) return;

    // Job is auto-saved during search, so just confirm
    toast.success(`${job.title} at ${job.company} is saved`);

    // Refresh saved jobs list
    if (!jobs.find((j) => j.id === jobId)) {
      setJobs((prev) => [job, ...prev]);
    }
  };

  // Real search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    if (searchPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { results, saved, error } = await searchJobs(searchQuery, {
        platforms: searchPlatforms,
        limit: 20,
        autoSave: true,
      });

      if (error) {
        toast.error(error);
        setIsSearching(false);
        return;
      }

      // Convert SearchResult to Job format
      const jobResults: Job[] = results.map((r) => ({
        id: r.id,
        platform: r.platform,
        title: r.title,
        company: r.company,
        location: r.location,
        location_type: r.locationType as "remote" | "hybrid" | "onsite" | null,
        salary_min: r.salaryMin,
        salary_max: r.salaryMax,
        url: r.url,
        description: r.description,
        easy_apply: r.easyApply,
        match_score: r.matchScore,
        saved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      setSearchResults(jobResults);

      if (results.length > 0) {
        toast.success(`Found ${results.length} jobs, ${saved} saved to database`);
        // Refresh saved jobs
        setJobs((prev) => {
          const existingIds = new Set(prev.map(j => j.id));
          const newJobs = jobResults.filter(j => !existingIds.has(j.id));
          return [...newJobs, ...prev];
        });
      } else {
        toast.info("No jobs found. Try different keywords or platforms.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please check your API configuration.");
    } finally {
      setIsSearching(false);
    }
  };

  const togglePlatform = (p: "indeed" | "glassdoor" | "linkedin") => {
    setSearchPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleRemove = async (jobId: string) => {
    startTransition(async () => {
      const success = await deleteJob(jobId);
      if (success) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast.success("Job removed from saved jobs");
      } else {
        toast.error("Failed to remove job");
      }
    });
  };

  const filteredJobs = jobs.filter((job) => {
    if (platform !== "all" && job.platform !== platform) return false;
    if (locationType !== "all" && job.location_type !== locationType) return false;
    if (
      filterQuery &&
      !job.title.toLowerCase().includes(filterQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(filterQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Search</h1>
        <p className="text-muted-foreground">
          Search across LinkedIn, Indeed, and Glassdoor
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "search" ? "default" : "outline"}
          onClick={() => setActiveTab("search")}
        >
          <Zap className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
        <Button
          variant={activeTab === "saved" ? "default" : "outline"}
          onClick={() => setActiveTab("saved")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Saved Jobs ({jobs.length})
        </Button>
      </div>

      {activeTab === "search" && (
        <>
          {/* Real Search Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Search Jobs
              </CardTitle>
              <CardDescription>
                Enter your search query and select platforms to search. Results are automatically saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Senior Python Engineer, Remote Software Developer..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={isSearching}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Platform Selection */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-muted-foreground">Platforms:</span>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indeed"
                    checked={searchPlatforms.includes("indeed")}
                    onCheckedChange={() => togglePlatform("indeed")}
                  />
                  <label htmlFor="indeed" className="text-sm cursor-pointer">Indeed</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="glassdoor"
                    checked={searchPlatforms.includes("glassdoor")}
                    onCheckedChange={() => togglePlatform("glassdoor")}
                  />
                  <label htmlFor="glassdoor" className="text-sm cursor-pointer">Glassdoor</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="linkedin"
                    checked={searchPlatforms.includes("linkedin")}
                    onCheckedChange={() => togglePlatform("linkedin")}
                  />
                  <label htmlFor="linkedin" className="text-sm cursor-pointer">LinkedIn</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching job boards...</p>
            </div>
          ) : hasSearched ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} results found
                </p>
              </div>
              {searchResults.length > 0 ? (
                <JobList jobs={searchResults} onApply={handleApply} onSave={handleSave} />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No jobs found. Try different keywords or platforms.</p>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Ready to Search</p>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your search query above and click Search to find jobs.
              </p>
            </Card>
          )}
        </>
      )}

      {activeTab === "saved" && (
        <>
          {/* Filters for saved jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Saved Jobs
                </CardTitle>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-lg border p-1">
                  <Button
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode("table")}
                  >
                    <TableIcon className="h-4 w-4 mr-1" />
                    Table
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter by title or company..."
                    className="pl-10"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </div>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="glassdoor">Glassdoor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Location Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} saved jobs
              {jobs.length !== filteredJobs.length && ` (${jobs.length} total)`}
            </p>
          </div>

          {/* Job List / Table */}
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredJobs.length > 0 ? (
            viewMode === "table" ? (
              <JobTable
                jobs={filteredJobs}
                onApply={handleApply}
                onRemove={handleRemove}
              />
            ) : (
              <JobList jobs={filteredJobs} onApply={handleApply} onSave={handleSave} />
            )
          ) : (
            <Card className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No Saved Jobs</p>
              <p className="text-sm text-muted-foreground mt-2">
                Search for jobs and they will be automatically saved here.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Apply Dialog */}
      {selectedJob && (
        <ApplyDialog
          job={selectedJob}
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          onApply={handleConfirmApply}
        />
      )}
    </div>
  );
}
