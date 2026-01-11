"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ExternalLink, Sparkles } from "lucide-react";
import type { Job, Resume } from "@/lib/db/schema";
import { getResumes } from "@/lib/actions/resumes";

interface ApplyDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (data: { resumeId?: string; notes?: string }) => Promise<void>;
}

export function ApplyDialog({ job, open, onOpenChange, onApply }: ApplyDialogProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getResumes().then((r) => {
        setResumes(r);
        const defaultResume = r.find((res) => res.isDefault);
        if (defaultResume) {
          setSelectedResume(defaultResume.id);
        } else if (r.length > 0) {
          setSelectedResume(r[0].id);
        }
      });
    }
  }, [open]);

  const handleApply = () => {
    startTransition(async () => {
      await onApply({
        resumeId: selectedResume || undefined,
        notes: notes || undefined,
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Apply for Position</DialogTitle>
          <DialogDescription>
            {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Info */}
          <div className="flex flex-wrap gap-2">
            {job.location && <Badge variant="outline">{job.location}</Badge>}
            {job.locationType && (
              <Badge
                variant="outline"
                className={job.locationType === "remote" ? "border-green-500" : ""}
              >
                {job.locationType}
              </Badge>
            )}
            <Badge variant="secondary">{job.platform}</Badge>
            {job.easyApply && (
              <Badge className="bg-green-500">Easy Apply</Badge>
            )}
          </div>

          {/* Resume Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Resume</Label>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No resumes uploaded. Please upload a resume first.
              </p>
            ) : (
              <RadioGroup value={selectedResume} onValueChange={setSelectedResume}>
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <RadioGroupItem value={resume.id} id={resume.id} />
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor={resume.id} className="flex-1 cursor-pointer">
                      <span className="font-medium">{resume.name}</span>
                      {resume.isDefault && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Default
                        </Badge>
                      )}
                      {resume.skills && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {resume.skills}
                        </p>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Auto-Apply Info */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Auto-Apply with Claude</p>
                <p className="text-xs text-muted-foreground">
                  After recording this application, ask Claude to auto-fill the application form
                  using chrome-devtools MCP. Claude will navigate to the job page, fill in your
                  information, and take a screenshot for confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Job Link */}
          <Button variant="outline" className="w-full" asChild>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Job Posting
            </a>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isPending || resumes.length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
