import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trade } from "../db/database";
import { useTrades } from "../hooks/useTrades";
import { useLocation } from "wouter";

export function TradeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { addTrade } = useTrades();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("pre");
  const [formData, setFormData] = useState<Partial<Trade>>({
    symbol: "",
    direction: "long",
    strategy: "",
    sessionType: "ny",
    date: new Date().toISOString().split("T")[0],
    status: "planned",
    preTradeEmotion: "neutral",
    mentalState: 7,
    planQuality: 7,
    setupNotes: "",
    riskPercent: 1,
    riskAmount: 0,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    positionSize: 0,
  });

  const updateForm = (key: keyof Trade, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const newTrade = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Omit<Trade, 'id'>;
      
      await addTrade(newTrade);
      onOpenChange(false);
      setLocation('/journal');
      // Reset form
      setActiveTab("pre");
    } catch (error) {
      console.error("Failed to save trade", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dashboard.newTrade')}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pre">Pre-Trade</TabsTrigger>
            <TabsTrigger value="exec">Execution</TabsTrigger>
            <TabsTrigger value="post">Post-Trade</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="pre" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input placeholder="EURUSD" value={formData.symbol} onChange={e => updateForm("symbol", e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={formData.date?.split("T")[0]} onChange={e => updateForm("date", new Date(e.target.value).toISOString())} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select value={formData.direction} onValueChange={v => updateForm("direction", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Input placeholder="Breakout" value={formData.strategy} onChange={e => updateForm("strategy", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select value={formData.sessionType} onValueChange={v => updateForm("sessionType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="overlap">Overlap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emotion Before</Label>
                  <Select value={formData.preTradeEmotion} onValueChange={v => updateForm("preTradeEmotion", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="fearful">Fearful</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Setup Notes & Hypothesis</Label>
                <Textarea 
                  placeholder="Why are you taking this trade?" 
                  rows={3}
                  value={formData.setupNotes}
                  onChange={e => updateForm("setupNotes", e.target.value)}
                />
              </div>

              <Button className="w-full mt-4" onClick={() => setActiveTab("exec")}>Next: Execution</Button>
            </TabsContent>

            <TabsContent value="exec" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Price</Label>
                  <Input type="number" step="0.00001" value={formData.entryPrice || ''} onChange={e => updateForm("entryPrice", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Position Size</Label>
                  <Input type="number" step="0.01" value={formData.positionSize || ''} onChange={e => updateForm("positionSize", Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stop Loss</Label>
                  <Input type="number" step="0.00001" value={formData.stopLoss || ''} onChange={e => updateForm("stopLoss", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Take Profit</Label>
                  <Input type="number" step="0.00001" value={formData.takeProfit || ''} onChange={e => updateForm("takeProfit", Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exit Price</Label>
                  <Input type="number" step="0.00001" value={formData.exitPrice || ''} onChange={e => updateForm("exitPrice", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => updateForm("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button variant="outline" className="w-1/2" onClick={() => setActiveTab("pre")}>Back</Button>
                <Button className="w-1/2" onClick={() => setActiveTab("post")}>Next: Review</Button>
              </div>
            </TabsContent>

            <TabsContent value="post" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>P&L ($)</Label>
                  <Input type="number" step="0.01" value={formData.pnl || ''} onChange={e => updateForm("pnl", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>R-Multiple</Label>
                  <Input type="number" step="0.01" value={formData.pnlR || ''} onChange={e => updateForm("pnlR", Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select value={formData.outcome} onValueChange={v => updateForm("outcome", v)}>
                    <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                      <SelectItem value="breakeven">Breakeven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Execution Score (1-10)</Label>
                  <Input type="number" min="1" max="10" value={formData.executionScore || ''} onChange={e => updateForm("executionScore", Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lessons Learned</Label>
                <Textarea 
                  placeholder="What did you learn from this trade?" 
                  rows={3}
                  value={formData.lessonLearned || ''}
                  onChange={e => updateForm("lessonLearned", e.target.value)}
                />
              </div>

              <div className="flex gap-4 mt-4">
                <Button variant="outline" className="w-1/3" onClick={() => setActiveTab("exec")}>Back</Button>
                <Button className="w-2/3" onClick={handleSave}>Save Trade</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}