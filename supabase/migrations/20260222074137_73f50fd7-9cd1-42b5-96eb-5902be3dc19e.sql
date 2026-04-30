
-- Create swap request status enum
CREATE TYPE public.swap_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create swap_requests table
CREATE TABLE public.swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  current_day TEXT NOT NULL,
  current_start_time TEXT NOT NULL,
  current_end_time TEXT NOT NULL,
  requested_day TEXT NOT NULL,
  requested_start_time TEXT NOT NULL,
  requested_end_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  status public.swap_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Faculty can view their own swap requests
CREATE POLICY "Faculty can view own swap requests"
ON public.swap_requests FOR SELECT
TO authenticated
USING (
  faculty_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Faculty can create swap requests for their own schedules
CREATE POLICY "Faculty can create own swap requests"
ON public.swap_requests FOR INSERT
TO authenticated
WITH CHECK (
  faculty_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid())
);

-- Only admins can update swap requests (approve/reject)
CREATE POLICY "Admins can update swap requests"
ON public.swap_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Faculty can delete their own pending requests
CREATE POLICY "Faculty can delete own pending requests"
ON public.swap_requests FOR DELETE
TO authenticated
USING (
  faculty_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid())
  AND status = 'pending'
);

-- Trigger for updated_at
CREATE TRIGGER update_swap_requests_updated_at
BEFORE UPDATE ON public.swap_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
