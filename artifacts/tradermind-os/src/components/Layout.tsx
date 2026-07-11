import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useUiStore } from "../stores/uiStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  BrainCircuit,
  TrendingUp,
  Map as MapIcon,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/journal", icon: BookOpen, labelKey: "nav.journal" },
  { href: "/analytics", icon: BarChart2, labelKey: "nav.analytics" },
  { href: "/psychology", icon: BrainCircuit, labelKey: "nav.psychology" },
  { href: "/growth", icon: TrendingUp, labelKey: "nav.growth" },
  { href: "/evolution", icon: MapIcon, labelKey: "nav.evolution" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen, language, setLanguage } = useUiStore();

  const isRtl = language === "fa";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "fa" ? "en" : "fa");
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-64 border-x border-border bg-card transition-all duration-300 z-20",
          isRtl ? "border-l" : "border-r"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <TrendingUp className="w-6 h-6" />
            <span>TraderMind<span className="text-foreground">OS</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{t(item.labelKey)}</span>
                </div>
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-border">
            <Link href="/settings">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === "/settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Settings className="w-5 h-5" />
                <span>{t("nav.settings")}</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" className="font-mono font-bold" onClick={toggleLanguage}>
            {language === "fa" ? "EN" : "FA"}
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 z-10 shrink-0">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <TrendingUp className="w-5 h-5" />
            <span>TraderMind</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/95 backdrop-blur-md z-50 flex items-center justify-around px-2">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
        <Link href="/settings">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer",
              location === "/settings" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Settings className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Mobile FAB */}
      <Link href="/journal?new=true">
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <Button size="icon" className="w-14 h-14 rounded-full shadow-lg">
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </Link>
    </div>
  );
}