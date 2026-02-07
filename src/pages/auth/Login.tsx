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

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in...', { email });
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error('Sign in failed:', signInError);
        setError(signInError.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
      } else {
        console.log('Sign in successful, navigating to dashboard...');
        // إضافة تأخير بسيط للتأكد من تحديث حالة المستخدم
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    } catch (err: any) {
      console.error('Sign in exception:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async (role: string) => {
    setError('');
    setLoading(true);
    
    const demoCredentials: Record<string, { email: string; password: string }> = {
      trainee: { email: 'trainee@example.com', password: 'password123' },
      trainer: { email: 'trainer@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'password123' },
    };

    const credentials = demoCredentials[role];
    
    try {
      console.log('Demo login attempt:', credentials.email);
      const { error: signInError } = await signIn(credentials.email, credentials.password);
      
      if (signInError) {
        console.error('Demo login failed:', signInError);
        setError(`فشل تسجيل الدخول التجريبي. تأكد من إنشاء حساب ${role} في Supabase`);
      } else {
        console.log('Demo login successful');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('Demo login exception:', err);
      setError('حدث خطأ في تسجيل الدخول التجريبي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
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
                    disabled={loading}
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
                {loading ? <Spinner className="mr-2" /> : null}
                تسجيل الدخول
              </Button>
            </form>

            {/* Demo Login Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">تسجيل الدخول التجريبي</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('trainee')}
                  disabled={loading}
                >
                  متدرب
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('trainer')}
                  disabled={loading}
                >
                  مدرب
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                >
                  مدير
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                تأكد من إنشاء الحسابات التجريبية في Supabase أولاً
              </p>
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

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2024 FellowFlow. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
};
