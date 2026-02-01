"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EducationForm } from "@/components/settings/education-form";
import { ExperienceForm } from "@/components/settings/experience-form";
import { ProjectsForm } from "@/components/settings/projects-form";
import { SkillsForm } from "@/components/settings/skills-form";
import {
  updateEducation,
  updateWorkExperience,
  updateProjects,
  updateSkills,
  type Education,
  type WorkExperience,
  type Project,
  type Skills,
  updatePersonalInfo,
  updateSearchPreferences,
  updateCommonAnswers,
  type Preferences,
  type PersonalInfo,
  type SearchPreferences,
  type CommonAnswers,
} from "@/lib/actions/config";
import {
  GraduationCap,
  Briefcase,
  Code,
  Cpu,
  Save,
  User,
  Search,
  MessageSquare,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface SettingsClientProps {
  initialPreferences: Preferences | null;
}

export function SettingsClient({ initialPreferences }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    initialPreferences?.personal_info || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      linkedin_url: "",
      github_url: "",
    }
  );

  const [searchPrefs, setSearchPrefs] = useState({
    defaultKeywords: initialPreferences?.search_preferences?.default_keywords?.join(", ") || "",
    defaultLocation: initialPreferences?.search_preferences?.default_location || "",
    remotePreference: initialPreferences?.search_preferences?.remote_preference || "remote",
    salaryMin: String(initialPreferences?.search_preferences?.salary_min || 150000),
    excludedCompanies: initialPreferences?.search_preferences?.excluded_companies?.join(", ") || "",
  });

  const [commonAnswers, setCommonAnswers] = useState<CommonAnswers>(
    initialPreferences?.common_answers || {
      willing_to_relocate: "Yes",
      work_authorization: "Authorized to work in the US",
      visa_sponsorship_required: "No",
      salary_expectation: "Open to discussion",
    }
  );

  const handleSavePersonalInfo = () => {
    startTransition(async () => {
      const success = await updatePersonalInfo(personalInfo);
      if (success) {
        toast.success("Personal information saved");
      } else {
        toast.error("Failed to save personal information");
      }
    });
  };

  const handleSaveSearchPrefs = () => {
    startTransition(async () => {
      const prefs: SearchPreferences = {
        default_keywords: searchPrefs.defaultKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        default_location: searchPrefs.defaultLocation,
        remote_preference: searchPrefs.remotePreference as "remote" | "hybrid" | "onsite" | "any",
        salary_min: parseInt(searchPrefs.salaryMin) || 0,
        excluded_companies: searchPrefs.excludedCompanies.split(",").map((s) => s.trim()).filter(Boolean),
        preferred_companies: [],
      };
      const success = await updateSearchPreferences(prefs);
      if (success) {
        toast.success("Search preferences saved");
      } else {
        toast.error("Failed to save search preferences");
      }
    });
  };

  const handleSaveCommonAnswers = () => {
    startTransition(async () => {
      const success = await updateCommonAnswers(commonAnswers);
      if (success) {
        toast.success("Common answers saved");
      } else {
        toast.error("Failed to save common answers");
      }
    });
  };

  // New states are implicitly handled by the initialPreferences passed to child components
  // But we need the save handlers

  const handleSaveEducation = (education: Education[]) => {
    startTransition(async () => {
      const success = await updateEducation(education);
      if (success) toast.success("Education saved");
      else toast.error("Failed to save education");
    });
  };

  const handleSaveExperience = (experience: WorkExperience[]) => {
    startTransition(async () => {
      const success = await updateWorkExperience(experience);
      if (success) toast.success("Experience saved");
      else toast.error("Failed to save experience");
    });
  };

  const handleSaveProjects = (projects: Project[]) => {
    startTransition(async () => {
      const success = await updateProjects(projects);
      if (success) toast.success("Projects saved");
      else toast.error("Failed to save projects");
    });
  };

  const handleSaveSkills = (skills: Skills) => {
    startTransition(async () => {
      const success = await updateSkills(skills);
      if (success) toast.success("Skills saved");
      else toast.error("Failed to save skills");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your JobPilot preferences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-2">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="h-4 w-4 mr-2" />
            Education
          </TabsTrigger>
          <TabsTrigger value="experience">
            <Briefcase className="h-4 w-4 mr-2" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Code className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Cpu className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search Preferences
          </TabsTrigger>
          <TabsTrigger value="answers">
            <MessageSquare className="h-4 w-4 mr-2" />
            Common Answers
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                This information will be used to auto-fill job applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.first_name}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.last_name}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, last_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={personalInfo.linkedin_url}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, linkedin_url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    value={personalInfo.github_url}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, github_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSavePersonalInfo} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <EducationForm
            initialEducation={initialPreferences?.education || []}
            onSave={handleSaveEducation}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceForm
            initialExperience={initialPreferences?.work_experience || []}
            onSave={handleSaveExperience}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsForm
            initialProjects={initialPreferences?.projects || []}
            onSave={handleSaveProjects}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsForm
            initialSkills={initialPreferences?.skills || {
              technical: [],
              programming_languages: [],
              frameworks: [],
              tools: [],
              soft_skills: [],
              languages: []
            }}
            onSave={handleSaveSkills}
            isPending={isPending}
          />
        </TabsContent>

        {/* Search Preferences */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Preferences</CardTitle>
              <CardDescription>
                Default filters for job searches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Default Keywords</Label>
                <Input
                  id="keywords"
                  value={searchPrefs.defaultKeywords}
                  onChange={(e) =>
                    setSearchPrefs({ ...searchPrefs, defaultKeywords: e.target.value })
                  }
                  placeholder="Comma-separated keywords"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Default Location</Label>
                  <Input
                    id="location"
                    value={searchPrefs.defaultLocation}
                    onChange={(e) =>
                      setSearchPrefs({ ...searchPrefs, defaultLocation: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote">Remote Preference</Label>
                  <Select
                    value={searchPrefs.remotePreference}
                    onValueChange={(value) =>
                      setSearchPrefs({ ...searchPrefs, remotePreference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Minimum Salary ($)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={searchPrefs.salaryMin}
                  onChange={(e) =>
                    setSearchPrefs({ ...searchPrefs, salaryMin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excluded">Excluded Companies</Label>
                <Textarea
                  id="excluded"
                  value={searchPrefs.excludedCompanies}
                  onChange={(e) =>
                    setSearchPrefs({ ...searchPrefs, excludedCompanies: e.target.value })
                  }
                  placeholder="Comma-separated company names to exclude"
                />
              </div>
              <Button onClick={handleSaveSearchPrefs} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Answers */}
        <TabsContent value="answers">
          <Card>
            <CardHeader>
              <CardTitle>Common Application Answers</CardTitle>
              <CardDescription>
                Pre-fill answers for frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="relocate">Willing to Relocate?</Label>
                  <Select
                    value={commonAnswers.willing_to_relocate}
                    onValueChange={(value) =>
                      setCommonAnswers({ ...commonAnswers, willing_to_relocate: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Depends">Depends on location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visa">Visa Sponsorship Required?</Label>
                  <Select
                    value={commonAnswers.visa_sponsorship_required}
                    onValueChange={(value) =>
                      setCommonAnswers({ ...commonAnswers, visa_sponsorship_required: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorization">Work Authorization</Label>
                <Input
                  id="authorization"
                  value={commonAnswers.work_authorization}
                  onChange={(e) =>
                    setCommonAnswers({ ...commonAnswers, work_authorization: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryExp">Salary Expectation</Label>
                <Textarea
                  id="salaryExp"
                  value={commonAnswers.salary_expectation}
                  onChange={(e) =>
                    setCommonAnswers({ ...commonAnswers, salary_expectation: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveCommonAnswers} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
