-- Add batch_id column to profiles table for students to save their batch preference
ALTER TABLE public.profiles 
ADD COLUMN batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_profiles_batch_id ON public.profiles(batch_id);

-- Allow users to update their own batch_id
-- (existing "Users can update their own profile" policy already covers this)