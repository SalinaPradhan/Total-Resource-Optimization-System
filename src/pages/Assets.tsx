import { useState } from "react";
import { Plus, Projector, Monitor, Wrench, Sofa, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceFilters, FilterOption } from "@/components/resources/ResourceFilters";
import { StatusBadge } from "@/components/resources/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from "@/hooks/useAssets";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { AssetFormDialog } from "@/components/forms/AssetFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/components/ui/use-toast";
import { Asset } from "@/types";
import { AssetFormValues } from "@/lib/validationSchemas";

const typeIcons: Record<string, any> = {
  'projector': Projector,
  'computer': Monitor,
  'equipment': Wrench,
  'furniture': Sofa,
};

export default function AssetsPage() {
  const { data: assets, isLoading, error } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredData,
  } = useResourceFilters({
    data: assets,
    searchFields: ['name', 'location', 'assignedTo'],
    statusField: 'status',
    typeField: 'type',
  });

  const statusOptions: FilterOption[] = [
    { value: 'working', label: 'Working' },
    { value: 'broken', label: 'Broken' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const typeOptions: FilterOption[] = [
    { value: 'projector', label: 'Projector' },
    { value: 'computer', label: 'Computer' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'furniture', label: 'Furniture' },
  ];

  const handleAddClick = () => {
    setSelectedAsset(null);
    setFormOpen(true);
  };

  const handleEditClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormOpen(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: AssetFormValues) => {
    try {
      if (selectedAsset) {
        await updateAsset.mutateAsync({
          id: selectedAsset.id,
          name: data.name,
          type: data.type,
          location: data.location || "",
          status: data.status,
          assignedTo: data.assignedTo || undefined,
        });
        toast({ title: "Asset updated successfully" });
      } else {
        await createAsset.mutateAsync({
          name: data.name,
          type: data.type,
          location: data.location || "",
          status: data.status,
          assignedTo: data.assignedTo || undefined,
        });
        toast({ title: "Asset created successfully" });
      }
      setFormOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save asset",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset.mutateAsync(assetToDelete.id);
      toast({ title: "Asset deleted successfully" });
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Asset',
      render: (asset: Asset) => {
        const Icon = typeIcons[asset.type] || Wrench;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.id.slice(0, 8)}</p>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (asset: Asset) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-secondary text-secondary-foreground">
          {asset.type}
        </span>
      )
    },
    { key: 'location', header: 'Location' },
    { 
      key: 'assignedTo', 
      header: 'Assigned To',
      render: (asset: Asset) => (
        <span className="text-sm">
          {asset.assignedTo || <span className="text-muted-foreground">—</span>}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (asset: Asset) => <StatusBadge status={asset.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (asset: Asset) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(asset);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(asset);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Assets" subtitle="Track and manage equipment, projectors, and other resources" />
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
        <Header title="Assets" subtitle="Track and manage equipment, projectors, and other resources" />
        <div className="p-6">
          <div className="text-destructive">Failed to load assets. Please try again.</div>
        </div>
      </div>
    );
  }

  const assetData = assets ?? [];
  const displayData = filteredData;

  return (
    <div className="min-h-screen">
      <Header 
        title="Assets" 
        subtitle="Track and manage equipment, projectors, and other resources"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">{assetData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
              <span className="text-sm text-muted-foreground">Working:</span>
              <span className="font-semibold text-success">
                {assetData.filter(a => a.status === 'working').length}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10">
              <span className="text-sm text-muted-foreground">Broken:</span>
              <span className="font-semibold text-destructive">
                {assetData.filter(a => a.status === 'broken').length}
              </span>
            </div>
            {displayData.length !== assetData.length && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                <span className="text-sm text-muted-foreground">Showing:</span>
                <span className="font-semibold text-primary">{displayData.length}</span>
              </div>
            )}
          </div>
          
          <Button variant="gradient" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        <ResourceFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search assets..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          statusLabel="Status"
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeOptions={typeOptions}
          typeLabel="Type"
        />

        {assetData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No assets found. Add your first asset to get started.
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No assets match your filters. Try adjusting your search or filters.
          </div>
        ) : (
          <ResourceTable data={displayData} columns={columns} />
        )}
      </div>

      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        asset={selectedAsset}
        isSubmitting={createAsset.isPending || updateAsset.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset"
        description={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteAsset.isPending}
      />
    </div>
  );
}
