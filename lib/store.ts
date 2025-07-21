import { create } from 'zustand';
import { Land, Transfer, User, Profile } from '@/types';
import { landOperations, transferOperations } from '@/lib/supabase';

interface LandStore {
  // Auth state
  user: User | null;
  profile: Profile | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearAuth: () => void;
  
  // Land state
  lands: Land[];
  selectedLand: Land | null;
  isLandLoading: boolean;
  
  // Land actions
  setLands: (lands: Land[]) => void;
  addLand: (land: Land) => void;
  updateLand: (id: number, updates: Partial<Land>) => void;
  setSelectedLand: (land: Land | null) => void;
  setLandLoading: (loading: boolean) => void;
  refreshLands: () => Promise<void>;
  
  // Transfer state
  transfers: Transfer[];
  selectedTransfer: Transfer | null;
  isTransferLoading: boolean;
  
  // Transfer actions
  setTransfers: (transfers: Transfer[]) => void;
  addTransfer: (transfer: Transfer) => void;
  updateTransfer: (id: number, updates: Partial<Transfer>) => void;
  removeTransfer: (id: number) => void;
  setSelectedTransfer: (transfer: Transfer | null) => void;
  setTransferLoading: (loading: boolean) => void;
  refreshTransfers: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  
  // UI state
  isModalOpen: boolean;
  modalType: 'create' | 'edit' | 'delete' | null;
  setModalState: (open: boolean, type?: 'create' | 'edit' | 'delete' | null) => void;
}

export const useLandStore = create<LandStore>((set, get) => ({
  // Initial auth state
  user: null,
  profile: null,
  isAuthLoading: true,
  isAuthenticated: false,
  
  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  
  clearAuth: () => set({ 
    user: null, 
    profile: null, 
    isAuthenticated: false,
    lands: [],
    transfers: []
  }),
  
  // Initial state
  lands: [],
  selectedLand: null,
  isLandLoading: false,
  
  transfers: [],
  selectedTransfer: null,
  isTransferLoading: false,
  
  isModalOpen: false,
  modalType: null,
  
  // Land actions
  setLands: (lands) => set({ lands }),
  
  addLand: (land) => set((state) => ({ 
    lands: [land, ...state.lands] 
  })),
  
  updateLand: (id, updates) => set((state) => ({
    lands: state.lands.map((land) => 
      land.id === id ? { ...land, ...updates } : land
    )
  })),
  
  setSelectedLand: (land) => set({ selectedLand: land }),
  
  setLandLoading: (loading) => set({ isLandLoading: loading }),

  refreshLands: async () => {
    try {
      set({ isLandLoading: true });
      const { data, error } = await landOperations.getAll();
      if (data && !error) {
        set({ lands: data });
      }
    } catch (error) {
      console.error('Error refreshing lands:', error);
    } finally {
      set({ isLandLoading: false });
    }
  },
  
  // Transfer actions
  setTransfers: (transfers) => set({ transfers }),
  
  addTransfer: (transfer) => set((state) => ({ 
    transfers: [transfer, ...state.transfers] 
  })),
  
  updateTransfer: (id, updates) => set((state) => ({
    transfers: state.transfers.map((transfer) => 
      transfer.id === id ? { ...transfer, ...updates } : transfer
    )
  })),
  
  removeTransfer: (id) => set((state) => ({
    transfers: state.transfers.filter((transfer) => transfer.id !== id)
  })),
  
  setSelectedTransfer: (transfer) => set({ selectedTransfer: transfer }),
  
  setTransferLoading: (loading) => set({ isTransferLoading: loading }),

  refreshTransfers: async () => {
    try {
      set({ isTransferLoading: true });
      const { data, error } = await transferOperations.getAll();
      if (data && !error) {
        set({ transfers: data });
      }
    } catch (error) {
      console.error('Error refreshing transfers:', error);
    } finally {
      set({ isTransferLoading: false });
    }
  },

  refreshAllData: async () => {
    const { refreshLands, refreshTransfers } = get();
    await Promise.all([refreshLands(), refreshTransfers()]);
  },
  
  // UI actions
  setModalState: (open, type = null) => set({ 
    isModalOpen: open, 
    modalType: open ? type : null 
  }),
})); 