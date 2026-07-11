import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useProfile } from "../hooks/useProfile";
import { Brain, Swords, Shield, Target, Map as MapIcon } from "lucide-react";

export default function Evolution() {
  const { t } = useTranslation();
  const { profile, loading } = useProfile();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const level = profile?.level || 1;
  const nextLevelProgress = 45; // Mock data

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.evolution')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3 border-primary/20 bg-gradient-to-r from-card to-primary/5">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 border-4 border-primary rounded-full opacity-20"></div>
              <div 
                className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
                style={{ transform: `rotate(${nextLevelProgress * 3.6}deg)` }}
              ></div>
              <div className="text-center">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">LEVEL</div>
                <div className="text-5xl font-black text-primary">{level}</div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Stage: The System Builder</h2>
              <p className="text-muted-foreground mb-4 max-w-2xl">
                You have moved past searching for the "holy grail" indicator and are now focused on consistency, edge definition, and execution flawlessless.
              </p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${nextLevelProgress}%` }}></div>
              </div>
              <div className="text-xs text-right mt-1 text-muted-foreground">{nextLevelProgress}% to Level {level + 1}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" /> Edge Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Environment</div>
              <div className="font-medium">London Session, High Volatility</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary Weapon</div>
              <div className="font-medium">Trend Continuation Pullbacks</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fatal Flaw</div>
              <div className="font-medium text-destructive">Boredom induced counter-trend setups</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" /> Era Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-6">
              <div className="relative">
                <div className="absolute -left-[31px] bg-primary w-4 h-4 rounded-full border-4 border-card"></div>
                <h4 className="font-bold">Present Era</h4>
                <p className="text-sm text-muted-foreground">Focus on execution quality and risk management.</p>
              </div>
              <div className="relative opacity-60">
                <div className="absolute -left-[31px] bg-muted-foreground w-4 h-4 rounded-full border-4 border-card"></div>
                <h4 className="font-bold">The Drawdown Era (Oct 2023 - Jan 2024)</h4>
                <p className="text-sm text-muted-foreground">Survived a 15% drawdown without breaking rules. Built resilience.</p>
              </div>
              <div className="relative opacity-40">
                <div className="absolute -left-[31px] bg-muted-foreground w-4 h-4 rounded-full border-4 border-card"></div>
                <h4 className="font-bold">The Discovery Era (Jan 2023 - Oct 2023)</h4>
                <p className="text-sm text-muted-foreground">Tested various strategies. Settled on current playbook.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}