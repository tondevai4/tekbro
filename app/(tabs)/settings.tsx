import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, User, Bell, Smartphone, Trash2, Info, ChevronRight, LogOut, Shield, CreditCard, Palette, Check } from 'lucide-react-native';
import { FONTS, SPACING, RADIUS, ThemeType } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { EditProfileModal } from '../../components/EditProfileModal';

export default function SettingsScreen() {
    const { username, reset, setProfile } = useStore();
    const { theme, currentTheme, setTheme } = useTheme();
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [hapticsEnabled, setHapticsEnabled] = React.useState(true);
    const [editProfileVisible, setEditProfileVisible] = React.useState(false);

    const handleReset = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Reset Account',
            'Are you sure you want to wipe all progress? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: () => {
                        reset();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        router.replace('/onboarding');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, title, subtitle, onPress, isDestructive = false, rightElement }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!!rightElement}
        >
            <View style={[
                styles.iconBox,
                { backgroundColor: isDestructive ? theme.negativeSubtle : theme.primary + '15' }
            ]}>
                <Icon size={20} color={isDestructive ? theme.negative : theme.primary} />
            </View>
            <View style={styles.itemContent}>
                <Text style={[
                    styles.itemTitle,
                    { color: isDestructive ? theme.negative : theme.text }
                ]}>{title}</Text>
                {subtitle && <Text style={[styles.itemSubtitle, { color: theme.textTertiary }]}>{subtitle}</Text>}
            </View>
            {rightElement || <ChevronRight size={20} color={theme.textTertiary} />}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>
    );

    const ThemeOption = ({ id, label, colors }: { id: ThemeType, label: string, colors: readonly [string, string] }) => {
        const isActive = currentTheme === id;
        return (
            <TouchableOpacity
                style={[
                    styles.themeCard,
                    {
                        borderColor: isActive ? theme.primary : 'transparent',
                        transform: [{ scale: isActive ? 1.02 : 1 }]
                    }
                ]}
                onPress={() => {
                    setTheme(id);
                    Haptics.selectionAsync();
                }}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={colors}
                    style={styles.themeCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {isActive && (
                        <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                            <Check size={12} color="#000" strokeWidth={3} />
                        </View>
                    )}
                    <View style={styles.themeCardContent}>
                        <Text style={styles.themeCardLabel}>{label}</Text>
                        <View style={[styles.themeCardIndicator, { backgroundColor: isActive ? theme.primary : 'rgba(255,255,255,0.2)' }]} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <LinearGradient
                    colors={[theme.primary + '20', theme.primary + '05']}
                    style={[styles.profileCard, { borderColor: theme.primary + '30' }]}
                >
                    <View style={[styles.avatar, { backgroundColor: theme.bg, borderColor: theme.primary }]}>
                        <User size={32} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.profileName, { color: theme.text }]}>{username || 'Trader'}</Text>
                        <Text style={[styles.profileStatus, { color: theme.primary }]}>Pro Member</Text>
                    </View>
                </LinearGradient>

                <SectionHeader title="Appearance" />
                <View style={styles.themeGrid}>
                    <ThemeOption id="midnight" label="Midnight" colors={['#000000', '#1A1A1A']} />
                    <ThemeOption id="ocean" label="Ocean" colors={['#020617', '#1e293b']} />
                    <ThemeOption id="sunset" label="Sunset" colors={['#2a0a2a', '#4a1a4a']} />
                    <ThemeOption id="forest" label="Forest" colors={['#052e16', '#064e3b']} />
                </View>

                <SectionHeader title="Preferences" />
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Bell}
                        title="Notifications"
                        subtitle="Price alerts & news"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={'#FFF'}
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Smartphone}
                        title="Haptic Feedback"
                        subtitle="Vibrations on interaction"
                        rightElement={
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={setHapticsEnabled}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={'#FFF'}
                            />
                        }
                    />
                </View>

                <SectionHeader title="Account" />
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={User}
                        title="Edit Profile"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setEditProfileVisible(true);
                        }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={CreditCard}
                        title="Subscription"
                        subtitle="Manage your Pro plan"
                        onPress={() => { }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={Shield}
                        title="Privacy & Security"
                        onPress={() => { }}
                    />
                </View>

                <SectionHeader title="Support" />
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SettingItem
                        icon={Info}
                        title="About PaperTrader"
                        subtitle="Version 2.0.0"
                        onPress={() => { }}
                    />
                </View>

                <SectionHeader title="Danger Zone" />
                <View style={[
                    styles.section,
                    {
                        backgroundColor: theme.negativeSubtle,
                        borderColor: theme.negativeSubtle
                    }
                ]}>
                    <SettingItem
                        icon={Trash2}
                        title="Reset Account"
                        subtitle="Wipe all data and start over"
                        isDestructive
                        onPress={handleReset}
                    />
                </View>

                <Text style={[styles.footerText, { color: theme.textTertiary }]}>Made with ❤️ by BankTec</Text>
            </ScrollView>

            <EditProfileModal
                visible={editProfileVisible}
                onClose={() => setEditProfileVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.xl,
        borderWidth: 1,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.lg,
        borderWidth: 2,
    },
    profileName: {
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    profileStatus: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginTop: 2,
    },
    sectionHeader: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
        borderWidth: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    itemContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    itemTitle: {
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    itemSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        marginLeft: 60,
    },
    footerText: {
        textAlign: 'center',
        fontFamily: FONTS.medium,
        fontSize: 12,
        marginTop: SPACING.lg,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    themeCard: {
        width: '47%',
        height: 100,
        borderRadius: RADIUS.xl,
        borderWidth: 2,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    themeCardGradient: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'flex-end',
    },
    themeCardContent: {
        gap: 4,
    },
    themeCardLabel: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    themeCardIndicator: {
        width: 20,
        height: 4,
        borderRadius: RADIUS.full,
    },
    activeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
