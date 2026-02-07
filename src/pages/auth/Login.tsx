     1	import React, { useState } from 'react';
     2	import { useNavigate, Link } from 'react-router-dom';
     3	import { useAuth } from '@/contexts/AuthContext';
     4	import { Button } from '@/components/ui/button';
     5	import { Input } from '@/components/ui/input';
     6	import { Label } from '@/components/ui/label';
     7	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
     8	import { Alert, AlertDescription } from '@/components/ui/alert';
     9	import { Checkbox } from '@/components/ui/checkbox';
    10	import { Spinner } from '@/components/ui/spinner';
    11	import { Eye, EyeOff, Mail, Lock, Stethoscope } from 'lucide-react';
    12	
    13	export const Login: React.FC = () => {
    14	  const navigate = useNavigate();
    15	  const { signIn } = useAuth();
    16	  const [email, setEmail] = useState('');
    17	  const [password, setPassword] = useState('');
    18	  const [showPassword, setShowPassword] = useState(false);
    19	  const [rememberMe, setRememberMe] = useState(false);
    20	  const [error, setError] = useState('');
    21	  const [loading, setLoading] = useState(false);
    22	
    23	  const handleSubmit = async (e: React.FormEvent) => {
    24	    e.preventDefault();
    25	    setError('');
    26	    setLoading(true);
    27	
    28	    try {
    29	      const { error } = await signIn(email, password);
    30	      if (error) {
    31	        setError(error.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
    32	      } else {
    33	        navigate('/dashboard');
    34	      }
    35	    } catch (err) {
    36	      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    37	    } finally {
    38	      setLoading(false);
    39	    }
    40	  };
    41	
    42	  // Demo login for testing
    43	  const handleDemoLogin = async (role: string) => {
    44	    setLoading(true);
    45	    const demoEmails: Record<string, string> = {
    46	      trainee: 'trainee@example.com',
    47	      trainer: 'trainer@example.com',
    48	      admin: 'admin@example.com',
    49	    };
    50	    const { error } = await signIn(demoEmails[role], 'password123');
    51	    if (!error) {
    52	      navigate('/dashboard');
    53	    }
    54	    setLoading(false);
    55	  };
    56	
    57	  return (
    58	    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
    59	      <div className="w-full max-w-md">
    60	        {/* Logo */}
    61	        <div className="flex flex-col items-center mb-8">
    62	          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
    63	            <Stethoscope className="w-10 h-10 text-white" />
    64	          </div>
    65	          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FellowFlow</h1>
    66	          <p className="text-gray-500 dark:text-gray-400">نظام إدارة الزمالة الطبية</p>
    67	        </div>
    68	
    69	        <Card>
    70	          <CardHeader>
    71	            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
    72	            <CardDescription className="text-center">
    73	              أدخل بياناتك للوصول إلى حسابك
    74	            </CardDescription>
    75	          </CardHeader>
    76	
    77	          <CardContent>
    78	            {error && (
    79	              <Alert variant="destructive" className="mb-4">
    80	                <AlertDescription>{error}</AlertDescription>
    81	              </Alert>
    82	            )}
    83	
    84	            <form onSubmit={handleSubmit} className="space-y-4">
    85	              <div className="space-y-2">
    86	                <Label htmlFor="email">البريد الإلكتروني</Label>
    87	                <div className="relative">
    88	                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
    89	                  <Input
    90	                    id="email"
    91	                    type="email"
    92	                    placeholder="name@example.com"
    93	                    value={email}
    94	                    onChange={(e) => setEmail(e.target.value)}
    95	                    className="pr-10"
    96	                    required
    97	                  />
    98	                </div>
    99	              </div>
   100	
   101	              <div className="space-y-2">
   102	                <Label htmlFor="password">كلمة المرور</Label>
   103	                <div className="relative">
   104	                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
   105	                  <Input
   106	                    id="password"
   107	                    type={showPassword ? 'text' : 'password'}
   108	                    placeholder="••••••••"
   109	                    value={password}
   110	                    onChange={(e) => setPassword(e.target.value)}
   111	                    className="pr-10"
   112	                    required
   113	                  />
   114	                  <button
   115	                    type="button"
   116	                    onClick={() => setShowPassword(!showPassword)}
   117	                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
   118	                  >
   119	                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
   120	                  </button>
   121	                </div>
   122	              </div>
   123	
   124	              <div className="flex items-center justify-between">
   125	                <div className="flex items-center space-x-2 space-x-reverse">
   126	                  <Checkbox
   127	                    id="remember"
   128	                    checked={rememberMe}
   129	                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
   130	                  />
   131	                  <Label htmlFor="remember" className="text-sm cursor-pointer">
   132	                    تذكرني
   133	                  </Label>
   134	                </div>
   135	                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
   136	                  نسيت كلمة المرور؟
   137	                </Link>
   138	              </div>
   139	
   140	              <Button type="submit" className="w-full" disabled={loading}>
   141	                {loading ? <Spinner className="mr-2" /> : null}
   142	                تسجيل الدخول
   143	              </Button>
   144	            </form>
   145	
   146	            {/* Demo Login Buttons */}
   147	            <div className="mt-6 pt-6 border-t border-gray-200">
   148	              <p className="text-sm text-gray-500 text-center mb-3">تسجيل الدخول التجريبي</p>
   149	              <div className="grid grid-cols-3 gap-2">
   150	                <Button
   151	                  variant="outline"
   152	                  size="sm"
   153	                  onClick={() => handleDemoLogin('trainee')}
   154	                  disabled={loading}
   155	                >
   156	                  متدرب
   157	                </Button>
   158	                <Button
   159	                  variant="outline"
   160	                  size="sm"
   161	                  onClick={() => handleDemoLogin('trainer')}
   162	                  disabled={loading}
   163	                >
   164	                  مدرب
   165	                </Button>
   166	                <Button
   167	                  variant="outline"
   168	                  size="sm"
   169	                  onClick={() => handleDemoLogin('admin')}
   170	                  disabled={loading}
   171	                >
   172	                  مدير
   173	                </Button>
   174	              </div>
   175	            </div>
   176	          </CardContent>
   177	
   178	          <CardFooter className="flex flex-col space-y-2">
   179	            <p className="text-sm text-gray-500 text-center">
   180	              ليس لديك حساب؟{' '}
   181	              <Link to="/register" className="text-blue-600 hover:underline">
   182	                طلب انضمام
   183	              </Link>
   184	            </p>
   185	          </CardFooter>
   186	        </Card>
   187	
   188	        {/* Footer */}
   189	        <p className="text-center text-sm text-gray-500 mt-8">
   190	          © 2024 FellowFlow. جميع الحقوق محفوظة.
   191	        </p>
   192	      </div>
   193	    </div>
   194	  );
   195	};
   196	
