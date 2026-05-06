import React, { useState } from 'react'

interface PurchaseInterfaceProps {
    userAddress: string
    baseSepoliaBalance: string
}

interface Purchase {
    id: string
    merchant: string
    amount: string
    installments: number
    status: 'active' | 'completed'
    nextPayment: string
    createdAt: string
}

export function PurchaseInterface({ userAddress, baseSepoliaBalance }: PurchaseInterfaceProps) {
    const [amount, setAmount] = useState('')
    const [merchant, setMerchant] = useState('bitrefill')
    const [installments, setInstallments] = useState(3)
    const [isLoading, setIsLoading] = useState(false)
    const [purchases, setPurchases] = useState<Purchase[]>([])

    const handlePurchase = async () => {
        if (!amount || parseFloat(amount) <= 0) return

        setIsLoading(true)

        // Simulate purchase processing
        setTimeout(() => {
            const newPurchase: Purchase = {
                id: Date.now().toString(),
                merchant: merchant === 'bitrefill' ? 'Bitrefill' : 'Amazon',
                amount,
                installments,
                status: 'active',
                nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                createdAt: new Date().toLocaleDateString()
            }

            setPurchases(prev => [newPurchase, ...prev])
            setAmount('')
            setIsLoading(false)
        }, 2000)
    }

    const installmentAmount = amount ? (parseFloat(amount) / installments).toFixed(2) : '0.00'
    const hasEnoughBalance = amount ? parseFloat(amount) <= parseFloat(baseSepoliaBalance) : true

    return (
        <div className="card">
            <h3>Make a Purchase</h3>
            <p>Use your MUSD on Base Sepolia to shop online and pay in installments.</p>

            <div className="purchase-form">
                <div className="form-group">
                    <label>Merchant</label>
                    <select
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="input"
                    >
                        <option value="bitrefill">Bitrefill (Gift Cards)</option>
                        <option value="amazon">Amazon (Demo)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Purchase Amount (MUSD)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="input"
                        disabled={isLoading}
                    />
                    {!hasEnoughBalance && (
                        <div style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '0.5rem' }}>
                            Insufficient balance. You have {baseSepoliaBalance} MUSD on Base Sepolia.
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Number of Installments</label>
                    <select
                        value={installments}
                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                        className="input"
                    >
                        <option value={2}>2 payments</option>
                        <option value={3}>3 payments</option>
                        <option value={4}>4 payments</option>
                        <option value={6}>6 payments</option>
                    </select>
                </div>

                {amount && (
                    <div className="installment-preview">
                        <div className="balance">
                            <span className="balance-label">Installment Amount</span>
                            <span className="balance-amount">{installmentAmount} MUSD</span>
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#888', marginTop: '0.5rem' }}>
                            {installments} payments of {installmentAmount} MUSD each
                        </div>
                    </div>
                )}

                <button
                    className="button primary"
                    onClick={handlePurchase}
                    disabled={!amount || !hasEnoughBalance || isLoading}
                    style={{ width: '100%' }}
                >
                    {isLoading ? (
                        <>
                            <span className="loading"></span> Processing Purchase...
                        </>
                    ) : (
                        `Purchase with ${installments} Installments`
                    )}
                </button>
            </div>

            {purchases.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h4>Recent Purchases</h4>
                    {purchases.map(purchase => (
                        <div key={purchase.id} className="balance" style={{ marginBottom: '1rem' }}>
                            <div>
                                <div className="balance-label">{purchase.merchant}</div>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>
                                    {purchase.amount} MUSD • {purchase.installments} installments • {purchase.createdAt}
                                </div>
                            </div>
                            <div>
                                <div className="balance-amount">{purchase.status}</div>
                                <div style={{ fontSize: '0.8em', color: '#888' }}>
                                    Next: {purchase.nextPayment}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#888' }}>
                <p><strong>How BitPay Later works:</strong></p>
                <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <li>Make purchases using your MUSD balance on Base Sepolia</li>
                    <li>Split payments into 2-6 installments automatically</li>
                    <li>Keep your Bitcoin exposure while shopping online</li>
                    <li>No interest charges - just a small processing fee</li>
                </ul>
            </div>
        </div>
    )
}