import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem'
import { baseSepolia } from 'viem/chains'

// Base Sepolia public client for reading treasury events
export const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://base-sepolia.drpc.org'),
})

export interface InstallmentData {
    id: string
    userAddress: string
    musdAmount: string
    usdcReceived: string
    timestamp: number
    txHash: string
    status: 'active' | 'repaid'
}

export interface RepaymentData {
    id: string
    userAddress: string
    amount: string
    timestamp: number
    txHash: string
}

/**
 * Service for tracking treasury contract events as installment data
 */
export class InstallmentService {
    private treasuryAddress = '0xbb53cb5d15ca9df45e7ed01a91871d4180399533' as const
    
    /**
     * Get user's treasury locks (treated as "purchases" for installment tracking)
     */
    async getUserInstallments(userAddress: string): Promise<InstallmentData[]> {
        try {
            // Get Locked events for this user
            const lockedEvents = await baseSepoliaClient.getLogs({
                address: this.treasuryAddress,
                event: parseAbiItem('event Locked(address indexed user, uint256 musdAmount, uint256 usdcCredit)'),
                args: {
                    user: userAddress as `0x${string}`
                },
                fromBlock: 'earliest',
                toBlock: 'latest'
            })

            // Get Repaid events for this user
            const repaidEvents = await baseSepoliaClient.getLogs({
                address: this.treasuryAddress,
                event: parseAbiItem('event Repaid(address indexed user, uint256 amount)'),
                args: {
                    user: userAddress as `0x${string}`
                },
                fromBlock: 'earliest',
                toBlock: 'latest'
            })

            // Convert events to installment data
            const installments: InstallmentData[] = []
            
            for (const event of lockedEvents) {
                const block = await baseSepoliaClient.getBlock({ blockHash: event.blockHash! })
                
                // Check if this lock has been repaid
                const isRepaid = repaidEvents.some(repayEvent => 
                    repayEvent.blockNumber > event.blockNumber
                )
                
                installments.push({
                    id: event.transactionHash!,
                    userAddress: event.args.user!,
                    musdAmount: formatUnits(event.args.musdAmount!, 18),
                    usdcReceived: formatUnits(event.args.usdcCredit!, 18),
                    timestamp: Number(block.timestamp),
                    txHash: event.transactionHash!,
                    status: isRepaid ? 'repaid' : 'active'
                })
            }

            // Sort by timestamp (newest first)
            return installments.sort((a, b) => b.timestamp - a.timestamp)
            
        } catch (error) {
            console.error('Failed to fetch installments:', error)
            return []
        }
    }

    /**
     * Get user's repayment history
     */
    async getUserRepayments(userAddress: string): Promise<RepaymentData[]> {
        try {
            const repaidEvents = await baseSepoliaClient.getLogs({
                address: this.treasuryAddress,
                event: parseAbiItem('event Repaid(address indexed user, uint256 amount)'),
                args: {
                    user: userAddress as `0x${string}`
                },
                fromBlock: 'earliest',
                toBlock: 'latest'
            })

            const repayments: RepaymentData[] = []
            
            for (const event of repaidEvents) {
                const block = await baseSepoliaClient.getBlock({ blockHash: event.blockHash! })
                
                repayments.push({
                    id: event.transactionHash!,
                    userAddress: event.args.user!,
                    amount: formatUnits(event.args.amount!, 18),
                    timestamp: Number(block.timestamp),
                    txHash: event.transactionHash!
                })
            }

            return repayments.sort((a, b) => b.timestamp - a.timestamp)
            
        } catch (error) {
            console.error('Failed to fetch repayments:', error)
            return []
        }
    }

    /**
     * Get summary statistics for user
     */
    async getUserSummary(userAddress: string) {
        const installments = await this.getUserInstallments(userAddress)
        const repayments = await this.getUserRepayments(userAddress)
        
        const totalLocked = installments.reduce((sum, inst) => 
            sum + parseFloat(inst.musdAmount), 0
        )
        
        const totalRepaid = repayments.reduce((sum, rep) => 
            sum + parseFloat(rep.amount), 0
        )
        
        const activeInstallments = installments.filter(inst => inst.status === 'active')
        
        return {
            totalLocked: totalLocked.toFixed(2),
            totalRepaid: totalRepaid.toFixed(2),
            activeBalance: (totalLocked - totalRepaid).toFixed(2),
            activeCount: activeInstallments.length,
            totalTransactions: installments.length + repayments.length
        }
    }
}

export const installmentService = new InstallmentService()
