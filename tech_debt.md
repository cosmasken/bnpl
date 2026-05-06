# Tech Debt & Hackathon Roadmap#

## Existing Tech Debt (Aligned with Hackathon Goals)

### 1. Empty/Mock Files
| File | Issue | Hackathon Alignment |
|------|-------|---------------------|
| `src/services/simpleBridgeService.ts` | Empty file (0 lines) - should be removed | Cleanup for Technical Implementation score |
| `src/components/PurchaseInterface.tsx` | Purchase flow is mocked (setTimeout simulation, no real blockchain interaction) | Core to Business Viability (BNPL use case) |
| `src/components/InstallmentTracker.tsx` | Uses hardcoded mock data, payment actions are simulated only | Core to Business Viability (installment tracking) |

### 2. TypeScript @ts-nocheck Suppressions
- `src/services/bridgeService.ts:1`
- `src/config/wagmi.ts:1`
- `src/components/PurchaseInterface.tsx:1`

### 3. Bug in Bridge Service (CRITICAL)
`src/services/bridgeService.ts:118-124` - Attempts to send redeem transaction on **destination chain** using **source chain walletClient**.

**Fix Reference:** `references/ntt-bridge-mezo-testnet/cli/src/index.ts:71-76`
```typescript
// Reference shows proper pattern: use dstNtt.redeem() with dst signer
const dstTxids = await signSendWait(
  dst,
  dstNtt.redeem([vaa!], dstSigner.address.address),
  dstSigner.signer
);
```

**Recommended Fix:** Use Wormhole SDK route pattern from `references/ntt-bridge-mezo-testnet/cli/src/index.ts`

### 4. Debug Code in UI
`src/components/BridgeInterface.tsx:169-171` - Debug info visible in production UI.

### 5. Missing Files/Config
- No `.env.example` file (uses `VITE_WALLETCONNECT_PROJECT_ID` in `src/config/wagmi.ts:58`)
- No proper test files (only utility in `src/utils/bridgeTest.ts`)

---

## Contract Addresses

**⚠️ We USE Mezo's deployed contracts for Trove/BTC→MUSD. We ONLY deploy OUR treasury contract on Base. We bridge MUSD directly to Base via NTT (no cross-chain messaging).**

### Mezo Testnet (Chain ID: 31611) - Mezo's Contracts (Reference Patterns)
| Contract | Address | Source | Our Use |
|----------|---------|--------|---------|
| mUSD Token | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | `references/mezo-x402/README.md:150` | User borrows this via Trove |
| BorrowerOperations | `0xCdF7028ceAB81fA0C6971208e83fa7872994beE5` | `references/dapp/src/config/contracts.ts:6` | User deposits BTC, borrows MUSD |
| TroveManager | `0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0` | `references/dapp/src/config/contracts.ts:12` | Manage trove, collateral |
| PriceFeed (Pyth) | `0x86bCF0841622a5dAC14A313a15f96A95421b9366` | `references/dapp/src/config/contracts.ts:27` | BTC price for collateral |
| MUSD/USDC Pool | `0x52e604c44417233b6cEDDc0d640A405Caacefb` | `references/dapp/src/config/contracts.ts:70` | Yield source (Phase 6, post-demo) |

### Base Sepolia (Chain ID: 84532) - Our Deployed Contract + Bridged Tokens
| Contract | Address | Source | Our Use |
|----------|---------|--------|---------|
| mUSD Token (Bridged) | `0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5` | `src/bridge/consts.ts:16` | Bridged from Mezo via fixed NTT |
| Fake USDC (Hackathon) | *TBD* | Deploy fake ERC20 for demo | 1:1 credit to users from treasury |
| NTT Manager (MUSD) | `0x6590DFF6abEd7C077839E8227A4f12Ec90E6D85F` | `src/bridge/consts.ts:17` | Bridge MUSD from Mezo to Base |
| **Our BitPayTreasury.sol** | *To deploy* | Phase 4 | User locks bridged MUSD, gets fake USDC |

