import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Rocket, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getApplicationStats, getRecentApplications } from "@/lib/actions/applications";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getApplicationStats();
  const recentApplications = await getRecentApplications(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your job search overview.
          </p>
        </div>
        <Link href="/jobs">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Search Jobs
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <RecentApplications applications={recentApplications} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/jobs">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search for new jobs
              </Button>
            </Link>
            <Link href="/applications">
              <Button variant="outline" className="w-full justify-start">
                <Rocket className="mr-2 h-4 w-4" />
                View all applications
              </Button>
            </Link>
            <Link href="/resumes">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Manage resumes
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Export weekly report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
