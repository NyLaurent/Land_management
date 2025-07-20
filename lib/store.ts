import { create } from 'zustand';
import { Land, Transfer } from '@/types';

interface LandStore {
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
  
  // UI state
  isModalOpen: boolean;
  modalType: 'create' | 'edit' | 'delete' | null;
  setModalState: (open: boolean, type?: 'create' | 'edit' | 'delete' | null) => void;
}

export const useLandStore = create<LandStore>((set) => ({
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
  
  // UI actions
  setModalState: (open, type = null) => set({ 
    isModalOpen: open, 
    modalType: open ? type : null 
  }),
})); 