import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Navigation
} from 'lucide-react';
import type { Attendance as AttendanceType } from '@/types';
import { getAttendance, checkIn, checkOut } from '@/lib/supabase';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceType[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchAttendance();
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [user]);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      const { data } = await getAttendance(user.id, 30);
      setAttendanceRecords(data || []);
      
      // Check if already checked in today
      const today = new Date().toDateString();
      const todayRecord = data?.find(record => 
        new Date(record.check_in_at).toDateString() === today
      );
      setTodayAttendance(todayRecord || null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setCheckingIn(true);
    setError('');

    try {
      const { data, error } = await checkIn(user.id, location?.lat, location?.lng);
      if (error) throw error;
      setTodayAttendance(data);
      await fetchAttendance();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الحضور');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !todayAttendance) return;
    setCheckingOut(true);
    setError('');

    try {
      const { data, error } = await checkOut(todayAttendance.id, location?.lat, location?.lng);
      if (error) throw error;
      setTodayAttendance(data);
      await fetchAttendance();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الانصراف');
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500">حاضر</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500">متأخر</Badge>;
      case 'absent':
        return <Badge variant="destructive">غائب</Badge>;
      case 'excused':
        return <Badge variant="secondary">معذور</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'late':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Calculate stats
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalDays = attendanceRecords.length || 1;
  const attendanceRate = Math.round(((presentDays + lateDays) / totalDays) * 100);

  // Generate calendar days for current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getDayStatus = (day: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const record = attendanceRecords.find(r => 
      new Date(r.check_in_at).toDateString() === date.toDateString()
    );
    return record?.status;
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
        <h1 className="text-2xl font-bold">سجل الحضور والانصراف</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Today's Status */}
      <Card className={todayAttendance ? 'border-green-500' : ''}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                {todayAttendance ? 'تم تسجيل الحضور اليوم' : 'تسجيل الحضور'}
              </h2>
              <p className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('ar-SA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {location && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  الموقع: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {!todayAttendance ? (
                <Button 
                  onClick={handleCheckIn} 
                  disabled={checkingIn}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {checkingIn ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  )}
                  تسجيل حضور
                </Button>
              ) : !todayAttendance.check_out_at ? (
                <Button 
                  onClick={handleCheckOut} 
                  disabled={checkingOut}
                  variant="outline"
                >
                  {checkingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                  ) : (
                    <Clock className="h-4 w-4 ml-2" />
                  )}
                  تسجيل انصراف
                </Button>
              ) : (
                <Badge className="bg-green-500 text-white px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                  تم إكمال اليوم
                </Badge>
              )}
            </div>
          </div>

          {todayAttendance && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">وقت الحضور</p>
                  <p className="font-semibold">
                    {new Date(todayAttendance.check_in_at).toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {todayAttendance.check_out_at && (
                  <div>
                    <p className="text-sm text-gray-500">وقت الانصراف</p>
                    <p className="font-semibold">
                      {new Date(todayAttendance.check_out_at).toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                )}
                {todayAttendance.duration_minutes && (
                  <div>
                    <p className="text-sm text-gray-500">المدة</p>
                    <p className="font-semibold">
                      {Math.floor(todayAttendance.duration_minutes / 60)}:{(todayAttendance.duration_minutes % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">نسبة الحضور</p>
            <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">أيام الحضور</p>
            <p className="text-2xl font-bold text-green-600">{presentDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">أيام التأخر</p>
            <p className="text-2xl font-bold text-yellow-600">{lateDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">أيام الغياب</p>
            <p className="text-2xl font-bold text-red-600">{absentDays}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            تقويم الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
              <div key={day} className="text-sm font-medium text-gray-500 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-10" />;
              }
              
              const status = getDayStatus(day);
              const isToday = day === today.getDate();
              
              let bgClass = 'bg-gray-50';
              if (status === 'present') bgClass = 'bg-green-100 text-green-700';
              if (status === 'late') bgClass = 'bg-yellow-100 text-yellow-700';
              if (status === 'absent') bgClass = 'bg-red-100 text-red-700';
              
              return (
                <div
                  key={day}
                  className={`h-10 flex items-center justify-center rounded-lg text-sm ${bgClass} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>حاضر</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>متأخر</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span>غائب</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendanceRecords.slice(0, 10).map((record) => (
              <div 
                key={record.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">
                      {new Date(record.check_in_at).toLocaleDateString('ar-SA', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.check_in_at).toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {record.check_out_at && (
                        <> - {new Date(record.check_out_at).toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {record.duration_minutes && (
                    <span className="text-sm text-gray-500">
                      {Math.floor(record.duration_minutes / 60)}:{(record.duration_minutes % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  {getStatusBadge(record.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
