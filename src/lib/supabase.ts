import { createClient } from '@supabase/supabase-js';
import type { User, Program, Specialty, TrainingCenter, Rotation, Attendance, Skill, SkillEvaluation, Exam, ExamAttempt, Lecture, LectureAttendance, Notification, DashboardStats } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data as User;
};

// User Functions
export const getUsers = async (role?: string) => {
  let query = supabase.from('profiles').select('*');
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  return { data: data as User[] | null, error };
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data as User | null, error };
};

// Program Functions
export const getPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true);
  return { data: data as Program[] | null, error };
};

export const getProgramById = async (id: string) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data as Program | null, error };
};

// Specialty Functions
export const getSpecialties = async () => {
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .eq('is_active', true);
  return { data: data as Specialty[] | null, error };
};

// Training Center Functions
export const getTrainingCenters = async () => {
  const { data, error } = await supabase
    .from('training_centers')
    .select('*')
    .eq('status', 'active');
  return { data: data as TrainingCenter[] | null, error };
};

// Rotation Functions
export const getRotations = async (traineeId?: string) => {
  let query = supabase
    .from('rotations')
    .select('*, specialty:specialties(*), center:training_centers(*), supervisor:profiles(*)');
  if (traineeId) query = query.eq('trainee_id', traineeId);
  const { data, error } = await query;
  return { data: data as Rotation[] | null, error };
};

export const getCurrentRotation = async (traineeId: string) => {
  const { data, error } = await supabase
    .from('rotations')
    .select('*, specialty:specialties(*), center:training_centers(*), supervisor:profiles(*)')
    .eq('trainee_id', traineeId)
    .eq('status', 'active')
    .single();
  return { data: data as Rotation | null, error };
};

// Attendance Functions
export const getAttendance = async (userId: string, limit: number = 30) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .order('check_in_at', { ascending: false })
    .limit(limit);
  return { data: data as Attendance[] | null, error };
};

export const checkIn = async (userId: string, lat?: number, lng?: number) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      user_id: userId,
      check_in_lat: lat,
      check_in_lng: lng,
      status: 'present'
    })
    .select()
    .single();
  return { data: data as Attendance | null, error };
};

export const checkOut = async (attendanceId: string, lat?: number, lng?: number) => {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      check_out_at: new Date().toISOString(),
      check_out_lat: lat,
      check_out_lng: lng
    })
    .eq('id', attendanceId)
    .select()
    .single();
  return { data: data as Attendance | null, error };
};

// Skill Functions
export const getSkills = async (specialtyId?: string) => {
  let query = supabase.from('skills').select('*, specialty:specialties(*)');
  if (specialtyId) query = query.eq('specialty_id', specialtyId);
  const { data, error } = await query;
  return { data: data as Skill[] | null, error };
};

export const getSkillEvaluations = async (traineeId: string) => {
  const { data, error } = await supabase
    .from('skill_evaluations')
    .select('*, skill:skills(*, specialty:specialties(*)), trainer:profiles(*)')
    .eq('trainee_id', traineeId)
    .order('evaluation_date', { ascending: false });
  return { data: data as SkillEvaluation[] | null, error };
};

export const createSkillEvaluation = async (evaluation: Partial<SkillEvaluation>) => {
  const { data, error } = await supabase
    .from('skill_evaluations')
    .insert(evaluation)
    .select()
    .single();
  return { data: data as SkillEvaluation | null, error };
};

// Exam Functions
export const getExams = async (programId?: string) => {
  let query = supabase.from('exams').select('*').eq('is_published', true);
  if (programId) query = query.eq('program_id', programId);
  const { data, error } = await query;
  return { data: data as Exam[] | null, error };
};

export const getExamAttempts = async (traineeId: string) => {
  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*, exam:exams(*)')
    .eq('trainee_id', traineeId)
    .order('started_at', { ascending: false });
  return { data: data as ExamAttempt[] | null, error };
};

// Lecture Functions
export const getLectures = async (programId?: string) => {
  let query = supabase
    .from('lectures')
    .select('*, trainer:profiles(*)')
    .eq('is_published', true)
    .order('scheduled_at', { ascending: true });
  if (programId) query = query.eq('program_id', programId);
  const { data, error } = await query;
  return { data: data as Lecture[] | null, error };
};

export const getLectureAttendance = async (traineeId: string) => {
  const { data, error } = await supabase
    .from('lecture_attendance')
    .select('*, lecture:lectures(*)')
    .eq('trainee_id', traineeId);
  return { data: data as LectureAttendance[] | null, error };
};

// Notification Functions
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return { data: data as Notification[] | null, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { error };
};

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // This would be a RPC call in production
  // For now, return mock data
  return {
    totalTrainees: 156,
    totalTrainers: 42,
    totalCenters: 8,
    attendanceRate: 87,
    completionRate: 78,
    pendingEvaluations: 24,
    upcomingExams: 5
  };
};

// Admin Functions
export const createUser = async (userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();
  return { data: data as User | null, error };
};

export const updateUser = async (id: string, userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  return { data: data as User | null, error };
};

export const createProgram = async (programData: Partial<Program>) => {
  const { data, error } = await supabase
    .from('programs')
    .insert(programData)
    .select()
    .single();
  return { data: data as Program | null, error };
};

export const createTrainingCenter = async (centerData: Partial<TrainingCenter>) => {
  const { data, error } = await supabase
    .from('training_centers')
    .insert(centerData)
    .select()
    .single();
  return { data: data as TrainingCenter | null, error };
};

export const createRotation = async (rotationData: Partial<Rotation>) => {
  const { data, error } = await supabase
    .from('rotations')
    .insert(rotationData)
    .select()
    .single();
  return { data: data as Rotation | null, error };
};
