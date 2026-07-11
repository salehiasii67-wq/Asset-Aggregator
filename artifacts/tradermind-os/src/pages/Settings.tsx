import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useProfile } from "../hooks/useProfile";
import { useUiStore } from "../stores/uiStore";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Download, Upload, MonitorSmartphone } from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const { profile, updateProfile, loading } = useProfile();
  const { language, setLanguage } = useUiStore();
  const { theme, setTheme } = useTheme();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const handleExport = async () => {
    // Basic export logic placeholder - to be implemented fully later
    console.log("Export triggered");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">{t('nav.settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Trader Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              defaultValue={profile?.name || ''} 
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountSize">Account Size ($)</Label>
              <Input 
                id="accountSize" 
                type="number" 
                defaultValue={profile?.accountSize || 0}
                onChange={(e) => updateProfile({ accountSize: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskPerTrade">Default Risk %</Label>
              <Input 
                id="riskPerTrade" 
                type="number" 
                step="0.1"
                defaultValue={profile?.riskPerTradeDefault || 1}
                onChange={(e) => updateProfile({ riskPerTradeDefault: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">Select your preferred interface language</p>
            </div>
            <Select value={language} onValueChange={(v: 'en'|'fa') => setLanguage(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (LTR)</SelectItem>
                <SelectItem value="fa">فارسی (RTL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Dark mode is highly recommended for eye strain</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            TraderMind OS stores all data locally in your browser. There is no backend server. 
            Export your data regularly to avoid losing it if you clear your browser data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Backup (JSON)
            </Button>
            <Button variant="outline" className="gap-2 text-primary border-primary/50 hover:bg-primary/10">
              <Upload className="w-4 h-4" />
              Import Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground py-8">
        <MonitorSmartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>TraderMind OS v1.0.0</p>
        <p>Local-First PWA</p>
      </div>
    </div>
  );
}