import React, { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { troveService, TroveData } from '../services/troveService'
import { formatUnits, parseUnits } from 'viem'

interface TroveInterfaceProps {
    onMUSDReceived?: (amount: string) => void
}

export function TroveInterface({ onMUSDReceived }: TroveInterfaceProps) {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    
    const [troveData, setTroveData] = useState<TroveData | null>(null)
    const [hasTrove, setHasTrove] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Form states
    const [btcAmount, setBtcAmount] = useState('')
    const [musdAmount, setMusdAmount] = useState('')
    const [operation, setOperation] = useState<'open' | 'borrow' | 'repay' | 'addColl'>('open')

    /**
     * Load user's Trove data on component mount and address change
     */
    useEffect(() => {
        if (address && walletClient) {
            loadTroveData()
        }
    }, [address, walletClient])

    const loadTroveData = async () => {
        if (!address || !walletClient) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const hasExistingTrove = await troveService.hasTrove(address, walletClient)
            setHasTrove(hasExistingTrove)
            
            if (hasExistingTrove) {
                const data = await troveService.getTroveData(address, walletClient)
                setTroveData(data)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Trove data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenTrove = async () => {
        if (!walletClient || !btcAmount || !musdAmount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await troveService.openTrove({
                walletClient,
                amount: btcAmount,
                musdAmount
            })
            
            console.log('Trove opened:', txHash)
            
            // Notify parent component about MUSD received
            if (onMUSDReceived) {
                onMUSDReceived(musdAmount)
            }
            
            // Reload Trove data
            await loadTroveData()
            
            // Reset form
            setBtcAmount('')
            setMusdAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open Trove')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBorrowMUSD = async () => {
        if (!walletClient || !musdAmount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await troveService.borrowMUSD({
                walletClient,
                amount: musdAmount
            })
            
            console.log('MUSD borrowed:', txHash)
            
            if (onMUSDReceived) {
                onMUSDReceived(musdAmount)
            }
            
            await loadTroveData()
            setMusdAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to borrow MUSD')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRepayMUSD = async () => {
        if (!walletClient || !musdAmount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await troveService.repayMUSD({
                walletClient,
                amount: musdAmount
            })
            
            console.log('MUSD repaid:', txHash)
            await loadTroveData()
            setMusdAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to repay MUSD')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCollateral = async () => {
        if (!walletClient || !btcAmount) return
        
        setIsLoading(true)
        setError(null)
        
        try {
            const txHash = await troveService.addCollateral({
                walletClient,
                amount: btcAmount
            })
            
            console.log('Collateral added:', txHash)
            await loadTroveData()
            setBtcAmount('')
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add collateral')
        } finally {
            setIsLoading(false)
        }
    }

    if (!address) {
        return (
            <div className="trove-interface">
                <h3>🏦 Mezo Trove</h3>
                <p>Connect your wallet to manage your Bitcoin collateral and borrow MUSD</p>
            </div>
        )
    }

    return (
        <div className="trove-interface">
            <h3>🏦 Mezo Trove - Borrow MUSD with BTC Collateral</h3>
            
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            
            {/* Trove Status */}
            {hasTrove && troveData && (
                <div className="trove-status" style={{ 
                    background: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem' 
                }}>
                    <h4>Your Trove Status</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <strong>BTC Collateral:</strong> {parseFloat(troveData.collateral).toFixed(4)} BTC
                        </div>
                        <div>
                            <strong>MUSD Debt:</strong> {parseFloat(troveData.debt).toFixed(2)} MUSD
                        </div>
                        <div>
                            <strong>Collateral Ratio:</strong> {parseFloat(troveData.collateralRatio).toFixed(2)}%
                        </div>
                        <div>
                            <strong>Interest Owed:</strong> {parseFloat(troveData.interestOwed).toFixed(4)} MUSD
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <strong>Status:</strong> 
                        <span style={{ 
                            color: troveData.status === 'active' ? 'green' : 'red',
                            marginLeft: '0.5rem'
                        }}>
                            {troveData.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Operation Selector */}
            <div style={{ marginBottom: '1rem' }}>
                <label>Operation:</label>
                <select 
                    value={operation} 
                    onChange={(e) => setOperation(e.target.value as any)}
                    style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
                >
                    {!hasTrove && <option value="open">Open New Trove</option>}
                    {hasTrove && <option value="borrow">Borrow More MUSD</option>}
                    {hasTrove && <option value="repay">Repay MUSD</option>}
                    {hasTrove && <option value="addColl">Add BTC Collateral</option>}
                </select>
            </div>
            
            {/* Input Forms */}
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                {(operation === 'open' || operation === 'addColl') && (
                    <div>
                        <label>BTC Amount:</label>
                        <input
                            type="number"
                            step="0.0001"
                            placeholder="0.1"
                            value={btcAmount}
                            onChange={(e) => setBtcAmount(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                )}
                
                {(operation === 'open' || operation === 'borrow' || operation === 'repay') && (
                    <div>
                        <label>MUSD Amount:</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="1000"
                            value={musdAmount}
                            onChange={(e) => setMusdAmount(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                )}
            </div>
            
            {/* Action Button */}
            <button
                onClick={() => {
                    switch (operation) {
                        case 'open': return handleOpenTrove()
                        case 'borrow': return handleBorrowMUSD()
                        case 'repay': return handleRepayMUSD()
                        case 'addColl': return handleAddCollateral()
                    }
                }}
                disabled={isLoading || !walletClient}
                style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Processing...' : 
                 operation === 'open' ? `Open Trove (${btcAmount} BTC → ${musdAmount} MUSD)` :
                 operation === 'borrow' ? `Borrow ${musdAmount} MUSD` :
                 operation === 'repay' ? `Repay ${musdAmount} MUSD` :
                 `Add ${btcAmount} BTC Collateral`}
            </button>
            
            <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#666' }}>
                <p><strong>How it works:</strong></p>
                <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Deposit BTC as collateral on Mezo</li>
                    <li>Borrow MUSD at 1% fixed interest rate</li>
                    <li>Your BTC stays in your control (no selling)</li>
                    <li>Maintain collateral ratio above 110%</li>
                </ul>
            </div>
        </div>
    )
}
