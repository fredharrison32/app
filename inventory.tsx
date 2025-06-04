import { View, StyleSheet, Text, Image, Dimensions, ScrollView, TouchableOpacity, Modal, Animated as RNAnimated, Easing } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useBirdStore } from '../store/birdStore';
import { birdAssets } from '../store/birdAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const birdPreviewSize = Math.floor(SCREEN_WIDTH * 0.6);
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - 40) / 3); // 3 columns with 20px padding on each side

const SparkleEffect = () => {
    return (
        <View style={styles.sparkleContainer}>
            <LottieView
                source={require('../../../assets/animations/sparkle.json')}
                autoPlay
                loop
                style={styles.sparkleAnimation}
            />
        </View>
    );
};

export default function Inventory() {
    const [selectedCategory, setSelectedCategory] = useState('hat');
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const birdType = useBirdStore((state) => state.birdType);
    const currentClothing = useBirdStore((state) => state.clothing);
    const setClothing = useBirdStore((state) => state.setClothing);
    const setBirdType = useBirdStore((state) => state.setBirdType);
    const claimedItems = useBirdStore((state) => state.claimedItems);
    const assets = birdAssets[birdType];

    const handleItemPress = (item: any) => {
        setPreviewItem(item);
        setModalVisible(true);
    };

    const handleEquip = () => {
        if (previewItem) {
            if (previewItem.assets.birdType) {
                setBirdType(previewItem.assets.birdType);
                useBirdStore.getState().resetClothing();
            } else {
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
        }
        setModalVisible(false);
        setPreviewItem(null);
    };

    const handleRemoveItem = () => {
        if (selectedCategory === 'hat') {
            setClothing({
                ...currentClothing,
                hat: undefined
            });
        } else if (selectedCategory === 'shirt') {
            setClothing({
                ...currentClothing,
                shirt_body: undefined,
                left_sleeve: undefined,
                right_sleeve: undefined
            });
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        // Reset scroll position when category changes
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const categories = [
        { id: 'hat', label: 'Hats' },
        { id: 'shirt', label: 'Shirts' },
        { id: 'bird', label: 'Birds' },
    ];

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return '#e0e0e0'; // Darker gray
            case 'rare':
                return '#bbdefb'; // Darker blue
            case 'epic':
                return '#ce93d8'; // Pinker purple
            case 'legendary':
                return '#d4af37'; // Metallic gold (fallback for non-gradient)
            default:
                return '#e0e0e0';
        }
    };

    const getRarityTextColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return '#666666';
            case 'rare':
                return '#1976d2';
            case 'epic':
                return '#7b1fa2';
            case 'legendary':
                return '#b8860b'; // Dark goldenrod for better contrast
            default:
                return '#666666';
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Section - Current Bird */}
            <View style={styles.topSection}>
                <View style={styles.birdContainer}>
                    <Image
                        source={assets.body}
                        style={styles.birdImage}
                        resizeMode="contain"
                    />
                    <Image
                        source={assets.eyes}
                        style={styles.birdImage}
                        resizeMode="contain"
                    />
                    <Image
                        source={assets.beak}
                        style={styles.birdImage}
                        resizeMode="contain"
                    />
                    <Image
                        source={assets.feet}
                        style={styles.birdImage}
                        resizeMode="contain"
                    />                    
                    {currentClothing.shirt_body && (
                        <Image
                            source={currentClothing.shirt_body}
                            style={styles.birdImage}
                            resizeMode="contain"
                        />
                    )}
                    <Animated.Image
                        source={assets.Lwing}
                        style={[styles.birdImage]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={assets.Rwing}
                        style={[styles.birdImage]}
                        resizeMode="contain"
                    />
                    {currentClothing.left_sleeve && (
                        <Animated.Image
                            source={currentClothing.left_sleeve}
                            style={[styles.birdImage]}
                            resizeMode="contain"
                        />
                    )}
                    {currentClothing.right_sleeve && (
                        <Animated.Image
                            source={currentClothing.right_sleeve}
                            style={[styles.birdImage]}
                            resizeMode="contain"
                        />
                    )}
                    {currentClothing.hat && (
                        <Image
                            source={currentClothing.hat}
                            style={styles.birdImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </View>

            {/* Middle Section - Category Selector */}
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
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.id && styles.selectedCategoryText,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Bottom Section - Items Grid */}
            <ScrollView 
                ref={scrollViewRef}
                style={styles.itemsGrid}
            >
                <View style={styles.itemsContainer}>
                    {/* Remove option for Hats and Shirts */}
                    {(selectedCategory === 'hat' || selectedCategory === 'shirt') && (
                        <TouchableOpacity
                            style={styles.itemContainer}
                            onPress={handleRemoveItem}
                        >
                            <View style={[styles.itemBox, styles.removeBox]}>
                                <Text style={styles.removeText}>Remove {selectedCategory === 'hat' ? 'Hat' : 'Shirt'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    {claimedItems[selectedCategory as keyof typeof claimedItems]?.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemContainer}
                            onPress={() => handleItemPress(item)}
                        >
                            {item.assets.rarity === 'legendary' ? (
                                <View style={[styles.itemBox, styles.legendaryBox]}>
                                    <SparkleEffect />
                                    <Image
                                        source={item.preview}
                                        style={styles.itemImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={[
                                        styles.itemName,
                                        { color: getRarityTextColor(item.assets.rarity) }
                                    ]}>{item.name}</Text>
                                </View>
                            ) : item.assets.rarity === 'epic' ? (
                                <View style={[styles.itemBox, styles.epicBox]}>
                                    <SparkleEffect />
                                    <Image
                                        source={item.preview}
                                        style={styles.itemImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={[
                                        styles.itemName,
                                        { color: getRarityTextColor(item.assets.rarity) }
                                    ]}>{item.name}</Text>
                                </View>
                            ) : (
                                <View style={[
                                    styles.itemBox,
                                    { backgroundColor: getRarityColor(item.assets.rarity) }
                                ]}>
                                    <Image
                                        source={item.preview}
                                        style={styles.itemImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={[
                                        styles.itemName,
                                        { color: getRarityTextColor(item.assets.rarity) }
                                    ]}>{item.name}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                    {/* Add empty boxes to fill the grid */}
                    {[...Array(6)].map((_, index) => (
                        <View key={`empty-${index}`} style={styles.itemContainer}>
                            <View style={[styles.itemBox, styles.emptyBox]}>
                                <Text style={styles.emptyText}>Coming Soon</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Preview Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {previewItem && (
                            <View style={styles.previewContainer}>
                                <Image
                                    source={previewItem.preview}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.previewName}>{previewItem.name}</Text>
                            </View>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.equipButton}
                                onPress={handleEquip}
                            >
                                <Text style={styles.buttonText}>Equip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom Button */}
            <View style={styles.bottomSection}>
                <TouchableOpacity 
                    style={styles.okButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSection: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    birdContainer: {
        width: birdPreviewSize,
        height: birdPreviewSize,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    birdImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
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
    itemsGrid: {
        flex: 1,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
    },
    itemContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE + 30,
        marginBottom: 10,
        alignItems: 'center',
    },
    itemBox: {
        width: ITEM_SIZE - 10,
        height: ITEM_SIZE - 10,
        borderWidth: 0,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
    },
    emptyBox: {
        backgroundColor: '#f5f5f5',
    },
    itemImage: {
        width: '100%',
        height: '85%',
    },
    itemName: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 2,
    },
    emptyText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
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
        width: '80%',
        alignItems: 'center',
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: 200,
        height: 200,
        marginBottom: 10,
    },
    previewName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    equipButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    okButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: scale(40),
        paddingVertical: verticalScale(10),
        borderRadius: scale(20),
    },
    okButtonText: {
        color: '#fff',
        fontSize: scale(18),
        fontWeight: 'bold',
    },
    removeBox: {
        borderColor: '#f44336',
        backgroundColor: '#ffebee',
    },
    removeText: {
        color: '#f44336',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    sparkleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
    },
    sparkleAnimation: {
        width: '100%',
        height: '100%',
    },
    legendaryBox: {
        backgroundColor: '#f5d76e', // Lighter gold
        position: 'relative',
        overflow: 'hidden',
    },
    epicBox: {
        backgroundColor: '#ce93d8', // Pinker purple
        position: 'relative',
        overflow: 'hidden',
    },
}); 