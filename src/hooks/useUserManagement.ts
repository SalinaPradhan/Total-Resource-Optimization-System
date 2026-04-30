import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'super_admin' | 'admin' | 'faculty' | 'student';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async (): Promise<UserWithRole[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles separately since we can't join across RLS boundaries easily
      const userIds = data.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role as AppRole]) || []);

      return data.map(profile => ({
        ...profile,
        role: roleMap.get(profile.id) || 'student',
      }));
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { newRole }) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update role',
        description: error.message,
      });
    },
  });
}
