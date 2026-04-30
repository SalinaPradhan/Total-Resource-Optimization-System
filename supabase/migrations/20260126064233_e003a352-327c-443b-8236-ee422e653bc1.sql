-- Create faculty availability preferences table
CREATE TABLE public.faculty_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('preferred', 'available', 'unavailable')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_faculty_day_time UNIQUE (faculty_id, day_of_week, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.faculty_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for faculty availability
CREATE POLICY "Anyone can view faculty availability"
  ON public.faculty_availability
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert faculty availability"
  ON public.faculty_availability
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update faculty availability"
  ON public.faculty_availability
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete faculty availability"
  ON public.faculty_availability
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faculty_availability_updated_at
  BEFORE UPDATE ON public.faculty_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_faculty_availability_faculty_id ON public.faculty_availability(faculty_id);
CREATE INDEX idx_faculty_availability_day ON public.faculty_availability(day_of_week);