import { useAccount, useSwitchChain } from 'wagmi'
import { CHAIN_IDS } from '../config/wagmi'
import { switchToMezo, switchToBaseSepolia } from '../utils/addNetwork'

export function NetworkSwitcher() {
    const { chain, isConnected } = useAccount()
    const { switchChain } = useSwitchChain()

    if (!isConnected) return null

    const handleSwitchToMezo = async () => {
        try {
            // Try wagmi first
            if (chain?.id !== CHAIN_IDS.MEZO_TESTNET) {
                switchChain({ chainId: CHAIN_IDS.MEZO_TESTNET })
            }
        } catch (error) {
            console.log('Wagmi switch failed, trying manual switch:', error)
            // Fallback to manual MetaMask switch
            try {
                await switchToMezo()
            } catch (manualError) {
                console.error('Manual switch also failed:', manualError)
            }
        }
    }

    const handleSwitchToBase = async () => {
        try {
            // Try wagmi first
            if (chain?.id !== CHAIN_IDS.BASE_SEPOLIA) {
                switchChain({ chainId: CHAIN_IDS.BASE_SEPOLIA })
            }
        } catch (error) {
            console.log('Wagmi switch failed, trying manual switch:', error)
            // Fallback to manual MetaMask switch
            try {
                await switchToBaseSepolia()
            } catch (manualError) {
                console.error('Manual switch also failed:', manualError)
            }
        }
    }

    return (
        <div className="card">
            <h3>Switch Network</h3>
            <p>Switch between Mezo and Base Sepolia networks for different features.</p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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

            {chain && (
                <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#888' }}>
                    <p>Current: {chain.name} (ID: {chain.id})</p>
                    {chain.id !== CHAIN_IDS.MEZO_TESTNET && chain.id !== CHAIN_IDS.BASE_SEPOLIA && (
                        <p style={{ color: '#ff6b35' }}>
                            ⚠️ You're on an unsupported network. Please switch to Mezo Testnet or Base Sepolia.
                        </p>
                    )}
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

            <div style={{ marginTop: '1rem', fontSize: '0.8em', color: '#666' }}>
                <p><strong>Network Details:</strong></p>
                <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                    <li>Mezo Testnet: Chain ID 31611 (0xA7C04)</li>
                    <li>Base Sepolia: Chain ID 84532 (0x14A34)</li>
                    <li>If switching fails, the network will be added to MetaMask automatically</li>
                </ul>
            </div>
        </div>
    )
}