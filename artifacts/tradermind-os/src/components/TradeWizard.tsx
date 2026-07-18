import { useState, useEffect } from "react";
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
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

type FormData = Partial<Trade>;

const EMPTY_FORM: FormData = {
  symbol: "", direction: "long", sessionType: "london",
  date: new Date().toISOString().split("T")[0],
  status: "completed", strategy: "", riskPercent: 1, riskAmount: 0,
  entryPrice: 0, stopLoss: 0, takeProfit: 0, positionSize: 0,
  entryQuality: 7, exitQuality: 7, mentalState: 7, planQuality: 7,
  preTradeEmotion: "neutral", rulesFollowed: true, setupNotes: "",
  preConfidence: 7, preStress: 3, preFocus: 7, preEnergy: 7,
  preMotivation: 7, preDiscipline: 7, preFear: 3, prePatience: 7,
};

function SliderField({ label, value, onChange, min = 1, max = 10 }: {
  label: string; value?: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  const v = value ?? Math.round((min + max) / 2);
  const color = v >= 7 ? "text-green-400" : v >= 4 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className={cn("text-sm font-bold", color)}>{v}/{max}</span>
      </div>
      <input type="range" min={min} max={max} value={v}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 accent-primary cursor-pointer" />
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Trade;
  mode?: 'add' | 'edit';
}

export function TradeWizard({ open, onOpenChange, initialData, mode = 'add' }: Props) {
  const { t } = useTranslation();
  const { addTrade, updateTrade } = useTrades();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(initialData || EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(initialData || EMPTY_FORM);
      setStep(1);
    }
  }, [open, initialData]);

  const set = (key: keyof Trade, val: any) => setForm(p => ({ ...p, [key]: val }));

  // Auto-calculate R-Multiple when pnl or riskAmount changes
  useEffect(() => {
    if (form.pnl !== undefined && form.riskAmount && form.riskAmount > 0) {
      const autoR = parseFloat((form.pnl / form.riskAmount).toFixed(2));
      setForm(p => ({ ...p, pnlR: autoR }));
    }
  }, [form.pnl, form.riskAmount]);

  const qualityScore = computeTradeQualityScore(form);

  const rr = form.entryPrice && form.stopLoss && form.takeProfit
    ? Math.abs((form.takeProfit - form.entryPrice) / (form.entryPrice - form.stopLoss))
    : undefined;

  const handleSave = async () => {
    setSaving(true);
    try {
      const trade: Omit<Trade, 'id'> = {
        ...form as any,
        riskReward: rr,
        tradeQualityScore: qualityScore,
        updatedAt: new Date().toISOString(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };
      if (mode === 'edit' && initialData?.id) {
        await updateTrade(initialData.id, trade);
      } else {
        await addTrade(trade);
      }
      onOpenChange(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const STEPS = [
    t('wizard.steps.1'), t('wizard.steps.2'), t('wizard.steps.3'),
    t('wizard.steps.4'), t('wizard.steps.5'), t('wizard.steps.6'), t('wizard.steps.7')
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[660px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{mode === 'edit' ? t('journal.editTrade') : t('wizard.title')}</span>
            <span className="ml-auto text-xs text-muted-foreground font-normal">{t('wizard.step')} {step} {t('wizard.of')} 7</span>
          </DialogTitle>
        </DialogHeader>

        {/* Step progress bar */}
        <div className="flex gap-1 mt-1">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i + 1)}
              className={cn("flex-1 h-1.5 rounded-full transition-colors", step >= i + 1 ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <div className="text-xs font-semibold text-primary">{STEPS[step - 1]}</div>

        <div className="min-h-[340px]">

          {/* ─── STEP 1: اطلاعات معامله ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.symbol')}</Label>
                  <Input placeholder={t('wizard.step1.symbolPlaceholder')} value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.date')}</Label>
                  <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.direction')}</Label>
                  <Select value={form.direction} onValueChange={v => set("direction", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">{t('wizard.step1.directionLong')}</SelectItem>
                      <SelectItem value="short">{t('wizard.step1.directionShort')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.session')}</Label>
                  <Select value={form.sessionType} onValueChange={v => set("sessionType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="london">{t('wizard.step1.sessionLondon')}</SelectItem>
                      <SelectItem value="ny">{t('wizard.step1.sessionNY')}</SelectItem>
                      <SelectItem value="asian">{t('wizard.step1.sessionAsian')}</SelectItem>
                      <SelectItem value="overlap">{t('wizard.step1.sessionOverlap')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.entryPrice')}</Label>
                  <Input type="number" step="0.00001" placeholder="0.00000" value={form.entryPrice || ""} onChange={e => set("entryPrice", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.positionSize')}</Label>
                  <Input type="number" step="0.01" placeholder="1.00" value={form.positionSize || ""} onChange={e => set("positionSize", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.stopLoss')}</Label>
                  <Input type="number" step="0.00001" value={form.stopLoss || ""} onChange={e => set("stopLoss", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.takeProfit')}</Label>
                  <Input type="number" step="0.00001" value={form.takeProfit || ""} onChange={e => set("takeProfit", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.exitPrice')}</Label>
                  <Input type="number" step="0.00001" value={form.exitPrice || ""} onChange={e => set("exitPrice", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.commission')}</Label>
                  <Input type="number" step="0.01" value={form.commission || ""} onChange={e => set("commission", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step1.status')}</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">{t('wizard.step1.statusCompleted')}</SelectItem>
                      <SelectItem value="planned">{t('wizard.step1.statusPlanned')}</SelectItem>
                      <SelectItem value="active">{t('wizard.step1.statusActive')}</SelectItem>
                      <SelectItem value="cancelled">{t('wizard.step1.statusCancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: زمینه بازار ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step2.marketCondition')}</Label>
                  <Select value={form.marketCondition} onValueChange={v => set("marketCondition", v)}>
                    <SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">{t('wizard.step2.conditionTrending')}</SelectItem>
                      <SelectItem value="ranging">{t('wizard.step2.conditionRanging')}</SelectItem>
                      <SelectItem value="breakout">{t('wizard.step2.conditionBreakout')}</SelectItem>
                      <SelectItem value="reversal">{t('wizard.step2.conditionReversal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step2.volatility')}</Label>
                  <Select value={form.volatility} onValueChange={v => set("volatility", v)}>
                    <SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('wizard.step2.volLow')}</SelectItem>
                      <SelectItem value="medium">{t('wizard.step2.volMedium')}</SelectItem>
                      <SelectItem value="high">{t('wizard.step2.volHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step2.rationale')}</Label>
                <Textarea rows={3} placeholder={t('wizard.step2.rationalePlaceholder')} value={form.tradeRationale || ""} onChange={e => set("tradeRationale", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step2.setup')}</Label>
                <Textarea rows={3} placeholder={t('wizard.step2.setupPlaceholder')} value={form.setupDescription || ""} onChange={e => set("setupDescription", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step2.confirmation')}</Label>
                <Input placeholder={t('wizard.step2.confirmationPlaceholder')} value={form.entryConfirmation || ""} onChange={e => set("entryConfirmation", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="news" checked={form.newsCondition || false} onChange={e => set("newsCondition", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="news" className="cursor-pointer text-sm">{t('wizard.step2.newsCondition')}</Label>
              </div>
            </div>
          )}

          {/* ─── STEP 3: استراتژی ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step3.strategy')}</Label>
                  <Input placeholder={t('wizard.step3.strategyPlaceholder')} value={form.strategy} onChange={e => set("strategy", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step3.setupType')}</Label>
                  <Input placeholder={t('wizard.step3.setupTypePlaceholder')} value={form.setupType || ""} onChange={e => set("setupType", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step3.playbookPattern')}</Label>
                <Input placeholder={t('wizard.step3.playbookPlaceholder')} value={form.playbookPattern || ""} onChange={e => set("playbookPattern", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step3.setupNotes')}</Label>
                <Textarea rows={4} placeholder={t('wizard.step3.setupNotesPlaceholder')} value={form.setupNotes} onChange={e => set("setupNotes", e.target.value)} />
              </div>
              <SliderField label={t('wizard.step3.planQuality')} value={form.planQuality} onChange={v => set("planQuality", v)} />
            </div>
          )}

          {/* ─── STEP 4: مدیریت ریسک ─── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step4.riskPct')}</Label>
                  <Input type="number" step="0.1" min="0" max="10" value={form.riskPercent || ""} onChange={e => set("riskPercent", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step4.riskAmount')}</Label>
                  <Input type="number" step="1" value={form.riskAmount || ""} onChange={e => set("riskAmount", Number(e.target.value))} />
                </div>
              </div>
              {form.entryPrice && form.stopLoss && form.takeProfit ? (
                <div className="p-4 rounded-xl bg-secondary/30 border space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wizard.step4.rrAnalysis')}</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">{t('wizard.step4.risk')}</div>
                      <div className="font-bold text-destructive">{Math.abs(form.entryPrice - form.stopLoss).toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{t('wizard.step4.reward')}</div>
                      <div className="font-bold text-green-500">{Math.abs(form.takeProfit - form.entryPrice).toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{t('wizard.step4.rrRatio')}</div>
                      <div className={cn("font-bold", rr && rr >= 2 ? "text-green-500" : "text-yellow-500")}>
                        1:{rr?.toFixed(2) || '—'}
                      </div>
                    </div>
                  </div>
                  {(form.riskPercent || 0) > 2 && (
                    <div className="text-xs text-destructive font-medium text-center">{t('wizard.step4.highRiskWarning')}</div>
                  )}
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label>{t('wizard.step4.expectedR')}</Label>
                <Input type="number" step="0.1" placeholder={t('wizard.step4.expectedRPlaceholder')} value={form.expectedR || ""} onChange={e => set("expectedR", Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* ─── STEP 5: روانشناسی ─── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wizard.step5.beforeTrade')}</div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step5.primaryEmotion')}</Label>
                <Select value={form.preTradeEmotion} onValueChange={v => set("preTradeEmotion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">{t('wizard.step5.emotionCalm')}</SelectItem>
                    <SelectItem value="confident">{t('wizard.step5.emotionConfident')}</SelectItem>
                    <SelectItem value="neutral">{t('wizard.step5.emotionNeutral')}</SelectItem>
                    <SelectItem value="anxious">{t('wizard.step5.emotionAnxious')}</SelectItem>
                    <SelectItem value="fearful">{t('wizard.step5.emotionFearful')}</SelectItem>
                    <SelectItem value="excited">{t('wizard.step5.emotionExcited')}</SelectItem>
                    <SelectItem value="frustrated">{t('wizard.step5.emotionFrustrated')}</SelectItem>
                    <SelectItem value="impatient">{t('wizard.step5.emotionImpatient')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SliderField label={t('wizard.step5.confidence')} value={form.preConfidence} onChange={v => set("preConfidence", v)} />
                <SliderField label={t('wizard.step5.focus')} value={form.preFocus} onChange={v => set("preFocus", v)} />
                <SliderField label={t('wizard.step5.stress')} value={form.preStress} onChange={v => set("preStress", v)} />
                <SliderField label={t('wizard.step5.fear')} value={form.preFear} onChange={v => set("preFear", v)} />
                <SliderField label={t('wizard.step5.patience')} value={form.prePatience} onChange={v => set("prePatience", v)} />
                <SliderField label={t('wizard.step5.discipline')} value={form.preDiscipline} onChange={v => set("preDiscipline", v)} />
                <SliderField label={t('wizard.step5.energy')} value={form.preEnergy} onChange={v => set("preEnergy", v)} />
                <SliderField label={t('wizard.step5.motivation')} value={form.preMotivation} onChange={v => set("preMotivation", v)} />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">{t('wizard.step5.behaviorCheck')}</div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "followedPlan", label: t('wizard.step5.followedPlan') },
                  { key: "rulesFollowed", label: t('wizard.step5.rulesFollowed') },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={(form as any)[key] ?? false} onChange={e => set(key as keyof Trade, e.target.checked)} className="w-4 h-4 accent-primary" />
                    <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
                {([
                  { key: "hesitated", label: t('wizard.step5.hesitated') },
                  { key: "rushed", label: t('wizard.step5.rushed') },
                  { key: "brokRules", label: t('wizard.step5.brokRules') },
                  { key: "emotionAffectedDecision", label: t('wizard.step5.emotionAffected') },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={(form as any)[key] ?? false} onChange={e => set(key as keyof Trade, e.target.checked)} className="w-4 h-4 accent-primary" />
                    <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 6: کیفیت اجرا ─── */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SliderField label={t('wizard.step6.entryQuality')} value={form.entryQuality} onChange={v => set("entryQuality", v)} />
                <SliderField label={t('wizard.step6.exitQuality')} value={form.exitQuality} onChange={v => set("exitQuality", v)} />
                <SliderField label={t('wizard.step6.managementQuality')} value={form.managementQuality} onChange={v => set("managementQuality", v)} />
                <SliderField label={t('wizard.step6.decisionQuality')} value={form.decisionQuality} onChange={v => set("decisionQuality", v)} />
                <SliderField label={t('wizard.step6.patience')} value={form.patienceScore} onChange={v => set("patienceScore", v)} />
                <SliderField label={t('wizard.step6.mentalState')} value={form.mentalState} onChange={v => set("mentalState", v)} />
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border text-center">
                <div className="text-xs text-muted-foreground mb-1">{t('wizard.step6.executionScore')}</div>
                <div className={cn("text-4xl font-black", qualityScore >= 70 ? "text-green-500" : qualityScore >= 50 ? "text-yellow-500" : "text-destructive")}>
                  {qualityScore}<span className="text-sm text-muted-foreground">/100</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {qualityScore >= 80 ? t('wizard.step6.scoreLabelA') : qualityScore >= 65 ? t('wizard.step6.scoreLabelB') : qualityScore >= 50 ? t('wizard.step6.scoreLabelC') : t('wizard.step6.scoreLabelD')}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 7: مرور نهایی ─── */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{t('wizard.step7.pnl')}</Label>
                  <Input type="number" step="0.01" value={form.pnl || ""} onChange={e => set("pnl", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('wizard.step7.pnlR')}</Label>
                  <div className={cn("h-10 flex items-center px-3 rounded-md border bg-secondary/30 font-mono font-bold text-sm",
                    (form.pnlR || 0) >= 0 ? "text-green-400" : "text-destructive")}>
                    {form.pnlR !== undefined ? `${form.pnlR > 0 ? '+' : ''}${form.pnlR}R` : '—'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('wizard.step7.outcome')}</Label>
                  <Select value={form.outcome} onValueChange={v => set("outcome", v)}>
                    <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win">{t('wizard.step7.outcomeWin')}</SelectItem>
                      <SelectItem value="loss">{t('wizard.step7.outcomeLoss')}</SelectItem>
                      <SelectItem value="breakeven">{t('wizard.step7.outcomeBreakeven')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step7.postEmotion')}</Label>
                <Select value={form.postEmotion} onValueChange={v => set("postEmotion", v)}>
                  <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satisfied">{t('wizard.step7.emotionSatisfied')}</SelectItem>
                    <SelectItem value="neutral">{t('wizard.step7.emotionNeutral')}</SelectItem>
                    <SelectItem value="frustrated">{t('wizard.step7.emotionFrustrated')}</SelectItem>
                    <SelectItem value="disappointed">{t('wizard.step7.emotionDisappointed')}</SelectItem>
                    <SelectItem value="excited">{t('wizard.step7.emotionExcited')}</SelectItem>
                    <SelectItem value="calm">{t('wizard.step7.emotionCalm')}</SelectItem>
                    <SelectItem value="anxious">{t('wizard.step7.emotionAnxious')}</SelectItem>
                    <SelectItem value="relieved">{t('wizard.step7.emotionRelieved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step7.whatWentRight')}</Label>
                <Textarea rows={2} placeholder={t('wizard.step7.whatWentRightPlaceholder')} value={form.whatWentRight || ""} onChange={e => set("whatWentRight", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step7.whatWentWrong')}</Label>
                <Textarea rows={2} placeholder={t('wizard.step7.whatWentWrongPlaceholder')} value={form.whatWentWrong || ""} onChange={e => set("whatWentWrong", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wizard.step7.lessonLearned')}</Label>
                <Textarea rows={2} placeholder={t('wizard.step7.lessonPlaceholder')} value={form.lessonLearned || ""} onChange={e => set("lessonLearned", e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('wizard.back')}
          </Button>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", step === i ? "bg-primary" : "bg-secondary")} />
            ))}
          </div>
          {step < 7 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              {t('wizard.next')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? t('wizard.saving') : t('wizard.save')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
