import { create } from 'zustand';

interface UiState {
  language: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  language: (localStorage.getItem('tradermind_lang') as 'fa' | 'en') || 'fa',
  setLanguage: (lang) => {
    localStorage.setItem('tradermind_lang', lang);
    set({ language: lang });
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  },
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));