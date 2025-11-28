import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stock, Crypto } from '../types';
import { StockCard } from './StockCard';
import { CryptoCard } from './CryptoCard';
import { FlashList } from '@shopify/flash-list';
import { SPACING, COLORS, FONTS } from '../constants/theme';

interface AssetListProps {
    assets: (Stock | Crypto | any)[]; // Accepting any for flexibility with the mapped objects in index.tsx
}

export const AssetList: React.FC<AssetListProps> = ({ assets }) => {
    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'stock' || (!item.type && item.sector && item.sector !== 'Crypto')) {
            return <StockCard stock={item} />;
        } else if (item.type === 'crypto' || item.logo) {
            return <CryptoCard crypto={item} />;
        }
        return null;
    };

    if (assets.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No assets found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {assets.map((item, index) => (
                <View key={`${item.symbol}-${index}`}>
                    {renderItem({ item })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },
});
