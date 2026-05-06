import { createWalletClient, http, parseEther, createPublicClient, getContract } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config()

const MUSD_BASE_ADDRESS = "0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5"

// Load compiled contract artifacts
const fakeUsdcArtifact = JSON.parse(readFileSync('./artifacts/contracts/FakeUSDC.sol/FakeUSDC.json', 'utf8'))
const treasuryArtifact = JSON.parse(readFileSync('./artifacts/contracts/BitPayTreasury.sol/BitPayTreasury.json', 'utf8'))

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env file')
  }

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http('https://base-sepolia.drpc.org')
  })

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://base-sepolia.drpc.org')
  })

  console.log('🚀 Deploying from account:', account.address)
  console.log('📡 Network: Base Sepolia')
  console.log('💰 MUSD Address:', MUSD_BASE_ADDRESS)

  // Step 1: Deploy FakeUSDC
  console.log('\n1️⃣ Deploying FakeUSDC...')
  const fakeUsdcHash = await walletClient.deployContract({
    abi: fakeUsdcArtifact.abi,
    bytecode: fakeUsdcArtifact.bytecode as `0x${string}`,
  })
  
  console.log('📝 FakeUSDC deployment tx:', fakeUsdcHash)
  
  // Wait for transaction receipt
  const fakeUsdcReceipt = await publicClient.waitForTransactionReceipt({ 
    hash: fakeUsdcHash 
  })
  
  const fakeUsdcAddress = fakeUsdcReceipt.contractAddress!
  console.log('✅ FakeUSDC deployed at:', fakeUsdcAddress)

  // Step 2: Deploy BitPayTreasury
  console.log('\n2️⃣ Deploying BitPayTreasury...')
  const treasuryHash = await walletClient.deployContract({
    abi: treasuryArtifact.abi,
    bytecode: treasuryArtifact.bytecode as `0x${string}`,
    args: [MUSD_BASE_ADDRESS, fakeUsdcAddress],
  })
  
  console.log('📝 BitPayTreasury deployment tx:', treasuryHash)
  
  // Wait for transaction receipt
  const treasuryReceipt = await publicClient.waitForTransactionReceipt({ 
    hash: treasuryHash 
  })
  
  const treasuryAddress = treasuryReceipt.contractAddress!
  console.log('✅ BitPayTreasury deployed at:', treasuryAddress)

  // Step 3: Transfer fake USDC to treasury
  console.log('\n3️⃣ Transferring fake USDC to treasury...')
  
  const fakeUsdcContract = getContract({
    address: fakeUsdcAddress,
    abi: fakeUsdcArtifact.abi,
    client: walletClient,
  })

  const transferHash = await fakeUsdcContract.write.transfer([
    treasuryAddress,
    parseEther('500000') // 500k fake USDC
  ])
  
  console.log('📝 Transfer tx:', transferHash)
  await publicClient.waitForTransactionReceipt({ hash: transferHash })
  console.log('✅ Transferred 500k fake USDC to treasury')

  // Step 4: Verify deployment
  console.log('\n4️⃣ Verifying deployment...')
  
  const treasuryBalance = await fakeUsdcContract.read.balanceOf([treasuryAddress])
  console.log('💰 Treasury fake USDC balance:', treasuryBalance.toString())

  console.log('\n🎉 Deployment Complete!')
  console.log('=' .repeat(50))
  console.log('📋 Contract Addresses:')
  console.log('FakeUSDC:', fakeUsdcAddress)
  console.log('BitPayTreasury:', treasuryAddress)
  console.log('MUSD (bridged):', MUSD_BASE_ADDRESS)
  console.log('=' .repeat(50))
  
  console.log('\n📝 Next Steps:')
  console.log('1. Update src/services/treasuryService.ts with these addresses:')
  console.log(`   BITPAY_TREASURY: '${treasuryAddress}'`)
  console.log(`   FAKE_USDC: '${fakeUsdcAddress}'`)
  console.log('2. Test the treasury integration in the frontend')
  
  return {
    fakeUsdcAddress,
    treasuryAddress,
    musdAddress: MUSD_BASE_ADDRESS
  }
}

main().catch(console.error)
