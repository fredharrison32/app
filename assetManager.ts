import { create } from 'zustand';
import { bundledAssets } from './bundledAssets';
// import { assetQueries } from '../lib/supabase';

// Types for our asset system
export type AssetSource = 'bundled' | 'remote';
export type AssetType = 'bird' | 'shirt' | 'hat' | 'glasses' | 'scarf';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  source: AssetSource;
  preview: any; // Image source
  assets: {
    [key: string]: any; // Dynamic asset properties
  };
  version?: string;
  isPremium?: boolean;
  rarity?: string;
}

interface AssetManagerState {
  // Bundled assets (initial app content)
  bundledAssets: {
    birds: Asset[];
    shirts: Asset[];
    hats: Asset[];
    glasses: Asset[];
    scarfs: Asset[];
  };
  // Remote assets (downloaded content)
  remoteAssets: {
    birds: Asset[];
    shirts: Asset[];
    hats: Asset[];
    glasses: Asset[];
    scarfs: Asset[];
  };
  // Asset loading state
  isLoading: boolean;
  lastSync: Date | null;
  // Methods
  initializeBundledAssets: () => void;
  fetchRemoteAssets: () => Promise<void>;
  getAsset: (id: string, type: AssetType) => Asset | undefined;
  getAllAssets: (type: AssetType) => Asset[];
  getAssetsByRarity: (rarity: string) => Asset[];
}

// Helper function to get the correct plural form for asset types
const getPluralType = (type: AssetType): keyof AssetManagerState['bundledAssets'] => {
  switch (type) {
    case 'bird': return 'birds';
    case 'shirt': return 'shirts';
    case 'hat': return 'hats';
    case 'glasses': return 'glasses';
    case 'scarf': return 'scarfs';
  }
};

export const useAssetManager = create<AssetManagerState>((set, get) => ({
  bundledAssets: {
    birds: [],
    shirts: [],
    hats: [],
    glasses: [],
    scarfs: [],
  },
  remoteAssets: {
    birds: [],
    shirts: [],
    hats: [],
    glasses: [],
    scarfs: [],
  },
  isLoading: false,
  lastSync: null,

  initializeBundledAssets: () => {
    set({ bundledAssets });
  },

  fetchRemoteAssets: async () => {
    set({ isLoading: true });
    try {
      // TODO: Implement Supabase integration
      // const data = await assetQueries.fetchActiveAssets();
      
      // For now, return empty arrays
      const remoteAssets = {
        birds: [],
        shirts: [],
        hats: [],
        glasses: [],
        scarfs: [],
      };

      set({ remoteAssets, lastSync: new Date() });
    } catch (error) {
      console.error('Error fetching remote assets:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getAsset: (id: string, type: AssetType) => {
    const { bundledAssets, remoteAssets } = get();
    const pluralType = getPluralType(type);
    return [...bundledAssets[pluralType], ...remoteAssets[pluralType]]
      .find(asset => asset.id === id);
  },

  getAllAssets: (type: AssetType) => {
    const { bundledAssets, remoteAssets } = get();
    const pluralType = getPluralType(type);
    return [...bundledAssets[pluralType], ...remoteAssets[pluralType]];
  },

  getAssetsByRarity: (rarity: string) => {
    const { bundledAssets, remoteAssets } = get();
    const allAssets = [
      ...bundledAssets.birds,
      ...bundledAssets.shirts,
      ...bundledAssets.hats,
      ...bundledAssets.glasses,
      ...bundledAssets.scarfs,
      ...remoteAssets.birds,
      ...remoteAssets.shirts,
      ...remoteAssets.hats,
      ...remoteAssets.glasses,
      ...remoteAssets.scarfs,
    ];
    return allAssets.filter(asset => asset.rarity === rarity);
  },
})); 