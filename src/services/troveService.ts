import { WalletClient, parseUnits, formatUnits } from 'viem'
import { BORROWER_OPERATIONS_ABI, TROVE_MANAGER_ABI } from '../config/contracts'

// Mezo Testnet contract addresses from references/dapp/src/config/contracts.ts
const MEZO_CONTRACTS = {
    BORROWER_OPERATIONS: '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',
    TROVE_MANAGER: '0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0',
    MUSD_TOKEN: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
    PRICE_FEED: '0x86bCF0841622a5dAC14A313a15f96A95421b9366'
} as const

export interface TroveData {
    collateral: string
    debt: string
    collateralRatio: string
    interestOwed: string
    status: 'active' | 'closed' | 'liquidated'
}

export interface TroveOperationParams {
    walletClient: WalletClient
    amount: string
}

/**
 * Service for interacting with Mezo's Trove system
 * Allows users to deposit BTC collateral and borrow MUSD
 */
export class TroveService {
    /**
     * Deposit BTC as collateral and open a new Trove
     */
    async openTrove(params: TroveOperationParams & { musdAmount: string }): Promise<string> {
        const { walletClient, amount: btcAmount, musdAmount } = params
        
        const txHash = await walletClient.writeContract({
            address: MEZO_CONTRACTS.BORROWER_OPERATIONS,
            abi: BORROWER_OPERATIONS_ABI,
            functionName: 'openTrove',
            args: [
                parseUnits(musdAmount, 18), // _MUSDAmount
                walletClient.account.address, // _upperHint
                walletClient.account.address, // _lowerHint
            ],
            value: parseUnits(btcAmount, 18), // BTC collateral
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return txHash
    }

    /**
     * Add more BTC collateral to existing Trove
     */
    async addCollateral(params: TroveOperationParams): Promise<string> {
        const { walletClient, amount } = params
        
        const txHash = await walletClient.writeContract({
            address: MEZO_CONTRACTS.BORROWER_OPERATIONS,
            abi: BORROWER_OPERATIONS_ABI,
            functionName: 'addColl',
            args: [
                walletClient.account.address, // _upperHint
                walletClient.account.address, // _lowerHint
            ],
            value: parseUnits(amount, 18),
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return txHash
    }

    /**
     * Borrow additional MUSD from existing Trove
     */
    async borrowMUSD(params: TroveOperationParams): Promise<string> {
        const { walletClient, amount } = params
        
        const txHash = await walletClient.writeContract({
            address: MEZO_CONTRACTS.BORROWER_OPERATIONS,
            abi: BORROWER_OPERATIONS_ABI,
            functionName: 'withdrawMUSD',
            args: [
                parseUnits(amount, 18), // _MUSDAmount
                walletClient.account.address, // _upperHint
                walletClient.account.address, // _lowerHint
            ],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return txHash
    }

    /**
     * Repay MUSD debt
     */
    async repayMUSD(params: TroveOperationParams): Promise<string> {
        const { walletClient, amount } = params
        
        const txHash = await walletClient.writeContract({
            address: MEZO_CONTRACTS.BORROWER_OPERATIONS,
            abi: BORROWER_OPERATIONS_ABI,
            functionName: 'repayMUSD',
            args: [
                parseUnits(amount, 18), // _MUSDAmount
                walletClient.account.address, // _upperHint
                walletClient.account.address, // _lowerHint
            ],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return txHash
    }

    /**
     * Get current Trove data for user
     */
    async getTroveData(userAddress: string, walletClient: WalletClient): Promise<TroveData> {
        // Get collateral ratio
        const collateralRatio = await walletClient.readContract({
            address: MEZO_CONTRACTS.TROVE_MANAGER,
            abi: TROVE_MANAGER_ABI,
            functionName: 'getCurrentICR',
            args: [userAddress, parseUnits('1', 18)], // price
        }) as bigint

        // Get Trove details
        const troveData = await walletClient.readContract({
            address: MEZO_CONTRACTS.TROVE_MANAGER,
            abi: TROVE_MANAGER_ABI,
            functionName: 'Troves',
            args: [userAddress],
        }) as [bigint, bigint, bigint, number, bigint]

        const [debt, collateral, , status] = troveData

        // Get interest owed
        const interestOwed = await walletClient.readContract({
            address: MEZO_CONTRACTS.TROVE_MANAGER,
            abi: TROVE_MANAGER_ABI,
            functionName: 'getTroveInterestOwed',
            args: [userAddress],
        }) as bigint

        return {
            collateral: formatUnits(collateral, 18),
            debt: formatUnits(debt, 18),
            collateralRatio: formatUnits(collateralRatio, 16), // ICR is in 1e18 format, convert to percentage
            interestOwed: formatUnits(interestOwed, 18),
            status: status === 1 ? 'active' : status === 2 ? 'closed' : 'liquidated'
        }
    }

    /**
     * Check if user has an active Trove
     */
    async hasTrove(userAddress: string, walletClient: WalletClient): Promise<boolean> {
        const troveData = await walletClient.readContract({
            address: MEZO_CONTRACTS.TROVE_MANAGER,
            abi: TROVE_MANAGER_ABI,
            functionName: 'Troves',
            args: [userAddress],
        }) as [bigint, bigint, bigint, number, bigint]

        const [, , , status] = troveData
        return status === 1 // Status 1 = active
    }
}

export const troveService = new TroveService()
