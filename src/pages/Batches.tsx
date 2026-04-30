import { useState, useMemo } from "react";
import { Plus, Users, Pencil, Trash2, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from "@/hooks/useBatches";
import { Batch } from "@/types";
import { BatchFormDialog } from "@/components/forms/BatchFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

export default function BatchesPage() {
  const { data: batches, isLoading, error } = useBatches();
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const [search, setSearch] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const filterOptions = useMemo(() => {
    if (!batches) return { disciplines: [], branches: [], sections: [], semesters: [] };
    return {
      disciplines: [...new Set(batches.map(b => b.discipline).filter(Boolean))].sort(),
      branches: [...new Set(batches.map(b => b.branch).filter(Boolean))].sort(),
      sections: [...new Set(batches.map(b => b.section).filter(Boolean))].sort(),
      semesters: [...new Set(batches.map(b => b.semester))].sort((a, b) => a - b),
    };
  }, [batches]);

  const filteredData = useMemo(() => {
    if (!batches) return [];
    return batches.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.branch.toLowerCase().includes(q) || b.discipline.toLowerCase().includes(q) || (b.subBranch?.toLowerCase().includes(q));
      const matchesDiscipline = disciplineFilter === "all" || b.discipline === disciplineFilter;
      const matchesBranch = branchFilter === "all" || b.branch === branchFilter;
      const matchesSection = sectionFilter === "all" || b.section === sectionFilter;
      const matchesSemester = semesterFilter === "all" || String(b.semester) === semesterFilter;
      return matchesSearch && matchesDiscipline && matchesBranch && matchesSection && matchesSemester;
    });
  }, [batches, search, disciplineFilter, branchFilter, sectionFilter, semesterFilter]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const handleAdd = () => { setSelectedBatch(null); setFormOpen(true); };
  const handleEdit = (b: Batch) => { setSelectedBatch(b); setFormOpen(true); };
  const handleDeleteClick = (b: Batch) => { setSelectedBatch(b); setDeleteOpen(true); };

  const handleFormSubmit = async (data: Omit<Batch, "id">) => {
    try {
      if (selectedBatch) {
        await updateBatch.mutateAsync({ id: selectedBatch.id, ...data });
        toast({ title: "Batch updated successfully" });
      } else {
        await createBatch.mutateAsync(data);
        toast({ title: "Batch created successfully" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Failed to save batch", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedBatch) return;
    try {
      await deleteBatch.mutateAsync(selectedBatch.id);
      toast({ title: "Batch deleted successfully" });
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete batch", variant: "destructive" });
    }
  };

  const columns = [
    {
      key: 'discipline',
      header: 'Discipline',
      render: (batch: Batch) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent text-accent-foreground">
          {batch.discipline}
        </span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (batch: Batch) => (
        <div>
          <p className="font-medium">{batch.branch}</p>
          {batch.subBranch && <p className="text-xs text-muted-foreground">{batch.subBranch}</p>}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Batch',
      render: (batch: Batch) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium">{batch.name}</p>
            <p className="text-xs text-muted-foreground">Year {batch.year}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      render: (batch: Batch) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary text-secondary-foreground">
          {batch.section}
        </span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (batch: Batch) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
          Sem {batch.semester}
        </span>
      ),
    },
    {
      key: 'size',
      header: 'Capacity',
      render: (batch: Batch) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">{batch.size}</span>
        </div>
      ),
    },
    {
      key: 'classTimings',
      header: 'Class Timings',
      render: (batch: Batch) => (
        batch.classStartTime && batch.classEndTime ? (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{batch.classStartTime} - {batch.classEndTime}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (batch: Batch) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(batch)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Batches" subtitle="Manage student batches and sections" />
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
        <Header title="Batches" subtitle="Manage student batches and sections" />
        <div className="p-6">
          <div className="text-destructive">Failed to load batches. Please try again.</div>
        </div>
      </div>
    );
  }

  const batchData = batches ?? [];

  return (
    <div className="min-h-screen">
      <Header
        title="Batches"
        subtitle="Manage disciplines, branches, batches, and sections"
      />

      <div className="p-6">
        {/* Summary stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total Batches:</span>
              <span className="font-semibold">{batchData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
              <span className="text-sm text-muted-foreground">Total Students:</span>
              <span className="font-semibold text-primary">
                {batchData.reduce((acc, b) => acc + b.size, 0)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50">
              <span className="text-sm text-muted-foreground">Disciplines:</span>
              <span className="font-semibold">{filterOptions.disciplines.length}</span>
            </div>
          </div>

          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Batch
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <Input
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              {filterOptions.disciplines.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {filterOptions.branches.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {filterOptions.sections.map((s) => (
                <SelectItem key={s} value={s}>Section {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {filterOptions.semesters.map((s) => (
                <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {batchData.length === 0
              ? "No batches found. Add your first batch to get started."
              : "No batches match your search criteria."}
          </div>
        ) : (
          <ResourceTable data={filteredData} columns={columns} />
        )}
      </div>

      <BatchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        batch={selectedBatch}
        isSubmitting={createBatch.isPending || updateBatch.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Batch"
        description={`Are you sure you want to delete "${selectedBatch?.name}"? This action cannot be undone.`}
        isDeleting={deleteBatch.isPending}
      />
    </div>
  );
}