---

## Hackathon Feature Roadmap (Simplified Flow - Bridge MUSD Directly)

**Target Tracks:** Bank on Bitcoin (Bitcoin Track) + Supernormal dApps (MUSD Track)  
**Judging Criteria:** Mezo Integration (30%), Business Viability (30%), Technical Implementation (20%), UX (10%), Presentation (10%)

### Your Exact Flow (Updated: Base Vault, Direct MUSD Bridge):
1. **User deposits BTC** → Uses **Mezo's BorrowerOperations** (dapp pattern) → Gets **REAL MUSD** (Mezo mints it)
2. **User bridges MUSD** via **fixed NTT bridge** → MUSD arrives on **Base Sepolia** (no messaging needed)
3. **User locks bridged MUSD** in **OUR BitPayTreasury.sol on Base** → Gets **fake USDC 1:1** from treasury (hackathon-friendly)
4. **User spends fake USDC** on Base (Bitrefill, merchants) OR **repays MUSD** to unlock from treasury
5. **Optional:** Yield from Mezo pools repays position (Phase 6, after demo)

**Why This Wins:**
- ✅ Uses REAL MUSD (not synthetic) - borrowed from Mezo's Trove
- ✅ BTC stays as collateral (user keeps Bitcoin exposure)
- ✅ **Bridge MUSD directly** (no cross-chain messaging, simpler)
- ✅ **Vault on Base** (more secure, user already on Base)
- ✅ User gets spendable USDC on Base (fake USDC for hackathon demo)
- ✅ No swap needed (1:1 treasury lock → no slippage)
- ✅ **Fewer moving parts** (no Wormhole messaging, just NTT token bridge)

---

## Phase 1: Fix Existing NTT Bridge

**Reference:** `references/ntt-bridge-mezo-testnet/cli/src/index.ts`

**Action:** Rewrite `src/services/bridgeService.ts` using Wormhole SDK route pattern
```typescript
// From references/ntt-bridge-mezo-testnet/cli/src/index.ts
import { nttManualRoute, nttAutomaticRoute } from "@wormhole-foundation/sdk-route-ntt";

const resolver = wh.resolver([
  nttManualRoute({ tokens: MUSD_NTT_CONTRACTS }),
]);

const bestRoute = await resolver.findRoutes(transferRequest);
const receipt = await bestRoute.initiate(srcSigner, quote, dstAddress);
await routes.checkAndCompleteTransfer(bestRoute, receipt, dstSigner);
```

---

## Phase 2: Integrate Mezo Trove (User Deposits BTC → Gets REAL MUSD)

**⚠️ We DO NOT deploy custom Trove - We USE Mezo's deployed contracts!**

**References (Patterns to Follow):**
- `references/dapp/src/config/contracts.ts:89-209` (Mezo Trove ABIs)
- `references/dapp/src/config/contracts.ts:4-86` (Verified Mezo contract addresses)
- `references/Stratum-FI/stratum-contracts/contracts/DebtManager.sol` (Self-repaying logic - inspiration only)

**Create Service:** `src/services/troveService.ts`

**This service interacts with Mezo's BorrowerOperations/TroveManager (NOT our contract):**
```typescript
// Using Mezo's deployed contracts (dapp/src/config/contracts.ts)
// User calls: deposit BTC → borrow REAL MUSD at 1% fixed rate

import { BORROWER_OPERATIONS_ABI, TROVE_MANAGER_ABI } from "../config/contracts";

depositBTC(amount) {
  // Calls Mezo's BorrowerOperations.openTrove() or addColl()
  // Reference: Stratum-FI VaultController.sol:78-93 (pattern only)
  // BUT uses Mezo's contract at 0xCdF7028ceAB81fA0C6971208e83fa7872994beE5
}

borrowMUSD(amount) {
  // Calls Mezo's BorrowerOperations.withdrawMUSD()
  // User gets REAL MUSD minted by Mezo
}

getCollateralRatio() {
  // Calls TroveManager.getCurrentICR()
}

getInterestOwed() {
  // Calls TroveManager.getTroveInterestOwed()
}

repayMUSD(amount) {
  // Calls BorrowerOperations.repayMUSD()
  // User repays borrowed MUSD
}
```

