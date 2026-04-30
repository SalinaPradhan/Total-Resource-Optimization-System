import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { StatusBadge } from "@/components/resources/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { SupportStaff } from "@/types";
import { cn } from "@/lib/utils";
import { StaffFormDialog } from "@/components/forms/StaffFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  'lab-assistant': 'Lab Assistant',
  'technician': 'Technician',
  'admin': 'Admin',
};

const shiftLabels: Record<string, string> = {
  'morning': 'Morning (8AM-2PM)',
  'afternoon': 'Afternoon (2PM-8PM)',
  'full-day': 'Full Day',
};

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "on_leave", label: "On Leave" },
];

const roleOptions = [
  { value: "lab-assistant", label: "Lab Assistant" },
  { value: "technician", label: "Technician" },
  { value: "admin", label: "Admin" },
];

export default function StaffPage() {
  const { data: staff, isLoading, error } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredData,
  } = useResourceFilters({
    data: staff,
    searchFields: ["name", "department"],
    statusField: "status",
    typeField: "role",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);

  const handleAdd = () => {
    setSelectedStaff(null);
    setFormOpen(true);
  };

  const handleEdit = (s: SupportStaff) => {
    setSelectedStaff(s);
    setFormOpen(true);
  };

  const handleDeleteClick = (s: SupportStaff) => {
    setSelectedStaff(s);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SupportStaff, "id">) => {
    try {
      if (selectedStaff) {
        await updateStaff.mutateAsync({ id: selectedStaff.id, ...data });
        toast({ title: "Staff updated successfully" });
      } else {
        await createStaff.mutateAsync(data);
        toast({ title: "Staff created successfully" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Failed to save staff", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff.mutateAsync(selectedStaff.id);
      toast({ title: "Staff deleted successfully" });
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete staff", variant: "destructive" });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Staff Member',
      render: (s: SupportStaff) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
            {s.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.id.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role',
      render: (s: SupportStaff) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          s.role === 'lab-assistant' ? 'bg-accent/20 text-accent' : 
          s.role === 'technician' ? 'bg-primary/20 text-primary' :
          'bg-secondary text-secondary-foreground'
        )}>
          {roleLabels[s.role]}
        </span>
      )
    },
    { key: 'department', header: 'Department' },
    { 
      key: 'shift', 
      header: 'Shift',
      render: (s: SupportStaff) => (
        <span className="text-sm">{shiftLabels[s.shift]}</span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (s: SupportStaff) => <StatusBadge status={s.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: SupportStaff) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(s)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Support Staff" subtitle="Manage lab assistants, technicians, and administrative staff" />
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
        <Header title="Support Staff" subtitle="Manage lab assistants, technicians, and administrative staff" />
        <div className="p-6">
          <div className="text-destructive">Failed to load staff. Please try again.</div>
        </div>
      </div>
    );
  }

  const staffData = staff ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Support Staff" 
        subtitle="Manage lab assistants, technicians, and administrative staff"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">{staffData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
              <span className="text-sm text-muted-foreground">Available:</span>
              <span className="font-semibold text-success">
                {staffData.filter(s => s.status === 'available').length}
              </span>
            </div>
          </div>
          
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <ResourceFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search staff by name or department..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeOptions={roleOptions}
          typeLabel="Role"
        />

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {staffData.length === 0 
              ? "No staff found. Add your first staff member to get started."
              : "No staff match your search criteria."}
          </div>
        ) : (
          <ResourceTable data={filteredData} columns={columns} />
        )}
      </div>

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        staff={selectedStaff}
        isSubmitting={createStaff.isPending || updateStaff.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Staff"
        description={`Are you sure you want to delete "${selectedStaff?.name}"? This action cannot be undone.`}
        isDeleting={deleteStaff.isPending}
      />
    </div>
  );
}
