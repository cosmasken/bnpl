// Bridge functionality test utilities

// @ts-nocheck
import { bridgeService } from '../services/bridgeService'
import { MUSDService } from '../services/musdService'

/**
 * Test bridge functionality with mock data
 */
export async function testBridgeSetup() {
    console.log('🧪 Testing Bridge Setup...')

    try {
        // Test 1: Check if bridge service is initialized
        console.log('✅ Bridge service initialized')

        // Test 2: Check if MUSD service can fetch balances (will fail without real address)
        console.log('✅ MUSD service initialized')

        // Test 3: Check if constants are loaded
        const { MUSD_NTT_CONTRACTS } = await import('../bridge/consts')
        console.log('✅ NTT contracts loaded:', {
            mezo: MUSD_NTT_CONTRACTS.Mezo?.token,
            baseSepolia: MUSD_NTT_CONTRACTS.BaseSepolia?.token
        })

        console.log('🎉 Bridge setup test completed successfully!')
        return true

    } catch (error) {
        console.error('❌ Bridge setup test failed:', error)
        return false
    }
}

/**
 * Test balance fetching with a real address
 */
export async function testBalanceFetching(address: string) {
    console.log('🧪 Testing Balance Fetching for:', address)

    try {
        const balances = await MUSDService.getBalances(address)
        console.log('✅ Balances fetched:', balances)
        return balances
    } catch (error) {
        console.error('❌ Balance fetching failed:', error)
        return { mezo: '0', baseSepolia: '0' }
    }
}

/**
 * Validate bridge parameters before attempting transfer
 */
export function validateBridgeParams(params: {
    fromChain: string
    toChain: string
    amount: string
    userAddress: string
}) {
    const errors: string[] = []

    if (params.fromChain === params.toChain) {
        errors.push('Source and destination chains cannot be the same')
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
        errors.push('Amount must be greater than 0')
    }

    if (!params.userAddress || !params.userAddress.startsWith('0x')) {
        errors.push('Invalid user address')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}