**Key Point:** User now has **REAL MUSD** from Mezo - no custom minting!

---

## Phase 3: Fix NTT Bridge & Bridge MUSD to Base

**Reference:** `references/ntt-bridge-mezo-testnet/cli/src/index.ts`

**Action:** Rewrite `src/services/bridgeService.ts` using Wormhole SDK route pattern
- Fix bug at line 118-124 (wrong walletClient for destination chain)
- Enable MUSD transfers from Mezo → Base Sepolia
- Search: "Wormhole NTT manual route transfer token example"

```typescript
// From references/ntt-bridge-mezo-testnet/cli/src/index.ts
import { nttManualRoute, nttAutomaticRoute } from "@wormhole-foundation/sdk-route-ntt";

const resolver = wh.resolver([
  nttManualRoute({ tokens: MUSD_NTT_CONTRACTS }),
]);

const bestRoute = await resolver.findRoutes(transferRequest);
const receipt = await bestRoute.initiate(srcSigner, quote, dstAddress);
await routes.checkAndCompleteTransfer(bestRoute, receipt, dstSigner);
```

---

## Phase 4: Deploy OUR BitPayTreasury.sol on Base

**References (Patterns to Follow):**
- `references/Stratum-FI/stratum-contracts/contracts/VaultController.sol` (Vault pattern)
- `references/dapp/src/config/contracts.ts:70-72` (Mezo pool addresses for yield - Phase 6)
- `src/bridge/consts.ts:16-17` (Bridged MUSD address on Base)

**⚠️ We Deploy OUR Contract on Base (NOT Mezo) - User locks BRIDGED MUSD**

### OUR Custom Contract on Base: `contracts/BitPayTreasury.sol`

**Purpose:** User locks BRIDGED MUSD on Base → Gets fake USDC 1:1 (hackathon demo)

```solidity
// Inspired by Stratum-FI VaultController.sol:78-93
contract BitPayTreasury {
    IERC20 public immutable musd;  // BRIDGED MUSD on Base: 0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5
    IERC20 public immutable fakeUsdc;  // Fake USDC for hackathon demo
    uint256 public totalLocked;
    mapping(address => uint256) public userLocked;
    
    event Locked(address indexed user, uint256 musdAmount, uint256 usdcCredit);
    event Repaid(address indexed user, uint256 amount);
    
    constructor(address _musd, address _fakeUsdc) {
        musd = IERC20(_musd);
        fakeUsdc = IERC20(_fakeUsdc);
    }
    
    // User locks BRIDGED MUSD on Base → Gets fake USDC 1:1
    function lockMUSD(uint256 amount) external {
        musd.transferFrom(msg.sender, address(this), amount);
        userLocked[msg.sender] += amount;
        totalLocked += amount;
        // Give fake USDC 1:1 from treasury (hackathon demo)
        fakeUsdc.transfer(msg.sender, amount);
        emit Locked(msg.sender, amount, amount); // 1:1 credit
    }
    
    // User repays MUSD → unlock from treasury
    function repayMUSD(uint256 amount) external {
        require(userLocked[msg.sender] >= amount, "Insufficient locked");
        musd.transferFrom(msg.sender, address(this), amount); // User returns MUSD
        userLocked[msg.sender] -= amount;
        totalLocked -= amount;
        emit Repaid(msg.sender, amount);
    }
}
```

**Why Base Vault:**
- ✅ User already on Base after bridging MUSD
- ✅ No cross-chain messaging needed (simpler)
- ✅ More secure (user funds on Base, not Mezo)
- ✅ Fake USDC for hackathon (no faucet limits)

## Phase 5: Replace Mock Installment Tracker (Base Treasury Events)

