-- Create enum types for status and role management
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');
CREATE TYPE public.room_type AS ENUM ('lecture', 'lab', 'seminar', 'auditorium');
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE public.faculty_status AS ENUM ('available', 'on_leave', 'busy');
CREATE TYPE public.staff_role AS ENUM ('lab_assistant', 'technician', 'admin_staff');
CREATE TYPE public.staff_shift AS ENUM ('morning', 'afternoon', 'full_day');
CREATE TYPE public.staff_status AS ENUM ('available', 'assigned', 'on_leave');
CREATE TYPE public.asset_type AS ENUM ('projector', 'computer', 'equipment', 'furniture');
CREATE TYPE public.asset_status AS ENUM ('working', 'broken', 'maintenance');
CREATE TYPE public.schedule_type AS ENUM ('lecture', 'lab', 'tutorial');
CREATE TYPE public.alert_type AS ENUM ('error', 'warning', 'info');

-- User roles table (for role-based access)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type room_type NOT NULL DEFAULT 'lecture',
  capacity INTEGER NOT NULL DEFAULT 30,
  building TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 0,
  has_projector BOOLEAN DEFAULT false,
  has_smart_board BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  status room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Faculty table
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  max_load INTEGER NOT NULL DEFAULT 18,
  current_load INTEGER NOT NULL DEFAULT 0,
  status faculty_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support staff table
CREATE TABLE public.support_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role staff_role NOT NULL DEFAULT 'lab_assistant',
  department TEXT NOT NULL,
  shift staff_shift NOT NULL DEFAULT 'full_day',
  status staff_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type asset_type NOT NULL,
  location TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  status asset_status NOT NULL DEFAULT 'working',
  assigned_to UUID REFERENCES public.support_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL DEFAULT 3,
  credit_hours INTEGER NOT NULL DEFAULT 3,
  requires_lab BOOLEAN DEFAULT false,
  requires_projector BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  stream TEXT NOT NULL,
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  size INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedules (timetable) table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type schedule_type NOT NULL DEFAULT 'lecture',
  assigned_staff_id UUID REFERENCES public.support_staff(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule warnings table
CREATE TABLE public.schedule_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  warning TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rooms (viewable by all authenticated, manageable by admin)
CREATE POLICY "Authenticated users can view rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for faculty
CREATE POLICY "Authenticated users can view faculty" ON public.faculty
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage faculty" ON public.faculty
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Faculty can update their own record" ON public.faculty
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for support_staff
CREATE POLICY "Authenticated users can view staff" ON public.support_staff
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage staff" ON public.support_staff
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for assets
CREATE POLICY "Authenticated users can view assets" ON public.assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage assets" ON public.assets
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for courses
CREATE POLICY "Authenticated users can view courses" ON public.courses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for batches
CREATE POLICY "Authenticated users can view batches" ON public.batches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage batches" ON public.batches
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for schedules
CREATE POLICY "Authenticated users can view schedules" ON public.schedules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage schedules" ON public.schedules
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for schedule_warnings
CREATE POLICY "Authenticated users can view warnings" ON public.schedule_warnings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage warnings" ON public.schedule_warnings
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for alerts
CREATE POLICY "Authenticated users can view alerts" ON public.alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL USING (public.is_admin(auth.uid()));

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_staff_updated_at BEFORE UPDATE ON public.support_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup (creates profile and default role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_schedules_day ON public.schedules(day);
CREATE INDEX idx_schedules_faculty ON public.schedules(faculty_id);
CREATE INDEX idx_schedules_batch ON public.schedules(batch_id);
CREATE INDEX idx_schedules_room ON public.schedules(room_id);
CREATE INDEX idx_faculty_department ON public.faculty(department);
CREATE INDEX idx_courses_department ON public.courses(department);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);