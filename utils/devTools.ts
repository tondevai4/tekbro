import { useCryptoStore } from '../store/useCryptoStore';
import { useStore } from '../store/useStore';
import { initializeCryptos } from '../constants/cryptoData';
import { initializeStocks } from '../constants/stockData';
import { Alert } from 'react-native';

/**
 * 🛠️ DEV TOOLS
 * Use these functions to reset the app during development
 */

export const resetAllPrices = () => {
    Alert.alert(
        'Reset All Prices',
        'This will reset all stocks and crypto to their base prices. Continue?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                    // Reset crypto
                    const freshCryptos = initializeCryptos();
                    useCryptoStore.getState().setCryptos(freshCryptos);

                    // Reset stocks
                    const freshStocks = initializeStocks();
                    useStore.getState().setStocks(freshStocks);

                    Alert.alert('✅ Success', 'All prices have been reset to base values!');
                }
            }
        ]
    );
};

export const resetCryptoPrices = () => {
    const freshCryptos = initializeCryptos();
    useCryptoStore.getState().setCryptos(freshCryptos);
    Alert.alert('✅ Success', 'Crypto prices reset!');
};

export const resetStockPrices = () => {
    const freshStocks = initializeStocks();
    useStore.getState().setStocks(freshStocks);
    Alert.alert('✅ Success', 'Stock prices reset!');
};
