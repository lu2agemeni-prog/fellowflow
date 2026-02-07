import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  BookOpen, 
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Plus
} from 'lucide-react';
import type { User, Program, TrainingCenter, DashboardStats } from '@/types';
import { getUsers, getPrograms, getTrainingCenters, getDashboardStats } from '@/lib/supabase';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersData, programsData, centersData, statsData] = await Promise.all([
        getUsers(),
        getPrograms(),
        getTrainingCenters(),
        getDashboardStats(),
      ]);
      
      setUsers(usersData.data || []);
      setPrograms(programsData.data || []);
      setCenters(centersData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainees = users.filter(u => u.role === 'trainee');
  const trainers = users.filter(u => u.role === 'trainer');
  // const admins = users.filter(u => u.role === 'admin');

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
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-500">نظرة عامة على النظام والإحصائيات</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المتدربين</p>
                <p className="text-2xl font-bold">{trainees.length}</p>
                <p className="text-xs text-green-600">+12 هذا الشهر</p>
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
                <p className="text-sm text-gray-500">المدربين</p>
                <p className="text-2xl font-bold">{trainers.length}</p>
                <p className="text-xs text-green-600">+3 هذا الشهر</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المراكز</p>
                <p className="text-2xl font-bold">{centers.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">البرامج</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            تقدم البرامج
          </CardTitle>
        </CardHeader>
        <CardContent>
          {programs.map((program) => (
            <div key={program.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{program.program_name}</h3>
                  <p className="text-sm text-gray-500">
                    {program.duration_years} سنوات • {trainees.filter(t => t.program_id === program.id).length} متدرب
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">78%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>السنة 1: 52</span>
                <span>السنة 2: 48</span>
                <span>السنة 3: 56</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="centers">المراكز</TabsTrigger>
          <TabsTrigger value="activity">النشاط الأخير</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المستخدمين</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.slice(0, 5).map((userItem) => (
                  <div 
                    key={userItem.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {getInitials(userItem.full_name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{userItem.full_name}</p>
                        <p className="text-sm text-gray-500">{userItem.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={userItem.status === 'active' ? 'default' : 'secondary'}>
                        {userItem.role === 'trainee' ? 'متدرب' : 
                         userItem.role === 'trainer' ? 'مدرب' : 'مدير'}
                      </Badge>
                      <Button variant="ghost" size="sm">عرض</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المراكز التدريبية</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {centers.map((center) => (
                  <div 
                    key={center.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{center.center_name}</p>
                      <p className="text-sm text-gray-500">{center.governorate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={center.status === 'active' ? 'default' : 'secondary'}>
                        {center.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Button variant="ghost" size="sm">عرض</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm">تم إضافة متدرب جديد: د. سارة أحمد</p>
                    <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm">تم اعتماد 15 سجل حضور</p>
                    <p className="text-xs text-gray-500">منذ ساعة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm">تم إكمال 8 تقييمات مهارات</p>
                    <p className="text-xs text-gray-500">منذ 3 ساعات</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm">تم نشر محاضرة جديدة</p>
                    <p className="text-xs text-gray-500">منذ 5 ساعات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
