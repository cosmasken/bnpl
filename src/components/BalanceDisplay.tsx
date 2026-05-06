// @ts-nocheck
import React from 'react'

interface BalanceDisplayProps {
    mezoBalance: string
    baseSepoliaBalance: string
    onRefresh: () => void
    isLoading?: boolean
}

export function BalanceDisplay({ mezoBalance, baseSepoliaBalance, onRefresh, isLoading }: BalanceDisplayProps) {
    return (
        <div className="card">
            <h3>Your MUSD Balances</h3>
            <div className="grid">
                <div className="balance">
                    <div>
                        <div className="balance-label">Mezo Testnet</div>
                        <div className="balance-amount">
                            {isLoading ? <span className="loading"></span> : `${mezoBalance} MUSD`}
                        </div>
                    </div>
                </div>
                <div className="balance">
                    <div>
                        <div className="balance-label">Base Sepolia</div>
                        <div className="balance-amount">
                            {isLoading ? <span className="loading"></span> : `${baseSepoliaBalance} MUSD`}
                        </div>
                    </div>
                </div>
            </div>
            <button className="button" onClick={onRefresh} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh Balances'}
            </button>
        </div>
    )
}