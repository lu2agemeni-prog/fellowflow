import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Play,
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';
import type { Exam, ExamAttempt } from '@/types';
import { getExams, getExamAttempts } from '@/lib/supabase';

export const Exams: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [examsData, attemptsData] = await Promise.all([
        getExams(),
        getExamAttempts(user.id),
      ]);
      setExams(examsData.data || []);
      setAttempts(attemptsData.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const upcomingExams = exams.filter(e => {
    if (!e.available_from) return true;
    return new Date(e.available_from) > now;
  });

  const availableExams = exams.filter(e => {
    if (!e.available_from || !e.available_until) return false;
    const from = new Date(e.available_from);
    const until = new Date(e.available_until);
    return from <= now && until >= now;
  });

  const passedExams = attempts.filter(a => a.is_passed).length;
  const totalAttempts = attempts.length || 1;
  const passRate = Math.round((passedExams / totalAttempts) * 100);
  const averageScore = attempts.length > 0 
    ? Math.round((attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length) * 10) / 10
    : 0;

  const getExamTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mcq: 'اختيار من متعدد',
      essay: 'مقالي',
      practical: 'عملي',
      oral: 'شفوي',
      mixed: 'مختلط',
    };
    return types[type] || type;
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
          <h1 className="text-2xl font-bold">الاختبارات والتقييمات</h1>
          <p className="text-gray-500">إدارة الاختبارات ومتابعة النتائج</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{exams.length}</p>
            <p className="text-sm text-gray-500">إجمالي الاختبارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{passedExams}</p>
            <p className="text-sm text-gray-500">ناجح</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{passRate}%</p>
            <p className="text-sm text-gray-500">نسبة النجاح</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{averageScore}%</p>
            <p className="text-sm text-gray-500">متوسط الدرجات</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="available">متاح الآن</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingExams.length > 0 ? (
            upcomingExams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <Badge variant="outline">{getExamTypeLabel(exam.exam_type)}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {exam.available_from 
                              ? new Date(exam.available_from).toLocaleDateString('ar-SA')
                              : 'غير محدد'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{exam.duration_minutes} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{exam.total_marks} درجة</span>
                        </div>
                      </div>

                      {exam.pass_percentage && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>درجة النجاح: {exam.pass_percentage}%</span>
                          </div>
                          <Progress value={exam.pass_percentage} className="h-2 w-48" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">
                        <Clock className="h-3 w-3 ml-1" />
                        قريباً
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد اختبارات قادمة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableExams.length > 0 ? (
            availableExams.map((exam) => {
              const hasAttempted = attempts.some(a => a.exam_id === exam.id);
              
              return (
                <Card key={exam.id} className="border-green-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{exam.title}</h3>
                          <Badge variant="outline">{getExamTypeLabel(exam.exam_type)}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{exam.duration_minutes} دقيقة</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{exam.total_marks} درجة</span>
                          </div>
                        </div>

                        {exam.available_until && (
                          <p className="text-sm text-red-500 mt-2">
                            متاح حتى: {new Date(exam.available_until).toLocaleString('ar-SA')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {hasAttempted ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                            تم التقدم
                          </Badge>
                        ) : (
                          <Button className="gap-2">
                            <Play className="h-4 w-4" />
                            بدء الاختبار
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد اختبارات متاحة حالياً</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {attempts.length > 0 ? (
            attempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{attempt.exam?.title}</h3>
                        {attempt.exam && (
                          <Badge variant="outline">{getExamTypeLabel(attempt.exam.exam_type)}</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(attempt.started_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {attempt.submitted_at 
                              ? Math.round((new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)
                              : 0
                            } دقيقة
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {attempt.total_score}/{attempt.exam?.total_marks}
                        </p>
                        <p className="text-sm text-gray-500">{attempt.percentage}%</p>
                      </div>
                      
                      {attempt.is_passed ? (
                        <Badge className="bg-green-500 px-3 py-1">
                          <CheckCircle2 className="h-4 w-4 ml-1" />
                          ناجح
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="px-3 py-1">
                          <XCircle className="h-4 w-4 ml-1" />
                          راسب
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Feedback section - can be added when feedback field is available */}

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      عرض النتيجة
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      مراجعة الأخطاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لم تقم بأي اختبارات بعد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
