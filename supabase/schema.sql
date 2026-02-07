-- FellowFlow - Family Medicine Fellowship Management System
-- Supabase Database Schema
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'trainer', 'trainee', 'observer', 'alumni');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive', 'graduated');
CREATE TYPE rotation_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled', 'on_hold');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused');
CREATE TYPE evaluation_status AS ENUM ('pending', 'in_progress', 'completed', 'approved');
CREATE TYPE exam_type AS ENUM ('mcq', 'essay', 'practical', 'oral', 'mixed');

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Centers
CREATE TABLE training_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  center_name TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  status user_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  program_name TEXT NOT NULL,
  duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 7),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialties
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty_name TEXT NOT NULL UNIQUE,
  specialty_code TEXT UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program Structure
CREATE TABLE program_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id) ON DELETE CASCADE,
  year_number INTEGER NOT NULL CHECK (year_number BETWEEN 1 AND 7),
  duration_weeks INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT TRUE,
  UNIQUE(program_id, specialty_id, year_number)
);

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  fellowship_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'trainee',
  status user_status DEFAULT 'pending',
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  current_year INTEGER DEFAULT 1,
  current_specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  current_center_id UUID REFERENCES training_centers(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRAINING MANAGEMENT
-- ============================================

-- Rotations
CREATE TABLE rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id) ON DELETE CASCADE,
  center_id UUID REFERENCES training_centers(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status rotation_status DEFAULT 'scheduled',
  completion_percentage INTEGER DEFAULT 0,
  required_hours INTEGER DEFAULT 240,
  completed_hours INTEGER DEFAULT 0,
  final_score INTEGER,
  is_passed BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rotation_id UUID REFERENCES rotations(id) ON DELETE SET NULL,
  check_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMP WITH TIME ZONE,
  check_in_lat DOUBLE PRECISION,
  check_in_lng DOUBLE PRECISION,
  check_in_distance_meters INTEGER,
  duration_minutes INTEGER,
  status attendance_status DEFAULT 'present',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVALUATION SYSTEM
-- ============================================

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  required_for_completion BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Evaluations (DOPs)
CREATE TABLE skill_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rotation_id UUID REFERENCES rotations(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 5),
  feedback TEXT,
  status evaluation_status DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXAMINATION SYSTEM
-- ============================================

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam_type exam_type DEFAULT 'mcq',
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  pass_percentage INTEGER DEFAULT 60,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Attempts
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER,
  percentage DECIMAL(5,2),
  is_passed BOOLEAN,
  status evaluation_status DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEARNING MANAGEMENT
-- ============================================

-- Lectures
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_link TEXT,
  is_mandatory BOOLEAN DEFAULT FALSE,
  is_recorded BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lecture Attendance
CREATE TABLE lecture_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  attended_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  UNIQUE(lecture_id, trainee_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Trainers can view assigned trainees" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer'
    ) OR auth.uid() = id
  );

-- Rotations RLS Policies
CREATE POLICY "Trainees can view own rotations" ON rotations
  FOR SELECT USING (trainee_id = auth.uid());

CREATE POLICY "Trainers can view supervised rotations" ON rotations
  FOR SELECT USING (
    supervisor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Attendance RLS Policies
CREATE POLICY "Users can view own attendance" ON attendance
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Trainers can view trainee attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin', 'super_admin')
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Default Organization
INSERT INTO organizations (name, code, description) VALUES
('Family Medicine Fellowship Program', 'FMFP', 'Default organization for Family Medicine Fellowship');

-- Default Specialties
INSERT INTO specialties (specialty_name, specialty_code, category) VALUES
('Family Medicine - Outpatient', 'FM-OP', 'primary_care'),
('Internal Medicine', 'IM', 'medical'),
('General Surgery', 'GS', 'surgical'),
('Pediatrics', 'PED', 'medical'),
('Obstetrics & Gynecology', 'OBGYN', 'surgical'),
('Emergency Medicine', 'ER', 'medical'),
('Community Medicine', 'CM', 'preventive'),
('Cardiology', 'CARD', 'medical'),
('Pulmonology', 'PULM', 'medical'),
('Endocrinology', 'ENDO', 'medical'),
('Dermatology', 'DERM', 'medical'),
('Psychiatry', 'PSYCH', 'medical'),
('Orthopedics', 'ORTHO', 'surgical'),
('Ophthalmology', 'OPHTH', 'surgical'),
('ENT', 'ENT', 'surgical');

-- Default Program
INSERT INTO programs (program_name, duration_years, description, is_active) VALUES
('Family Medicine Fellowship', 3, 'Three-year family medicine fellowship program', TRUE);

-- Default Training Centers
INSERT INTO training_centers (center_name, governorate, status) VALUES
('Cairo University Hospital', 'Cairo', 'active'),
('Alexandria Main Hospital', 'Alexandria', 'active'),
('Mansoura Medical Center', 'Dakahlia', 'active');
