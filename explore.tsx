import { View, Image, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { LevelProgress } from './components/LevelProgress';
import { scale, verticalScale } from '../../utils/scaling';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming,
    Easing,
    runOnJS
} from "react-native-reanimated";
import LottieView from 'lottie-react-native';
import { useBirdStore } from '../store/birdStore';
import { birdAssets } from '../store/birdAssets';
import { useIsFocused } from '@react-navigation/native';

interface coinsTotalProps {
    coinsTotal: number;
}

const { width: screenWidth } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');
const birdScale = screenWidth / 500;

const BirdAnimation = ({ levelUpTrigger }: { levelUpTrigger: number }) => {
    const birdType = useBirdStore((state) => state.birdType);
    const clothing = useBirdStore((state) => state.clothing);
    const assets = birdAssets[birdType];

    const shirt_body = clothing.shirt_body;
    const left_sleeve = clothing.left_sleeve;
    const right_sleeve = clothing.right_sleeve;
    const hat = clothing.hat;

    const wingRotation = useSharedValue(0);
    const eyeOpacity = useSharedValue(1);
    const headPosition = useSharedValue(0);
    const isFlapping = useSharedValue(false);
    const jumpValue = useSharedValue(0);

    const confettiRef = useRef<LottieView>(null);

    const startFlapping = () => {
        if (!isFlapping.value) {
            isFlapping.value = true;
            wingRotation.value = withRepeat(
                withSequence(
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 }),
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 }),
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 }),
                    withTiming(0, { duration: 300 })
                ),
                1,
                true,
                () => {
                    isFlapping.value = false;
                }
            );
        }
    };

    const startLevelUpAnimation = () => {
        console.log('startLevelUpAnimation');
        confettiRef.current?.play();

        // Start flapping (faster, more celebratory)
        wingRotation.value = withRepeat(
            withSequence(
                withTiming(120, { duration: 250 }),
                withTiming(60, { duration: 250 }),
                withTiming(120, { duration: 250 }),
                withTiming(60, { duration: 250 }),
                withTiming(120, { duration: 250 }),
                withTiming(60, { duration: 250 }),
                withTiming(120, { duration: 250 }),
                withTiming(60, { duration: 250 }),
                withTiming(0, { duration: 250 })
            ),
            2,
            false
        );

        // Start jump (up, down, up, down, settle)
        jumpValue.value = withSequence(
            withTiming(-birdScale * 120, { duration: 500, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }),
            withTiming(-birdScale * 70, { duration: 400, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }),
            withTiming(-birdScale * 35, { duration: 300, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }),
            withTiming(-birdScale * 120, { duration: 250, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) }),
            withTiming(-birdScale * 60, { duration: 200, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }),
            withTiming(-birdScale * 35, { duration: 180, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) })
        );
    };

    useEffect(() => {
        let moveHeadTimeout: NodeJS.Timeout;
        
        const moveHead = () => {
            const randomPosition = (Math.random() * 10 - 5) * birdScale;
            headPosition.value = withTiming(randomPosition, { duration: 500 });
            moveHeadTimeout = setTimeout(moveHead, Math.random() * 3000 + 2000);
        };
        
        moveHead();

        // Cleanup function
        return () => {
            if (moveHeadTimeout) {
                clearTimeout(moveHeadTimeout);
            }
        };
    }, []);

    useEffect(() => {
        let blinkTimeout: NodeJS.Timeout;
        
        const blink = () => {
            eyeOpacity.value = withSequence(
                withTiming(0, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
            blinkTimeout = setTimeout(blink, Math.random() * 3000 + 2000);
        };
        
        blink();

        // Cleanup function
        return () => {
            if (blinkTimeout) {
                clearTimeout(blinkTimeout);
            }
        };
    }, []);

    useEffect(() => {
        if (levelUpTrigger > 0) {
            startLevelUpAnimation();
        }
    }, [levelUpTrigger]);

    const jumpAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: jumpValue.value }],
    }));

    const wingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: birdScale*-60 },
            { translateY: birdScale*4 },
            { rotate: `${wingRotation.value}deg` },
            { translateX: birdScale*60 },
            { translateY: birdScale*-4 },
        ],
    }));

    const rightWingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: birdScale*60 },
            { translateY: birdScale*4 },
            { rotate: `-${wingRotation.value}deg` },
            { translateX: birdScale*-60 },
            { translateY: birdScale*-4 },
        ],
    }));

    const eyesAnimatedStyle = useAnimatedStyle(() => ({
        opacity: eyeOpacity.value,
        transform: [{ translateX: headPosition.value }],
    }));

    const eyesShutAnimatedStyle = useAnimatedStyle(() => ({
        opacity: 1 - eyeOpacity.value,
        transform: [{ translateX: headPosition.value }],
    }));

    const beakAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: headPosition.value }],
    }));

    return (
        <Animated.View style={[styles.birdContainer, jumpAnimatedStyle]}>
            <Pressable onPress={startFlapping}>
                <View style={styles.birdContainer}>
                    <Image source={assets.body} style={styles.image} resizeMode="contain" />   
                    <Image source={shirt_body} style={styles.image} resizeMode="contain" />
                    <Animated.Image 
                        source={assets.beak} 
                        style={[styles.image, beakAnimatedStyle]} 
                        resizeMode="contain" 
                    />
                    <Image source={assets.feet} style={styles.image} resizeMode="contain" />
                    <Animated.Image
                        source={assets.Rwing}
                        style={[styles.image, rightWingAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={assets.Lwing}
                        style={[styles.image, wingAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={right_sleeve}
                        style={[styles.image, rightWingAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={left_sleeve}
                        style={[styles.image, wingAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={assets.eyes}
                        style={[styles.image, eyesAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Animated.Image
                        source={assets.eyes_shut}
                        style={[styles.image, eyesShutAnimatedStyle]}
                        resizeMode="contain"
                    />
                    <Image source={hat} style={styles.image} resizeMode="contain" />
                    <LottieView
                        ref={confettiRef}
                        source={require('../../../assets/animations/confetti.json')}
                        style={styles.lottie}
                        autoPlay={false}
                        loop={false}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const CoinsTotal: React.FC<coinsTotalProps> = ({ coinsTotal }) => {
    return (
        <View style={styles.coinsContainer}>
            <Image
                source={require('../../../assets/levels/coins_total.png')}
                style={styles.coinsImage}
            />
            <Text style={styles.coinsText}>{coinsTotal}</Text>
        </View>
    );
};

export default function Explore() {
    const currentXP = useBirdStore((state) => state.currentXP);
    const maxXP = useBirdStore((state) => state.maxXP);
    const currentCoins = useBirdStore((state) => state.currentCoins);
    const currentLevel = useBirdStore((state) => state.currentLevel);

    const [levelUpTrigger, setLevelUpTrigger] = useState(0);
    const prevLevel = useRef(currentLevel);
    const isFocused = useIsFocused();
    useEffect(() => {
        if (!isFocused) return;
        if (currentLevel > prevLevel.current) {
            setLevelUpTrigger(t => t + 1);
        }
        prevLevel.current = currentLevel;
    }, [currentLevel, isFocused]);

    return (
        <View style={styles.container}>
            <LevelProgress 
                currentXP={currentXP} 
                maxXP={maxXP} 
                currentLevel={currentLevel} 
                isVisible={isFocused}
            />
            <CoinsTotal coinsTotal={currentCoins} />
            <BirdAnimation levelUpTrigger={levelUpTrigger} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 0,
        marginTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinsContainer: {
        position: 'absolute',
        width: scale(84),
        height: verticalScale(46),
        left: scale(286),
        top: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 4,
    },
    coinsImage: {
        width: '100%',
        height: '100%',
    },
    coinsText: {
        position: 'absolute',
        fontSize: scale(12),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        transform: [{ translateX: scale(18) }],
    },
    birdContainer: {        
        width: birdScale * 500,
        height: birdScale * 500,
        position: 'relative',
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',

    },
    image: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    lottie: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});