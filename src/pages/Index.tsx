import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DetonatorSimulator from '@/components/DetonatorSimulator';

interface UserSession {
  username: string;
  expiresAt: number;
}

interface UserProgress {
  theoryCompleted: number;
  practiceCompleted: number;
  testsCompleted: number;
  totalScore: number;
}

export default function Index() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();
  const [progress] = useState<UserProgress>({
    theoryCompleted: 45,
    practiceCompleted: 30,
    testsCompleted: 60,
    totalScore: 850
  });

  // Timer countdown
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, session.expiresAt - now);
      setTimeLeft(left);

      if (left === 0) {
        handleLogout();
        toast({
          title: "Сессия истекла",
          description: "Время доступа истекло. Войдите снова.",
          variant: "destructive"
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка кода доступа (демо: код "BLAST2024")
    if (accessCode === 'BLAST2024' && username.trim()) {
      const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 часа
      setSession({ username, expiresAt });
      toast({
        title: "Доступ разрешен",
        description: `Добро пожаловать, ${username}! Время сессии: 2 часа.`,
      });
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный код доступа или логин",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setSession(null);
    setUsername('');
    setAccessCode('');
    setTimeLeft(0);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        
        <Card className="w-full max-w-md relative z-10 border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <Icon name="ShieldCheck" size={48} className="text-cyan-400 relative" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              BLAST TRAINING
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Система обучения работе с электронными детонаторами
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Логин оператора</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите ваш логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-slate-300">Код доступа</Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Введите разовый код"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold">
                <Icon name="Lock" size={18} className="mr-2" />
                Войти в систему
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Демо код: BLAST2024 | Сессия: 2 часа
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Zap" size={32} className="text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">BLAST TRAINING</h1>
              <p className="text-xs text-slate-400">Электронные детонаторы</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-300">{session.username}</p>
              <div className="flex items-center gap-2 text-xs">
                <Icon name="Clock" size={14} className="text-orange-400" />
                <span className={timeLeft < 600000 ? 'text-orange-400 font-semibold' : 'text-slate-400'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Теория</p>
                  <p className="text-2xl font-bold text-cyan-400">{progress.theoryCompleted}%</p>
                </div>
                <Icon name="BookOpen" size={32} className="text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Практика</p>
                  <p className="text-2xl font-bold text-purple-400">{progress.practiceCompleted}%</p>
                </div>
                <Icon name="Hammer" size={32} className="text-purple-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Тесты</p>
                  <p className="text-2xl font-bold text-orange-400">{progress.testsCompleted}%</p>
                </div>
                <Icon name="ClipboardCheck" size={32} className="text-orange-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Общий балл</p>
                  <p className="text-2xl font-bold text-green-400">{progress.totalScore}</p>
                </div>
                <Icon name="Trophy" size={32} className="text-green-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="theory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="theory" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Теория
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Icon name="Hammer" size={18} className="mr-2" />
              Практика
            </TabsTrigger>
            <TabsTrigger value="tests" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Icon name="ClipboardCheck" size={18} className="mr-2" />
              Тесты
            </TabsTrigger>
          </TabsList>

          {/* Theory Tab */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400">Основы электронных детонаторов</CardTitle>
                <CardDescription>Теоретические материалы и принципы работы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <LessonCard 
                    title="1. Введение в электронные детонаторы"
                    duration="15 мин"
                    status="completed"
                    icon="CheckCircle2"
                  />
                  <LessonCard 
                    title="2. Принципы программируемого замедления"
                    duration="20 мин"
                    status="completed"
                    icon="CheckCircle2"
                  />
                  <LessonCard 
                    title="3. Техника безопасности при работе"
                    duration="25 мин"
                    status="in-progress"
                    icon="Play"
                  />
                  <LessonCard 
                    title="4. Протоколы тестирования линий"
                    duration="30 мин"
                    status="locked"
                    icon="Lock"
                  />
                  <LessonCard 
                    title="5. Расчет схем подрыва"
                    duration="40 мин"
                    status="locked"
                    icon="Lock"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-4">
            <DetonatorSimulator />
            
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Другие симуляции</CardTitle>
                <CardDescription>Дополнительные упражнения для практики</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SimulationCard 
                  title="Подключение детонаторов к блоку управления"
                  difficulty="Средний"
                  attempts={3}
                  bestScore={72}
                />
                <SimulationCard 
                  title="Диагностика неисправностей цепи"
                  difficulty="Продвинутый"
                  attempts={0}
                  bestScore={0}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <Card className="border-orange-500/20 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-400">Аттестация и проверка знаний</CardTitle>
                <CardDescription>Тестирование и оценка компетенций</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TestCard 
                  title="Базовая аттестация"
                  questions={20}
                  passed={true}
                  score={92}
                  date="15.01.2026"
                />
                <TestCard 
                  title="Продвинутый уровень"
                  questions={30}
                  passed={true}
                  score={78}
                  date="10.01.2026"
                />
                <TestCard 
                  title="Финальная сертификация"
                  questions={50}
                  passed={false}
                  score={0}
                  date=""
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Helper Components
function LessonCard({ title, duration, status, icon }: { 
  title: string; 
  duration: string; 
  status: 'completed' | 'in-progress' | 'locked';
  icon: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'in-progress': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'locked': return 'text-slate-500 bg-slate-800/30 border-slate-700/20';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} transition-all hover:scale-[1.02] cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name={icon as any} size={24} />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-70">{duration}</p>
          </div>
        </div>
        <Icon name="ChevronRight" size={20} />
      </div>
    </div>
  );
}

function SimulationCard({ title, difficulty, attempts, bestScore }: {
  title: string;
  difficulty: string;
  attempts: number;
  bestScore: number;
}) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Базовый': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Средний': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Продвинутый': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <Badge className={`${getDifficultyColor(difficulty)} border`}>
            {difficulty}
          </Badge>
        </div>
        <Icon name="Play" size={24} className="text-purple-400" />
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>Попыток: {attempts}</span>
        {bestScore > 0 && <span>Лучший результат: {bestScore}%</span>}
      </div>
      {bestScore > 0 && (
        <Progress value={bestScore} className="mt-3 h-2" />
      )}
    </div>
  );
}

function TestCard({ title, questions, passed, score, date }: {
  title: string;
  questions: number;
  passed: boolean;
  score: number;
  date: string;
}) {
  return (
    <div className={`p-4 rounded-lg border ${passed ? 'border-green-500/20 bg-green-500/5' : 'border-orange-500/20 bg-slate-800/30'} hover:bg-slate-800/50 transition-all cursor-pointer`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{questions} вопросов</p>
        </div>
        {passed ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
            Пройден
          </Badge>
        ) : (
          <Badge className="bg-slate-700 text-slate-300">
            Доступен
          </Badge>
        )}
      </div>
      {passed && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Результат: {score}%</span>
          <span className="text-slate-500">{date}</span>
        </div>
      )}
    </div>
  );
}