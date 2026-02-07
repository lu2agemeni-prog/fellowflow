import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  FileText, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import type { Rotation, SkillEvaluation, ExamAttempt, Lecture, DashboardStats } from '@/types';
import { getCurrentRotation, getSkillEvaluations, getExamAttempts, getLectures, getDashboardStats } from '@/lib/supabase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentRotation, setCurrentRotation] = useState<Rotation | null>(null);
  const [skillEvaluations, setSkillEvaluations] = useState<SkillEvaluation[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [rotationData, skillsData, examsData, lecturesData, statsData] = await Promise.all([
          getCurrentRotation(user.id),
          getSkillEvaluations(user.id),
          getExamAttempts(user.id),
          getLectures(),
          getDashboardStats(),
        ]);

        setCurrentRotation(rotationData.data);
        setSkillEvaluations(skillsData.data || []);
        setExamAttempts(examsData.data || []);
        setUpcomingLectures(lecturesData.data?.slice(0, 3) || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const completedSkills = skillEvaluations.filter(e => e.status === 'completed' || e.status === 'approved').length;
  const totalSkills = 20; // This would come from the program structure
  const skillsProgress = Math.round((completedSkills / totalSkills) * 100);

  const passedExams = examAttempts.filter(e => e.is_passed).length;
  const totalExams = examAttempts.length || 1;
  const examsProgress = Math.round((passedExams / totalExams) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، د. {user?.full_name?.split(' ')[0] || 'أحمد'} 👋</h1>
          <p className="text-gray-500">إليك ملخص تقدمك في البرنامج</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نسبة الحضور</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +5% هذا الشهر
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المهارات</p>
                <p className="text-2xl font-bold">{completedSkills}/{totalSkills}</p>
                <Progress value={skillsProgress} className="h-2 w-20 mt-1" />
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">الاختبارات</p>
                <p className="text-2xl font-bold">{passedExams}/{totalExams}</p>
                <Progress value={examsProgress} className="h-2 w-20 mt-1" />
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">التقدم العام</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-gray-400">السنة {user?.current_year || 1}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Rotation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                التخصص الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRotation ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{currentRotation.specialty?.specialty_name}</h3>
                      <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {currentRotation.center?.center_name}
                      </p>
                      {currentRotation.supervisor && (
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          المشرف: د. {currentRotation.supervisor.full_name}
                        </p>
                      )}
                    </div>
                    <Badge variant={currentRotation.status === 'active' ? 'default' : 'secondary'}>
                      {currentRotation.status === 'active' ? 'نشط' : 'مجدول'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>التقدم في التخصص</span>
                      <span>{currentRotation.completion_percentage}%</span>
                    </div>
                    <Progress value={currentRotation.completion_percentage} className="h-3" />
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>بدأ: {new Date(currentRotation.start_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>ينتهي: {new Date(currentRotation.end_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">تفاصيل التخصص</Button>
                    <Button variant="outline" size="sm">تواصل مع المشرف</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا يوجد تخصص نشط حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                جدول اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 text-center">
                    <p className="font-semibold">09:00</p>
                    <p className="text-xs text-gray-500">ص</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">عيادة صباحية</p>
                    <p className="text-sm text-gray-500">قسم الطوارئ</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-16 text-center">
                    <p className="font-semibold">14:00</p>
                    <p className="text-xs text-gray-500">م</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">محاضرة: أمراض القلب</p>
                    <p className="text-sm text-gray-500">د. خالد محمود</p>
                  </div>
                  <Button size="sm">الانضمام</Button>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="w-16 text-center">
                    <p className="font-semibold">16:00</p>
                    <p className="text-xs text-gray-500">م</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">تقييم مهارة</p>
                    <p className="text-sm text-gray-500">فحص القلب</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>المهام المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 مهارات بانتظار التقييم</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">اختبار نهائي يوم الخميس</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">تسليم تقرير حالة</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Lectures */}
          <Card>
            <CardHeader>
              <CardTitle>محاضرات قادمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingLectures.length > 0 ? (
                  upcomingLectures.map((lecture) => (
                    <div key={lecture.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={lecture.trainer?.avatar_url} />
                        <AvatarFallback>{lecture.trainer?.full_name ? getInitials(lecture.trainer.full_name) : 'T'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lecture.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lecture.scheduled_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد محاضرات قادمة</p>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4" size="sm">
                عرض جميع المحاضرات
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">تسجيل حضور</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">طلب تقييم</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">مكتبة الموارد</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">تقريري</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
