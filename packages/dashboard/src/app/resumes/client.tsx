"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Upload, Star, Trash2, Eye, Plus, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Resume } from "@/lib/db/schema";
import { createResume, setDefaultResume, deleteResume, updateResumeSkills } from "@/lib/actions/resumes";
import { useRouter } from "next/navigation";

interface ResumesClientProps {
  initialResumes: Resume[];
}

export function ResumesClient({ initialResumes }: ResumesClientProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState("");
  const [newResumeSkills, setNewResumeSkills] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const success = await setDefaultResume(id);
      if (success) {
        setResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isDefault: r.id === id,
          }))
        );
        toast.success("Default resume updated");
      } else {
        toast.error("Failed to update default resume");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const success = await deleteResume(id);
      if (success) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Resume deleted");
      } else {
        toast.error("Failed to delete resume");
      }
    });
  };

  const handleUpload = () => {
    if (!newResumeName) {
      toast.error("Please enter a resume name");
      return;
    }

    startTransition(async () => {
      const fileName = `${newResumeName.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      const resume = await createResume(newResumeName, fileName, newResumeSkills);

      if (resume) {
        setResumes((prev) => [resume, ...prev]);
        setNewResumeName("");
        setNewResumeSkills("");
        setIsUploadOpen(false);
        toast.success("Resume registered! Place the PDF file in data/resumes/");
      } else {
        toast.error("Failed to create resume");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground">
            Manage your resumes for job applications
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resume</DialogTitle>
              <DialogDescription>
                Register a resume for use in applications. Place the PDF file in
                data/resumes/ folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resume Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Software Engineer Resume"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (Optional)</Label>
                <Textarea
                  id="skills"
                  placeholder="Python, TypeScript, React, AWS..."
                  value={newResumeSkills}
                  onChange={(e) => setNewResumeSkills(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Place your PDF file at:{" "}
                    <code className="bg-muted px-1 rounded">
                      data/resumes/{newResumeName?.toLowerCase().replace(/\s+/g, "_") || "your_resume"}.pdf
                    </code>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resume List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="relative">
            {resume.isDefault && (
              <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {resume.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Added{" "}
                    {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume.skills && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {resume.skills}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-mono truncate">
                {resume.filePath.split("/").pop()}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a
                    href={`file://${resume.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                {!resume.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(resume.id)}
                    disabled={isPending}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No resumes yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first resume to start applying for jobs
          </p>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Add Resume
          </Button>
        </div>
      )}
    </div>
  );
}
