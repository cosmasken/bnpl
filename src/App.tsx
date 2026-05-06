import React, { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { config } from './config/wagmi'
import { WalletButton } from './components/WalletButton'
import { NetworkSwitcher } from './components/NetworkSwitcher'
import { BridgeInterface } from './components/BridgeInterface'
import { PurchaseInterface } from './components/PurchaseInterface'
import { InstallmentTracker } from './components/InstallmentTracker'
import { BalanceDisplay } from './components/BalanceDisplay'
import { TroveInterface } from './components/TroveInterface'
import { MUSDService } from './services/musdService'

const queryClient = new QueryClient()

function AppContent() {
    const { address, isConnected, chain } = useAccount()
    const [activeTab, setActiveTab] = useState<'trove' | 'bridge' | 'purchase' | 'installments' | 'network'>('trove')
    const [balances, setBalances] = useState({
        mezo: '0',
        baseSepolia: '0'
    })
    const [isLoadingBalances, setIsLoadingBalances] = useState(false)

    const isSupportedNetwork = chain && (
        chain.id === 31611 || // Mezo Testnet
        chain.id === 84532    // Base Sepolia
    )

    // Load balances when address changes and network is supported
    useEffect(() => {
        if (address && isSupportedNetwork) {
            loadBalances()
        } else {
            setBalances({ mezo: '0', baseSepolia: '0' })
        }
    }, [address, isSupportedNetwork])

    const loadBalances = async () => {
        if (!address) return

        setIsLoadingBalances(true)
        try {
            const balanceData = await MUSDService.getBalances(address)
            setBalances(balanceData)
        } catch (error) {
            console.error('Failed to load balances:', error)
        } finally {
            setIsLoadingBalances(false)
        }
    }

    const handleBridgeComplete = () => {
        loadBalances()
    }

    return (
        <div className="app">
            <div className="header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>BitPay Later</h1>
                        <p>Shop anywhere online without selling your Bitcoin. Pay in installments. Keep your stack.</p>
                    </div>
                    <WalletButton />
                </div>
            </div>

            {!isConnected && (
                <div className="card">
                    <h3>Welcome to BitPay Later</h3>
                    <p>Connect your wallet to start using Bitcoin-native buy now, pay later services.</p>
                    <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', color: '#888' }}>
                        <li>Bridge MUSD between Mezo and Base Sepolia</li>
                        <li>Make purchases with installment payments</li>
                        <li>Keep your Bitcoin exposure while shopping</li>
                        <li>Track and manage your payment schedules</li>
                    </ul>
                </div>
            )}

            {isConnected && !isSupportedNetwork && (
                <div className="card">
                    <h3>⚠️ Unsupported Network</h3>
                    <p>BitPay Later only works on Mezo Testnet and Base Sepolia networks.</p>
                    <div style={{ marginTop: '1rem' }}>
                        <p><strong>Current Network:</strong> {chain?.name || 'Unknown'} (ID: {chain?.id})</p>
                        <p><strong>Supported Networks:</strong></p>
                        <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', color: '#888' }}>
                            <li>Mezo Testnet (ID: 31611)</li>
                            <li>Base Sepolia (ID: 84532)</li>
                        </ul>
                        <p style={{ marginTop: '1rem', color: '#ff6b35' }}>
                            Please switch to a supported network using the "Switch to Mezo" button in the top-right corner.
                        </p>
                    </div>
                </div>
            )}

            {isConnected && isSupportedNetwork && (
                <>
                    <BalanceDisplay
                        mezoBalance={balances.mezo}
                        baseSepoliaBalance={balances.baseSepolia}
                        onRefresh={loadBalances}
                        isLoading={isLoadingBalances}
                    />

                    <div className="tabs">
                        <button
                            className={`button ${activeTab === 'trove' ? 'primary' : ''}`}
                            onClick={() => setActiveTab('trove')}
                        >
                            Mezo Trove
                        </button>
                        <button
                            className={`button ${activeTab === 'bridge' ? 'primary' : ''}`}
                            onClick={() => setActiveTab('bridge')}
                        >
                            Bridge MUSD
                        </button>
                        <button
                            className={`button ${activeTab === 'purchase' ? 'primary' : ''}`}
                            onClick={() => setActiveTab('purchase')}
                        >
                            Make Purchase
                        </button>
                        <button
                            className={`button ${activeTab === 'installments' ? 'primary' : ''}`}
                            onClick={() => setActiveTab('installments')}
                        >
                            My Installments
                        </button>
                        <button
                            className={`button ${activeTab === 'network' ? 'primary' : ''}`}
                            onClick={() => setActiveTab('network')}
                        >
                            Network
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'trove' && (
                            <TroveInterface
                                onMUSDReceived={(amount) => {
                                    loadBalances()
                                }}
                            />
                        )}

                        {activeTab === 'bridge' && (
                            <BridgeInterface
                                userAddress={address}
                                onBridgeComplete={handleBridgeComplete}
                            />
                        )}

                        {activeTab === 'purchase' && (
                            <PurchaseInterface
                                userAddress={address}
                                baseSepoliaBalance={balances.baseSepolia}
                            />
                        )}

                        {activeTab === 'installments' && (
                            <InstallmentTracker
                                userAddress={address}
                            />
                        )}

                        {activeTab === 'network' && (
                            <NetworkSwitcher />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <AppContent />
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default App