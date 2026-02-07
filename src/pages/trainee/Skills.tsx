import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Star, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Award,
  TrendingUp
} from 'lucide-react';
import type { Skill, SkillEvaluation } from '@/types';
import { getSkills, getSkillEvaluations } from '@/lib/supabase';

export const Skills: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [evaluations, setEvaluations] = useState<SkillEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpecialty, setExpandedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [skillsData, evaluationsData] = await Promise.all([
        getSkills(),
        getSkillEvaluations(user.id),
      ]);
      setSkills(skillsData.data || []);
      setEvaluations(evaluationsData.data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillEvaluationsList = (skillId: string) => {
    return evaluations.filter(e => e.skill_id === skillId);
  };

  const getSkillAverageScore = (skillId: string) => {
    const skillEvals = getSkillEvaluationsList(skillId);
    if (skillEvals.length === 0) return 0;
    const sum = skillEvals.reduce((acc, e) => acc + e.overall_score, 0);
    return Math.round((sum / skillEvals.length) * 10) / 10;
  };

  const getSkillStatus = (skillId: string) => {
    const skillEvals = getSkillEvaluationsList(skillId);
    if (skillEvals.length === 0) return 'pending';
    const completed = skillEvals.filter(e => e.status === 'completed' || e.status === 'approved').length;
    if (completed >= 3) return 'completed';
    if (completed > 0) return 'in_progress';
    return 'pending';
  };

  // Group skills by specialty
  const skillsBySpecialty = skills.reduce((acc, skill) => {
    const specialtyName = skill.specialty?.specialty_name || 'عام';
    if (!acc[specialtyName]) {
      acc[specialtyName] = [];
    }
    acc[specialtyName].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const completedSkills = skills.filter(s => getSkillStatus(s.id) === 'completed').length;
  const inProgressSkills = skills.filter(s => getSkillStatus(s.id) === 'in_progress').length;
  const totalSkills = skills.length || 1;
  const overallProgress = Math.round((completedSkills / totalSkills) * 100);

  const getDifficultyStars = (level?: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < (level || 1) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
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
          <h1 className="text-2xl font-bold">المهارات والكفاءات</h1>
          <p className="text-gray-500">تتبع تقدمك في المهارات السريرية (DOPs)</p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                التقدم العام
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {completedSkills} من {totalSkills} مهارة مكتملة
              </p>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold text-blue-600">{overallProgress}%</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{completedSkills}</p>
              <p className="text-sm text-gray-600">مكتملة</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{inProgressSkills}</p>
              <p className="text-sm text-gray-600">قيد التقدم</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Target className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{totalSkills - completedSkills - inProgressSkills}</p>
              <p className="text-sm text-gray-600">متبقية</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills by Specialty */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">الكل</TabsTrigger>
          {Object.keys(skillsBySpecialty).map(specialty => (
            <TabsTrigger key={specialty} value={specialty}>{specialty}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(skillsBySpecialty).map(([specialtyName, specialtySkills]) => {
            const specialtyCompleted = specialtySkills.filter(s => getSkillStatus(s.id) === 'completed').length;
            const specialtyProgress = Math.round((specialtyCompleted / specialtySkills.length) * 100);
            const isExpanded = expandedSpecialty === specialtyName;

            return (
              <Card key={specialtyName}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedSpecialty(isExpanded ? null : specialtyName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{specialtyName}</CardTitle>
                        <CardDescription>
                          {specialtyCompleted} من {specialtySkills.length} مهارة
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-lg font-bold">{specialtyProgress}%</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <Progress value={specialtyProgress} className="h-2 mt-3" />
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {specialtySkills.map((skill) => {
                        const status = getSkillStatus(skill.id);
                        const averageScore = getSkillAverageScore(skill.id);
                        const skillEvals = getSkillEvaluationsList(skill.id);

                        return (
                          <div 
                            key={skill.id} 
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{skill.skill_name}</h4>
                                {skill.required_for_completion && (
                                  <Badge variant="secondary" className="text-xs">إلزامي</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-0.5">
                                  {getDifficultyStars(skill.difficulty_level)}
                                </div>
                                <span>•</span>
                                <span>{skill.category || 'سريري'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {averageScore > 0 && (
                                <div className="text-center">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold">{averageScore}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">{skillEvals.length} تقييم</p>
                                </div>
                              )}

                              {status === 'completed' ? (
                                <Badge className="bg-green-500">
                                  <CheckCircle2 className="h-3 w-3 ml-1" />
                                  مكتمل
                                </Badge>
                              ) : status === 'in_progress' ? (
                                <Badge className="bg-yellow-500">
                                  <Clock className="h-3 w-3 ml-1" />
                                  قيد التقدم
                                </Badge>
                              ) : (
                                <Badge variant="outline">بانتظار التقييم</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {Object.entries(skillsBySpecialty).map(([specialtyName, specialtySkills]) => (
          <TabsContent key={specialtyName} value={specialtyName} className="space-y-4">
            {specialtySkills.map((skill) => {
              const status = getSkillStatus(skill.id);
              const averageScore = getSkillAverageScore(skill.id);
              const skillEvals = getSkillEvaluationsList(skill.id);

              return (
                <Card key={skill.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{skill.skill_name}</h3>
                          {skill.required_for_completion && (
                            <Badge variant="secondary">إلزامي</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center gap-0.5">
                            {getDifficultyStars(skill.difficulty_level)}
                          </div>
                          <span>•</span>
                          <span>{skill.category || 'سريري'}</span>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-gray-600 mt-2">{skill.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {averageScore > 0 && (
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="font-semibold text-lg">{averageScore}</span>
                              <span className="text-gray-400">/5</span>
                            </div>
                            <p className="text-xs text-gray-500">{skillEvals.length} تقييم</p>
                          </div>
                        )}

                        {status === 'completed' ? (
                          <Badge className="bg-green-500 px-3 py-1">
                            <CheckCircle2 className="h-4 w-4 ml-1" />
                            مكتمل
                          </Badge>
                        ) : status === 'in_progress' ? (
                          <Badge className="bg-yellow-500 px-3 py-1">
                            <Clock className="h-4 w-4 ml-1" />
                            قيد التقدم
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            طلب تقييم
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Evaluation History */}
                    {skillEvals.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium mb-2">سجل التقييمات:</p>
                        <div className="space-y-2">
                          {skillEvals.map((evalItem) => (
                            <div 
                              key={evalItem.id} 
                              className="flex items-center justify-between text-sm p-2 bg-white rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {new Date(evalItem.evaluation_date).toLocaleDateString('ar-SA')}
                                </span>
                                <span>•</span>
                                <span>د. {evalItem.trainer?.full_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < evalItem.overall_score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="font-medium">{evalItem.overall_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
