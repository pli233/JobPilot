"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Calendar, TrendingUp } from "lucide-react";

interface Stats {
  weekly: number;
  total: number;
  interviewRate: number;
  responseRate: number;
  weeklyChange?: number;
  interviewChange?: number;
  responseChange?: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "This Week",
      value: stats.weekly,
      icon: FileText,
      change: stats.weeklyChange,
    },
    {
      title: "Total Applications",
      value: stats.total,
      icon: Calendar,
    },
    {
      title: "Interview Rate",
      value: `${stats.interviewRate}%`,
      icon: TrendingUp,
      change: stats.interviewChange,
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: Eye,
      change: stats.responseChange,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change !== undefined && (
              <p
                className={
                  card.change >= 0
                    ? "text-green-500 text-xs"
                    : "text-red-500 text-xs"
                }
              >
                {card.change >= 0 ? "+" : ""}
                {card.change} from last week
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
