import { useState } from "react";
import { Plus, FlaskConical, MonitorPlay, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from "@/hooks/useCourses";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { Course } from "@/types";
import { CourseFormDialog } from "@/components/forms/CourseFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

const requirementOptions = [
  { value: "lab", label: "Requires Lab" },
  { value: "projector", label: "Requires Projector" },
  { value: "none", label: "No Requirements" },
];

export default function CoursesPage() {
  const { data: courses, isLoading, error } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [requirementFilter, setRequirementFilter] = useState("all");

  const {
    search,
    setSearch,
    filteredData: searchFiltered,
  } = useResourceFilters({
    data: courses,
    searchFields: ["name", "code", "department"],
  });

  // Additional filter for requirements
  const filteredData = searchFiltered.filter((course) => {
    if (requirementFilter === "all") return true;
    if (requirementFilter === "lab") return course.requiresLab;
    if (requirementFilter === "projector") return course.requiresProjector;
    if (requirementFilter === "none") return !course.requiresLab && !course.requiresProjector;
    return true;
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleAdd = () => {
    setSelectedCourse(null);
    setFormOpen(true);
  };

  const handleEdit = (c: Course) => {
    setSelectedCourse(c);
    setFormOpen(true);
  };

  const handleDeleteClick = (c: Course) => {
    setSelectedCourse(c);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Course, "id">) => {
    try {
      if (selectedCourse) {
        await updateCourse.mutateAsync({ id: selectedCourse.id, ...data });
        toast({ title: "Course updated successfully" });
      } else {
        await createCourse.mutateAsync(data);
        toast({ title: "Course created successfully" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Failed to save course", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    try {
      await deleteCourse.mutateAsync(selectedCourse.id);
      toast({ title: "Course deleted successfully" });
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete course", variant: "destructive" });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Course',
      render: (course: Course) => (
        <div>
          <p className="font-medium">{course.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
        </div>
      )
    },
    { key: 'department', header: 'Department' },
    { 
      key: 'weeklyHours', 
      header: 'Weekly Hours',
      render: (course: Course) => (
        <span className="font-mono">{course.weeklyHours} hrs</span>
      )
    },
    { 
      key: 'creditHours', 
      header: 'Credits',
      render: (course: Course) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
          {course.creditHours} CR
        </span>
      )
    },
    { 
      key: 'requirements', 
      header: 'Requirements',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          {course.requiresLab && (
            <div className="p-1.5 rounded bg-accent/20" title="Requires Lab">
              <FlaskConical className="w-3 h-3 text-accent" />
            </div>
          )}
          {course.requiresProjector && (
            <div className="p-1.5 rounded bg-primary/20" title="Requires Projector">
              <MonitorPlay className="w-3 h-3 text-primary" />
            </div>
          )}
          {!course.requiresLab && !course.requiresProjector && (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(course)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Courses" subtitle="Manage course catalog and requirements" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Courses" subtitle="Manage course catalog and requirements" />
        <div className="p-6">
          <div className="text-destructive">Failed to load courses. Please try again.</div>
        </div>
      </div>
    );
  }

  const courseData = courses ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Courses" 
        subtitle="Manage course catalog and requirements"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total Courses:</span>
              <span className="font-semibold">{courseData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
              <span className="text-sm text-muted-foreground">Lab Courses:</span>
              <span className="font-semibold text-accent">
                {courseData.filter(c => c.requiresLab).length}
              </span>
            </div>
          </div>
          
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>

        <ResourceFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses by name, code, or department..."
          typeFilter={requirementFilter}
          onTypeFilterChange={setRequirementFilter}
          typeOptions={requirementOptions}
          typeLabel="Requirements"
        />

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {courseData.length === 0 
              ? "No courses found. Add your first course to get started."
              : "No courses match your search criteria."}
          </div>
        ) : (
          <ResourceTable data={filteredData} columns={columns} />
        )}
      </div>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        course={selectedCourse}
        isSubmitting={createCourse.isPending || updateCourse.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`}
        isDeleting={deleteCourse.isPending}
      />
    </div>
  );
}
