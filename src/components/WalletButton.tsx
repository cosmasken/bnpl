import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { truncateAddress } from '../bridge/helpers'
import { CHAIN_IDS } from '../config/wagmi'

export function WalletButton() {
    const { address, isConnected, chain } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()
    const { switchChain } = useSwitchChain()

    const isSupportedNetwork = chain && (
        chain.id === CHAIN_IDS.MEZO_TESTNET ||
        chain.id === CHAIN_IDS.BASE_SEPOLIA
    )

    const handleSwitchToMezo = () => {
        switchChain({ chainId: CHAIN_IDS.MEZO_TESTNET })
    }

    if (!isConnected) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {connectors.slice(0, 1).map((connector) => (
                    <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        className="button primary"
                    >
                        {isPending ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                ))}
            </div>
        )
    }

    // Show network switch prompt for unsupported networks
    if (!isSupportedNetwork) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.9em', fontWeight: '500', color: '#ef4444' }}>
                        Unsupported Network
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>
                        {chain?.name || 'Unknown Network'}
                    </div>
                </div>
                <button
                    className="button primary"
                    onClick={handleSwitchToMezo}
                    style={{ fontSize: '0.9em' }}
                >
                    Switch to Mezo
                </button>
                <button
                    className="button"
                    onClick={() => disconnect()}
                    style={{ fontSize: '0.9em' }}
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.9em', fontWeight: '500' }}>
                    {truncateAddress(address!)}
                </div>
                <div style={{ fontSize: '0.8em', color: '#888' }}>
                    {chain?.name || 'Unknown Network'}
                </div>
            </div>
            <button
                className="button"
                onClick={() => disconnect()}
                style={{ fontSize: '0.9em' }}
            >
                Disconnect
            </button>
        </div>
    )
}