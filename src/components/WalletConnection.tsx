import React from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { mezoTestnet, baseSepolia, CHAIN_IDS } from '../config/wagmi'

interface WalletConnectionProps {
    onAddressChange: (address: string | undefined) => void
}

export function WalletConnection({ onAddressChange }: WalletConnectionProps) {
    const { address, isConnected, chain } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()
    const { switchChain } = useSwitchChain()

    // Notify parent component when address changes
    React.useEffect(() => {
        onAddressChange(address)
    }, [address, onAddressChange])

    const handleSwitchToMezo = () => {
        if (chain?.id !== CHAIN_IDS.MEZO_TESTNET) {
            switchChain({ chainId: CHAIN_IDS.MEZO_TESTNET })
        }
    }

    const handleSwitchToBase = () => {
        if (chain?.id !== CHAIN_IDS.BASE_SEPOLIA) {
            switchChain({ chainId: CHAIN_IDS.BASE_SEPOLIA })
        }
    }

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    if (!isConnected) {
        return (
            <div className="card">
                <h3>Connect Wallet</h3>
                <p>Connect your wallet to start using BitPay Later</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => connect({ connector })}
                            disabled={isPending}
                            className="button primary"
                        >
                            {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <h3>Wallet Connected</h3>

            <div className="balance">
                <div>
                    <div className="balance-label">Address</div>
                    <div className="balance-amount">{formatAddress(address!)}</div>
                </div>
                <button
                    className="button"
                    onClick={() => disconnect()}
                    style={{ fontSize: '0.9em' }}
                >
                    Disconnect
                </button>
            </div>

            <div className="balance">
                <div>
                    <div className="balance-label">Current Network</div>
                    <div className="balance-amount">{chain?.name || 'Unknown'}</div>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <h4>Switch Network</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`button ${chain?.id === CHAIN_IDS.MEZO_TESTNET ? 'primary' : ''}`}
                        onClick={handleSwitchToMezo}
                        disabled={chain?.id === CHAIN_IDS.MEZO_TESTNET}
                    >
                        Mezo Testnet
                    </button>
                    <button
                        className={`button ${chain?.id === CHAIN_IDS.BASE_SEPOLIA ? 'primary' : ''}`}
                        onClick={handleSwitchToBase}
                        disabled={chain?.id === CHAIN_IDS.BASE_SEPOLIA}
                    >
                        Base Sepolia
                    </button>
                </div>
            </div>

            {chain && (
                <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#888' }}>
                    <p>Chain ID: {chain.id}</p>
                    {chain.blockExplorers?.default && (
                        <p>
                            Explorer: <a
                                href={chain.blockExplorers.default.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#646cff' }}
                            >
                                {chain.blockExplorers.default.name}
                            </a>
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}