import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePsychology } from "../hooks/usePsychology";
import { useTrades } from "../hooks/useTrades";
import { getEmotionPerformance } from "../lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { PsychologyLog } from "../db/database";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import { Plus, Brain, Smile, Meh, Frown, Trash2, Zap } from "lucide-react";

function SliderField({ label, name, value, onChange }: { label: string; name: string; value: number; onChange: (v: number) => void }) {
  const colors = value >= 7 ? "text-green-400" : value >= 4 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className={`text-sm font-bold ${colors}`}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 accent-primary cursor-pointer" />
    </div>
  );
}

const DEFAULT_FORM: Omit<PsychologyLog, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  sessionType: 'london',
  overallMood: 7,
  energyLevel: 7,
  stressLevel: 4,
  focusLevel: 7,
  sleepQuality: 7,
  motivation: 7,
  confidenceLevel: 7,
  tradingReadiness: 7,
  notes: '',
  triggers: [],
  copingStrategies: [],
  createdAt: new Date().toISOString(),
};

export default function Psychology() {
  const { t } = useTranslation();
  const { logs, loading, addLog, deleteLog } = usePsychology();
  const { trades } = useTrades();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<PsychologyLog, 'id'>>(DEFAULT_FORM);
  const [triggerInput, setTriggerInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof PsychologyLog, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await addLog({ ...form, createdAt: new Date().toISOString() });
      setOpen(false);
      setForm(DEFAULT_FORM);
      setTriggerInput('');
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addTrigger = () => {
    if (triggerInput.trim()) {
      set('triggers', [...form.triggers, triggerInput.trim()]);
      setTriggerInput('');
    }
  };

  const emotionData = getEmotionPerformance(trades);
  const chartData = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-21).map(l => ({
    date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    mood: l.overallMood,
    focus: l.focusLevel,
    stress: l.stressLevel,
    readiness: l.tradingReadiness,
  }));

  const avg = (key: keyof PsychologyLog) => logs.length
    ? Math.round(logs.slice(0, 7).reduce((s, l) => s + ((l[key] as number) || 0), 0) / Math.min(7, logs.length) * 10) / 10
    : 0;

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.psychology')}</h1>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Log Session
        </Button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Mood', value: avg('overallMood'), icon: Smile },
          { label: 'Avg Focus', value: avg('focusLevel'), icon: Brain },
          { label: 'Avg Stress', value: avg('stressLevel'), icon: Zap, inverse: true },
          { label: 'Avg Readiness', value: avg('tradingReadiness'), icon: Smile },
        ].map(({ label, value, icon: Icon, inverse }) => {
          const color = inverse
            ? (value <= 4 ? 'text-green-400' : value <= 6 ? 'text-yellow-400' : 'text-red-400')
            : (value >= 7 ? 'text-green-400' : value >= 4 ? 'text-yellow-400' : 'text-red-400');
          return (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className={`text-2xl font-bold ${color}`}>{value || '—'}</div>
                <div className="text-xs text-muted-foreground">7-day avg</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mood, Focus & Stress Trend</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 10]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                    <Line type="monotone" dataKey="mood" name="Mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="focus" name="Focus" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="readiness" name="Readiness" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data yet — log your first session</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No logs yet</p>}
              {logs.slice(0, 8).map(log => {
                const MoodIcon = log.overallMood >= 7 ? Smile : log.overallMood <= 4 ? Frown : Meh;
                const moodColor = log.overallMood >= 7 ? 'text-green-400' : log.overallMood <= 4 ? 'text-red-400' : 'text-yellow-400';
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/30 transition-colors group">
                    <MoodIcon className={`w-5 h-5 ${moodColor} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mood {log.overallMood}/10</span>
                          <button onClick={() => log.id && deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {log.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.notes}</p>}
                      {log.triggers.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {log.triggers.slice(0, 2).map((tr, i) => <Badge key={i} variant="secondary" className="text-xs py-0">{tr}</Badge>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotion vs Performance */}
      {emotionData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Emotion vs Performance (Avg R by Pre-Trade State)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}R`} />
                  <YAxis type="category" dataKey="emotion" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any) => [`${v}R avg`, 'Avg R']} />
                  <Bar dataKey="avgR" radius={[0, 4, 4, 0]}>
                    {emotionData.map((e, i) => <Cell key={i} fill={e.avgR >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Based on {trades.filter(t => t.status === 'completed').length} completed trades</p>
          </CardContent>
        </Card>
      )}

      {/* Log Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log Psychology Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Session</Label>
                <Select value={form.sessionType} onValueChange={v => set('sessionType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-market">Pre-Market</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="post-session">Post-Session</SelectItem>
                    <SelectItem value="daily">Daily Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/20 border space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mental State (1=low, 10=high)</div>
              <SliderField label="Overall Mood" name="overallMood" value={form.overallMood} onChange={v => set('overallMood', v)} />
              <SliderField label="Energy Level" name="energyLevel" value={form.energyLevel} onChange={v => set('energyLevel', v)} />
              <SliderField label="Stress Level (low is best)" name="stressLevel" value={form.stressLevel} onChange={v => set('stressLevel', v)} />
              <SliderField label="Focus / Concentration" name="focusLevel" value={form.focusLevel} onChange={v => set('focusLevel', v)} />
              <SliderField label="Sleep Quality (last night)" name="sleepQuality" value={form.sleepQuality} onChange={v => set('sleepQuality', v)} />
              <SliderField label="Motivation" name="motivation" value={form.motivation} onChange={v => set('motivation', v)} />
              <SliderField label="Confidence" name="confidenceLevel" value={form.confidenceLevel} onChange={v => set('confidenceLevel', v)} />
              <SliderField label="Trading Readiness" name="tradingReadiness" value={form.tradingReadiness} onChange={v => set('tradingReadiness', v)} />
            </div>

            <div className="space-y-1.5">
              <Label>Notes / Observations</Label>
              <Textarea rows={3} placeholder="How are you feeling? Any thoughts, worries, or insights..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Triggers / Stressors</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. Missed entry, news event..." value={triggerInput} onChange={e => setTriggerInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTrigger()} />
                <Button type="button" variant="outline" size="sm" onClick={addTrigger}>Add</Button>
              </div>
              {form.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.triggers.map((tr, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => set('triggers', form.triggers.filter((_, j) => j !== i))}>
                      {tr} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
