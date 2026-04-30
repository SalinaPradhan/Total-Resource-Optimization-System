import { Brain, Play, Settings, Zap, CheckCircle, AlertTriangle, Clock, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useGenerateTimetable } from "@/hooks/useGenerateTimetable";
import { toast } from "@/hooks/use-toast";

export default function SchedulerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    stats?: {
      totalEntries: number;
      conflicts: number;
      availabilityViolations?: number;
      fitness: number;
      generations: number;
    };
  } | null>(null);
  
  const [weights, setWeights] = useState({
    hardClash: 1000,
    roomConstraint: 500,
    staffAvailability: 200,
    infrastructure: 200,
    facultyUnavailable: 800,
    facultyPreferred: 50,
  });

  const [params, setParams] = useState({
    populationSize: 50,
    maxGenerations: 200,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    eliteCount: 5,
  });

  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState(1);
  const [clearExisting, setClearExisting] = useState(true);

  const generateMutation = useGenerateTimetable();

  // Simulate progress while waiting for the edge function
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95; // Cap at 95% until complete
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleGenerate = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await generateMutation.mutateAsync({
        weights,
        params,
        academicYear,
        semester,
        clearExisting,
      });

      setProgress(100);
      setResult(response);

      if (response.success) {
        toast({
          title: "Timetable Generated",
          description: response.message,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: response.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate timetable";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setProgress(0);
    setResult(null);
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="AI Scheduler" 
        subtitle="Genetic Algorithm-based Timetable Optimization"
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Status Card */}
            <Card className="glass-card border-border animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Schedule Generator</CardTitle>
                    <CardDescription>
                      AI-powered timetable optimization using Genetic Algorithm
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Academic Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Input
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2024-2025"
                      disabled={isRunning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input
                      type="number"
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                      min={1}
                      max={8}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label>Clear Existing Schedules</Label>
                    <p className="text-xs text-muted-foreground">
                      Remove existing schedules for this semester before generating
                    </p>
                  </div>
                  <Switch
                    checked={clearExisting}
                    onCheckedChange={setClearExisting}
                    disabled={isRunning}
                  />
                </div>

                {/* Progress Section */}
                {isRunning && (
                  <div className="space-y-2 p-4 rounded-lg bg-secondary/50 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning animate-pulse" />
                        Optimizing Schedule...
                      </span>
                      <span className="font-mono">{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Running genetic algorithm with population size {params.populationSize}...
                    </p>
                  </div>
                )}

                {result && !isRunning && (
                  <div className={`p-4 rounded-lg animate-scale-in ${
                    result.success 
                      ? 'bg-success/10 border border-success/30' 
                      : 'bg-destructive/10 border border-destructive/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${result.success ? 'text-success' : 'text-destructive'}`}>
                          {result.success ? 'Schedule Generated Successfully!' : 'Generation Failed'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.message}
                        </p>
                        {result.stats && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <span>Entries: <strong>{result.stats.totalEntries}</strong></span>
                            <span>Conflicts: <strong>{result.stats.conflicts}</strong></span>
                            <span>Availability Issues: <strong>{result.stats.availabilityViolations ?? 0}</strong></span>
                            <span>Fitness: <strong>{result.stats.fitness.toFixed(2)}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    onClick={handleGenerate}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isRunning ? 'Generating...' : 'Generate Timetable'}
                  </Button>
                  {result && (
                    <Button variant="outline" size="lg" onClick={handleReset}>
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Constraint Weights */}
            <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-lg">Constraint Weights</CardTitle>
                <CardDescription>
                  Adjust penalty weights for the cost function
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Hard Clashes (W₁)</Label>
                      <span className="text-sm font-mono text-primary">{weights.hardClash}</span>
                    </div>
                    <Slider
                      value={[weights.hardClash]}
                      max={2000}
                      min={100}
                      step={100}
                      onValueChange={([v]) => setWeights(w => ({ ...w, hardClash: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Teacher/Room/Student double-booking penalties
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Room Constraints (W₂)</Label>
                      <span className="text-sm font-mono text-primary">{weights.roomConstraint}</span>
                    </div>
                    <Slider
                      value={[weights.roomConstraint]}
                      max={1000}
                      min={50}
                      step={50}
                      onValueChange={([v]) => setWeights(w => ({ ...w, roomConstraint: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Room type and capacity mismatch penalties
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Staff Availability (W₃)</Label>
                      <span className="text-sm font-mono text-accent">{weights.staffAvailability}</span>
                    </div>
                    <Slider
                      value={[weights.staffAvailability]}
                      max={500}
                      min={50}
                      step={50}
                      onValueChange={([v]) => setWeights(w => ({ ...w, staffAvailability: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lab assistant availability penalties
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Infrastructure (W₄)</Label>
                      <span className="text-sm font-mono text-accent">{weights.infrastructure}</span>
                    </div>
                    <Slider
                      value={[weights.infrastructure]}
                      max={500}
                      min={50}
                      step={50}
                      onValueChange={([v]) => setWeights(w => ({ ...w, infrastructure: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Equipment and resource availability penalties
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Faculty Unavailable (W₅)</Label>
                      <span className="text-sm font-mono text-destructive">{weights.facultyUnavailable}</span>
                    </div>
                    <Slider
                      value={[weights.facultyUnavailable]}
                      max={1500}
                      min={100}
                      step={100}
                      onValueChange={([v]) => setWeights(w => ({ ...w, facultyUnavailable: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Penalty for scheduling during faculty's unavailable times
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Faculty Preferred Bonus (W₆)</Label>
                      <span className="text-sm font-mono text-success">{weights.facultyPreferred}</span>
                    </div>
                    <Slider
                      value={[weights.facultyPreferred]}
                      max={200}
                      min={10}
                      step={10}
                      onValueChange={([v]) => setWeights(w => ({ ...w, facultyPreferred: v }))}
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Reward for using faculty's preferred time slots
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Algorithm Info */}
            <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '150ms' }}>
              <CardHeader>
                <CardTitle className="text-lg">Algorithm Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Population Size</span>
                  <Input
                    type="number"
                    value={params.populationSize}
                    onChange={(e) => setParams(p => ({ ...p, populationSize: parseInt(e.target.value) || 50 }))}
                    className="w-20 h-8 text-right font-mono"
                    min={10}
                    max={200}
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Max Generations</span>
                  <Input
                    type="number"
                    value={params.maxGenerations}
                    onChange={(e) => setParams(p => ({ ...p, maxGenerations: parseInt(e.target.value) || 200 }))}
                    className="w-20 h-8 text-right font-mono"
                    min={50}
                    max={1000}
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Mutation Rate</span>
                  <Input
                    type="number"
                    value={params.mutationRate}
                    onChange={(e) => setParams(p => ({ ...p, mutationRate: parseFloat(e.target.value) || 0.1 }))}
                    className="w-20 h-8 text-right font-mono"
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Crossover Rate</span>
                  <Input
                    type="number"
                    value={params.crossoverRate}
                    onChange={(e) => setParams(p => ({ ...p, crossoverRate: parseFloat(e.target.value) || 0.8 }))}
                    className="w-20 h-8 text-right font-mono"
                    min={0.5}
                    max={1}
                    step={0.05}
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Elite Count</span>
                  <Input
                    type="number"
                    value={params.eliteCount}
                    onChange={(e) => setParams(p => ({ ...p, eliteCount: parseInt(e.target.value) || 5 }))}
                    className="w-20 h-8 text-right font-mono"
                    min={1}
                    max={20}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Function */}
            <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-lg">Cost Function</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-secondary/50 font-mono text-xs">
                  <p className="text-primary mb-2">C<sub>total</sub> =</p>
                  <p className="pl-4 text-muted-foreground">
                    (W₁ × H<sub>clash</sub>) +
                  </p>
                  <p className="pl-4 text-muted-foreground">
                    (W₂ × R<sub>constraint</sub>) +
                  </p>
                  <p className="pl-4 text-muted-foreground">
                    (W₃ × S<sub>staff</sub>) +
                  </p>
                  <p className="pl-4 text-muted-foreground">
                    (W₄ × I<sub>infra</sub>) +
                  </p>
                  <p className="pl-4 text-muted-foreground">
                    (W₅ × F<sub>unavailable</sub>) −
                  </p>
                  <p className="pl-4 text-muted-foreground">
                    (W₆ × F<sub>preferred</sub>)
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Goal: Minimize C<sub>total</sub> (can be negative with preferred slots)
                </p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '250ms' }}>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p>Fetches all courses, faculty, rooms, batches, and staff from your database</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p>Creates random schedule populations and evaluates conflicts</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p>Evolves solutions using crossover and mutation operators</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <p>Saves the optimal schedule directly to your timetable</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
