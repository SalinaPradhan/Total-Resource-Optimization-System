
ALTER TABLE public.batches
  ADD COLUMN discipline text NOT NULL DEFAULT 'B.Tech',
  ADD COLUMN branch text NOT NULL DEFAULT '',
  ADD COLUMN sub_branch text,
  ADD COLUMN section text NOT NULL DEFAULT 'A',
  ADD COLUMN class_start_time time,
  ADD COLUMN class_end_time time;

UPDATE public.batches SET branch = stream WHERE branch = '';
