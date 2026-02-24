import { create } from "zustand";

interface DrawerState {
  type: string;
  id: string | number;
}

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeDrawer: DrawerState | null;
  openDrawer: (type: string, id: string | number) => void;
  closeDrawer: () => void;

  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;

  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeDrawer: null,
  openDrawer: (type, id) => set({ activeDrawer: { type, id } }),
  closeDrawer: () => set({ activeDrawer: null }),

  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),

  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
}));
