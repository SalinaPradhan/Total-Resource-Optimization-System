import { useState } from 'react';
import {
  useCoordinatorAssignments,
  useCreateCoordinatorAssignment,
  useDeleteCoordinatorAssignment,
} from '@/hooks/useCoordinatorAssignments';
import { useUsers } from '@/hooks/useUserManagement';
import { useBatches } from '@/hooks/useBatches';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Crown, Link } from 'lucide-react';

export function CoordinatorAssignmentPanel() {
  const { data: assignments, isLoading } = useCoordinatorAssignments();
  const { data: users } = useUsers();
  const { data: batches } = useBatches();
  const createAssignment = useCreateCoordinatorAssignment();
  const deleteAssignment = useDeleteCoordinatorAssignment();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // Only show users who are admins (coordinators)
  const coordinatorUsers = users?.filter(u => u.role === 'admin') ?? [];
  const allBatches = batches ?? [];

  const handleAssign = async () => {
    if (!selectedUserId || !selectedBatchId) return;
    await createAssignment.mutateAsync({ userId: selectedUserId, batchId: selectedBatchId });
    setSelectedUserId('');
    setSelectedBatchId('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-warning" />
          Coordinator Batch Assignments
        </CardTitle>
        <CardDescription>
          Assign batch coordinators (Admin role) to specific batches. Coordinators can only manage resources within their assigned batches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment form */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Coordinator</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select coordinator..." />
              </SelectTrigger>
              <SelectContent>
                {coordinatorUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
                {coordinatorUsers.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No users with Admin role found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Batch</label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch..." />
              </SelectTrigger>
              <SelectContent>
                {allBatches.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.discipline} - {b.branch} - {b.name} (Sec {b.section})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedUserId || !selectedBatchId || createAssignment.isPending}
          >
            {createAssignment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Assign
          </Button>
        </div>

        {/* Assignments table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coordinator</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Discipline / Branch</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assignments ?? []).map(a => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {(a.user_name || a.user_email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{a.user_name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground">{a.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{a.batch_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">{a.batch_discipline}</Badge>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-sm">{a.batch_branch}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-secondary text-secondary-foreground">{a.batch_section}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAssignment.mutate(a.id)}
                      disabled={deleteAssignment.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!assignments || assignments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Link className="w-8 h-8 text-muted-foreground/50" />
                      <p>No coordinator assignments yet</p>
                      <p className="text-xs">Assign coordinators to batches above</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
