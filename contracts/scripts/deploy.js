const hre = require("hardhat");

async function main() {
  // Bridged MUSD address on Base Sepolia
  const MUSD_ADDRESS = "0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5";
  
  console.log("Deploying FakeUSDC...");
  const FakeUSDC = await hre.ethers.getContractFactory("FakeUSDC");
  const fakeUsdc = await FakeUSDC.deploy();
  await fakeUsdc.waitForDeployment();
  console.log("FakeUSDC deployed to:", await fakeUsdc.getAddress());
  
  console.log("Deploying BitPayTreasury...");
  const BitPayTreasury = await hre.ethers.getContractFactory("BitPayTreasury");
  const treasury = await BitPayTreasury.deploy(MUSD_ADDRESS, await fakeUsdc.getAddress());
  await treasury.waitForDeployment();
  console.log("BitPayTreasury deployed to:", await treasury.getAddress());
  
  // Transfer fake USDC to treasury for distribution
  console.log("Transferring fake USDC to treasury...");
  const transferTx = await fakeUsdc.transfer(await treasury.getAddress(), hre.ethers.parseEther("500000"));
  await transferTx.wait();
  console.log("Transferred 500k fake USDC to treasury");
  
  console.log("\nDeployment Summary:");
  console.log("FakeUSDC:", await fakeUsdc.getAddress());
  console.log("BitPayTreasury:", await treasury.getAddress());
  console.log("MUSD (bridged):", MUSD_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