**References:**
- `references/dapp/src/hooks/useSwapMutations.ts` (React Query patterns)
- `contracts/BitPayTreasury.sol` (Our Base contract events)

**Action:** Replace mock data in `src/components/InstallmentTracker.tsx`
- Fetch real installment data from `BitPayTreasury.sol` events on Base
- Implement `handlePayInstallment` with actual MUSD transfer on Base
- Use React Query patterns from `dapp/src/hooks/useSwapMutations.ts`

---

## Phase 6: Integrate Bitrefill for Shopping (LAST - After Full Flow Works)

**References:**
- `references/mezo-x402/gui/src/usePayForJoke.ts` (x402 payment pattern)
- `references/mezo-x402/README.md` (Permit2 for gasless approvals)

**Implementation:**
```typescript
// From mezo-x402/gui/src/usePayForJoke.ts:40-46
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

// User spends FAKE USDC on Base via Bitrefill API
const response = await fetchWithPayment(`${BITREFILL_API}/purchase`, {
  method: "POST",
  body: JSON.stringify({ productId, amount: fakeUsdcAmount })
});
```

**Note:** Bitrefill API documentation reference still needed. Do this LAST after cross-chain flow is complete.

---

## Phase 7: Mezo Pool Integration for Yield (POST-DEMO)

**References:**
- `references/dapp/src/config/contracts.ts:70-72` (Mezo pool addresses)
- `references/Stratum-FI/stratum-contracts/contracts/DebtManager.sol` (Yield logic inspiration)

**Action:** Optional yield from Mezo pools → auto-repay MUSD position
- Stake MUSD in Mezo pools (MUSD/USDC, MUSD/BTC)
- Yield → repay user's MUSD debt on Mezo
- **Do this after hackathon demo** (not critical for flow)

---

## Judging Criteria Alignment

**⚠️ We USE Mezo's Trove (NOT custom). We deploy OUR treasury on Base. Bridge MUSD directly via NTT.**

| Feature | Mezo Integration (30%) | Business Viability (30%) | Technical (20%) | UX (10%) | Presentation (10%) |
|---------|-------------------------|---------------------------|---------------------|----------|-------------------|
| Fixed NTT Bridge | ✅ MUSD Mezo→Base | | ✅ Wormhole SDK route pattern | | ✅ Demo clarity |
| Mezo Trove (dapp ref) | ✅ BTC→REAL MUSD borrowing | ✅ Core hackathon theme | ✅ Mezo ABIs | ✅ Collateral UI | ✅ Clear value prop |
| Bridge MUSD to Base | ✅ Direct NTT transfer | ✅ No messaging needed | ✅ Fixed `bridgeService.ts` | ✅ Seamless UX | ✅ Simplified flow |
| Base Treasury Lock | ✅ Vault on Base | ✅ 1:1 fake USDC credit | ✅ Our `BitPayTreasury.sol` | ✅ Instant credit | ✅ Unique feature |
| Bitrefill Spend (x402) | ✅ USDC on Base | ✅ Real merchant use | ✅ Payment protocol | ✅ Familiar shopping | ✅ Demo ready (LAST) |
| Real Installments | ✅ Base contract events | ✅ Market potential | ✅ Our contract events | ✅ Payment visibility | ✅ User journey |

---

## Quick Reference - All Reusable Files

**⚠️ We USE Mezo's Trove (dapp pattern). We DEPLOY treasury on Base. Bridge MUSD directly via NTT.**

