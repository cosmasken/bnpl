import React, { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { treasuryService, UserTreasuryData } from '../services/treasuryService'

interface TreasuryInterfaceProps {
    musdBalance: string
    onBalanceUpdate?: () => void
}

export function TreasuryInterface({ musdBalance, onBalanceUpdate }: TreasuryInterfaceProps) {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    
    const [treasuryData, setTreasuryData] = useState<UserTreasuryData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState('')
    const [operation, setOperation] = useState<'lock' | 'repay'>('lock')

    useEffect(() => {
        if (address && walletClient) {
            loadTreasuryData()
        }
    }, [address, walletClient])

    const loadTreasuryData = async () => {
        if (!address || !walletClient) return
        
        try {
            const data = await treasuryService.getUserTreasuryData(address, walletClient)
            setTreasuryData(data)
        } catch (err) {
            console.error('Failed to load treasury data:', err)
        }
    }

    const handleLockMUSD = async () => {
        if (!walletClient || !amount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await treasuryService.lockMUSD({
                walletClient,
                amount
            })
            
            console.log('MUSD locked:', txHash)
            await loadTreasuryData()
            if (onBalanceUpdate) onBalanceUpdate()
            setAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lock MUSD')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRepayMUSD = async () => {
        if (!walletClient || !amount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await treasuryService.repayMUSD({
                walletClient,
                amount
            })
            
            console.log('MUSD repaid:', txHash)
            await loadTreasuryData()
            if (onBalanceUpdate) onBalanceUpdate()
            setAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to repay MUSD')
        } finally {
            setIsLoading(false)
        }
    }

    if (!address) {
        return (
            <div className="card">
                <h3>Base Treasury</h3>
                <p>Connect your wallet to lock MUSD and get spendable USDC</p>
            </div>
        )
    }

    return (
        <div>
            <h3>Base Treasury - Lock MUSD for Spending Power</h3>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {/* Treasury Status */}
            {treasuryData && (
                <div className="trove-status">
                    <h4>Your Treasury Position</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <strong>Locked MUSD:</strong> {parseFloat(treasuryData.lockedMUSD).toFixed(2)} MUSD
                        </div>
                        <div>
                            <strong>Spendable USDC:</strong> {parseFloat(treasuryData.fakeUSDCBalance).toFixed(2)} USDC
                        </div>
                    </div>
                </div>
            )}
            
            {/* Available Balance */}
            <div className="balance-card" style={{ marginBottom: '16px' }}>
                <h4>Available MUSD on Base</h4>
                <div className="amount">{parseFloat(musdBalance).toFixed(2)} MUSD</div>
            </div>
            
            {/* Operation Selector */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>Operation:</label>
                <select 
                    value={operation} 
                    onChange={(e) => setOperation(e.target.value as any)}
                >
                    <option value="lock">Lock MUSD → Get USDC</option>
                    <option value="repay">Repay MUSD → Unlock</option>
                </select>
            </div>
            
            {/* Amount Input */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {operation === 'lock' ? 'MUSD to Lock:' : 'MUSD to Repay:'}
                </label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            
            {/* Action Button */}
            <button
                className="button primary"
                onClick={operation === 'lock' ? handleLockMUSD : handleRepayMUSD}
                disabled={isLoading || !walletClient || !amount}
                style={{ width: '100%', marginBottom: '16px' }}
            >
                {isLoading ? 'Processing...' : 
                 operation === 'lock' ? `Lock ${amount} MUSD → Get ${amount} USDC` :
                 `Repay ${amount} MUSD`}
            </button>
            
            <div style={{ marginTop: '16px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
                <p><strong>How it works:</strong></p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Lock bridged MUSD in Base treasury contract</li>
                    <li>Receive fake USDC 1:1 for spending</li>
                    <li>Use USDC for purchases and installments</li>
                    <li>Repay MUSD to unlock your position</li>
                </ul>
            </div>
        </div>
    )
}
