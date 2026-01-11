"use client";

import { useState } from "react";
import { WorkExperience } from "@/lib/actions/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface ExperienceFormProps {
    initialExperience: WorkExperience[];
    onSave: (experience: WorkExperience[]) => void;
    isPending: boolean;
}

export function ExperienceForm({
    initialExperience,
    onSave,
    isPending,
}: ExperienceFormProps) {
    const [experienceList, setExperienceList] =
        useState<WorkExperience[]>(initialExperience);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempExperience, setTempExperience] = useState<WorkExperience | null>(
        null
    );

    const handleAddNew = () => {
        const newExp: WorkExperience = {
            company: "",
            title: "",
            location: "",
            start_date: "",
            end_date: "",
            is_current: false,
            description: "",
            achievements: [],
        };
        setTempExperience(newExp);
        setEditingIndex(-1);
    };

    const handleEdit = (index: number) => {
        setTempExperience({ ...experienceList[index] });
        setEditingIndex(index);
    };

    const handleDelete = (index: number) => {
        const newList = experienceList.filter((_, i) => i !== index);
        setExperienceList(newList);
        onSave(newList);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setTempExperience(null);
    };

    const handleSaveItem = () => {
        if (!tempExperience) return;

        let newList = [...experienceList];
        if (editingIndex === -1) {
            newList.push(tempExperience);
        } else if (editingIndex !== null) {
            newList[editingIndex] = tempExperience;
        }
        setExperienceList(newList);
        onSave(newList);
        setEditingIndex(null);
        setTempExperience(null);
    };

    const updateTempField = (field: keyof WorkExperience, value: any) => {
        if (!tempExperience) return;
        setTempExperience({ ...tempExperience, [field]: value });
    };

    return (
        <div className="space-y-4">
            {editingIndex !== null && tempExperience ? (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingIndex === -1 ? "Add Experience" : "Edit Experience"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company</Label>
                                <Input
                                    value={tempExperience.company}
                                    onChange={(e) => updateTempField("company", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={tempExperience.title}
                                    onChange={(e) => updateTempField("title", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={tempExperience.location}
                                    onChange={(e) => updateTempField("location", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Checkbox
                                    id="current"
                                    checked={tempExperience.is_current}
                                    onCheckedChange={(checked) =>
                                        updateTempField("is_current", checked)
                                    }
                                />
                                <Label htmlFor="current">I currently work here</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    value={tempExperience.start_date}
                                    onChange={(e) => updateTempField("start_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    value={tempExperience.end_date}
                                    onChange={(e) => updateTempField("end_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                    disabled={tempExperience.is_current}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={tempExperience.description}
                                    onChange={(e) => updateTempField("description", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveItem}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Work Experience</h3>
                        <Button onClick={handleAddNew} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {experienceList.map((exp, index) => (
                            <Card key={index}>
                                <CardContent className="p-4 flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{exp.title}</h4>
                                        <p className="text-sm font-medium">{exp.company}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date} • {exp.location}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(index)}
                                            disabled={isPending}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(index)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {experienceList.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No work experience added.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
