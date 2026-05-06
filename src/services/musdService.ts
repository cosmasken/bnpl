import { createPublicClient, http, erc20Abi, formatUnits } from 'viem'
import { mezoTestnet, baseSepolia } from '../config/wagmi'

// MUSD token addresses from NTT contracts
const MUSD_ADDRESSES = {
    [mezoTestnet.id]: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503' as const,
    [baseSepolia.id]: '0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5' as const,
}

// Create public clients for each chain
const mezoClient = createPublicClient({
    chain: mezoTestnet,
    transport: http(),
})

const baseClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
})

export class MUSDService {
    /**
     * Get MUSD balance on Mezo Testnet
     */
    static async getBalanceMezo(address: string): Promise<string> {
        try {
            const balance = await mezoClient.readContract({
                address: MUSD_ADDRESSES[mezoTestnet.id],
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            })

            return formatUnits(balance, 18)
        } catch (error) {
            console.error('Failed to get Mezo MUSD balance:', error)
            return '0'
        }
    }

    /**
     * Get MUSD balance on Base Sepolia
     */
    static async getBalanceBaseSepolia(address: string): Promise<string> {
        try {
            const balance = await baseClient.readContract({
                address: MUSD_ADDRESSES[baseSepolia.id],
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            })

            return formatUnits(balance, 18)
        } catch (error) {
            console.error('Failed to get Base Sepolia MUSD balance:', error)
            return '0'
        }
    }

    /**
     * Get MUSD balances on both chains
     */
    static async getBalances(address: string): Promise<{
        mezo: string
        baseSepolia: string
    }> {
        const [mezoBalance, baseBalance] = await Promise.all([
            this.getBalanceMezo(address),
            this.getBalanceBaseSepolia(address),
        ])

        return {
            mezo: mezoBalance,
            baseSepolia: baseBalance,
        }
    }

    /**
     * Get MUSD token info
     */
    static async getTokenInfo(chainId: number): Promise<{
        name: string
        symbol: string
        decimals: number
    }> {
        const client = chainId === mezoTestnet.id ? mezoClient : baseClient
        const address = MUSD_ADDRESSES[chainId as keyof typeof MUSD_ADDRESSES]

        if (!address) {
            throw new Error(`MUSD not supported on chain ${chainId}`)
        }

        try {
            const [name, symbol, decimals] = await Promise.all([
                client.readContract({
                    address,
                    abi: erc20Abi,
                    functionName: 'name',
                }),
                client.readContract({
                    address,
                    abi: erc20Abi,
                    functionName: 'symbol',
                }),
                client.readContract({
                    address,
                    abi: erc20Abi,
                    functionName: 'decimals',
                }),
            ])

            return { name, symbol, decimals }
        } catch (error) {
            console.error('Failed to get token info:', error)
            return { name: 'MUSD', symbol: 'MUSD', decimals: 18 }
        }
    }

    /**
     * Get MUSD allowance for a spender
     */
    static async getAllowance(
        owner: string,
        spender: string,
        chainId: number
    ): Promise<bigint> {
        const client = chainId === mezoTestnet.id ? mezoClient : baseClient
        const address = MUSD_ADDRESSES[chainId as keyof typeof MUSD_ADDRESSES]

        if (!address) {
            throw new Error(`MUSD not supported on chain ${chainId}`)
        }

        try {
            const allowance = await client.readContract({
                address,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [owner as `0x${string}`, spender as `0x${string}`],
            })

            return allowance
        } catch (error) {
            console.error('Failed to get allowance:', error)
            return 0n
        }
    }
}

// Export token addresses for use in other components
export { MUSD_ADDRESSES }