import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ignition";
import "dotenv/config";

export default defineConfig({
  solidity: "0.8.19",
  networks: {
    baseSepolia: {
      type: "http",
      url: "https://base-sepolia.drpc.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
});
