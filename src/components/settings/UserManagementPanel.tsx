import { useState } from 'react';
import { useUsers, useUpdateUserRole } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, Users, GraduationCap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppRole = 'super_admin' | 'admin' | 'faculty' | 'student';

const roleConfig: Record<AppRole, { icon: React.ElementType; color: string; label: string }> = {
  super_admin: { icon: Crown, color: 'bg-warning/20 text-warning border-warning/30', label: 'Super Admin' },
  admin: { icon: Shield, color: 'bg-destructive/20 text-destructive border-destructive/30', label: 'Coordinator' },
  faculty: { icon: Users, color: 'bg-primary/20 text-primary border-primary/30', label: 'Faculty' },
  student: { icon: GraduationCap, color: 'bg-accent/20 text-accent border-accent/30', label: 'Student' },
};

export function UserManagementPanel() {
  const { user, isSuperAdmin } = useAuth();
  const { data: users, isLoading, error } = useUsers();
  const updateRole = useUpdateUserRole();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingUserId(userId);
    try {
      await updateRole.mutateAsync({ userId, newRole });
    } finally {
      setUpdatingUserId(null);
    }
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

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          Failed to load users: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>
          Manage user roles: Super Admins have global access, Coordinators (Admin) manage assigned batches, Faculty view schedules, Students view their batch schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((userRecord) => {
                const role = (userRecord.role as AppRole) || 'student';
                const config = roleConfig[role] || roleConfig.student;
                const Icon = config.icon;
                const isCurrentUser = userRecord.id === user?.id;

                return (
                  <TableRow key={userRecord.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {(userRecord.full_name || userRecord.email).charAt(0).toUpperCase()}
                        </div>
                        <span>{userRecord.full_name || 'No name'}</span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {userRecord.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1 border', config.color)}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {updatingUserId === userRecord.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Select
                          value={role}
                          onValueChange={(value) => handleRoleChange(userRecord.id, value as AppRole)}
                          disabled={isCurrentUser || !isSuperAdmin}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Coordinator</SelectItem>
                            <SelectItem value="faculty">Faculty</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {isCurrentUser && (
                        <p className="text-xs text-muted-foreground mt-1">Can't change own role</p>
                      )}
                      {!isSuperAdmin && !isCurrentUser && (
                        <p className="text-xs text-muted-foreground mt-1">Only Super Admins can change roles</p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found
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
