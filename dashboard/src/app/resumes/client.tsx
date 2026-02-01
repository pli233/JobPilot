"use client";

import { useState, useTransition, useRef } from "react";
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
import {
  FileText,
  Upload,
  Star,
  Trash2,
  Eye,
  Plus,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Resume } from "@/lib/supabase/types";
import { setDefaultResume, deleteResume } from "@/lib/actions/resumes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ResumesClientProps {
  initialResumes: Resume[];
}

export function ResumesClient({ initialResumes }: ResumesClientProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [newResumeName, setNewResumeName] = useState("");
  const [newResumeSkills, setNewResumeSkills] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!confirm("Are you sure you want to delete this resume?")) return;

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Only PDF files are allowed");
        return;
      }
      setSelectedFile(file);
      // Auto-fill name from filename if empty
      if (!newResumeName) {
        setNewResumeName(file.name.replace(/\.pdf$/i, "").replace(/_/g, " "));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }
    if (!newResumeName) {
      toast.error("Please enter a resume name");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", newResumeName);
      if (newResumeSkills) {
        formData.append("skills", newResumeSkills);
      }

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResumes((prev) => [data.resume, ...prev]);
        setNewResumeName("");
        setNewResumeSkills("");
        setSelectedFile(null);
        setIsUploadOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast.success("Resume uploaded successfully!");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreview = (id: string) => {
    setPreviewResumeId(id);
    setIsPreviewOpen(true);
  };

  const defaultResume = resumes.find((r) => r.is_default);
  const otherResumes = resumes.filter((r) => !r.is_default);

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
              Upload Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Resume</DialogTitle>
              <DialogDescription>
                Upload a PDF resume to use for job applications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* File Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  selectedFile
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <Check className="h-8 w-8 mx-auto text-green-500" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF only</p>
                  </div>
                )}
              </div>

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
                <Label htmlFor="skills">Target Skills (Optional)</Label>
                <Textarea
                  id="skills"
                  placeholder="Python, TypeScript, React, AWS..."
                  value={newResumeSkills}
                  onChange={(e) => setNewResumeSkills(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Add skills to help match this resume to relevant jobs
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                  setNewResumeName("");
                  setNewResumeSkills("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active/Default Resume */}
      {defaultResume && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-primary">Active Resume</span>
              </div>
              <Badge variant="secondary">Default</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{defaultResume.name}</h3>
                {defaultResume.skills && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {defaultResume.skills}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Added {formatDistanceToNow(new Date(defaultResume.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(defaultResume.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(defaultResume.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Resumes */}
      {otherResumes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Other Resumes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherResumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {resume.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Added{" "}
                        {formatDistanceToNow(new Date(resume.created_at), {
                          addSuffix: true,
                        })}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(resume.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(resume.id)}
                      disabled={isPending}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
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
        </div>
      )}

      {resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No resumes yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your first resume to start applying for jobs
          </p>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>
              {resumes.find((r) => r.id === previewResumeId)?.name || "Resume Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 pt-2">
            {previewResumeId && (
              <iframe
                src={`/api/resumes/${previewResumeId}`}
                className="w-full h-full rounded-lg border"
                title="Resume Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
