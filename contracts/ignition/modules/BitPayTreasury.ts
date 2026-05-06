import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MUSD_BASE_ADDRESS = "0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5";

export default buildModule("BitPayTreasuryModule", (m) => {
  // Deploy FakeUSDC first
  const fakeUsdc = m.contract("FakeUSDC");

  // Deploy BitPayTreasury with MUSD and FakeUSDC addresses
  const treasury = m.contract("BitPayTreasury", [MUSD_BASE_ADDRESS, fakeUsdc]);

  // Transfer 500k fake USDC to treasury for distribution
  m.call(fakeUsdc, "transfer", [treasury, m.bigint("500000000000000000000000")]);

  return { treasury, fakeUsdc };
});
