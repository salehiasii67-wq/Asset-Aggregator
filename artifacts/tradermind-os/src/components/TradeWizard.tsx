import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Trade } from "../db/database";
import { useTrades } from "../hooks/useTrades";
import { computeTradeQualityScore } from "../lib/analytics";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Save } from "lucide-react";

const STEPS = [
  { id: 1, label: "Trade Info" },
  { id: 2, label: "Market" },
  { id: 3, label: "Strategy" },
  { id: 4, label: "Risk" },
  { id: 5, label: "Psychology" },
  { id: 6, label: "Execution" },
  { id: 7, label: "Review" },
];

type FormData = Partial<Trade>;

function SliderField({ label, name, value, onChange, min = 1, max = 10 }: { label: string; name: string; value?: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const v = value ?? Math.round((min + max) / 2);
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-sm font-bold text-primary">{v}/{max}</span>
      </div>
      <input
        type="range" min={min} max={max} value={v}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 accent-primary cursor-pointer"
      />
    </div>
  );
}

export function TradeWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { addTrade } = useTrades();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    symbol: "", direction: "long", sessionType: "london",
    date: new Date().toISOString().split("T")[0],
    status: "completed", strategy: "", riskPercent: 1, riskAmount: 0,
    entryPrice: 0, stopLoss: 0, takeProfit: 0, positionSize: 0,
    entryQuality: 7, exitQuality: 7, mentalState: 7, planQuality: 7,
    preTradeEmotion: "neutral", rulesFollowed: true, setupNotes: "",
    preConfidence: 7, preStress: 3, preFocus: 7, preEnergy: 7,
    preMotivation: 7, preDiscipline: 7, preFear: 3, prePatience: 7,
  });

  const set = (key: keyof Trade, val: any) => setForm(p => ({ ...p, [key]: val }));

  const qualityScore = computeTradeQualityScore(form);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rr = form.entryPrice && form.stopLoss && form.takeProfit
        ? Math.abs((form.takeProfit - form.entryPrice) / (form.entryPrice - form.stopLoss))
        : undefined;
      const trade: Omit<Trade, 'id'> = {
        ...form as any,
        riskReward: rr,
        tradeQualityScore: qualityScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addTrade(trade);
      onOpenChange(false);
      setStep(1);
      setForm({ symbol: "", direction: "long", sessionType: "london", date: new Date().toISOString().split("T")[0], status: "completed", strategy: "", riskPercent: 1, riskAmount: 0, entryPrice: 0, stopLoss: 0, takeProfit: 0, positionSize: 0, entryQuality: 7, exitQuality: 7, mentalState: 7, planQuality: 7, preTradeEmotion: "neutral", rulesFollowed: true, setupNotes: "", preConfidence: 7, preStress: 3, preFocus: 7, preEnergy: 7, preMotivation: 7, preDiscipline: 7, preFear: 3, prePatience: 7 });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{t('dashboard.newTrade')}</span>
            <span className="ml-auto text-xs text-muted-foreground font-normal">Step {step} of 7</span>
          </DialogTitle>
        </DialogHeader>

        {/* Steps bar */}
        <div className="flex gap-1 mt-1">
          {STEPS.map(s => (
            <button key={s.id} onClick={() => setStep(s.id)}
              className={cn("flex-1 h-1.5 rounded-full transition-colors", step >= s.id ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <div className="text-xs font-medium text-primary">{STEPS[step - 1].label}</div>

        <div className="min-h-[340px]">
          {/* STEP 1: Trade Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Symbol *</Label>
                  <Input placeholder="EURUSD / XAUUSD" value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date *</Label>
                  <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Direction *</Label>
                  <Select value={form.direction} onValueChange={v => set("direction", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long (Buy)</SelectItem>
                      <SelectItem value="short">Short (Sell)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Session *</Label>
                  <Select value={form.sessionType} onValueChange={v => set("sessionType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="overlap">Overlap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Entry Price *</Label>
                  <Input type="number" step="0.00001" placeholder="0.00000" value={form.entryPrice || ""} onChange={e => set("entryPrice", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Position Size</Label>
                  <Input type="number" step="0.01" placeholder="1.00" value={form.positionSize || ""} onChange={e => set("positionSize", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Stop Loss *</Label>
                  <Input type="number" step="0.00001" value={form.stopLoss || ""} onChange={e => set("stopLoss", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Take Profit</Label>
                  <Input type="number" step="0.00001" value={form.takeProfit || ""} onChange={e => set("takeProfit", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Exit Price</Label>
                  <Input type="number" step="0.00001" value={form.exitPrice || ""} onChange={e => set("exitPrice", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Commission ($)</Label>
                  <Input type="number" step="0.01" value={form.commission || ""} onChange={e => set("commission", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Market Context */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Market Condition</Label>
                  <Select value={form.marketCondition} onValueChange={v => set("marketCondition", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="ranging">Ranging</SelectItem>
                      <SelectItem value="breakout">Breakout</SelectItem>
                      <SelectItem value="reversal">Reversal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Volatility</Label>
                  <Select value={form.volatility} onValueChange={v => set("volatility", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Why does this trade exist? *</Label>
                <Textarea rows={3} placeholder="The rationale and thesis behind this trade..." value={form.tradeRationale || ""} onChange={e => set("tradeRationale", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>What was the setup?</Label>
                <Textarea rows={3} placeholder="Describe the price action / structure that formed the setup..." value={form.setupDescription || ""} onChange={e => set("setupDescription", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>What confirmed the entry?</Label>
                <Input placeholder="Candle close, indicator, order flow..." value={form.entryConfirmation || ""} onChange={e => set("entryConfirmation", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="news" checked={form.newsCondition || false} onChange={e => set("newsCondition", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="news" className="cursor-pointer">High-impact news in this session</Label>
              </div>
            </div>
          )}

          {/* STEP 3: Strategy */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Strategy *</Label>
                  <Input placeholder="e.g. Breakout, Trend Follow..." value={form.strategy} onChange={e => set("strategy", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Setup Type</Label>
                  <Input placeholder="e.g. BOS + Retest..." value={form.setupType || ""} onChange={e => set("setupType", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Playbook Pattern</Label>
                <Input placeholder="e.g. A+ London Continuation..." value={form.playbookPattern || ""} onChange={e => set("playbookPattern", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Setup Notes / Checklist</Label>
                <Textarea rows={4} placeholder="- Trend confirmed on H4&#10;- Entry on M15 pullback&#10;- Risk within limits" value={form.setupNotes} onChange={e => set("setupNotes", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan Quality</Label>
                <SliderField label="How well prepared was the plan?" name="planQuality" value={form.planQuality} onChange={v => set("planQuality", v)} />
              </div>
            </div>
          )}

          {/* STEP 4: Risk Management */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Risk % *</Label>
                  <Input type="number" step="0.1" min="0" max="10" value={form.riskPercent || ""} onChange={e => set("riskPercent", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Risk Amount ($)</Label>
                  <Input type="number" step="1" value={form.riskAmount || ""} onChange={e => set("riskAmount", Number(e.target.value))} />
                </div>
              </div>
              {form.entryPrice && form.stopLoss && form.takeProfit ? (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk/Reward Analysis</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Risk</div>
                      <div className="font-bold text-destructive">{Math.abs(form.entryPrice - form.stopLoss).toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Reward</div>
                      <div className="font-bold text-green-500">{Math.abs(form.takeProfit - form.entryPrice).toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">R:R Ratio</div>
                      <div className={cn("font-bold", Math.abs((form.takeProfit - form.entryPrice) / (form.entryPrice - form.stopLoss)) >= 2 ? "text-green-500" : "text-yellow-500")}>
                        1:{Math.abs((form.takeProfit - form.entryPrice) / (form.entryPrice - form.stopLoss)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {form.riskPercent > 2 && (
                    <div className="text-xs text-destructive font-medium">Risk exceeds 2% — review your position sizing</div>
                  )}
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label>Expected R Multiple</Label>
                <Input type="number" step="0.1" placeholder="2.0" value={form.expectedR || ""} onChange={e => set("expectedR", Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* STEP 5: Psychology */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Before Trade</div>
              <div className="space-y-1.5">
                <Label>Primary Emotion</Label>
                <Select value={form.preTradeEmotion} onValueChange={v => set("preTradeEmotion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["calm","confident","neutral","anxious","fearful","excited","frustrated","impatient"].map(e => (
                      <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SliderField label="Confidence" name="preConfidence" value={form.preConfidence} onChange={v => set("preConfidence", v)} />
                <SliderField label="Focus" name="preFocus" value={form.preFocus} onChange={v => set("preFocus", v)} />
                <SliderField label="Stress (low is good)" name="preStress" value={form.preStress} onChange={v => set("preStress", v)} />
                <SliderField label="Fear (low is good)" name="preFear" value={form.preFear} onChange={v => set("preFear", v)} />
                <SliderField label="Patience" name="prePatience" value={form.prePatience} onChange={v => set("prePatience", v)} />
                <SliderField label="Discipline" name="preDiscipline" value={form.preDiscipline} onChange={v => set("preDiscipline", v)} />
                <SliderField label="Energy" name="preEnergy" value={form.preEnergy} onChange={v => set("preEnergy", v)} />
                <SliderField label="Motivation" name="preMotivation" value={form.preMotivation} onChange={v => set("preMotivation", v)} />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Behavior Check</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "followedPlan", label: "Followed my plan" },
                  { key: "rulesFollowed", label: "Rules followed" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={(form as any)[key] ?? false} onChange={e => set(key as keyof Trade, e.target.checked)} className="w-4 h-4 accent-primary" />
                    <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
                {[
                  { key: "hesitated", label: "Hesitated at entry" },
                  { key: "rushed", label: "Rushed the entry" },
                  { key: "brokRules", label: "Broke a rule" },
                  { key: "emotionAffectedDecision", label: "Emotion affected decision" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={(form as any)[key] ?? false} onChange={e => set(key as keyof Trade, e.target.checked)} className="w-4 h-4 accent-primary" />
                    <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Execution Quality */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SliderField label="Entry Quality" name="entryQuality" value={form.entryQuality} onChange={v => set("entryQuality", v)} />
                <SliderField label="Exit Quality" name="exitQuality" value={form.exitQuality} onChange={v => set("exitQuality", v)} />
                <SliderField label="Management Quality" name="managementQuality" value={form.managementQuality} onChange={v => set("managementQuality", v)} />
                <SliderField label="Decision Quality" name="decisionQuality" value={form.decisionQuality} onChange={v => set("decisionQuality", v)} />
                <SliderField label="Patience During Trade" name="patienceScore" value={form.patienceScore} onChange={v => set("patienceScore", v)} />
                <SliderField label="Mental State (Overall)" name="mentalState" value={form.mentalState} onChange={v => set("mentalState", v)} />
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border text-center">
                <div className="text-xs text-muted-foreground mb-1">Execution Score (computed)</div>
                <div className={cn("text-4xl font-black", qualityScore >= 70 ? "text-green-500" : qualityScore >= 50 ? "text-yellow-500" : "text-destructive")}>
                  {qualityScore}
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {qualityScore >= 80 ? "A+ Trade — professional execution" : qualityScore >= 65 ? "Good trade — minor improvements possible" : qualityScore >= 50 ? "Average — review what could improve" : "Needs improvement — analyze the issues"}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Review */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>P&L ($)</Label>
                  <Input type="number" step="0.01" value={form.pnl || ""} onChange={e => set("pnl", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>R-Multiple</Label>
                  <Input type="number" step="0.01" value={form.pnlR || ""} onChange={e => set("pnlR", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Outcome</Label>
                  <Select value={form.outcome} onValueChange={v => set("outcome", v)}>
                    <SelectTrigger><SelectValue placeholder="Result..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="breakeven">Breakeven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Post-Trade Emotion</Label>
                <Select value={form.postEmotion} onValueChange={v => set("postEmotion", v)}>
                  <SelectTrigger><SelectValue placeholder="How do you feel?" /></SelectTrigger>
                  <SelectContent>
                    {["satisfied","neutral","frustrated","disappointed","excited","calm","anxious","relieved"].map(e => (
                      <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>What went right?</Label>
                <Textarea rows={2} placeholder="What did you execute well?" value={form.whatWentRight || ""} onChange={e => set("whatWentRight", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>What went wrong?</Label>
                <Textarea rows={2} placeholder="What could have been better?" value={form.whatWentWrong || ""} onChange={e => set("whatWentWrong", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Lesson Learned</Label>
                <Textarea rows={2} placeholder="Key takeaway from this trade..." value={form.lessonLearned || ""} onChange={e => set("lessonLearned", e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">{step}/7</div>
          {step < 7 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? "Saving..." : "Save Trade"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
