import { Crypto } from '../types';

// Cryptocurrency Catalog
export const CRYPTO_CATALOG: Crypto[] = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        basePrice: 55000,
        price: 55000,
        openPrice: 55000,
        history: [{ timestamp: Date.now(), value: 55000 }],
        volatility: 0.04,
        logo: require('../assets/crypto/btc.png'),
        description: 'The original cryptocurrency. Digital gold.',
        educational: 'Bitcoin is the first decentralized digital currency, allowing peer-to-peer transactions without intermediaries.'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        basePrice: 3200,
        price: 3200,
        openPrice: 3200,
        history: [{ timestamp: Date.now(), value: 3200 }],
        volatility: 0.05,
        logo: require('../assets/crypto/eth.png'),
        description: 'The leading smart contract platform.',
        educational: 'Ethereum introduced smart contracts, enabling decentralized applications (dApps) and DeFi.'
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        basePrice: 140,
        price: 140,
        openPrice: 140,
        history: [{ timestamp: Date.now(), value: 140 }],
        volatility: 0.08,
        logo: require('../assets/crypto/sol.png'),
        description: 'High-performance blockchain for mass adoption.',
        educational: 'Solana is known for its incredible speed and low transaction costs, making it popular for NFTs and gaming.'
    },
    {
        symbol: 'ADA',
        name: 'Cardano',
        basePrice: 0.65,
        price: 0.65,
        openPrice: 0.65,
        history: [{ timestamp: Date.now(), value: 0.65 }],
        volatility: 0.06,
        logo: require('../assets/crypto/ada.png'),
        description: 'Proof-of-stake blockchain platform.',
        educational: 'Cardano is built on peer-reviewed research and aims to provide a more secure and sustainable blockchain.'
    },
    {
        symbol: 'DOGE',
        name: 'Dogecoin',
        basePrice: 0.12,
        price: 0.12,
        openPrice: 0.12,
        history: [{ timestamp: Date.now(), value: 0.12 }],
        volatility: 0.10,
        logo: require('../assets/crypto/doge.png'),
        description: 'The original meme coin.',
        educational: 'Started as a joke, Dogecoin has become a popular cryptocurrency for tipping and community fundraising.'
    },
    {
        symbol: 'MATIC',
        name: 'Polygon',
        basePrice: 0.90,
        price: 0.90,
        openPrice: 0.90,
        history: [{ timestamp: Date.now(), value: 0.90 }],
        volatility: 0.07,
        logo: require('../assets/crypto/matic.png'),
        description: 'Ethereum scaling solution for faster, cheaper transactions.',
        educational: 'Polygon is a Layer 2 scaling solution that helps Ethereum handle more transactions at lower cost.'
    },
    {
        symbol: 'AVAX',
        name: 'Avalanche',
        basePrice: 35,
        price: 35,
        openPrice: 35,
        history: [{ timestamp: Date.now(), value: 35 }],
        volatility: 0.08,
        logo: require('../assets/crypto/avax.png'),
        description: 'Fast smart contract platform with sub-second finality.',
        educational: 'Avalanche uses a unique consensus protocol that achieves transaction finality in under 1 second.'
    },
    {
        symbol: 'DOT',
        name: 'Polkadot',
        basePrice: 7.5,
        price: 7.5,
        openPrice: 7.5,
        history: [{ timestamp: Date.now(), value: 7.5 }],
        volatility: 0.06,
        logo: require('../assets/crypto/dot.png'),
        description: 'Multi-chain protocol enabling blockchain interoperability.',
        educational: 'Polkadot connects different blockchains together, allowing them to share information and features.'
    },
    {
        symbol: 'LINK',
        name: 'Chainlink',
        basePrice: 16,
        price: 16,
        openPrice: 16,
        history: [{ timestamp: Date.now(), value: 16 }],
        volatility: 0.05,
        logo: require('../assets/crypto/link.png'),
        description: 'Decentralized oracle network bringing real-world data to blockchains.',
        educational: 'Chainlink oracles allow smart contracts to access external data like stock prices, weather, and more.'
    },
    {
        symbol: 'UNI',
        name: 'Uniswap',
        basePrice: 8,
        price: 8,
        openPrice: 8,
        history: [{ timestamp: Date.now(), value: 8 }],
        volatility: 0.06,
        logo: require('../assets/crypto/uni.png'),
        description: 'Leading decentralized exchange protocol.',
        educational: 'Uniswap pioneered automated market makers (AMMs), allowing anyone to trade tokens without a centralized exchange.'
    },
];

export function initializeCryptos(): Crypto[] {
    return CRYPTO_CATALOG.map(crypto => ({
        ...crypto,
        price: crypto.basePrice,
        openPrice: crypto.basePrice,
        history: [{ timestamp: Date.now(), value: crypto.basePrice }]
    }));
}
