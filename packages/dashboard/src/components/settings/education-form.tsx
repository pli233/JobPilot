"use client";

import { useState } from "react";
import { Education } from "@/lib/actions/config"; // Ensure this matches typical imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface EducationFormProps {
    initialEducation: Education[];
    onSave: (education: Education[]) => void;
    isPending: boolean;
}

export function EducationForm({ initialEducation, onSave, isPending }: EducationFormProps) {
    const [educationList, setEducationList] = useState<Education[]>(initialEducation);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempEducation, setTempEducation] = useState<Education | null>(null);

    const handleAddNew = () => {
        const newEdu: Education = {
            school: "",
            degree: "",
            field_of_study: "",
            start_date: "",
            end_date: "",
            gpa: "",
            location: "",
            achievements: [],
            coursework: [],
        };
        setTempEducation(newEdu);
        setEditingIndex(-1); // -1 indicates new item
    };

    const handleEdit = (index: number) => {
        setTempEducation({ ...educationList[index] });
        setEditingIndex(index);
    };

    const handleDelete = (index: number) => {
        const newList = educationList.filter((_, i) => i !== index);
        setEducationList(newList);
        onSave(newList);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setTempEducation(null);
    };

    const handleSaveItem = () => {
        if (!tempEducation) return;

        let newList = [...educationList];
        if (editingIndex === -1) {
            newList.push(tempEducation);
        } else if (editingIndex !== null) {
            newList[editingIndex] = tempEducation;
        }
        setEducationList(newList);
        onSave(newList);
        setEditingIndex(null);
        setTempEducation(null);
    };

    const updateTempField = (field: keyof Education, value: any) => {
        if (!tempEducation) return;
        setTempEducation({ ...tempEducation, [field]: value });
    };

    return (
        <div className="space-y-4">
            {editingIndex !== null && tempEducation ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingIndex === -1 ? "Add Education" : "Edit Education"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>School</Label>
                                <Input
                                    value={tempEducation.school}
                                    onChange={(e) => updateTempField("school", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Degree</Label>
                                <Input
                                    value={tempEducation.degree}
                                    onChange={(e) => updateTempField("degree", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Field of Study</Label>
                                <Input
                                    value={tempEducation.field_of_study}
                                    onChange={(e) => updateTempField("field_of_study", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>GPA</Label>
                                <Input
                                    value={tempEducation.gpa}
                                    onChange={(e) => updateTempField("gpa", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    value={tempEducation.start_date}
                                    onChange={(e) => updateTempField("start_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    value={tempEducation.end_date}
                                    onChange={(e) => updateTempField("end_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Location</Label>
                                <Input
                                    value={tempEducation.location}
                                    onChange={(e) => updateTempField("location", e.target.value)}
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
                        <h3 className="text-lg font-medium">Education History</h3>
                        <Button onClick={handleAddNew} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {educationList.map((edu, index) => (
                            <Card key={index}>
                                <CardContent className="p-4 flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{edu.school}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {edu.degree} in {edu.field_of_study}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {edu.start_date} - {edu.end_date} • {edu.location}
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
                        {educationList.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No education history added.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
