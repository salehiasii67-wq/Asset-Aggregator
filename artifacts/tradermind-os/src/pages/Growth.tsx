import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGrowthCycles, useCycleMissions } from "../hooks/useGrowthCycles";
import { GrowthCycle } from "../db/database";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Plus, Target, CheckCircle2, Circle, XCircle, TrendingUp,
  Calendar, Flag, ChevronDown, ChevronUp, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

function MissionList({ cycleId }: { cycleId: number }) {
  const { missions, loading, toggleMission, addMission } = useCycleMissions(cycleId);
  const [newTask, setNewTask] = useState('');
  const done = missions.filter(m => m.status === 'completed').length;
  const pct = missions.length > 0 ? Math.round((done / missions.length) * 100) : 0;

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addMission({ cycleId, date: new Date().toISOString().split('T')[0], task: newTask.trim(), category: 'custom', status: 'pending', createdAt: new Date().toISOString() });
    setNewTask('');
  };

  if (loading) return <div className="text-xs text-muted-foreground py-2">Loading missions...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Today's Missions ({done}/{missions.length})</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      {missions.length > 0 && <Progress value={pct} className="h-1.5" />}
      <div className="space-y-2">
        {missions.map(m => (
          <button key={m.id} onClick={() => m.id && toggleMission(m.id, m.status)}
            className={cn("w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
              m.status === 'completed' ? "bg-green-500/10 border-green-500/30" : "bg-secondary/30 border-border hover:border-primary/50")}>
            {m.status === 'completed'
              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
            <span className={cn("text-sm", m.status === 'completed' && "line-through text-muted-foreground")}>{m.task}</span>
            <Badge variant="outline" className="ml-auto text-xs shrink-0 capitalize">{m.category}</Badge>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Add custom mission..." value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} className="text-sm" />
        <Button size="sm" onClick={handleAdd} variant="outline">Add</Button>
      </div>
    </div>
  );
}

type FormData = {
  name: string; goals: string[]; weaknesses: string[]; focusAreas: string[];
  targetWinRate: string; targetRR: string; notes: string;
};

export default function Growth() {
  const { t } = useTranslation();
  const { cycles, loading, addCycle, completeCycle } = useGrowthCycles();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({ name: '', goals: [''], weaknesses: [''], focusAreas: [''], targetWinRate: '50', targetRR: '2', notes: '' });

  const activeCycle = cycles.find(c => c.status === 'active');
  const pastCycles = cycles.filter(c => c.status !== 'active');

  const setField = (k: keyof FormData, v: any) => setForm(p => ({ ...p, [k]: v }));

  const updateListField = (key: 'goals' | 'weaknesses' | 'focusAreas', idx: number, val: string) => {
    const arr = [...form[key]];
    arr[idx] = val;
    setField(key, arr);
  };

  const addListItem = (key: 'goals' | 'weaknesses' | 'focusAreas') => setField(key, [...form[key], '']);
  const removeListItem = (key: 'goals' | 'weaknesses' | 'focusAreas', idx: number) =>
    setField(key, form[key].filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const cycle: Omit<GrowthCycle, 'id'> = {
        name: form.name,
        startDate: new Date().toISOString(),
        status: 'active',
        goals: form.goals.filter(g => g.trim()),
        weaknesses: form.weaknesses.filter(w => w.trim()),
        focusAreas: form.focusAreas.filter(f => f.trim()),
        targetWinRate: Number(form.targetWinRate),
        targetRR: Number(form.targetRR),
        notes: form.notes,
        createdAt: new Date().toISOString(),
      };
      // Complete any existing active cycle first
      if (activeCycle?.id) await completeCycle(activeCycle.id);
      await addCycle(cycle);
      setOpen(false);
      setForm({ name: '', goals: [''], weaknesses: [''], focusAreas: [''], targetWinRate: '50', targetRR: '2', notes: '' });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.growth')}</h1>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Cycle
        </Button>
      </div>

      {/* Active Cycle */}
      {activeCycle ? (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <Badge className="text-xs bg-primary/20 text-primary border-primary/30">ACTIVE CYCLE</Badge>
                </div>
                <CardTitle className="text-xl">{activeCycle.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Started {new Date(activeCycle.startDate).toLocaleDateString()}
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => activeCycle.id && completeCycle(activeCycle.id)}>
                Complete Cycle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Targets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-secondary/30 text-center">
                <div className="text-2xl font-bold text-primary">{activeCycle.targetWinRate || '—'}%</div>
                <div className="text-xs text-muted-foreground">Target Win Rate</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30 text-center">
                <div className="text-2xl font-bold text-primary">1:{activeCycle.targetRR || '—'}</div>
                <div className="text-xs text-muted-foreground">Target R:R</div>
              </div>
            </div>

            {/* Goals */}
            {activeCycle.goals.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Goals
                </div>
                <div className="space-y-1.5">
                  {activeCycle.goals.map((g, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus Areas */}
            {activeCycle.focusAreas.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  {activeCycle.focusAreas.map((f, i) => <Badge key={i} variant="secondary">{f}</Badge>)}
                </div>
              </div>
            )}

            {/* Weaknesses to Fix */}
            {activeCycle.weaknesses.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weaknesses to Fix</div>
                <div className="flex flex-wrap gap-2">
                  {activeCycle.weaknesses.map((w, i) => <Badge key={i} variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30">{w}</Badge>)}
                </div>
              </div>
            )}

            {/* Missions */}
            <div className="border-t border-border pt-4">
              <MissionList cycleId={activeCycle.id!} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground/40" />
            <div className="text-center">
              <div className="font-semibold text-lg mb-1">No Active Growth Cycle</div>
              <p className="text-sm text-muted-foreground max-w-xs">Create a growth cycle to set goals, track weaknesses, and build daily habits.</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Start First Cycle</Button>
          </CardContent>
        </Card>
      )}

      {/* Past Cycles */}
      {pastCycles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Past Cycles</h2>
          {pastCycles.map(c => (
            <Card key={c.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <CardContent className="pt-4 pb-4">
                <button className="w-full flex items-center justify-between" onClick={() => setExpandedId(expandedId === c.id ? null : (c.id || null))}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.startDate).toLocaleDateString()} — {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'ongoing'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">{c.status}</Badge>
                    {expandedId === c.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {expandedId === c.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {c.goals.length > 0 && (
                      <div><div className="text-xs text-muted-foreground mb-1">Goals</div>
                        {c.goals.map((g, i) => <div key={i} className="text-sm">{g}</div>)}
                      </div>
                    )}
                    {c.focusAreas.length > 0 && (
                      <div><div className="text-xs text-muted-foreground mb-1">Focus Areas</div>
                        <div className="flex gap-2 flex-wrap">{c.focusAreas.map((f, i) => <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>)}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Cycle Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Growth Cycle</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>Cycle Name *</Label>
              <Input placeholder="e.g. Discipline Month, Q3 Focus..." value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Target Win Rate (%)</Label>
                <Input type="number" min="0" max="100" value={form.targetWinRate} onChange={e => setField('targetWinRate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Target R:R Ratio</Label>
                <Input type="number" step="0.5" min="0" value={form.targetRR} onChange={e => setField('targetRR', e.target.value)} />
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Goals</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('goals')} className="text-xs h-7 gap-1"><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {form.goals.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`Goal ${i + 1}...`} value={g} onChange={e => updateListField('goals', i, e.target.value)} />
                  {form.goals.length > 1 && <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeListItem('goals', i)}><XCircle className="w-4 h-4 text-muted-foreground" /></Button>}
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Weaknesses to Fix</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('weaknesses')} className="text-xs h-7 gap-1"><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {form.weaknesses.map((w, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`e.g. FOMO entries, Overtrading...`} value={w} onChange={e => updateListField('weaknesses', i, e.target.value)} />
                  {form.weaknesses.length > 1 && <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeListItem('weaknesses', i)}><XCircle className="w-4 h-4 text-muted-foreground" /></Button>}
                </div>
              ))}
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Focus Areas</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addListItem('focusAreas')} className="text-xs h-7 gap-1"><Plus className="w-3 h-3" /> Add</Button>
              </div>
              {form.focusAreas.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`e.g. Patience, Risk Management...`} value={f} onChange={e => updateListField('focusAreas', i, e.target.value)} />
                  {form.focusAreas.length > 1 && <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeListItem('focusAreas', i)}><XCircle className="w-4 h-4 text-muted-foreground" /></Button>}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} placeholder="Any additional context for this cycle..." value={form.notes} onChange={e => setField('notes', e.target.value)} />
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name.trim()}>{saving ? 'Creating...' : 'Start Cycle'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
