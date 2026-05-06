import { WalletClient, parseUnits, formatUnits, erc20Abi } from 'viem'

// Contract addresses (will be updated after deployment)
const TREASURY_CONTRACTS = {
    BITPAY_TREASURY: '0x0000000000000000000000000000000000000000', // To be updated
    FAKE_USDC: '0x0000000000000000000000000000000000000000', // To be updated
    MUSD_BASE: '0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5' // Bridged MUSD on Base Sepolia
} as const

// Minimal ABI for BitPayTreasury
const TREASURY_ABI = [
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "lockMUSD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "repayMUSD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "user", type: "address" }],
        name: "userLocked",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "user", type: "address" },
            { indexed: false, name: "musdAmount", type: "uint256" },
            { indexed: false, name: "usdcCredit", type: "uint256" }
        ],
        name: "Locked",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "user", type: "address" },
            { indexed: false, name: "amount", type: "uint256" }
        ],
        name: "Repaid",
        type: "event",
    },
] as const

export interface TreasuryOperationParams {
    walletClient: WalletClient
    amount: string
}

export interface UserTreasuryData {
    lockedMUSD: string
    fakeUSDCBalance: string
}

/**
 * Service for interacting with BitPayTreasury contract on Base Sepolia
 * Allows users to lock MUSD and get fake USDC for purchases
 */
export class TreasuryService {
    /**
     * Lock MUSD in treasury and receive fake USDC 1:1
     */
    async lockMUSD(params: TreasuryOperationParams): Promise<string> {
        const { walletClient, amount } = params
        
        // First approve MUSD for treasury
        const approvalTx = await walletClient.writeContract({
            address: TREASURY_CONTRACTS.MUSD_BASE,
            abi: erc20Abi,
            functionName: 'approve',
            args: [TREASURY_CONTRACTS.BITPAY_TREASURY, parseUnits(amount, 18)],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        // Wait for approval (simplified for demo)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Lock MUSD in treasury
        const lockTx = await walletClient.writeContract({
            address: TREASURY_CONTRACTS.BITPAY_TREASURY,
            abi: TREASURY_ABI,
            functionName: 'lockMUSD',
            args: [parseUnits(amount, 18)],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return lockTx
    }

    /**
     * Repay MUSD to unlock from treasury
     */
    async repayMUSD(params: TreasuryOperationParams): Promise<string> {
        const { walletClient, amount } = params
        
        // Approve MUSD for repayment
        const approvalTx = await walletClient.writeContract({
            address: TREASURY_CONTRACTS.MUSD_BASE,
            abi: erc20Abi,
            functionName: 'approve',
            args: [TREASURY_CONTRACTS.BITPAY_TREASURY, parseUnits(amount, 18)],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Repay MUSD
        const repayTx = await walletClient.writeContract({
            address: TREASURY_CONTRACTS.BITPAY_TREASURY,
            abi: TREASURY_ABI,
            functionName: 'repayMUSD',
            args: [parseUnits(amount, 18)],
            chain: walletClient.chain,
            account: walletClient.account,
        })
        
        return repayTx
    }

    /**
     * Get user's treasury data
     */
    async getUserTreasuryData(userAddress: string, walletClient: WalletClient): Promise<UserTreasuryData> {
        // Get locked MUSD amount
        const lockedMUSD = await walletClient.readContract({
            address: TREASURY_CONTRACTS.BITPAY_TREASURY,
            abi: TREASURY_ABI,
            functionName: 'userLocked',
            args: [userAddress],
        }) as bigint

        // Get fake USDC balance
        const fakeUSDCBalance = await walletClient.readContract({
            address: TREASURY_CONTRACTS.FAKE_USDC,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
        }) as bigint

        return {
            lockedMUSD: formatUnits(lockedMUSD, 18),
            fakeUSDCBalance: formatUnits(fakeUSDCBalance, 18)
        }
    }

    /**
     * Update contract addresses after deployment
     */
    static updateAddresses(treasuryAddress: string, fakeUsdcAddress: string) {
        // @ts-ignore - Updating const for deployment
        TREASURY_CONTRACTS.BITPAY_TREASURY = treasuryAddress
        // @ts-ignore
        TREASURY_CONTRACTS.FAKE_USDC = fakeUsdcAddress
    }
}

export const treasuryService = new TreasuryService()
