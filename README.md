# BitPay Later

**Shop anywhere online without selling your Bitcoin. Pay in installments. Keep your stack.**

BitPay Later is a Bitcoin-native buy now, pay later (BNPL) service built on Mezo. It allows Bitcoin holders to shop online using MUSD (Bitcoin-backed stablecoin) without selling their Bitcoin, with the ability to pay in installments.

## Features

- 🌉 **Cross-chain Bridge**: Move MUSD between Mezo and Base Sepolia using official NTT bridge
- 🛒 **Purchase Interface**: Buy from merchants using MUSD with installment options
- 📊 **Installment Tracking**: Manage payment schedules and track due dates
- 💰 **Balance Management**: View MUSD balances across both chains
- 📱 **Mobile Responsive**: Works on desktop and mobile devices

## Architecture

### Core Components

1. **NTT Bridge Integration**: Uses official Mezo NTT (Native Token Transfer) SDK
2. **Purchase System**: MUSD spending with installment payment options
3. **Cross-chain Support**: Mezo ↔ Base Sepolia bridge for ecosystem access

### How It Works

1. **User locks BTC on Mezo** → receives MUSD
2. **Bridge MUSD to Base Sepolia** for lower fees and merchant access
3. **Make purchases** using MUSD with installment payment plans
4. **Automatic payments** from MUSD balance on scheduled dates

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Funded wallet on Mezo Testnet and Base Sepolia

### Installation

```bash
# Clone and install dependencies
cd bitpay-later
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your private keys (for testing only)
# ETH_PRIVATE_KEY=your_private_key_here
```

### Development

```bash
# Start development server
npm run dev

# Test bridge functionality
npm run bridge

# Build for production
npm run build
```

## Usage

### 1. Bridge MUSD

- Select source and destination chains (Mezo ↔ Base Sepolia)
- Enter amount to bridge
- Confirm transaction and wait for cross-chain completion (2-5 minutes)

### 2. Make Purchases

- Choose merchant (Bitrefill, Amazon demo, etc.)
- Enter purchase amount
- Select number of installments (2-6 payments)
- Confirm purchase with automatic installment setup

### 3. Manage Installments

- View upcoming and overdue payments
- Make early payments or wait for automatic deduction
- Track payment history across all purchases

## Technical Details

### NTT Bridge Contracts

**Mezo Testnet:**
- Token: `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
- Manager: `0x20888B20e2F5F405d44261dA96467a1b1acE15be`

**Base Sepolia:**
- Token: `0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5`
- Manager: `0x6590DFF6abEd7C077839E8227A4f12Ec90E6D85F`

### Key Dependencies

- `@wormhole-foundation/sdk`: Core Wormhole SDK
- `@wormhole-foundation/sdk-evm-ntt`: NTT protocol for EVM chains
- React + TypeScript for frontend
- Vite for build tooling

## Hackathon Alignment

### Mezo Integration (30%)
- ✅ Direct MUSD usage for purchases
- ✅ Official NTT bridge integration
- ✅ Cross-chain MUSD management

### Technical Implementation (20%)
- ✅ Clean, modular architecture
- ✅ Official Mezo SDK usage
- ✅ Error handling and user feedback

### Business Viability (30%)
- ✅ Clear BNPL use case
- ✅ Solves real problem (spending Bitcoin without selling)
- ✅ Merchant integration potential

### User Experience (10%)
- ✅ Simple, intuitive interface
- ✅ Mobile responsive design
- ✅ Clear transaction status

## Future Enhancements

- Smart contract automation for installments
- Merchant SDK for easy integration
- Credit scoring based on Bitcoin holdings
- Multi-chain expansion beyond Base
- Real-time notifications for payments

## License

MIT License - see LICENSE file for details

---

**Built for the Mezo Hackathon 2024**

*Empowering Bitcoin holders to spend without selling, keeping their stack intact while accessing the broader DeFi ecosystem.*