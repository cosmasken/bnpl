import { createConfig, http } from 'wagmi'
import { metaMask, walletConnect, coinbaseWallet } from '@wagmi/connectors'
import { defineChain } from 'viem'

// Define Mezo Testnet chain
export const mezoTestnet = defineChain({
    id: 31611,
    name: 'Mezo Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Bitcoin',
        symbol: 'BTC',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.test.mezo.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Mezo Explorer',
            url: 'https://explorer.test.mezo.org',
        },
    },
    testnet: true,
})

// Define Base Sepolia chain
export const baseSepolia = defineChain({
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://sepolia.base.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Base Sepolia Explorer',
            url: 'https://sepolia.basescan.org',
        },
    },
    testnet: true,
})

// Wagmi configuration
export const config = createConfig({
    chains: [mezoTestnet, baseSepolia],
    connectors: [
        metaMask(),
        walletConnect({
            projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        }),
        coinbaseWallet({
            appName: 'BitPay Later',
        }),
    ],
    transports: {
        [mezoTestnet.id]: http(),
        [baseSepolia.id]: http(),
    },
})

// Export chain IDs for easy reference
export const CHAIN_IDS = {
    MEZO_TESTNET: mezoTestnet.id,
    BASE_SEPOLIA: baseSepolia.id,
} as const