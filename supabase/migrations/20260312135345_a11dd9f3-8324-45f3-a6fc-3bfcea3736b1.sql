
-- Create coordinator_assignments junction table
CREATE TABLE public.coordinator_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, batch_id)
);

-- Enable RLS
ALTER TABLE public.coordinator_assignments ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all assignments
CREATE POLICY "Super admins can manage coordinator assignments"
  ON public.coordinator_assignments
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Admins (coordinators) can view their own assignments
CREATE POLICY "Coordinators can view own assignments"
  ON public.coordinator_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Update is_admin to also return true for super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'super_admin')
$$;
