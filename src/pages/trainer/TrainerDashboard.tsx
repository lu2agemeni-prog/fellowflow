import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  TrendingUp,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import type { User, SkillEvaluation, DashboardStats } from '@/types';
import { getUsers, getSkillEvaluations, getDashboardStats } from '@/lib/supabase';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myTrainees, setMyTrainees] = useState<User[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<SkillEvaluation[]>([]);
  const [, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [traineesData, evaluationsData, statsData] = await Promise.all([
        getUsers('trainee'),
        getSkillEvaluations(user.id),
        getDashboardStats(),
      ]);
      
      // Filter trainees assigned to this trainer (mock logic)
      setMyTrainees(traineesData.data?.slice(0, 5) || []);
      
      // Get pending evaluations
      setPendingEvaluations(evaluationsData.data?.filter(e => e.status === 'pending') || []);
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching trainer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، د. {user?.full_name?.split(' ')[0] || 'محمد'} 👋</h1>
          <p className="text-gray-500">نظرة عامة على متدربيك والمهام المعلقة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المتدربين</p>
                <p className="text-2xl font-bold">{myTrainees.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">بانتظار الاعتماد</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تقييمات معلقة</p>
                <p className="text-2xl font-bold">{pendingEvaluations.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">محاضرات هذا الشهر</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Trainees */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                متدربي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTrainees.map((trainee) => (
                  <div 
                    key={trainee.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={trainee.avatar_url} />
                        <AvatarFallback>{getInitials(trainee.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{trainee.full_name}</p>
                        <p className="text-sm text-gray-500">
                          رقم الزمالة: {trainee.fellowship_number || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm text-gray-500">الحضور</p>
                        <p className="font-semibold">90%</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-500">المهارات</p>
                        <p className="font-semibold">15/20</p>
                      </div>
                      <Button variant="outline" size="sm">عرض الملف</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>مهام معلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 سجلات حضور بانتظار الاعتماد</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">2 تقييمات مهارات بانتظار المراجعة</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">محاضرة غداً: أمراض القلب</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </div>
              </div>
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
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs">اعتماد الحضور</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">تقييم مهارة</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">إضافة محاضرة</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">التقارير</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
