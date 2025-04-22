import { View, Image, StyleSheet, Dimensions } from 'react-native';
import React, { useMemo } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { scale, verticalScale } from 'react-native-size-matters';

interface LevelProgressProps {
    currentXP: number;
    maxXP: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ currentXP, maxXP }) => {
    const progress = useSharedValue(currentXP / maxXP);
    const maxWidth = useMemo(() => scale(131), []);

    const fillStyle = useAnimatedStyle(() => ({
        width: progress.value * maxWidth,
    }));

    return (
        <>
            <Image 
                source={require('../../../assets/levels/level_badge.png')}
                style={styles.levelBadge}
                resizeMode="contain"
            />
            <Image
                source={require('../../../assets/levels/progress_bar.png')}
                style={styles.barBackground}
                resizeMode="contain"
            />
            <Animated.View style={[styles.barFillWrapper, fillStyle]}>
                <Image
                    source={require('../../../assets/levels/progress_bar_fill.png')}
                    style={styles.barFill}
                    resizeMode="contain"
                />
            </Animated.View>
            <Image 
                source={require('../../../assets/levels/num_rewards_badge.png')}
                style={styles.numRewardsBadge}
                resizeMode="contain"
            />
        </>
    );
};

export default function Explore() {
    return (
        <View style={styles.container}>
            <LevelProgress currentXP={75} maxXP={100} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    levelBadge: {
        position: 'absolute',
        width: scale(175),
        height: verticalScale(61),
        left: scale(71),
        top: verticalScale(8),
        zIndex: 4,
    },
    barBackground: {
        position: 'absolute',
        width: scale(175),
        height: verticalScale(61),
        left: scale(71),
        top: verticalScale(8),
        zIndex: 2,
    },
    barFillWrapper: {
        position: 'absolute',
        height: verticalScale(61),
        left: scale(71),
        top: verticalScale(8),
        overflow: 'hidden',
        zIndex: 3,
    },
    barFill: {
        width: scale(131),
        height: verticalScale(61),
    },
    numRewardsBadge: {
        position: 'absolute',
        width: scale(175),
        height: verticalScale(61),
        left: scale(71),
        top: verticalScale(8),
        zIndex: 4,
    },
});