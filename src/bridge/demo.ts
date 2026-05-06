#!/usr/bin/env tsx

/**
 * Demo script to test NTT bridge functionality
 * Run with: npm run bridge
 */

import { bridgeService } from '../services/bridgeService.js'

async function main() {
  console.log('🌉 BitPay Later - NTT Bridge Demo')
  console.log('================================')

  const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b'

  try {
    // Demo bridge transfer (uncomment to test)
    console.log('\n🌉 Testing bridge transfer...')
    const result = await bridgeService.bridgeTransfer({
      fromChain: 'Mezo',
      toChain: 'BaseSepolia',
      amount: '0.01',
      recipientAddress: testAddress,
      walletClient: undefined as any // Will use env key via RPC
    })

    if (result.success) {
      console.log('✅ Bridge transfer successful!')
      console.log('Source TxIds:', result.sourceTxIds)
      console.log('Destination TxIds:', result.destinationTxIds)
    } else {
      console.log('❌ Bridge transfer failed:', result.error)
    }

    console.log('\n✨ Demo completed!')

  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

main().catch(console.error)