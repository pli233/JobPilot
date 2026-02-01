"use client";

import { useState } from "react";
import { Project } from "@/lib/actions/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface ProjectsFormProps {
    initialProjects: Project[];
    onSave: (projects: Project[]) => void;
    isPending: boolean;
}

export function ProjectsForm({
    initialProjects,
    onSave,
    isPending,
}: ProjectsFormProps) {
    const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempProject, setTempProject] = useState<Project | null>(null);

    const handleAddNew = () => {
        const newProject: Project = {
            name: "",
            description: "",
            url: "",
            technologies: [],
            start_date: "",
            end_date: "",
        };
        setTempProject(newProject);
        setEditingIndex(-1);
    };

    const handleEdit = (index: number) => {
        setTempProject({ ...projectsList[index] });
        setEditingIndex(index);
    };

    const handleDelete = (index: number) => {
        const newList = projectsList.filter((_, i) => i !== index);
        setProjectsList(newList);
        onSave(newList);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setTempProject(null);
    };

    const handleSaveItem = () => {
        if (!tempProject) return;

        let newList = [...projectsList];
        if (editingIndex === -1) {
            newList.push(tempProject);
        } else if (editingIndex !== null) {
            newList[editingIndex] = tempProject;
        }
        setProjectsList(newList);
        onSave(newList);
        setEditingIndex(null);
        setTempProject(null);
    };

    const updateTempField = (field: keyof Project, value: any) => {
        if (!tempProject) return;
        setTempProject({ ...tempProject, [field]: value });
    };

    const handleTechChange = (value: string) => {
        if (!tempProject) return;
        const techs = value.split(",").map((s) => s.trim()).filter(Boolean);
        updateTempField("technologies", techs);
    };

    return (
        <div className="space-y-4">
            {editingIndex !== null && tempProject ? (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingIndex === -1 ? "Add Project" : "Edit Project"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input
                                value={tempProject.name}
                                onChange={(e) => updateTempField("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                value={tempProject.url}
                                onChange={(e) => updateTempField("url", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    value={tempProject.start_date}
                                    onChange={(e) => updateTempField("start_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    value={tempProject.end_date}
                                    onChange={(e) => updateTempField("end_date", e.target.value)}
                                    placeholder="YYYY-MM"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Technologies (comma separated)</Label>
                            <Input
                                value={tempProject.technologies.join(", ")}
                                onChange={(e) => handleTechChange(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={tempProject.description}
                                onChange={(e) => updateTempField("description", e.target.value)}
                            />
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
                        <h3 className="text-lg font-medium">Projects</h3>
                        <Button onClick={handleAddNew} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {projectsList.map((proj, index) => (
                            <Card key={index}>
                                <CardContent className="p-4 flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{proj.name}</h4>
                                        <p className="text-sm text-muted-foreground">{proj.url}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {proj.technologies.map((tech) => (
                                                <span key={tech} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
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
                        {projectsList.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No projects added.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
