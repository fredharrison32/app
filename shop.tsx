import { View, StyleSheet, Text, Image, Dimensions, ScrollView, TouchableOpacity, Modal, Switch, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { router } from 'expo-router';
import { useBirdStore } from '../store/birdStore';
import { birdAssets } from '../store/birdAssets';
// @ts-ignore
import checkmarkIcon from '../../../assets/icons/checkmark.jpg';

type BirdType = 'owl' | 'base';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - 40) / 3);
const birdPreviewSize = Math.floor(SCREEN_WIDTH * 0.9);

// Define shop items structure
const shopItems = {
    birds: [
        {
            id: 'owl',
            name: 'Owl',
            price: 1000,
            preview: require('../../../assets/birdimage/owl/owl_preview.png'),
            assets: {
                birdType: 'owl',
                preview: require('../../../assets/birdimage/owl/owl_preview.png'),
            }
        },
        {
            id: 'base_bird',
            name: 'Base Bird',
            price: 500,
            preview: require('../../../assets/birdimage/body.png'),
            assets: {
                body: require('../../../assets/birdimage/body.png'),
                preview: require('../../../assets/birdimage/body.png'),
            }
        }
    ],
    clothes: [
        {
            id: 'blue_shirt',
            name: 'Blue Shirt',
            price: 300,
            preview: require('../../../assets/birdimage/shirts/blue/blue_shirt_preview.png'),
            assets: {
                id: 'blue_shirt',
                name: 'Blue Shirt',
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
            price: 300,
            preview: require('../../../assets/birdimage/shirts/pink/pink_shirt_preview.png'),
            assets: {
                id: 'pink_shirt',
                name: 'Pink Shirt',
                preview: require('../../../assets/birdimage/shirts/pink/pink_shirt_preview.png'),
                shirt_body: require('../../../assets/birdimage/shirts/pink/pink_shirt_body.png'),
                base_left_sleeve: require('../../../assets/birdimage/shirts/pink/pink_left_sleeve.png'),
                base_right_sleeve: require('../../../assets/birdimage/shirts/pink/pink_right_sleeve.png'),
                owl_left_sleeve: require('../../../assets/birdimage/shirts/pink/pink_owl_left_sleeve.png'),
                owl_right_sleeve: require('../../../assets/birdimage/shirts/pink/pink_owl_right_sleeve.png'),
            }
        },
        {
            id: 'pink_cowboy_hat',
            name: 'Pink Cowboy Hat',
            price: 200,
            preview: require('../../../assets/birdimage/hats/pink_cowboy_hat.png'),
            assets: {
                id: 'pink_cowboy_hat',
                name: 'Pink Cowboy Hat',
                preview: require('../../../assets/birdimage/hats/pink_cowboy_hat.png'),
                hat: require('../../../assets/birdimage/hats/pink_cowboy_hat.png'),
            }
        }
    ],
    backgrounds: [
        // Add background items here when available
    ]
};

export default function Shop() {
    const [selectedCategory, setSelectedCategory] = useState('birds');
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [equipNow, setEquipNow] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const setClothing = useBirdStore((state) => state.setClothing);
    const setBirdType = useBirdStore((state) => state.setBirdType);
    const birdType = useBirdStore((state) => state.birdType);
    const currentCoins = useBirdStore((state) => state.currentCoins);
    const addCoins = useBirdStore((state) => state.addCoins);
    const claimedItems = useBirdStore((state) => state.claimedItems);

    const categories = [
        { id: 'birds', label: 'Birds' },
        { id: 'clothes', label: 'Clothes' },
        { id: 'backgrounds', label: 'Backgrounds' },
        { id: 'inventory', label: 'Inventory' }
    ];

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (category === 'inventory') {
            router.push('/inventory');
        } else {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const openPreview = (item: any) => {
        setPreviewItem(item);
        setEquipNow(false);
        setModalVisible(true);
    };

    const closePreview = () => {
        setModalVisible(false);
        setPreviewItem(null);
    };

    const handlePurchase = () => {
        if (previewItem) {
            // Check if item is already claimed
            if (isItemClaimed(previewItem)) {
                Alert.alert(
                    "Already Owned",
                    `You already own ${previewItem.name}.`,
                    [{ text: "OK" }]
                );
                return;
            }

            // Check if user has enough coins
            if (currentCoins < previewItem.price) {
                Alert.alert(
                    "Not Enough Coins",
                    `You need ${previewItem.price} coins to purchase this item. You currently have ${currentCoins} coins.`,
                    [{ text: "OK" }]
                );
                return;
            }

            // Deduct coins
            addCoins(-previewItem.price);

            // Add item to inventory and equip if selected
            if (previewItem.assets.birdType) {
                useBirdStore.getState().addClaimedItem('bird', {
                    id: previewItem.assets.birdType,
                    name: previewItem.name,
                    preview: previewItem.preview,
                    assets: previewItem.assets
                });
                if (equipNow) {
                    setBirdType(previewItem.assets.birdType);
                    useBirdStore.getState().resetClothing();
                }
            } else if (previewItem.assets.shirt_body) {
                useBirdStore.getState().addClaimedItem('shirt', {
                    id: previewItem.assets.id,
                    name: previewItem.name,
                    preview: previewItem.preview,
                    assets: previewItem.assets
                });
                if (equipNow) {
                    const currentClothing = useBirdStore.getState().clothing;
                    setClothing({
                        ...currentClothing,
                        ...previewItem.assets,
                        left_sleeve:
                            birdType === 'owl'
                                ? previewItem.assets.owl_left_sleeve || currentClothing.left_sleeve
                                : previewItem.assets.base_left_sleeve || currentClothing.left_sleeve,
                        right_sleeve:
                            birdType === 'owl'
                                ? previewItem.assets.owl_right_sleeve || currentClothing.right_sleeve
                                : previewItem.assets.base_right_sleeve || currentClothing.right_sleeve,
                    });
                }
            } else if (previewItem.assets.hat) {
                useBirdStore.getState().addClaimedItem('hat', {
                    id: previewItem.assets.id,
                    name: previewItem.name,
                    preview: previewItem.preview,
                    assets: previewItem.assets
                });
                if (equipNow) {
                    const currentClothing = useBirdStore.getState().clothing;
                    setClothing({
                        ...currentClothing,
                        ...previewItem.assets
                    });
                }
            }

            // Show success message
            Alert.alert(
                "Purchase Successful",
                `You have purchased ${previewItem.name} for ${previewItem.price} coins.`,
                [{ text: "OK" }]
            );
        }
        setEquipNow(false);
        closePreview();
    };

    const isItemClaimed = (item: any) => {
        if (item.assets.birdType) {
            return claimedItems.bird.some((claimed: any) => claimed.id === item.assets.birdType);
        } else if (item.assets.shirt_body) {
            return claimedItems.shirt.some((claimed: any) => claimed.id === item.assets.id);
        } else if (item.assets.hat) {
            return claimedItems.hat.some((claimed: any) => claimed.id === item.assets.id);
        }
        return false;
    };

    return (
        <View style={styles.container}>
            <View style={styles.topSpacer} />
            <View style={styles.coinDisplay}>
                <Text style={styles.coinText}>{currentCoins} coins</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id && styles.selectedCategory,
                            category.id === 'inventory' && styles.inventoryButton
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category.id && styles.selectedCategoryText,
                            category.id === 'inventory' && styles.inventoryText
                        ]}>
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.gridContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.itemsGrid}
                >
                    {shopItems[selectedCategory as keyof typeof shopItems]?.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.itemContainer}
                            onPress={() => openPreview(item)}
                        >
                            <Image
                                source={item.preview}
                                style={styles.itemImage}
                                resizeMode="contain"
                            />
                            {isItemClaimed(item) && (
                                <Image
                                    source={checkmarkIcon}
                                    style={styles.checkmark}
                                />
                            )}
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price} coins</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closePreview}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {previewItem && (
                            <>
                                <View style={styles.previewContainer}>
                                    {previewItem.assets.birdType ? (
                                        <>
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].body}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].eyes}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].beak}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].feet}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].Lwing}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[previewItem.assets.birdType as BirdType].Rwing}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Image
                                                source={birdAssets[birdType].body}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[birdType].eyes}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[birdType].beak}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[birdType].feet}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            {previewItem.assets.shirt_body && (
                                                <Image
                                                    source={previewItem.assets.shirt_body}
                                                    style={styles.birdImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                            <Image
                                                source={birdAssets[birdType].Lwing}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            <Image
                                                source={birdAssets[birdType].Rwing}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                            {((birdType === 'owl' && previewItem.assets.owl_left_sleeve) || 
                                              (birdType === 'base' && previewItem.assets.base_left_sleeve)) && (
                                                <Image
                                                    source={
                                                        birdType === 'owl'
                                                            ? previewItem.assets.owl_left_sleeve
                                                            : previewItem.assets.base_left_sleeve
                                                    }
                                                    style={styles.birdImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                            {((birdType === 'owl' && previewItem.assets.owl_right_sleeve) || 
                                              (birdType === 'base' && previewItem.assets.base_right_sleeve)) && (
                                                <Image
                                                    source={
                                                        birdType === 'owl'
                                                            ? previewItem.assets.owl_right_sleeve
                                                            : previewItem.assets.base_right_sleeve
                                                    }
                                                    style={styles.birdImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                            {previewItem.assets.hat && (
                                                <Image
                                                    source={previewItem.assets.hat}
                                                    style={styles.birdImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </>
                                    )}
                                </View>
                                <Text style={styles.previewName}>{previewItem.name}</Text>
                                <Text style={[
                                    styles.previewPrice,
                                    currentCoins < previewItem.price && styles.insufficientFunds
                                ]}>
                                    {previewItem.price} coins
                                </Text>
                                <View style={styles.equipContainer}>
                                    <Text style={styles.equipText}>Equip Now</Text>
                                    <Switch
                                        value={equipNow}
                                        onValueChange={setEquipNow}
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={equipNow ? '#2196F3' : '#f4f3f4'}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.purchaseButton,
                                        currentCoins < previewItem.price && styles.disabledButton
                                    ]}
                                    onPress={handlePurchase}
                                    disabled={currentCoins < previewItem.price}
                                >
                                    <Text style={styles.purchaseButtonText}>
                                        {currentCoins < previewItem.price ? 'Not Enough Coins' : 'Purchase'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={closePreview}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSpacer: {
        height: '30%',
    },
    categoryScroll: {
        maxHeight: 50,
    },
    categoryContainer: {
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    selectedCategory: {
        backgroundColor: '#4CAF50',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    inventoryButton: {
        backgroundColor: '#2196F3',
    },
    inventoryText: {
        color: '#fff',
    },
    gridContainer: {
        flex: 1,
        width: '100%',
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
        paddingBottom: verticalScale(100),
    },
    itemContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE + 60,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 5,
    },
    itemImage: {
        width: '100%',
        height: '80%',
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    itemPrice: {
        fontSize: 12,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        width: '90%',
        maxHeight: '80%',
    },
    previewContainer: {
        width: birdPreviewSize,
        height: birdPreviewSize,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    birdImage: {
        position: 'absolute',
        width: birdPreviewSize,
        height: birdPreviewSize,
    },
    previewName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    previewPrice: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    equipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    equipText: {
        fontSize: 16,
        color: '#333',
    },
    purchaseButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 10,
    },
    purchaseButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 18,
    },
    coinDisplay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFD700',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    coinText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    insufficientFunds: {
        color: '#f44336',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    checkmark: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
    },
}); 