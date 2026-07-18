import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfile } from "../hooks/useProfile";
import { useUiStore } from "../stores/uiStore";
import { useTheme } from "next-themes";
import { db } from "../db/database";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Download, Upload, Trash2, User, Palette, Globe, Database,
  CheckCircle2, AlertTriangle, Sun, Moon
} from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const { profile, loading, updateProfile } = useProfile();
  const { language, setLanguage } = useUiStore();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const [form, setForm] = useState({
    name: profile?.name || '',
    accountSize: profile?.accountSize || 10000,
    riskPerTradeDefault: profile?.riskPerTradeDefault || 1,
    preferredCurrency: profile?.preferredCurrency || 'USD',
    bio: profile?.bio || '',
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  // Export all data as JSON
  const handleExport = async () => {
    setExporting(true);
    try {
      const [trades, growthCycles, cycleMissions, psychologyLogs, traderProfile] = await Promise.all([
        db.trades.toArray(),
        db.growthCycles.toArray(),
        db.cycleMissions.toArray(),
        db.psychologyLogs.toArray(),
        db.traderProfile.toArray(),
      ]);
      const exportData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        app: 'TraderMind OS',
        data: { trades, growthCycles, cycleMissions, psychologyLogs, traderProfile },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradermind-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
    setExporting(false);
  };

  // Import JSON backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess('');
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = JSON.parse(raw);
        if (!parsed.data || !parsed.app) throw new Error('Invalid TraderMind backup file.');
        const { trades, growthCycles, cycleMissions, psychologyLogs, traderProfile } = parsed.data;

        await db.transaction('rw', db.trades, db.growthCycles, db.cycleMissions, db.psychologyLogs, db.traderProfile, async () => {
          if (trades?.length) {
            const stripped = trades.map(({ id, ...rest }: any) => rest);
            await db.trades.bulkAdd(stripped);
          }
          if (growthCycles?.length) {
            const stripped = growthCycles.map(({ id, ...rest }: any) => rest);
            await db.growthCycles.bulkAdd(stripped);
          }
          if (cycleMissions?.length) {
            const stripped = cycleMissions.map(({ id, ...rest }: any) => rest);
            await db.cycleMissions.bulkAdd(stripped);
          }
          if (psychologyLogs?.length) {
            const stripped = psychologyLogs.map(({ id, ...rest }: any) => rest);
            await db.psychologyLogs.bulkAdd(stripped);
          }
          if (traderProfile?.length) {
            const stripped = traderProfile.map(({ id, ...rest }: any) => rest);
            await db.traderProfile.bulkAdd(stripped);
          }
        });
        setImportSuccess(`Successfully imported: ${trades?.length || 0} trades, ${growthCycles?.length || 0} cycles, ${psychologyLogs?.length || 0} psychology logs.`);
      } catch (err: any) {
        setImportError(err.message || 'Failed to import. Make sure it\'s a valid TraderMind backup file.');
      }
      setImporting(false);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleClearAll = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    try {
      await db.transaction('rw', db.trades, db.growthCycles, db.cycleMissions, db.psychologyLogs, db.traderProfile, async () => {
        await db.trades.clear();
        await db.growthCycles.clear();
        await db.cycleMissions.clear();
        await db.psychologyLogs.clear();
        await db.traderProfile.clear();
      });
      localStorage.removeItem('tradermind_seeded');
      setClearConfirm(false);
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">{t('nav.settings')}</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Trader Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={form.preferredCurrency} onValueChange={v => set('preferredCurrency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="IRR">IRR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Account Size ($)</Label>
              <Input type="number" value={form.accountSize} onChange={e => set('accountSize', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Default Risk Per Trade (%)</Label>
              <Input type="number" step="0.1" min="0.1" max="10" value={form.riskPerTradeDefault} onChange={e => set('riskPerTradeDefault', Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Input placeholder="A short description of your trading style..." value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saved ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> Saved!</> : saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="w-4 h-4" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Theme</div>
              <div className="text-xs text-muted-foreground">Switch between dark and light mode</div>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')} className="gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Dark
              </Button>
              <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')} className="gap-1.5">
                <Sun className="w-3.5 h-3.5" /> Light
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Language</div>
              <div className="text-xs text-muted-foreground">Interface language and text direction</div>
            </div>
            <div className="flex gap-2">
              <Button variant={language === 'fa' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('fa')}>
                فارسی
              </Button>
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>
                English
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Database className="w-4 h-4" /> Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-4 rounded-xl bg-secondary/20 border space-y-3">
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Export Backup
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Download all your trades, cycles, psychology logs, and profile as a JSON file.
              </div>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export All Data (.json)'}
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-secondary/20 border space-y-3">
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" /> Import Backup
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Restore data from a TraderMind backup file. Existing data will be kept — imported records are added.
              </div>
            </div>
            <label className="cursor-pointer">
              <Button variant="outline" className="gap-2" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importing...' : 'Import Backup (.json)'}
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
                </span>
              </Button>
            </label>
            {importSuccess && (
              <div className="flex items-start gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {importSuccess}
              </div>
            )}
            {importError && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {importError}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
            <div>
              <div className="font-medium text-sm text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Clear All Data
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Permanently delete all trades, cycles, and logs. This cannot be undone.
              </div>
            </div>
            <Button variant="destructive" onClick={handleClearAll} className="gap-2 bg-destructive/80 hover:bg-destructive">
              <Trash2 className="w-4 h-4" />
              {clearConfirm ? 'Click again to CONFIRM deletion' : 'Clear All Data'}
            </Button>
            {clearConfirm && (
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setClearConfirm(false)}>
                Cancel
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>TraderMind OS</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">v2.0</Badge>
              <Badge variant="outline" className="text-xs">Local-First PWA</Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">
            All data stored locally on your device using IndexedDB. No account required. No cloud sync.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
