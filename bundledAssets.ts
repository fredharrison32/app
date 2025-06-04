import { Asset } from './assetManager';
import { birdAssets } from './birdAssets';

// Convert bird assets to the new format
const birds: Asset[] = [
    {
        id: 'owl',
        name: 'Owl',
        type: 'bird',
        source: 'bundled',
        preview: require('../../../assets/birdimage/owl/owl_preview.png'),
        assets: {
            birdType: 'owl',
            preview: require('../../../assets/birdimage/owl/owl_preview.png'),
            rarity: 'legendary'
        }
    },
    {
        id: 'base_bird',
        name: 'Base Bird',
        type: 'bird',
        source: 'bundled',
        preview: require('../../../assets/birdimage/body.png'),
        assets: {
            body: require('../../../assets/birdimage/body.png'),
            preview: require('../../../assets/birdimage/body.png'),
            rarity: 'common'
        }
    }
];

// Shirt assets
const shirts: Asset[] = [
    {
        id: 'blue_shirt',
        name: 'Blue Shirt',
        type: 'shirt',
        source: 'bundled',
        preview: require('../../../assets/birdimage/shirts/blue/blue_shirt_preview.png'),
        assets: {
            id: 'blue_shirt',
            name: 'Blue Shirt',
            rarity: 'common',
            preview: require('../../../assets/birdimage/shirts/blue/blue_shirt_preview.png'),
            shirt_body: require('../../../assets/birdimage/shirts/blue/blue_shirt_body.png'),
            base_left_sleeve: require('../../../assets/birdimage/shirts/blue/blue_base_left_sleeve.png'),
            base_right_sleeve: require('../../../assets/birdimage/shirts/blue/blue_base_right_sleeve.png'),
            owl_left_sleeve: require('../../../assets/birdimage/shirts/blue/blue_owl_left_sleeve.png'),
            owl_right_sleeve: require('../../../assets/birdimage/shirts/blue/blue_owl_right_sleeve.png'),
        }
    },
    {
        id: 'pink_shirt',
        name: 'Pink Shirt',
        type: 'shirt',
        source: 'bundled',
        preview: require('../../../assets/birdimage/shirts/pink/pink_shirt_preview.png'),
        assets: {
            id: 'pink_shirt',
            name: 'Pink Shirt',
            rarity: 'epic',
            preview: require('../../../assets/birdimage/shirts/pink/pink_shirt_preview.png'),
            shirt_body: require('../../../assets/birdimage/shirts/pink/pink_shirt_body.png'),
            base_left_sleeve: require('../../../assets/birdimage/shirts/pink/pink_left_sleeve.png'),
            base_right_sleeve: require('../../../assets/birdimage/shirts/pink/pink_right_sleeve.png'),
            owl_left_sleeve: require('../../../assets/birdimage/shirts/pink/pink_owl_left_sleeve.png'),
            owl_right_sleeve: require('../../../assets/birdimage/shirts/pink/pink_owl_right_sleeve.png'),
        }
    }
];

// Hat assets
const hats: Asset[] = [
    {
        id: 'pink_cowboy_hat',
        name: 'Pink Cowboy Hat',
        type: 'hat',
        source: 'bundled',
        preview: require('../../../assets/birdimage/hats/pink_cowboy_hat_preview.png'),
        assets: {
            id: 'pink_cowboy_hat',
            name: 'Pink Cowboy Hat',
            rarity: 'rare',
            preview: require('../../../assets/birdimage/hats/pink_cowboy_hat_preview.png'),
            hat: require('../../../assets/birdimage/hats/pink_cowboy_hat.png'),
        }
    }
];

// Battle Pass levels
export const battlePassLevels = [
    {
        level: 1,
        freeReward: shirts[0], // Blue Shirt
        premiumReward: hats[0], // Pink Cowboy Hat
    },
    {
        level: 2,
        freeReward: shirts[1], // Pink Shirt
        premiumReward: birds[1], // Base Bird
    },
    {
        level: 3,
        freeReward: birds[1], // Base Bird
        premiumReward: birds[0], // Owl
    },
    // Add more levels as needed
];

// Shop items
export const shopItems = {
    birds,
    clothes: [...shirts, ...hats],
    backgrounds: [], // Add when available
};

// Export all bundled assets
export const bundledAssets = {
    birds,
    shirts,
    hats,
    glasses: [],
    scarfs: [],
};