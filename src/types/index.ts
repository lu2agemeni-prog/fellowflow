// User Types
export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'trainee' | 'observer' | 'alumni';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'inactive' | 'graduated';

export interface User {
  id: string;
  email: string;
  full_name: string;
  fellowship_number?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  program_id?: string;
  current_year?: number;
  current_center_id?: string;
  created_at: string;
}

// Program Types
export interface Program {
  id: string;
  program_name: string;
  duration_years: number;
  description?: string;
  is_active: boolean;
}

export interface Specialty {
  id: string;
  specialty_name: string;
  specialty_code?: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

export interface ProgramStructure {
  id: string;
  program_id: string;
  specialty_id: string;
  year_number: number;
  duration_weeks: number;
  order_index: number;
  is_mandatory: boolean;
  specialty?: Specialty;
}

// Training Center Types
export interface TrainingCenter {
  id: string;
  center_name: string;
  governorate: string;
  address?: string;
  location_lat?: number;
  location_lng?: number;
  status: UserStatus;
}

// Rotation Types
export type RotationStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'on_hold';

export interface Rotation {
  id: string;
  trainee_id: string;
  specialty_id: string;
  center_id: string;
  supervisor_id?: string;
  start_date: string;
  end_date: string;
  status: RotationStatus;
  completion_percentage: number;
  required_hours: number;
  completed_hours: number;
  final_score?: number;
  is_passed?: boolean;
  specialty?: Specialty;
  center?: TrainingCenter;
  supervisor?: User;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface Attendance {
  id: string;
  user_id: string;
  rotation_id?: string;
  check_in_at: string;
  check_out_at?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_in_distance_meters?: number;
  duration_minutes?: number;
  status: AttendanceStatus;
  is_verified: boolean;
}

// Skill Types
export interface Skill {
  id: string;
  specialty_id?: string;
  skill_name: string;
  description?: string;
  category?: string;
  difficulty_level?: number;
  required_for_completion: boolean;
  specialty?: Specialty;
}

export type EvaluationStatus = 'pending' | 'in_progress' | 'completed' | 'approved';

export interface SkillEvaluation {
  id: string;
  skill_id: string;
  trainee_id: string;
  trainer_id: string;
  rotation_id?: string;
  evaluation_date: string;
  overall_score: number;
  feedback?: string;
  status: EvaluationStatus;
  skill?: Skill;
  trainer?: User;
}

// Exam Types
export type ExamType = 'mcq' | 'essay' | 'practical' | 'oral' | 'mixed';

export interface Exam {
  id: string;
  title: string;
  exam_type: ExamType;
  duration_minutes: number;
  total_marks: number;
  pass_percentage: number;
  available_from?: string;
  available_until?: string;
  is_published: boolean;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  trainee_id: string;
  started_at: string;
  submitted_at?: string;
  total_score?: number;
  percentage?: number;
  is_passed?: boolean;
  status: EvaluationStatus;
  exam?: Exam;
}

// Lecture Types
export interface Lecture {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  trainer_id?: string;
  meeting_link?: string;
  is_mandatory: boolean;
  is_recorded: boolean;
  trainer?: User;
}

export interface LectureAttendance {
  id: string;
  lecture_id: string;
  trainee_id: string;
  attended: boolean;
  attended_at?: string;
  time_spent_minutes?: number;
  lecture?: Lecture;
}

// Notification Types
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalTrainees: number;
  totalTrainers: number;
  totalCenters: number;
  attendanceRate: number;
  completionRate: number;
  pendingEvaluations: number;
  upcomingExams: number;
}

// Auth Types
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}
