import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useStore } from '../store/useStore';

interface DailyChallengesModalProps {
    visible: boolean;
    onClose: () => void;
}

export const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({ visible, onClose }) => {
    const { dailyChallenges } = useStore();

    if (!dailyChallenges) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#0A0E1A', '#1A1F2E']}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Daily Challenges</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Render all 5 challenges */}
                        {dailyChallenges.challenges.map((challenge, index) => {
                            const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);

                            return (
                                <LinearGradient
                                    key={challenge.id}
                                    colors={challenge.completed ? ['#0D4D4D', '#1A5F5F'] : ['#1A1F2E', '#252B3A']}
                                    style={styles.challengeCard}
                                >
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.icon}>{challenge.icon}</Text>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                                            <Text style={styles.challengeDescription}>{challenge.description}</Text>
                                        </View>
                                        <View style={styles.xpBadge}>
                                            <Text style={styles.xpText}>{challenge.xpReward} XP</Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                                        </View>
                                        <Text style={styles.progressText}>
                                            {challenge.progress} / {challenge.target}
                                        </Text>
                                    </View>

                                    {challenge.completed && (
                                        <View style={styles.completedBadge}>
                                            <Text style={styles.completedText}>✓ Completed!</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            );
                        })}

                        <Text style={styles.note}>
                            Complete challenges to earn XP and level up faster! Challenges reset daily.
                        </Text>
                    </ScrollView>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    container: {
        height: '80%',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONTS.sizes.xxl,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    closeButton: {
        padding: SPACING.sm,
    },
    content: {
        flex: 1,
    },
    challengeCard: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    icon: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    cardInfo: {
        flex: 1,
    },
    challengeTitle: {
        fontSize: FONTS.sizes.md,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    challengeDescription: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.regular,
        color: COLORS.textSub,
    },
    xpBadge: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    xpText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    progressSection: {
        marginTop: SPACING.sm,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.accent,
        borderRadius: RADIUS.sm,
    },
    progressText: {
        fontSize: FONTS.sizes.xs,
        fontFamily: FONTS.medium,
        color: COLORS.textSub,
        textAlign: 'right',
    },
    completedBadge: {
        marginTop: SPACING.sm,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.positive,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    completedText: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.bold,
        color: '#000',
    },
    note: {
        fontSize: FONTS.sizes.sm,
        fontFamily: FONTS.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
});
