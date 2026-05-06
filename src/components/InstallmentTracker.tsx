import React, { useState, useEffect } from 'react'
import { installmentService, InstallmentData, RepaymentData } from '../services/installmentService'

interface InstallmentTrackerProps {
    userAddress: string
}

export function InstallmentTracker({ userAddress }: InstallmentTrackerProps) {
    const [installments, setInstallments] = useState<InstallmentData[]>([])
    const [repayments, setRepayments] = useState<RepaymentData[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (userAddress) {
            loadInstallmentData()
        }
    }, [userAddress])

    const loadInstallmentData = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
            const [installmentData, repaymentData, summaryData] = await Promise.all([
                installmentService.getUserInstallments(userAddress),
                installmentService.getUserRepayments(userAddress),
                installmentService.getUserSummary(userAddress)
            ])
            
            setInstallments(installmentData)
            setRepayments(repaymentData)
            setSummary(summaryData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load installment data')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString()
    }

    const formatTxHash = (hash: string) => {
        return `${hash.slice(0, 6)}...${hash.slice(-4)}`
    }

    if (!userAddress) {
        return (
            <div className="card">
                <h3>Treasury Activity</h3>
                <p>Connect your wallet to view your treasury transactions</p>
            </div>
        )
    }

    return (
        <div>
            <h3>Treasury Activity Tracker</h3>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {isLoading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loading"></div>
                    <p>Loading treasury activity...</p>
                </div>
            )}
            
            {/* Summary Stats */}
            {summary && (
                <div className="balance-display">
                    <div className="balance-card">
                        <h4>Total Locked</h4>
                        <div className="amount">{summary.totalLocked} MUSD</div>
                    </div>
                    <div className="balance-card">
                        <h4>Total Repaid</h4>
                        <div className="amount">{summary.totalRepaid} MUSD</div>
                    </div>
                    <div className="balance-card">
                        <h4>Active Balance</h4>
                        <div className="amount">{summary.activeBalance} MUSD</div>
                    </div>
                    <div className="balance-card">
                        <h4>Transactions</h4>
                        <div className="amount">{summary.totalTransactions}</div>
                    </div>
                </div>
            )}
            
            {/* Active Locks */}
            {installments.length > 0 && (
                <div className="card">
                    <h4>Treasury Locks</h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>MUSD Locked</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>USDC Received</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments.map((installment) => (
                                    <tr key={installment.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '12px' }}>{formatDate(installment.timestamp)}</td>
                                        <td style={{ padding: '12px' }}>{parseFloat(installment.musdAmount).toFixed(2)} MUSD</td>
                                        <td style={{ padding: '12px' }}>{parseFloat(installment.usdcReceived).toFixed(2)} USDC</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                color: installment.status === 'active' ? 'var(--primary)' : 'var(--success)',
                                                textTransform: 'uppercase',
                                                fontSize: '0.9em',
                                                fontWeight: '600'
                                            }}>
                                                {installment.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <a 
                                                href={`https://sepolia.basescan.org/tx/${installment.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                            >
                                                {formatTxHash(installment.txHash)}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Repayment History */}
            {repayments.length > 0 && (
                <div className="card">
                    <h4>Repayment History</h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Amount Repaid</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repayments.map((repayment) => (
                                    <tr key={repayment.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '12px' }}>{formatDate(repayment.timestamp)}</td>
                                        <td style={{ padding: '12px' }}>{parseFloat(repayment.amount).toFixed(2)} MUSD</td>
                                        <td style={{ padding: '12px' }}>
                                            <a 
                                                href={`https://sepolia.basescan.org/tx/${repayment.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                            >
                                                {formatTxHash(repayment.txHash)}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {!isLoading && installments.length === 0 && repayments.length === 0 && (
                <div className="card">
                    <h4>No Treasury Activity</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                        You haven't made any treasury transactions yet. Use the Treasury tab to lock MUSD and get spendable USDC.
                    </p>
                </div>
            )}
            
            <div style={{ marginTop: '16px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
                <p><strong>How it works:</strong></p>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Lock MUSD in treasury → receive spendable USDC 1:1</li>
                    <li>Use USDC for purchases and payments</li>
                    <li>Repay MUSD to unlock your treasury position</li>
                    <li>All transactions are tracked on Base Sepolia blockchain</li>
                </ul>
            </div>
        </div>
    )
}
