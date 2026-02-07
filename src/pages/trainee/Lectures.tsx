import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Play, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Download
} from 'lucide-react';
import type { Lecture } from '@/types';
import { getLectures } from '@/lib/supabase';

export const Lectures: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const { data } = await getLectures();
      setLectures(data || []);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const upcomingLectures = lectures.filter(l => new Date(l.scheduled_at) > now);
  const pastLectures = lectures.filter(l => new Date(l.scheduled_at) <= now);
  const recordedLectures = lectures.filter(l => l.is_recorded);

  const filteredLectures = (lecturesToFilter: Lecture[]) => {
    if (!searchQuery) return lecturesToFilter;
    return lecturesToFilter.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.trainer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getLectureStatus = (lecture: Lecture) => {
    const lectureDate = new Date(lecture.scheduled_at);
    const diffHours = (lectureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (lectureDate < now) return 'completed';
    if (diffHours < 24) return 'soon';
    return 'upcoming';
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
          <h1 className="text-2xl font-bold">المحاضرات والدورات</h1>
          <p className="text-gray-500">حضور المحاضرات والدورات التدريبية</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في المحاضرات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{lectures.length}</p>
            <p className="text-sm text-gray-500">إجمالي المحاضرات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{upcomingLectures.length}</p>
            <p className="text-sm text-gray-500">قادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pastLectures.length}</p>
            <p className="text-sm text-gray-500">مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{recordedLectures.length}</p>
            <p className="text-sm text-gray-500">مسجلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="past">السابقة</TabsTrigger>
          <TabsTrigger value="recorded">مسجلة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredLectures(upcomingLectures).length > 0 ? (
            filteredLectures(upcomingLectures).map((lecture) => {
              const status = getLectureStatus(lecture);
              
              return (
                <Card key={lecture.id} className={status === 'soon' ? 'border-blue-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{lecture.title}</h3>
                          {lecture.is_mandatory && (
                            <Badge variant="destructive">إلزامي</Badge>
                          )}
                          {status === 'soon' && (
                            <Badge className="bg-blue-500">قريباً</Badge>
                          )}
                        </div>
                        
                        {lecture.description && (
                          <p className="text-gray-600 mb-4">{lecture.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(lecture.scheduled_at).toLocaleDateString('ar-SA', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(lecture.scheduled_at).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {' - '}
                              {new Date(new Date(lecture.scheduled_at).getTime() + lecture.duration_minutes * 60000).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {lecture.trainer && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>د. {lecture.trainer.full_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lecture.meeting_link && (
                          <Button className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            الانضمام
                          </Button>
                        )}
                        <Button variant="outline" size="icon">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد محاضرات قادمة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredLectures(pastLectures).length > 0 ? (
            filteredLectures(pastLectures).map((lecture) => (
              <Card key={lecture.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{lecture.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(lecture.scheduled_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        {lecture.trainer && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>د. {lecture.trainer.full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        تم الحضور
                      </Badge>
                      {lecture.is_recorded && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Play className="h-4 w-4" />
                          مشاهدة
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد محاضرات سابقة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recorded" className="space-y-4">
          {filteredLectures(recordedLectures).length > 0 ? (
            filteredLectures(recordedLectures).map((lecture) => (
              <Card key={lecture.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{lecture.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(lecture.scheduled_at).toLocaleDateString('ar-SA')}
                        {lecture.trainer && ` • د. ${lecture.trainer.full_name}`}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2">
                          <Play className="h-4 w-4" />
                          تشغيل
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد محاضرات مسجلة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredLectures(lectures).length > 0 ? (
            filteredLectures(lectures).map((lecture) => (
              <Card key={lecture.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{lecture.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(lecture.scheduled_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {new Date(lecture.scheduled_at) > now ? (
                      <Badge>قادمة</Badge>
                    ) : (
                      <Badge variant="secondary">مكتملة</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد محاضرات</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
