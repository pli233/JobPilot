"use client";

import { useState } from "react";
import { Skills } from "@/lib/actions/config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";

interface SkillsFormProps {
    initialSkills: Skills;
    onSave: (skills: Skills) => void;
    isPending: boolean;
}

export function SkillsForm({ initialSkills, onSave, isPending }: SkillsFormProps) {
    const [skills, setSkills] = useState<Skills>(initialSkills);

    const updateList = (field: keyof Skills, value: string) => {
        if (field === "languages") return; // Handled separately or simpler format for now

        // Split by comma or newline
        const items = value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
        setSkills({ ...skills, [field]: items });
    };

    const getListString = (field: keyof Skills) => {
        if (field === "languages") return "";
        return (skills[field] as string[]).join(", ");
    };

    const handleSave = () => {
        onSave(skills);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Technical Skills</Label>
                    <Textarea
                        value={getListString("technical")}
                        onChange={(e) => updateList("technical", e.target.value)}
                        placeholder="Comma separated values"
                        className="min-h-[80px]"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Programming Languages</Label>
                    <Textarea
                        value={getListString("programming_languages")}
                        onChange={(e) => updateList("programming_languages", e.target.value)}
                        placeholder="Python, TypeScript, Java, etc."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Frameworks</Label>
                    <Textarea
                        value={getListString("frameworks")}
                        onChange={(e) => updateList("frameworks", e.target.value)}
                        placeholder="React, Next.js, PyTorch, etc."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tools</Label>
                    <Textarea
                        value={getListString("tools")}
                        onChange={(e) => updateList("tools", e.target.value)}
                        placeholder="Git, Docker, AWS, etc."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Soft Skills</Label>
                    <Textarea
                        value={getListString("soft_skills")}
                        onChange={(e) => updateList("soft_skills", e.target.value)}
                        placeholder="Leadership, Communication, etc."
                    />
                </div>

                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Skills
                </Button>
            </CardContent>
        </Card>
    );
}
