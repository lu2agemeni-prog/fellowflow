import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff, Mail, Lock, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // تم إضافة الاستيراد للتحقق من الرتبة

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // دالة موحدة للتوجيه بناءً على الرتبة لتجنب التعليق في صفحة الـ Loading
  const redirectBasedOnRole = async (userEmail: string) => {
    try {
      // جلب بيانات البروفايل للتحقق من الرتبة
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', userEmail)
        .single();

      if (profileError || !profile) {
        navigate('/dashboard'); // المسار الافتراضي
        return;
      }

      // التوجيه للمسار المتوافق مع صلاحيات App.tsx
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        navigate('/admin');
      } else if (profile.role === 'trainer') {
        navigate('/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
      } else {
        await refreshUser(); // تحديث حالة المستخدم في الـ Context
        await redirectBasedOnRole(email);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    const demoEmails: Record<string, string> = {
      trainee: 'trainee@example.com',
      trainer: 'trainer@example.com',
      admin: 'admin@example.com',
    };
    
    const email = demoEmails[role];
    const { error } = await signIn(email, 'password123');
    
    if (!error) {
      await refreshUser();
      await redirectBasedOnRole(email);
    } else {
      setError('فشل الدخول التجريبي.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FellowFlow</h1>
          <p className="text-gray-500 dark:text-gray-400">نظام إدارة الزمالة الطبية</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    تذكرني
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">تسجيل الدخول التجريبي</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('trainee')} disabled={loading}>
                  متدرب
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('trainer')} disabled={loading}>
                  مدرب
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')} disabled={loading}>
                  مدير
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-gray-500 text-center">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                طلب انضمام
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-8">
          © 2024 FellowFlow. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
};
