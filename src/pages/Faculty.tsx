import { useState } from "react";
import { Plus, Mail, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { StatusBadge } from "@/components/resources/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaculty, useCreateFaculty, useUpdateFaculty, useDeleteFaculty } from "@/hooks/useFaculty";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { Faculty } from "@/types";
import { FacultyFormDialog } from "@/components/forms/FacultyFormDialog";
import { FacultyAvailabilityDialog } from "@/components/forms/FacultyAvailabilityDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "on_leave", label: "On Leave" },
  { value: "busy", label: "Busy" },
];

export default function FacultyPage() {
  const { data: faculty, isLoading, error } = useFaculty();
  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const deleteFaculty = useDeleteFaculty();

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredData,
  } = useResourceFilters({
    data: faculty,
    searchFields: ["name", "email", "department", "subjects"],
    statusField: "status",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const handleAdd = () => {
    setSelectedFaculty(null);
    setFormOpen(true);
  };

  const handleEdit = (f: Faculty) => {
    setSelectedFaculty(f);
    setFormOpen(true);
  };

  const handleDeleteClick = (f: Faculty) => {
    setSelectedFaculty(f);
    setDeleteOpen(true);
  };

  const handleAvailabilityClick = (f: Faculty) => {
    setSelectedFaculty(f);
    setAvailabilityOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Faculty, "id">) => {
    try {
      if (selectedFaculty) {
        await updateFaculty.mutateAsync({ id: selectedFaculty.id, ...data });
        toast({ title: "Faculty updated successfully" });
      } else {
        await createFaculty.mutateAsync(data);
        toast({ title: "Faculty created successfully" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Failed to save faculty", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedFaculty) return;
    try {
      await deleteFaculty.mutateAsync(selectedFaculty.id);
      toast({ title: "Faculty deleted successfully" });
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete faculty", variant: "destructive" });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Faculty Member',
      render: (f: Faculty) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {f.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium">{f.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {f.email}
            </p>
          </div>
        </div>
      )
    },
    { key: 'department', header: 'Department' },
    { 
      key: 'subjects', 
      header: 'Subjects',
      render: (f: Faculty) => (
        <div className="flex flex-wrap gap-1">
          {f.subjects.slice(0, 2).map(subject => (
            <span key={subject} className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
              {subject}
            </span>
          ))}
          {f.subjects.length > 2 && (
            <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">
              +{f.subjects.length - 2}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'load', 
      header: 'Teaching Load',
      render: (f: Faculty) => {
        const percentage = (f.currentLoad / f.maxLoad) * 100;
        const isOverloaded = percentage >= 100;
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{f.currentLoad}/{f.maxLoad} hrs</span>
              <span className={isOverloaded ? 'text-destructive' : 'text-muted-foreground'}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={percentage} 
              className="h-1.5"
            />
          </div>
        );
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (f: Faculty) => <StatusBadge status={f.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (f: Faculty) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleAvailabilityClick(f)}
            title="Set availability preferences"
          >
            <CalendarClock className="w-4 h-4 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(f)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(f)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Faculty" subtitle="Manage teaching staff and their assignments" />
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
        <Header title="Faculty" subtitle="Manage teaching staff and their assignments" />
        <div className="p-6">
          <div className="text-destructive">Failed to load faculty. Please try again.</div>
        </div>
      </div>
    );
  }

  const facultyData = faculty ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Faculty" 
        subtitle="Manage teaching staff and their assignments"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">{facultyData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
              <span className="text-sm text-muted-foreground">Active:</span>
              <span className="font-semibold text-success">
                {facultyData.filter(f => f.status === 'available').length}
              </span>
            </div>
          </div>
          
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        <ResourceFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search faculty by name, email, department, or subject..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
        />

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {facultyData.length === 0 
              ? "No faculty found. Add your first faculty member to get started."
              : "No faculty match your search criteria."}
          </div>
        ) : (
          <ResourceTable data={filteredData} columns={columns} />
        )}
      </div>

      <FacultyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        faculty={selectedFaculty}
        isSubmitting={createFaculty.isPending || updateFaculty.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Faculty"
        description={`Are you sure you want to delete "${selectedFaculty?.name}"? This action cannot be undone.`}
        isDeleting={deleteFaculty.isPending}
      />

      <FacultyAvailabilityDialog
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        faculty={selectedFaculty}
      />
    </div>
  );
}
