import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Detonator {
  id: number;
  delay: number;
  status: 'idle' | 'armed' | 'fired' | 'error';
}

interface DetonatorSimulatorProps {
  username?: string;
}

export default function DetonatorSimulator({ username }: DetonatorSimulatorProps) {
  const [detonators, setDetonators] = useState<Detonator[]>([
    { id: 1, delay: 0, status: 'idle' },
    { id: 2, delay: 0, status: 'idle' },
    { id: 3, delay: 0, status: 'idle' },
    { id: 4, delay: 0, status: 'idle' },
  ]);
  const [isArmed, setIsArmed] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const API_URL = 'https://functions.poehali.dev/ded8e6aa-8eb3-477f-8584-8f1237784c9b';

  const updateDelay = (id: number, delay: string) => {
    const delayNum = parseInt(delay) || 0;
    if (delayNum < 0 || delayNum > 9999) return;
    
    setDetonators(prev =>
      prev.map(det => det.id === id ? { ...det, delay: delayNum } : det)
    );
  };

  const armSystem = () => {
    const allValid = detonators.every(det => det.delay >= 0);
    if (!allValid) {
      toast({
        title: "Ошибка",
        description: "Проверьте корректность задержек",
        variant: "destructive"
      });
      return;
    }

    setIsArmed(true);
    setDetonators(prev => prev.map(det => ({ ...det, status: 'armed' })));
    toast({
      title: "Система взведена",
      description: "Все детонаторы готовы к подрыву",
    });
  };

  const fireSequence = async () => {
    if (!isArmed) return;

    setIsFiring(true);
    const sorted = [...detonators].sort((a, b) => a.delay - b.delay);

    for (const det of sorted) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDetonators(prev =>
        prev.map(d => d.id === det.id ? { ...d, status: 'fired' } : d)
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверка правильности последовательности
    const correctSequence = [1, 2, 3, 4].map(id => 
      detonators.find(d => d.id === id)?.delay || 0
    );
    const isSequential = correctSequence.every((delay, i) => 
      i === 0 || delay >= correctSequence[i - 1]
    );

    const calculatedScore = isSequential ? 100 : Math.floor(Math.random() * 60 + 40);
    setScore(calculatedScore);
    setTestPassed(isSequential);

    toast({
      title: isSequential ? "Отлично!" : "Попробуй еще раз",
      description: `Результат: ${calculatedScore}%`,
      variant: isSequential ? "default" : "destructive"
    });

    // Сохранить результат в БД
    if (username) {
      await saveResult(calculatedScore, isSequential, correctSequence);
    }

    setIsFiring(false);
  };

  const saveResult = async (score: number, passed: boolean, sequence: number[]) => {
    if (!username) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          test_type: 'detonator_simulator',
          score,
          passed,
          max_delay: Math.max(...sequence),
          sequence_data: { delays: sequence }
        })
      });
      
      if (!response.ok) throw new Error('Failed to save result');
      
      const data = await response.json();
      if (data.success) {
        console.log('Result saved successfully');
      }
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setDetonators(prev => prev.map(det => ({ ...det, delay: 0, status: 'idle' })));
    setIsArmed(false);
    setIsFiring(false);
    setTestPassed(null);
    setScore(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-slate-400 bg-slate-800/50';
      case 'armed': return 'text-orange-400 bg-orange-500/20';
      case 'fired': return 'text-green-400 bg-green-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-800/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idle': return 'Ожидание';
      case 'armed': return 'Взведен';
      case 'fired': return 'Сработал';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Icon name="Zap" size={24} />
                Симулятор электронных детонаторов
              </CardTitle>
              <CardDescription className="mt-2">
                Настройте задержку для каждого детонатора и запустите последовательность
              </CardDescription>
            </div>
            {testPassed !== null && (
              <Badge className={testPassed ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}>
                {score}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isArmed ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm text-slate-300">
                {isArmed ? 'Взведено' : 'Безопасно'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon name="Activity" size={16} />
              <span>Детонаторов: {detonators.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon name="Timer" size={16} />
              <span>Макс. задержка: {Math.max(...detonators.map(d => d.delay))} мс</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon name="CheckCircle2" size={16} />
              <span>Готовых: {detonators.filter(d => d.status === 'armed').length}</span>
            </div>
          </div>

          {/* Detonators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detonators.map((det) => (
              <div
                key={det.id}
                className={`p-4 rounded-lg border transition-all ${getStatusColor(det.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-700">
                      <span className="text-lg font-bold text-purple-400">{det.id}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Детонатор #{det.id}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getStatusLabel(det.status)}
                      </Badge>
                    </div>
                  </div>
                  {det.status === 'fired' && (
                    <Icon name="Flame" size={24} className="text-orange-400 animate-pulse" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`delay-${det.id}`} className="text-slate-300 text-xs">
                    Задержка подрыва (мс)
                  </Label>
                  <Input
                    id={`delay-${det.id}`}
                    type="number"
                    min="0"
                    max="9999"
                    value={det.delay}
                    onChange={(e) => updateDelay(det.id, e.target.value)}
                    disabled={isArmed || isFiring}
                    className="bg-slate-900/50 border-slate-700 text-white font-mono"
                  />
                </div>

                {det.status === 'fired' && (
                  <div className="mt-3">
                    <Progress value={100} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            {!isArmed ? (
              <Button
                onClick={armSystem}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                disabled={isFiring}
              >
                <Icon name="ShieldAlert" size={18} className="mr-2" />
                Взвести систему
              </Button>
            ) : (
              <Button
                onClick={fireSequence}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold"
                disabled={isFiring}
              >
                <Icon name="Zap" size={18} className="mr-2" />
                {isFiring ? 'Подрыв...' : 'Запустить подрыв'}
              </Button>
            )}
            
            <Button
              onClick={reset}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={isFiring}
            >
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сброс
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-cyan-400 mt-0.5" />
              <div className="text-sm text-cyan-100">
                <p className="font-semibold mb-1">Задание:</p>
                <p className="text-cyan-200/80">
                  Настройте задержки так, чтобы детонаторы срабатывали в правильной последовательности.
                  Детонатор #1 должен сработать первым, #4 — последним. Рекомендуемый интервал: 100-500 мс.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}