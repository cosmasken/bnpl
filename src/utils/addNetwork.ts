// Utility to add Mezo Testnet to MetaMask

export const MEZO_NETWORK_PARAMS = {
    chainId: '0x7b7b', // 31611 in hex
    chainName: 'Mezo Testnet',
    nativeCurrency: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 18,
    },
    rpcUrls: ['https://rpc.test.mezo.org'],
    blockExplorerUrls: ['https://explorer.test.mezo.org'],
}

export const BASE_SEPOLIA_NETWORK_PARAMS = {
    chainId: '0x14A34', // 84532 in hex
    chainName: 'Base Sepolia',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
}

export async function addMezoNetwork() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MEZO_NETWORK_PARAMS],
        })
        console.log('Mezo Testnet added to MetaMask')
    } catch (error) {
        console.error('Failed to add Mezo Testnet:', error)
        throw error
    }
}

export async function addBaseSepolia() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_NETWORK_PARAMS],
        })
        console.log('Base Sepolia added to MetaMask')
    } catch (error) {
        console.error('Failed to add Base Sepolia:', error)
        throw error
    }
}

export async function switchToMezo() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MEZO_NETWORK_PARAMS.chainId }],
        })
    } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
            await addMezoNetwork()
        } else {
            throw error
        }
    }
}

export async function switchToBaseSepolia() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_NETWORK_PARAMS.chainId }],
        })
    } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
            await addBaseSepolia()
        } else {
            throw error
        }
    }
}