import { Chain } from "@wormhole-foundation/sdk-base";
import { Ntt } from "@wormhole-foundation/sdk-definitions-ntt";

export type NttContracts = {
    [key in Chain]?: Ntt.Contracts;
};

// Official Mezo MUSD NTT Contracts (from references)
export const MUSD_NTT_CONTRACTS: NttContracts = {
    Mezo: {
        token: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
        manager: "0x20888B20e2F5F405d44261dA96467a1b1acE15be",
        transceiver: { wormhole: "0x0E628A1C34c92F0aA85aF998814Ce4f03cAA5913" },
    },
    BaseSepolia: {
        token: "0x560985f804De8187E8FBA94F7127Bc4c0e54AEA5",
        manager: "0x6590DFF6abEd7C077839E8227A4f12Ec90E6D85F",
        transceiver: { wormhole: "0x2ada2d985Ce69b467d2D8372494Df021BEDfdbf2" },
    },
};

// Chain configurations
export const CHAIN_CONFIG = {
    Mezo: {
        name: "Mezo Testnet",
        rpcUrl: "https://rpc.test.mezo.org",
        chainId: 31611,
        nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
    },
    BaseSepolia: {
        name: "Base Sepolia",
        rpcUrl: "https://sepolia.base.org",
        chainId: 84532,
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    },
} as const;

// MUSD Token Info
export const MUSD_TOKEN = {
    symbol: "MUSD",
    name: "Mezo USD",
    decimals: 18,
} as const;