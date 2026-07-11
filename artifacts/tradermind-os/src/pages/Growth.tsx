import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useGrowthCycles } from "../hooks/useGrowthCycles";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Target, CheckCircle2, Circle, Flame } from "lucide-react";

export default function Growth() {
  const { t } = useTranslation();
  const { cycles, loading } = useGrowthCycles();
  
  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const activeCycle = cycles.find(c => c.status === 'active');
  const pastCycles = cycles.filter(c => c.status !== 'active');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.growth')}</h1>
        {!activeCycle && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Cycle
          </Button>
        )}
      </div>

      {activeCycle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Flame className="w-48 h-48" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">ACTIVE</span>
                <span className="text-sm text-muted-foreground">Started {new Date(activeCycle.startDate).toLocaleDateString()}</span>
              </div>
              <CardTitle className="text-2xl">{activeCycle.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-primary flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" /> Goals
                  </h3>
                  <ul className="space-y-2">
                    {activeCycle.goals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-destructive flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4" /> Weaknesses to Kill
                  </h3>
                  <ul className="space-y-2">
                    {activeCycle.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Circle className="w-4 h-4 text-destructive/50 shrink-0 mt-0.5" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Daily Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                  <div className="w-5 h-5 rounded border-2 border-primary shrink-0" />
                  <span className="text-sm font-medium">Review past trades</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                  <div className="w-5 h-5 rounded border-2 border-primary shrink-0" />
                  <span className="text-sm font-medium">Log psychology entry</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                  <div className="w-5 h-5 rounded border-2 border-primary shrink-0" />
                  <span className="text-sm font-medium">Markups for tomorrow</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent text-center py-12">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No Active Growth Cycle</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-2">
                Growth cycles help you focus on specific weaknesses and goals over a set period. Start one to build discipline.
              </p>
            </div>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Cycle
            </Button>
          </CardContent>
        </Card>
      )}

      {pastCycles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastCycles.map(cycle => (
              <Card key={cycle.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{cycle.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    {new Date(cycle.startDate).toLocaleDateString()} - {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'Present'}
                  </div>
                  <div className="text-2xl font-bold text-primary">{cycle.completionScore || 0}% <span className="text-sm font-normal text-muted-foreground">completion</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}