import { useTranslation } from "react-i18next";
import { useState } from "react";
import { usePsychology } from "../hooks/usePsychology";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Brain, Smile, Meh, Frown, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Psychology() {
  const { t } = useTranslation();
  const { logs, loading } = usePsychology();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    mood: log.overallMood,
    focus: log.focusLevel
  })).slice(-14); // Last 14 entries

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.psychology')}</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Log Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mood & Focus Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="mood" name="Mood" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="focus" name="Focus" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 4).map(log => (
                <div key={log.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="flex gap-1">
                      {log.overallMood >= 8 ? <Smile className="w-4 h-4 text-success" /> : 
                       log.overallMood <= 4 ? <Frown className="w-4 h-4 text-destructive" /> : 
                       <Meh className="w-4 h-4 text-warning" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{log.notes || "No notes provided."}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}