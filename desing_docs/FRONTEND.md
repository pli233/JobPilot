# Job Pilot - Frontend Dashboard 设计

> 系统架构见 [ARCHITECTURE.md](ARCHITECTURE.md)
> MCP 工具详情见 [IMPLEMENTATION.md](IMPLEMENTATION.md)
> UI 交互示例见 [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.x | 全栈框架 (App Router) |
| shadcn/ui | latest | UI 组件库 |
| Tailwind CSS | 4.x | 样式 |
| Drizzle ORM | latest | SQLite ORM |
| TanStack Query | 5.x | 服务端状态 |
| @dnd-kit | latest | Kanban 拖拽 |
| Lucide React | latest | 图标 |

---

## 📁 项目结构

```
packages/dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard 首页
│   │   ├── jobs/page.tsx       # 职位搜索
│   │   ├── applications/page.tsx # Kanban 看板
│   │   ├── settings/page.tsx   # 设置
│   │   └── api/                # API Routes
│   │       ├── jobs/route.ts
│   │       ├── applications/route.ts
│   │       └── export/route.ts
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── jobs/               # 职位组件
│   │   │   ├── job-card.tsx
│   │   │   ├── job-list.tsx
│   │   │   └── match-score-badge.tsx
│   │   ├── applications/       # 申请组件
│   │   │   ├── application-kanban.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   └── apply-dialog.tsx
│   │   └── dashboard/          # 仪表板组件
│   │       ├── stats-cards.tsx
│   │       └── recent-applications.tsx
│   │
│   ├── lib/
│   │   ├── db/schema.ts        # Drizzle Schema
│   │   └── utils/cn.ts
│   │
│   └── hooks/
│       ├── use-jobs.ts
│       └── use-applications.ts
│
├── components.json             # shadcn 配置
├── tailwind.config.ts
└── drizzle.config.ts
```

---

## 🧩 核心组件

### JobCard

```tsx
// src/components/jobs/job-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Zap, Building2, Bookmark } from "lucide-react";
import { MatchScoreBadge } from "./match-score-badge";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
}

export function JobCard({ job, onApply, onSave }: JobCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
          </div>
          <MatchScoreBadge score={job.matchScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{job.location}</Badge>
          {job.salary && <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1" />{job.salary}</Badge>}
          {job.easyApply && <Badge className="bg-green-500"><Zap className="h-3 w-3 mr-1" />Easy Apply</Badge>}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onApply(job.id)} className="flex-1">申请职位</Button>
          <Button variant="outline" onClick={() => onSave(job.id)}><Bookmark className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### MatchScoreBadge

```tsx
// src/components/jobs/match-score-badge.tsx
import { cn } from "@/lib/utils/cn";

export function MatchScoreBadge({ score }: { score?: number }) {
  if (!score) return null;

  const color = score >= 90 ? "bg-green-500" :
                score >= 80 ? "bg-emerald-500" :
                score >= 70 ? "bg-yellow-500" : "bg-gray-500";

  return (
    <div className={cn("px-2.5 py-1 rounded-full text-sm font-semibold text-white", color)}>
      {score}%
    </div>
  );
}
```

### ApplicationKanban

```tsx
// src/components/applications/application-kanban.tsx
"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";

const columns = [
  { id: "applied", title: "已申请", color: "bg-blue-500" },
  { id: "viewed", title: "已查看", color: "bg-yellow-500" },
  { id: "interview", title: "面试中", color: "bg-purple-500" },
  { id: "offer", title: "已录用", color: "bg-green-500" },
];

export function ApplicationKanban({ applications, onStatusChange }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onStatusChange(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            applications={applications.filter(a => a.status === col.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

### StatsCards

```tsx
// src/components/dashboard/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Calendar, TrendingUp } from "lucide-react";

export function StatsCards({ stats }) {
  const cards = [
    { title: "本周申请", value: stats.weekly, icon: FileText, change: stats.weeklyChange },
    { title: "总申请", value: stats.total, icon: Calendar },
    { title: "面试率", value: `${stats.interviewRate}%`, icon: TrendingUp, change: stats.interviewChange },
    { title: "响应率", value: `${stats.responseRate}%`, icon: Eye, change: stats.responseChange },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change !== undefined && (
              <p className={card.change >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                {card.change >= 0 ? "↑" : "↓"} {Math.abs(card.change)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### ApplyDialog

```tsx
// src/components/applications/apply-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function ApplyDialog({ job, resumes, qaTemplates, open, onOpenChange, onApply }) {
  const [selectedResume, setSelectedResume] = useState(resumes[0]?.id);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    await onApply({ resumeId: selectedResume, answers });
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>申请: {job.title} @ {job.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 简历选择 */}
          <RadioGroup value={selectedResume} onValueChange={setSelectedResume}>
            {resumes.map(r => (
              <div key={r.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value={r.id} id={r.id} />
                <Label htmlFor={r.id}>{r.name}</Label>
              </div>
            ))}
          </RadioGroup>

          {/* 问答 */}
          {qaTemplates.map((qa, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="font-medium text-sm">Q: {qa.question}</div>
              <Textarea
                value={answers[qa.question] || qa.answer}
                onChange={e => setAnswers({ ...answers, [qa.question]: e.target.value })}
                rows={3}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleApply} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认申请
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📊 Drizzle Schema

```typescript
// src/lib/db/schema.ts
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
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  url: text("url").notNull(),
  easyApply: integer("easy_apply", { mode: "boolean" }),
  matchScore: real("match_score"),
  savedAt: integer("saved_at", { mode: "timestamp" }).notNull(),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id").references(() => jobs.id),
  resumeId: text("resume_id").references(() => resumes.id),
  status: text("status").notNull(),
  appliedAt: integer("applied_at", { mode: "timestamp" }),
  notes: text("notes"),
  screenshotPath: text("screenshot_path"),
});

export const qaTemplates = sqliteTable("qa_templates", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  questionPattern: text("question_pattern").notNull(),
  answerTemplate: text("answer_template").notNull(),
  usageCount: integer("usage_count").default(0),
});
```

---

## ⚙️ 配置文件

### components.json (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn",
    "ui": "@/components/ui"
  }
}
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 🚀 快速开始

```bash
# 创建项目
npx create-next-app@latest packages/dashboard --typescript --tailwind --app --src-dir
cd packages/dashboard

# 安装依赖
npm install drizzle-orm better-sqlite3 @tanstack/react-query
npm install @dnd-kit/core @dnd-kit/sortable lucide-react zod
npm install -D drizzle-kit @types/better-sqlite3

# 初始化 shadcn/ui
npx shadcn@latest init

# 添加组件
npx shadcn@latest add button card badge dialog input select table toast tabs

# 初始化数据库
npx drizzle-kit push

# 启动
npm run dev
```

---

## 📱 响应式断点

```css
sm:  640px+   /* 移动端 */
md:  768px+   /* 平板 */
lg:  1024px+  /* 桌面 */
xl:  1280px+  /* 大屏 */
```
