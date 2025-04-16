import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native'
import { useEffect, useRef } from 'react'
import React from 'react'
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
import { SIZES } from '../../constants/sizing';
import { scale } from '../../utils/scaling';

{/* Get screen dimensions */}
const { width: screenWidth } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');
const DESIGN_SIZE = 500;
const canvasScale = screenWidth / DESIGN_SIZE;

const LevelProgress = ({ currentXP, nextXP }: { currentXP: number; nextXP: number }) => {
    const fillRatio = currentXP / nextXP;
    const fillAnimation = useSharedValue(fillRatio);

    useEffect(() => {
        fillAnimation.value = withTiming(fillRatio, { duration: 500 });
    }, [fillRatio]);

    const animatedFillStyle = useAnimatedStyle(() => ({
        width: scale(fillAnimation.value * SIZES.barFill.width),
    }));

    return (
        <View style={[styles.progressCanvas, { transform: [{ scale: canvasScale }] }]}>
            {/* Level Badge */}
            <Image 
                source={require('../../../assets/levels/level_badge.png')}
                style={styles.levelBadge}
                resizeMode="contain"
            />
            {/* Progress Bar */}
            <Image
                source={require('../../../assets/levels/progress_bar.png')}
                style={styles.barBackground}
                resizeMode="contain"
            />
            <Animated.View style={styles.barFill}>
                <Image
                    source={require('../../../assets/levels/progress_bar_fill.png')}
                    style={styles.barFill}
                    resizeMode="contain"
                />
            </Animated.View>
            {/* Items to collect */}
            <Image 
                source={require('../../../assets/levels/num_rewards_badge.png')}
                style={styles.numRewardsBadge}
                resizeMode="contain"
            />
        </View>
    );
}

