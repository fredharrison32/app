import { create } from 'zustand';
import { AssetType } from './assetManager';

type BirdType = 'owl' | 'base'; // Add more types as needed

type Clothing = {
  shirt_body?: any;
  base_left_sleeve?: any;
  base_right_sleeve?: any;
  owl_left_sleeve?: any;
  owl_right_sleeve?: any;
  left_sleeve?: any;
  right_sleeve?: any;
  hat?: any;
  glasses?: any;
  scarf?: any;
  // Add more clothing parts as needed
};

type ClaimedItem = {
  id: string;
  name: string;
  preview: any;
  assets: any;
};

interface BirdState {
  birdType: BirdType;
  clothing: Clothing;
  setBirdType: (type: BirdType) => void;
  setClothing: (clothing: Clothing) => void;
  resetClothing: () => void;
  currentXP: number;
  maxXP: number;
  currentCoins: number;
  currentLevel: number;
  claimedItems: Record<AssetType, ClaimedItem[]>;
  setXP: (currentXP: number, maxXP: number) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  setLevel: (level: number) => void;
  addClaimedItem: (category: AssetType, item: ClaimedItem) => void;
}

export const useBirdStore = create<BirdState>((set) => ({
  birdType: 'base',
  clothing: {},
  setBirdType: (birdType) => set({ birdType }),
  setClothing: (clothing) => set({ clothing }),
  resetClothing: () => set({ clothing: {} }),
  currentXP: 60,
  maxXP: 100,
  currentCoins: 0,
  currentLevel: 1,
  claimedItems: {
    bird: [],
    shirt: [],
    hat: [],
    glasses: [],
    scarf: [],
  },
  setXP: (currentXP, maxXP) => set({ currentXP, maxXP }),
  addXP: (amount) => set((state) => {
    let newXP = state.currentXP + amount;
    let newLevel = state.currentLevel;
    let maxXP = state.maxXP;

    // Level up as many times as needed if XP overflows multiple levels
    while (newXP >= maxXP) {
      newXP -= maxXP;
      newLevel += 1;
      // Optionally, increase maxXP for each new level:
      // maxXP = Math.floor(maxXP * 1.1); // Example: 10% harder per level
    }

    return {
      currentXP: newXP,
      currentLevel: newLevel,
      maxXP, // If you want to update maxXP, use the new value here
    };
  }),
  addCoins: (amount) => set((state) => ({ currentCoins: state.currentCoins + amount })),
  setLevel: (level) => set({ currentLevel: level }),
  addClaimedItem: (category: AssetType, item: ClaimedItem) => 
    set((state) => ({
      claimedItems: {
        ...state.claimedItems,
        [category]: [...state.claimedItems[category], item],
      },
    })),
}));