# BitPay Treasury Contracts

Smart contracts for BitPay Later BNPL service on Base Sepolia.

## Deployed Contracts

- **FakeUSDC:** `0xa6347e1dcb5f4c80ff2022850106eb5c7bf07f57`
- **BitPayTreasury:** `0xbb53cb5d15ca9df45e7ed01a91871d4180399533`
- **MUSD (Bridged):** `0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5`

## Deployment

```bash
# Install dependencies
npm install

# Add private key to .env
cp .env.example .env
# Edit .env: PRIVATE_KEY=your_private_key_here

# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
npx tsx deploy-real.ts
```

## Contracts

- **BitPayTreasury.sol** - Lock MUSD → get fake USDC 1:1
- **FakeUSDC.sol** - Demo token for hackathon purchases
