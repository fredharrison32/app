import { View, StyleSheet, Text, Image, Dimensions, ScrollView, TouchableOpacity, Modal, Animated as RNAnimated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useBirdStore } from '../store/birdStore';
import { birdAssets } from '../store/birdAssets';
import { useAssetManager, Asset } from '../store/assetManager';
import { battlePassLevels } from '../store/bundledAssets';
// @ts-ignore
import checkmarkIcon from '../../../assets/icons/checkmark.jpg';

type BirdType = 'owl' | 'base';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const birdPreviewSize = Math.floor(SCREEN_WIDTH * 0.9);

interface BattlePassRowProps {
    level: number;
    freeReward: Asset;
    premiumReward: Asset;
    openPreview: (assets: any) => void;
    currentLevel: number;
    claimedItems: Record<string, any[]>;
}

export default function BattlePass() {
    const [previewAssets, setPreviewAssets] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [landingAnim] = useState(new RNAnimated.Value(-birdPreviewSize));
    const wingRotation = useSharedValue(0);
    const setClothing = useBirdStore((state) => state.setClothing);
    const setBirdType = useBirdStore((state) => state.setBirdType);
    const birdType = useBirdStore((state) => state.birdType);
    const currentClothing = useBirdStore((state) => state.clothing);
    const assets = birdAssets[birdType];
    const currentLevel = useBirdStore((state) => state.currentLevel);
    const claimedItems = useBirdStore((state) => state.claimedItems);
    const assetManager = useAssetManager();

    useEffect(() => {
        if (modalVisible) {
            landingAnim.setValue(-birdPreviewSize);
            RNAnimated.timing(landingAnim, {
                toValue: 0,
                duration: 3000,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }).start();

            wingRotation.value = withRepeat(
                withSequence(
                    withTiming(120, { duration: 120 }),
                    withTiming(30, { duration: 120 }),
                    withTiming(120, { duration: 150 }),
                    withTiming(30, { duration: 150 }),
                    withTiming(120, { duration: 175 }),
                    withTiming(30, { duration: 175 }),
                    withTiming(120, { duration: 200 }),
                    withTiming(30, { duration: 200 }),
                    withTiming(120, { duration: 250 }),
                    withTiming(0, { duration: 300 })
                ),
                1,
                false
            );
        }
    }, [modalVisible]);

    const leftWingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: 0.9*-60 },
            { translateY: 0.9*4 },
            { rotate: `${wingRotation.value}deg` },
            { translateX: 0.9*60 },
            { translateY: 0.9*-4 },
        ],
    }));

    const rightWingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: 0.9*60 },
            { translateY: 0.9*4 },
            { rotate: `-${wingRotation.value}deg` },
            { translateX: 0.9*-60 },
            { translateY: 0.9*-4 },
        ],
    }));

    const openPreview = (assets: any) => {
        // Claim logic
        if (assets.shirt_body) {
            const shirtType = assets.id;
            const shirtName = assets.name;
            const claimedShirts = useBirdStore.getState().claimedItems.shirt;
            const alreadyClaimed = claimedShirts.some((item: any) => item.id === shirtType);
            if (!alreadyClaimed) {
                useBirdStore.getState().addClaimedItem('shirt', {
                    id: shirtType,
                    name: shirtName,
                    preview: assets.preview,
                    assets: assets
                });
            }
        } else if (assets.hat) {
            const hatType = assets.id;
            const hatName = assets.name;
            const claimedHats = useBirdStore.getState().claimedItems.hat;
            const alreadyClaimed = claimedHats.some((item: any) => item.id === hatType);
            if (!alreadyClaimed) {
                useBirdStore.getState().addClaimedItem('hat', {
                    id: hatType,
                    name: hatName,
                    preview: assets.preview,
                    assets: assets
                });
            }
        } else if (assets.birdType) {
            const claimedBirds = useBirdStore.getState().claimedItems.bird;
            const alreadyClaimed = claimedBirds.some((item: any) => item.id === assets.birdType);
            if (!alreadyClaimed) {
                useBirdStore.getState().addClaimedItem('bird', {
                    id: assets.birdType,
                    name: assets.name,
                    preview: assets.preview,
                    assets: assets
                });
            }
        }
        setPreviewAssets(assets);
        setModalVisible(true);
    };
    const closePreview = () => {
        setModalVisible(false);
        setPreviewAssets(null);
    };

    const handleClose = () => {
        router.replace('/explore');
    };

    // Initialize bundled assets when component mounts
    useEffect(() => {
        assetManager.initializeBundledAssets();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topSpacer} />
            <ScrollView 
                contentContainerStyle={{ 
                    paddingBottom: verticalScale(100),
                    flexGrow: 1 
                }}
            >
                {battlePassLevels.map((levelData, index) => (
                    <BattlePassRow
                        key={index}
                        level={levelData.level}
                        freeReward={levelData.freeReward}
                        premiumReward={levelData.premiumReward}
                        openPreview={openPreview}
                        currentLevel={currentLevel}
                        claimedItems={claimedItems}
                    />
                ))}
            </ScrollView>
            <View style={styles.bottomSection}>
                <TouchableOpacity 
                    style={styles.okButton}
                    onPress={handleClose}
                >
                    <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closePreview}
            >
                <View style={styles.modalContainer}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 20,
                        borderRadius: 20,
                        alignItems: 'center',
                        width: '90%',
                        height: '80%',
                        justifyContent: 'center',
                        zIndex: 0,
                    }}>
                        <LottieView
                            source={require('../../../assets/animations/firework.json')}
                            style={{
                                position: 'absolute',
                                width: '90%',
                                height: '80%',
                                zIndex: 1,
                                top: verticalScale(-35),
                            }}
                            autoPlay
                            loop
                            resizeMode="cover"
                        />
                        {previewAssets && (
                            <RNAnimated.View
                                style={{
                                    width: birdPreviewSize,
                                    height: birdPreviewSize,
                                    position: 'relative',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transform: [{ translateY: landingAnim }],
                                    zIndex: 2,
                                }}
                            >
                                {/* If previewing a new bird type, show that bird's assets */}
                                {previewAssets.birdType ? (
                                    <>
                                        <Image
                                            source={birdAssets[previewAssets.birdType as BirdType].body}
                                            style={styles.birdImage}
                                            resizeMode="contain"
                                        />
                                        <Image
                                            source={birdAssets[previewAssets.birdType as BirdType].eyes}
                                            style={styles.birdImage}
                                            resizeMode="contain"
                                        />
                                        <Image
                                            source={birdAssets[previewAssets.birdType as BirdType].beak}
                                            style={styles.birdImage}
                                            resizeMode="contain"
                                        />
                                        <Image
                                            source={birdAssets[previewAssets.birdType as BirdType].feet}
                                            style={styles.birdImage}
                                            resizeMode="contain"
                                        />
                                        <Animated.Image
                                            source={birdAssets[previewAssets.birdType as BirdType].Lwing}
                                            style={[
                                                { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                leftWingAnimatedStyle,
                                            ]}
                                            resizeMode="contain"
                                        />
                                        <Animated.Image
                                            source={birdAssets[previewAssets.birdType as BirdType].Rwing}
                                            style={[
                                                { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                rightWingAnimatedStyle,
                                            ]}
                                            resizeMode="contain"
                                        />
                                    </>
                                ) : (
                                    // Original preview code for clothing items
                                    <>
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
                                        {/* Shirt body (if present) */}
                                        {previewAssets.shirt_body && (
                                            <Image
                                                source={previewAssets.shirt_body}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                        )}
                                        {/* Left wing (animated) */}
                                        <Animated.Image
                                            source={assets.Lwing}
                                            style={[
                                                { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                leftWingAnimatedStyle,
                                            ]}
                                            resizeMode="contain"
                                        />
                                        {/* Right wing (animated) */}
                                        <Animated.Image
                                            source={assets.Rwing}
                                            style={[
                                                { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                rightWingAnimatedStyle,
                                            ]}
                                            resizeMode="contain"
                                        />
                                        {/* Left sleeve (if present) */}
                                        {((birdType === 'owl' && previewAssets.owl_left_sleeve) || 
                                          (birdType === 'base' && previewAssets.base_left_sleeve)) && (
                                            <Animated.Image
                                                source={
                                                    birdType === 'owl'
                                                        ? previewAssets.owl_left_sleeve
                                                        : previewAssets.base_left_sleeve
                                                }
                                                style={[
                                                    { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                    leftWingAnimatedStyle,
                                                ]}
                                                resizeMode="contain"
                                            />
                                        )}
                                        {/* Right sleeve (if present) */}
                                        {((birdType === 'owl' && previewAssets.owl_right_sleeve) || 
                                          (birdType === 'base' && previewAssets.base_right_sleeve)) && (
                                            <Animated.Image
                                                source={
                                                    birdType === 'owl'
                                                        ? previewAssets.owl_right_sleeve
                                                        : previewAssets.base_right_sleeve
                                                }
                                                style={[
                                                    { position: 'absolute', width: birdPreviewSize, height: birdPreviewSize },
                                                    rightWingAnimatedStyle,
                                                ]}
                                                resizeMode="contain"
                                            />
                                        )}
                                        {/* Hat (if present) */}
                                        {previewAssets.hat && (
                                            <Image
                                                source={previewAssets.hat}
                                                style={styles.birdImage}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </>
                                )}
                            </RNAnimated.View>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                if (previewAssets) {
                                    if (previewAssets.birdType) {
                                        setBirdType(previewAssets.birdType);
                                        useBirdStore.getState().resetClothing();
                                    } else {
                                        const currentClothing = useBirdStore.getState().clothing;
                                        setClothing({
                                            ...currentClothing,
                                            ...previewAssets,
                                            left_sleeve:
                                                birdType === 'owl'
                                                    ? previewAssets.owl_left_sleeve || currentClothing.left_sleeve
                                                    : previewAssets.base_left_sleeve || currentClothing.left_sleeve,
                                            right_sleeve:
                                                birdType === 'owl'
                                                    ? previewAssets.owl_right_sleeve || currentClothing.right_sleeve
                                                    : previewAssets.base_right_sleeve || currentClothing.right_sleeve,
                                        });
                                    }
                                }
                                closePreview();
                            }}
                            style={{ marginTop: 20, backgroundColor: '#2196F3', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, zIndex: 2 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Equip Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closePreview} style={{ marginTop: 10, zIndex: 2 }}>
                            <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const BattlePassRow: React.FC<BattlePassRowProps> = ({ level, freeReward, premiumReward, openPreview, currentLevel, claimedItems }) => {
    const faded = level > currentLevel;
    
    // Check if free reward is claimed
    let isFreeClaimed = false;
    if (freeReward.assets.shirt_body) {
        const shirtType = freeReward.assets.id;
        isFreeClaimed = claimedItems.shirt.some((item: any) => item.id === shirtType);
    } else if (freeReward.assets.hat) {
        const hatType = freeReward.assets.id;
        isFreeClaimed = claimedItems.hat.some((item: any) => item.id === hatType);
    } else if (freeReward.assets.birdType) {
        isFreeClaimed = claimedItems.bird.some((item: any) => item.id === freeReward.assets.birdType);
    }

    // Check if premium reward is claimed
    let isPremiumClaimed = false;
    if (premiumReward.assets.shirt_body) {
        const shirtType = premiumReward.assets.id;
        isPremiumClaimed = claimedItems.shirt.some((item: any) => item.id === shirtType);
    } else if (premiumReward.assets.hat) {
        const hatType = premiumReward.assets.id;
        isPremiumClaimed = claimedItems.hat.some((item: any) => item.id === hatType);
    } else if (premiumReward.assets.birdType) {
        isPremiumClaimed = claimedItems.bird.some((item: any) => item.id === premiumReward.assets.birdType);
    }

    const getRarityText = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'Common';
            case 'rare':
                return 'Rare';
            case 'epic':
                return 'Epic';
            case 'legendary':
                return 'Legendary';
            default:
                return 'Common';
        }
    };

    return (       
            <View style={styles.levelRow}>
                <View style={styles.sideBox}>
                    <LottieView
                        source={require('../../../assets/animations/basic_level_background.json')}
                        style={styles.animationBackground}
                        autoPlay
                        loop
                        resizeMode="cover"
                        speed={2}
                    />
                    <View style={styles.rewardContainer}>
                        <Image source={freeReward.assets.preview} style={styles.rewardImage} resizeMode="contain" />
                        {!isFreeClaimed && openPreview && freeReward.assets && (
                            <TouchableOpacity
                                style={StyleSheet.absoluteFillObject}
                                activeOpacity={0.6}
                                onPress={() => openPreview(freeReward.assets)}
                            />
                        )}
                        {isFreeClaimed && (
                            <Image source={checkmarkIcon} style={styles.checkmark} />
                        )}
                    </View>
                    <Text style={styles.rarityText}>{getRarityText(freeReward.assets.rarity)}</Text>
                </View>
                <View style={styles.sideBox}>
                    <LottieView
                        source={require('../../../assets/animations/premium_level_background.json')}
                        style={styles.animationBackground}
                        autoPlay
                        loop
                        resizeMode="cover"
                    />
                    <View style={styles.rewardContainer}>
                        <Image source={premiumReward.assets.preview} style={styles.rewardImage} resizeMode="contain" />
                        {!isPremiumClaimed && openPreview && premiumReward.assets && (
                            <TouchableOpacity
                                style={StyleSheet.absoluteFillObject}
                                activeOpacity={0.6}
                                onPress={() => openPreview(premiumReward.assets)}
                            />
                        )}
                        {isPremiumClaimed && (
                            <Image source={checkmarkIcon} style={styles.checkmark} />
                        )}
                    </View>
                    <Text style={styles.rarityText}>{getRarityText(premiumReward.assets.rarity)}</Text>
                </View>
                <Image
                    source={require('../../../assets/levels/battle_pass_level_badge.png')}
                    style={styles.badge}
                    resizeMode="contain"
                />
                <Text style={styles.badgeText}>{level}</Text>
                {faded && (
                    <View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            zIndex: 10,
                        }}
                        pointerEvents="none"
                    />
                )}
            </View>
    );
}

const BADGE_SIZE = scale(57);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSpacer: {
        height: '25%',
        backgroundColor: 'red', 
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: scale(150),
        width: SCREEN_WIDTH,
        position: 'relative',
    },
    sideBox: {
        flex: 1,
        height: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    animationBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: [{ scale: 1.5 }],
    },
    boxText: {
        fontSize: scale(18),
        color: '#2a2a2a',
        fontWeight: '600',
        zIndex: 1,
    },
    badge: {
        position: 'absolute',
        left: (SCREEN_WIDTH - BADGE_SIZE) / 2,
        top: (scale(150) - BADGE_SIZE) / 2,
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        zIndex: 2,
        elevation: 2,
    },
    rewardImage: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
    },
    badgeText: {
        position: 'absolute',
        left: (SCREEN_WIDTH - BADGE_SIZE) / 2,
        top: (scale(150) - BADGE_SIZE) / 2,
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#fff',
        zIndex: 3,
        textAlign: 'center',
        textAlignVertical: 'center',
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
        zIndex: 2,
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
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        zIndex: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    birdImage: {
        position: 'absolute',
        width: birdPreviewSize,
        height: birdPreviewSize,
    },
    categoryScroll: {
        maxHeight: 50,
        zIndex: 2,
    },
    itemsGrid: {
        flex: 1,
        zIndex: 2,
    },
    rewardContainer: {
        width: '70%',
        height: '70%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    rarityText: {
        fontSize: scale(12),
        color: '#666',
        marginTop: 4,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
}); 