export default function BirdAnimation() {
    const body = require('../../../assets/birdimage/body.png');
    const eyes = require('../../../assets/birdimage/eyes.png');
    const feet = require('../../../assets/birdimage/feet.png');
    const Lwing = require('../../../assets/birdimage/Lwing.png');
    const Rwing = require('../../../assets/birdimage/Rwing.png');
    const eyes_shut = require('../../../assets/birdimage/eyes_closed.png');

    const wingRotation = useSharedValue(0);
    const eyeOpacity = useSharedValue(1);
    const headPosition = useSharedValue(0);
    const isFlapping = useSharedValue(false);
    const birdPosition = useSharedValue({ x: 0, y: 0 });
    const isWalking = useSharedValue(false);
    const hopHeight = useSharedValue(0);
    const feetOffset = useSharedValue(0);
    const hopWingRotation = useSharedValue(0);
    const isCelebrating = useSharedValue(false);
    const celebrationHeight = useSharedValue(0);
    const celebrationWingRotation = useSharedValue(0);
    const celebrationRightWingRotation = useSharedValue(0);
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

    const startWalking = () => {
        if (!isWalking.value) {
            isWalking.value = true;
            const screenWidth = Dimensions.get('window').width;
            const screenHeight = Dimensions.get('window').height;
            
            const randomX = Math.random() * (screenWidth - 500);
            const randomY = Math.random() * (screenHeight - 500);
            
            // Start hopping animation
            const hopSequence = () => {
                // Lift feet slightly with easing
                feetOffset.value = withTiming(-5, { 
                    duration: 200,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                });
                
                // Start hopping with easing
                hopHeight.value = withSequence(
                    withTiming(-20, { 
                        duration: 300,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    }), // Jump up
                    withTiming(0, { 
                        duration: 300,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    }) // Come down
                );
                
                // Move wings slightly during hop with easing
                hopWingRotation.value = withSequence(
                    withTiming(10, { 
                        duration: 300,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    }),
                    withTiming(0, { 
                        duration: 300,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    })
                );
                
                // Put feet back down with easing
                feetOffset.value = withTiming(0, { 
                    duration: 200,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                });
            };

            // Repeat hop sequence more frequently while moving
            const hopInterval = setInterval(hopSequence, 800); // Hop every 800ms

            // Animate to new position with easing
            birdPosition.value = withTiming(
                { x: randomX, y: randomY },
                { 
                    duration: 2000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                },
                () => {
                    clearInterval(hopInterval);
                    isWalking.value = false;
                }
            );
        }
    };

    const startCelebration = () => {
        if (!isCelebrating.value) {
            isCelebrating.value = true;
            
            // Jump up and down 5 times
            celebrationHeight.value = withRepeat(
                withSequence(
                    withTiming(-100, { 
                        duration: 500,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    }),
                    withTiming(0, { 
                        duration: 500,
                        easing: Easing.bezier(0.4, 0, 0.2, 1)
                    })
                ),
                5,
                false,
                () => {
                    isCelebrating.value = false;
                }
            );

            // Wave wings during celebration
            celebrationWingRotation.value = withRepeat(
                withSequence(
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 }),
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 })
                ),
                5,
                false
            );

            celebrationRightWingRotation.value = withRepeat(
                withSequence(
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 }),
                    withTiming(120, { duration: 300 }),
                    withTiming(60, { duration: 300 })
                ),
                5,
            )

            // Try to play confetti if available
            confettiRef.current?.play();
        }
    };

    useEffect(() => {
        const moveHead = () => {
            const randomPosition = Math.random() * 10 - 5;
            headPosition.value = withTiming(randomPosition, { duration: 500 });
            setTimeout(moveHead, Math.random() * 3000 + 2000);
        };
        moveHead();
    }, []);

    useEffect(() => {
        const blink = () => {
            eyeOpacity.value = withSequence(
                withTiming(0, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
            setTimeout(blink, Math.random() * 3000 + 2000);
        };
        blink();
    }, []);

    const wingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: -54 },
            { translateY: 8 },
            { rotate: `${wingRotation.value + hopWingRotation.value + celebrationWingRotation.value}deg` },
            { translateX: 54 },
            { translateY: -8 },
        ],
    }));

    const rightWingAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: 54 },
            { translateY: -8 },
            { rotate: `${-(hopWingRotation.value + celebrationRightWingRotation.value)}deg` },
            { translateX: -54 },
            { translateY: 8 },
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

    const birdAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: birdPosition.value.x },
            { translateY: birdPosition.value.y + hopHeight.value + celebrationHeight.value },
        ],
    }));

    const feetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: feetOffset.value },
        ],
    }));
  
    return (
        <View style={styles.container}>
            <LevelProgress currentXP={50} nextXP={100} />
            <View style={styles.buttonContainer}>
                <Pressable style={styles.walkButton} onPress={startWalking}>
                    <Text style={styles.buttonText}>Walk</Text>
                </Pressable>
                <Pressable style={styles.celebrateButton} onPress={startCelebration}>
                    <Text style={styles.buttonText}>Celebrate!</Text>
                </Pressable>
            </View>
            <LottieView
                ref={confettiRef}
                source={require('../../../assets/animations/confetti.json')}
                style={styles.lottie}
                autoPlay={false}
                loop={false}
                speed={1}
            />
            <Animated.View style={[styles.birdContainer, birdAnimatedStyle]}>
                <Pressable onPress={startFlapping}>
                    <View style={styles.birdContainer}>
                        <Image source={body} style={styles.image} resizeMode="contain" />
                        <Animated.Image
                            source={Rwing}
                            style={[styles.image, rightWingAnimatedStyle]}
                            resizeMode="contain"
                        />
                        <Animated.Image 
                            source={feet} 
                            style={[styles.image, feetAnimatedStyle]} 
                            resizeMode="contain" 
                        />

                        <Animated.Image
                            source={Lwing}
                            style={[styles.image, wingAnimatedStyle]}
                            resizeMode="contain"
                        />

                        <Animated.Image
                            source={eyes}
                            style={[styles.image, eyesAnimatedStyle]}
                            resizeMode="contain"
                        />

                        <Animated.Image
                            source={eyes_shut}
                            style={[styles.image, eyesShutAnimatedStyle]}
                            resizeMode="contain"
                        />
                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: SIZES.spacing.medium,
    },
    progressCanvas: {
        width: 500,
        height: 500,
        position: 'relative',
    },
    progressContainer: {
        position: 'relative',
        //top: scale(50),
        width: screenWidth * 0.5,
        height: screenHeight * 0.15, // Make height proportional to width (1:4 ratio)
        alignItems: 'center',
        justifyContent: 'center',
        //left: screenWidth * 0.1, // Centers by offsetting by 10% on each side
        zIndex: 10,
    },
    levelBadge: {
        left: 39,
        top: 179,
        width: 141.42,
        height: 141.42,
        position: 'absolute',
        zIndex: 4,
    },
    barBackground: {
        left: 110,
        top: 194,
        width: 351,
        height: 112,
        position: 'absolute',
        zIndex: 2,
    },
    barFill: {
        left: 115,
        top: 197,
        width: 341,
        height: 106,
        position: 'absolute',
        zIndex: 3,
    },
    numRewardsBadge: {
        left: 407,
        top: 165,
        width: 65,
        height: 65,
        position: 'absolute',
        zIndex: 4,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: SIZES.margins.buttons.bottom,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: SIZES.margins.buttons.padding,
        zIndex: 10,
    },
    birdContainer: {
        width: SIZES.bird.width,
        height: SIZES.bird.height,
        position: 'relative',
        zIndex: 2,
    },
    image: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    walkButton: {
        backgroundColor: '#4CAF50',
        padding: SIZES.button.padding,
        borderRadius: SIZES.button.borderRadius,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    celebrateButton: {
        backgroundColor: '#FF9800',
        padding: SIZES.button.padding,
        borderRadius: SIZES.button.borderRadius,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    lottie: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
    },
});