| Need | Reference File | What to Reuse |
|------|----------------|---------------|
| NTT Bridge Fix | `references/ntt-bridge-mezo-testnet/cli/src/index.ts` | Route-based transfer pattern |
| NTT Config | `src/bridge/consts.ts:16-17` | MUSD NTT contracts Mezo/Base |
| Trove ABIs | `references/dapp/src/config/contracts.ts:89-209` | BorrowerOperations, TroveManager |
| Trove Addresses | `references/dapp/src/config/contracts.ts:4-86` | Verified Mezo contract addresses |
| Vault Pattern | `references/Stratum-FI/stratum-contracts/contracts/VaultController.sol` | Deposit/withdraw for Base `BitPayTreasury.sol` |
| x402 Payments | `references/mezo-x402/gui/src/usePayForJoke.ts` | Payment hook pattern (Phase 6) |
| Permit2 | `references/mezo-x402/gui/src/usePermit2Approval.ts` | Gasless approvals |
| React Query | `references/dapp/src/hooks/useSwapMutations.ts` | Mutation patterns |
| Mezo Config | `references/dapp/src/config/contracts.ts:598-647` | Chain definition |
| Base Deployment | Hardhat/Foundry | Deploy `BitPayTreasury.sol` to Base Sepolia |

---

## Missing References Needed for Implementation

1. **Wormhole NTT bridge fix** - Fix `src/services/bridgeService.ts` bug at line 118-124
   - Search: "Wormhole NTT manual route transfer token example"
   - Reference: `references/ntt-bridge-mezo-testnet/cli/src/index.ts`

2. **Deploy fake USDC on Base Sepolia** - For hackathon demo (1:1 credit)
   - Simple ERC20 contract deployment, no official faucet needed
   - User gets fake USDC from treasury, not real USDC

3. **Bitrefill API docs** - Programmatic gift card purchase (LAST phase)
   - Search: "Bitrefill API documentation developer portal"
   - Do this AFTER cross-chain flow works

4. **Mezo Pool integration** - How to stake MUSD for yield (POST-DEMO)
   - Reference: `references/dapp/src/config/contracts.ts:70-72` (pool addresses)
   - Optional: Yield auto-repays MUSD position

---

## Summary: Why This Approach Wins

**✅ Using REAL MUSD from Mezo (dapp pattern) - NOT synthetic bMUSD**
**✅ We USE Mezo's Trove - NOT custom Trove contract**
**✅ Bridge MUSD directly to Base - NO cross-chain messaging**

| Criteria | StratumFi (Reference) | Your Updated Flow (Implementation) |
|-----------|---------------------|--------------------------------|
| **BTC Yield** | ✅ LP trading fees | ✅ BTC stays as collateral (real Mezo BTC) |
| **MUSD Source** | bMUSD (synthetic token) | ✅ **REAL MUSD** borrowed from Mezo Trove |
| **Bridge to Base** | N/A | ✅ **Direct NTT bridge** (no messaging) |
| **Vault Location** | N/A | ✅ **Base Sepolia** (more secure, simpler) |
| **Spendable Asset** | bMUSD (synthetic) | ✅ **Fake USDC on Base** (hackathon-friendly) |
| **No Messaging** | N/A | ✅ Bridge tokens directly, no Wormhole messages |
| **No Swap Needed** | N/A | ✅ 1:1 treasury lock → no slippage |
| **Unique Value** | First on Bitcoin | ✅ "Keep your stack" + Base vault + REAL MUSD |

**Your updated flow simplifies everything:**
- **Fewer moving parts** (no Wormhole messaging, just NTT token bridge)
- **Vault on Base** (user already there after bridging)
- **Fake USDC** (no faucet limits, great for demo)
- **Real MUSD** (borrowed from Mezo's Trove, not synthetic)
- **Keeps Bitcoin exposed** (BTC collateral stays, earns yield)

---

## Implementation Priority (For Hackathon)

1. ✅ Fix NTT bridge (`src/services/bridgeService.ts`) - **PRIORITY 1**
2. ✅ Mezo Trove integration (`src/services/troveService.ts`) - **PRIORITY 2**
3. ✅ Bridge MUSD Mezo→Base - **PRIORITY 3** (search: "Wormhole NTT manual route transfer token example")
4. ✅ Deploy `BitPayTreasury.sol` on Base - **PRIORITY 4**
5. ✅ Replace mock UI with real transactions - **PRIORITY 5**
6. ⏳ Bitrefill integration - **LAST** (after full flow works)
7. ⏳ Mezo pool yield - **POST-DEMO** (optional nice-to-have)
