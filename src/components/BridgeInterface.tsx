import { useState } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import { bridgeService } from '../services/bridgeService'

interface BridgeInterfaceProps {
    userAddress: string
    onBridgeComplete: () => void
}

export function BridgeInterface({ userAddress, onBridgeComplete }: BridgeInterfaceProps) {
    const [fromChain, setFromChain] = useState<'Mezo' | 'BaseSepolia'>('Mezo')
    const [toChain, setToChain] = useState<'Mezo' | 'BaseSepolia'>('BaseSepolia')
    const [amount, setAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<{
        type: 'pending' | 'success' | 'error'
        message: string
    } | null>(null)

    const { data: walletClient } = useWalletClient()
    const { chain } = useAccount()

    const handleSwapChains = () => {
        setFromChain(toChain)
        setToChain(fromChain)
    }

    const handleBridge = async () => {
        console.log('Bridge button clicked!', { amount, userAddress, walletClient: !!walletClient })

        if (!amount || !userAddress || !walletClient) {
            setStatus({ type: 'error', message: 'Missing required parameters' })
            return
        }

        if (fromChain === toChain) {
            setStatus({ type: 'error', message: 'Source and destination chains must be different' })
            return
        }

        // Check if wallet is on correct chain
        const expectedChainId = fromChain === 'Mezo' ? 31611 : 84532

        if (chain?.id !== expectedChainId) {
            setStatus({
                type: 'error',
                message: `Please switch your wallet to ${fromChain} (Chain ID: ${expectedChainId}). Current: ${chain?.name}`
            })
            return
        }

        setIsLoading(true)
        setStatus({ type: 'pending', message: 'Initiating bridge transfer...' })

        try {
            const result = await bridgeService.bridgeTransfer({
                fromChain,
                toChain,
                amount,
                recipientAddress: userAddress,
                walletClient
            })

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: `Successfully bridged ${amount} MUSD from ${fromChain} to ${toChain}!`
                })
                setAmount('')
                onBridgeComplete()
            } else {
                setStatus({
                    type: 'error',
                    message: result.error || 'Bridge transfer failed'
                })
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="card">
            <h3>Bridge MUSD</h3>
            <p>Transfer MUSD between Mezo and Base Sepolia to access different ecosystems.</p>

            {/* Current Network Display */}
            {chain && (
                <div className="balance" style={{ marginBottom: '1rem' }}>
                    <div className="balance-label">Current Network</div>
                    <div className="balance-amount">{chain.name}</div>
                </div>
            )}

            <div className="bridge-form">
                <div className="form-group">
                    <label>From</label>
                    <select
                        value={fromChain}
                        onChange={(e) => setFromChain(e.target.value as 'Mezo' | 'BaseSepolia')}
                        className="input"
                        disabled={isLoading}
                    >
                        <option value="Mezo">Mezo Testnet</option>
                        <option value="BaseSepolia">Base Sepolia</option>
                    </select>
                </div>

                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <button className="button" onClick={handleSwapChains} disabled={isLoading}>
                        ⇅ Swap
                    </button>
                </div>

                <div className="form-group">
                    <label>To</label>
                    <select
                        value={toChain}
                        onChange={(e) => setToChain(e.target.value as 'Mezo' | 'BaseSepolia')}
                        className="input"
                        disabled={isLoading}
                    >
                        <option value="Mezo">Mezo Testnet</option>
                        <option value="BaseSepolia">Base Sepolia</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Amount (MUSD)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="input"
                        disabled={isLoading}
                        step="0.01"
                        min="0"
                    />
                </div>

                <button
                    className="button primary"
                    onClick={handleBridge}
                    disabled={!amount || parseFloat(amount) <= 0 || isLoading || fromChain === toChain || !walletClient}
                    style={{ width: '100%' }}
                >
                    {isLoading ? (
                        <>
                            <span className="loading"></span> Bridging...
                        </>
                    ) : !walletClient ? (
                        'Wallet Not Connected'
                    ) : fromChain === toChain ? (
                        'Select Different Chains'
                    ) : !amount || parseFloat(amount) <= 0 ? (
                        'Enter Amount'
                    ) : (
                        `Bridge ${amount} MUSD`
                    )}
                </button>

                {/* Debug info */}
                <div style={{ marginTop: '1rem', fontSize: '0.8em', color: '#666' }}>
                    <p>Debug: amount="{amount}", walletClient={walletClient ? 'connected' : 'not connected'}, fromChain={fromChain}, toChain={toChain}</p>
                </div>
            </div>

            {status && (
                <div className={`transaction-status ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#888' }}>
                <p><strong>How it works:</strong></p>
                <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <li>Bridge MUSD from Mezo to Base Sepolia to access Base ecosystem</li>
                    <li>Use bridged MUSD for purchases on Base (lower fees, more merchants)</li>
                    <li>Bridge back to Mezo when needed for collateral management</li>
                    <li>Cross-chain transfers take 2-5 minutes to complete</li>
                </ul>
            </div>
        </div>
    )
}