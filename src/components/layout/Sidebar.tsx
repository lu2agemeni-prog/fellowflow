import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Target,
  Library,
  MessageSquare,
  Users,
  CheckCircle,
  Award,
  BarChart3,
  Settings,
  Building2,
  RotateCcw,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  // Trainee routes
  { path: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/attendance', label: 'الحضور', icon: Calendar, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/rotations', label: 'التدويرات', icon: RotateCcw, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/lectures', label: 'المحاضرات', icon: BookOpen, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/exams', label: 'الاختبارات', icon: FileText, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/skills', label: 'المهارات', icon: Target, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/resources', label: 'المكتبة', icon: Library, roles: ['trainee', 'trainer', 'admin'] },
  { path: '/chat', label: 'المحادثات', icon: MessageSquare, roles: ['trainee', 'trainer', 'admin'] },
  
  // Trainer routes
  { path: '/my-trainees', label: 'متدربي', icon: Users, roles: ['trainer', 'admin'] },
  { path: '/attendance-approval', label: 'اعتماد الحضور', icon: CheckCircle, roles: ['trainer', 'admin'] },
  { path: '/skill-evaluation', label: 'تقييم المهارات', icon: Award, roles: ['trainer', 'admin'] },
  
  // Admin routes
  { path: '/users', label: 'المستخدمين', icon: Users, roles: ['admin'] },
  { path: '/programs', label: 'البرامج', icon: BookOpen, roles: ['admin'] },
  { path: '/centers', label: 'المراكز', icon: Building2, roles: ['admin'] },
  { path: '/reports', label: 'التقارير', icon: BarChart3, roles: ['admin'] },
  { path: '/settings', label: 'الإعدادات', icon: Settings, roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">FF</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">FellowFlow</h1>
          <p className="text-xs text-gray-500">نظام الزمالة الطبية</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
