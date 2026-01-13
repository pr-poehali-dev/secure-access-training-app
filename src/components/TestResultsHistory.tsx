import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface TestResult {
  id: number;
  test_type: string;
  score: number;
  passed: boolean;
  max_delay: number;
  completed_at: string;
}

interface UserProgress {
  theory_completed: number;
  practice_completed: number;
  tests_completed: number;
  total_score: number;
}

interface TestResultsHistoryProps {
  username?: string;
}

export default function TestResultsHistory({ username }: TestResultsHistoryProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://functions.poehali.dev/ded8e6aa-8eb3-477f-8584-8f1237784c9b';

  useEffect(() => {
    if (!username) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        
        const data = await response.json();
        setResults(data.results || []);
        setProgress(data.progress || null);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [username]);

  if (!username) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Icon name="Loader2" size={20} className="animate-spin" />
            <span>Загрузка результатов...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      {progress && (
        <Card className="border-green-500/20 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Общий прогресс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-2xl font-bold text-purple-400">{progress.practice_completed}</div>
                <div className="text-xs text-slate-400">Практик пройдено</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">{progress.tests_completed}</div>
                <div className="text-xs text-slate-400">Тестов завершено</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-2xl font-bold text-green-400">{progress.total_score}</div>
                <div className="text-xs text-slate-400">Всего баллов</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-2xl font-bold text-orange-400">
                  {progress.tests_completed > 0 ? Math.round(progress.total_score / progress.tests_completed) : 0}
                </div>
                <div className="text-xs text-slate-400">Средний балл</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results History */}
      <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Icon name="History" size={20} />
            История результатов
          </CardTitle>
          <CardDescription>
            Последние {results.length} попыток прохождения симулятора
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Icon name="FileX" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Пока нет сохраненных результатов</p>
              <p className="text-sm mt-1">Пройдите симулятор, чтобы увидеть результаты здесь</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      result.passed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      <Icon name={result.passed ? "CheckCircle2" : "AlertCircle"} size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Симулятор детонаторов</div>
                      <div className="text-sm text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {formatDate(result.completed_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Timer" size={14} />
                          {result.max_delay} мс
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      result.passed 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }>
                      {result.score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
