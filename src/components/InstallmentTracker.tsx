import React, { useState, useEffect } from 'react'

interface Installment {
    id: string
    purchaseId: string
    merchant: string
    amount: string
    dueDate: string
    status: 'pending' | 'paid' | 'overdue'
    paymentNumber: number
    totalPayments: number
}

interface InstallmentTrackerProps {
    userAddress: string
}

export function InstallmentTracker({ userAddress }: InstallmentTrackerProps) {
    const [installments, setInstallments] = useState<Installment[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Mock data for demo
    useEffect(() => {
        const mockInstallments: Installment[] = [
            {
                id: '1',
                purchaseId: 'purchase-1',
                merchant: 'Bitrefill',
                amount: '33.33',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                status: 'pending',
                paymentNumber: 2,
                totalPayments: 3
            },
            {
                id: '2',
                purchaseId: 'purchase-1',
                merchant: 'Bitrefill',
                amount: '33.33',
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                status: 'paid',
                paymentNumber: 1,
                totalPayments: 3
            },
            {
                id: '3',
                purchaseId: 'purchase-2',
                merchant: 'Amazon',
                amount: '25.00',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                status: 'overdue',
                paymentNumber: 1,
                totalPayments: 4
            }
        ]
        setInstallments(mockInstallments)
    }, [userAddress])

    const handlePayInstallment = async (installmentId: string) => {
        setIsLoading(true)

        // Simulate payment processing
        setTimeout(() => {
            setInstallments(prev =>
                prev.map(installment =>
                    installment.id === installmentId
                        ? { ...installment, status: 'paid' as const }
                        : installment
                )
            )
            setIsLoading(false)
        }, 2000)
    }

    const pendingInstallments = installments.filter(i => i.status === 'pending')
    const overdueInstallments = installments.filter(i => i.status === 'overdue')
    const paidInstallments = installments.filter(i => i.status === 'paid')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f7931e'
            case 'paid': return '#4ade80'
            case 'overdue': return '#ef4444'
            default: return '#888'
        }
    }

    return (
        <div className="card">
            <h3>My Installments</h3>
            <p>Track and manage your installment payments across all purchases.</p>

            {/* Summary */}
            <div className="grid" style={{ marginBottom: '2rem' }}>
                <div className="balance">
                    <div className="balance-label">Pending Payments</div>
                    <div className="balance-amount">{pendingInstallments.length}</div>
                </div>
                <div className="balance">
                    <div className="balance-label">Overdue Payments</div>
                    <div className="balance-amount" style={{ color: '#ef4444' }}>
                        {overdueInstallments.length}
                    </div>
                </div>
            </div>

            {/* Overdue Installments */}
            {overdueInstallments.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#ef4444' }}>⚠️ Overdue Payments</h4>
                    {overdueInstallments.map(installment => (
                        <div key={installment.id} className="balance" style={{ border: '1px solid #ef4444' }}>
                            <div>
                                <div className="balance-label">{installment.merchant}</div>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>
                                    Payment {installment.paymentNumber} of {installment.totalPayments} • Due: {installment.dueDate}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="balance-amount">{installment.amount} MUSD</div>
                                <button
                                    className="button primary"
                                    onClick={() => handlePayInstallment(installment.id)}
                                    disabled={isLoading}
                                    style={{ marginTop: '0.5rem', fontSize: '0.9em' }}
                                >
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Installments */}
            {pendingInstallments.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4>📅 Upcoming Payments</h4>
                    {pendingInstallments.map(installment => (
                        <div key={installment.id} className="balance">
                            <div>
                                <div className="balance-label">{installment.merchant}</div>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>
                                    Payment {installment.paymentNumber} of {installment.totalPayments} • Due: {installment.dueDate}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="balance-amount">{installment.amount} MUSD</div>
                                <button
                                    className="button"
                                    onClick={() => handlePayInstallment(installment.id)}
                                    disabled={isLoading}
                                    style={{ marginTop: '0.5rem', fontSize: '0.9em' }}
                                >
                                    Pay Early
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paid Installments */}
            {paidInstallments.length > 0 && (
                <div>
                    <h4>✅ Completed Payments</h4>
                    {paidInstallments.map(installment => (
                        <div key={installment.id} className="balance" style={{ opacity: 0.7 }}>
                            <div>
                                <div className="balance-label">{installment.merchant}</div>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>
                                    Payment {installment.paymentNumber} of {installment.totalPayments} • Paid: {installment.dueDate}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="balance-amount" style={{ color: '#4ade80' }}>
                                    {installment.amount} MUSD
                                </div>
                                <div style={{ fontSize: '0.8em', color: '#4ade80', marginTop: '0.5rem' }}>
                                    PAID
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {installments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    <p>No installments yet. Make your first purchase to get started!</p>
                </div>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#888' }}>
                <p><strong>Payment Options:</strong></p>
                <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <li>Automatic payments from your MUSD balance</li>
                    <li>Manual payments anytime before due date</li>
                    <li>Early payment discounts available</li>
                    <li>Grace period for late payments (small fee applies)</li>
                </ul>
            </div>
        </div>
    )
}