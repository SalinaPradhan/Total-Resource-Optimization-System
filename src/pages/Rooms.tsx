import { useState } from "react";
import { Plus, Monitor, Snowflake, Tv, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ResourceTable } from "@/components/resources/ResourceTable";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { StatusBadge } from "@/components/resources/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { Room } from "@/types";
import { cn } from "@/lib/utils";
import { RoomFormDialog } from "@/components/forms/RoomFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
];

const typeOptions = [
  { value: "lecture", label: "Lecture" },
  { value: "lab", label: "Lab" },
  { value: "seminar", label: "Seminar" },
  { value: "auditorium", label: "Auditorium" },
];

export default function Rooms() {
  const { data: rooms, isLoading, error } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredData,
  } = useResourceFilters({
    data: rooms,
    searchFields: ["name", "building"],
    statusField: "status",
    typeField: "type",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleAdd = () => {
    setSelectedRoom(null);
    setFormOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setSelectedRoom(room);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Room, "id">) => {
    try {
      if (selectedRoom) {
        await updateRoom.mutateAsync({ id: selectedRoom.id, ...data });
        toast({ title: "Room updated successfully" });
      } else {
        await createRoom.mutateAsync(data);
        toast({ title: "Room created successfully" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Failed to save room", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom.mutateAsync(selectedRoom.id);
      toast({ title: "Room deleted successfully" });
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete room", variant: "destructive" });
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Room Name',
      render: (room: Room) => (
        <div>
          <p className="font-medium">{room.name}</p>
          <p className="text-xs text-muted-foreground">{room.id.slice(0, 8)}</p>
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (room: Room) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium capitalize",
          room.type === 'lab' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
        )}>
          {room.type}
        </span>
      )
    },
    { key: 'capacity', header: 'Capacity' },
    { 
      key: 'building', 
      header: 'Location',
      render: (room: Room) => (
        <div>
          <p className="text-sm">{room.building}</p>
          <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
        </div>
      )
    },
    { 
      key: 'amenities', 
      header: 'Amenities',
      render: (room: Room) => (
        <div className="flex items-center gap-2">
          {room.hasProjector && (
            <div className="p-1.5 rounded bg-secondary" title="Projector">
              <Tv className="w-3 h-3 text-primary" />
            </div>
          )}
          {room.hasSmartBoard && (
            <div className="p-1.5 rounded bg-secondary" title="Smart Board">
              <Monitor className="w-3 h-3 text-accent" />
            </div>
          )}
          {room.hasAC && (
            <div className="p-1.5 rounded bg-secondary" title="Air Conditioning">
              <Snowflake className="w-3 h-3 text-info" />
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (room: Room) => <StatusBadge status={room.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (room: Room) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(room)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Rooms" subtitle="Manage lecture halls, labs, and seminar rooms" />
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
        <Header title="Rooms" subtitle="Manage lecture halls, labs, and seminar rooms" />
        <div className="p-6">
          <div className="text-destructive">Failed to load rooms. Please try again.</div>
        </div>
      </div>
    );
  }

  const roomData = rooms ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Rooms" 
        subtitle="Manage lecture halls, labs, and seminar rooms"
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">{roomData.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
              <span className="text-sm text-muted-foreground">Available:</span>
              <span className="font-semibold text-success">
                {roomData.filter(r => r.status === 'available').length}
              </span>
            </div>
          </div>
          
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>

        <ResourceFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search rooms by name, code, or building..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeOptions={typeOptions}
        />

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {roomData.length === 0 
              ? "No rooms found. Add your first room to get started."
              : "No rooms match your search criteria."}
          </div>
        ) : (
          <ResourceTable data={filteredData} columns={columns} />
        )}
      </div>

      <RoomFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        room={selectedRoom}
        isSubmitting={createRoom.isPending || updateRoom.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Room"
        description={`Are you sure you want to delete "${selectedRoom?.name}"? This action cannot be undone.`}
        isDeleting={deleteRoom.isPending}
      />
    </div>
  );
}
