// Contract addresses and ABIs for Mezo Testnet integration
// Based on references/dapp/src/config/contracts.ts

// Mezo Testnet contract addresses (Chain ID: 31611)
export const MEZO_CONTRACTS = {
    BORROWER_OPERATIONS: '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',
    TROVE_MANAGER: '0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0',
    MUSD_TOKEN: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
    PRICE_FEED: '0x86bCF0841622a5dAC14A313a15f96A95421b9366'
} as const

// Minimal ABIs for BorrowerOperations contract
export const BORROWER_OPERATIONS_ABI = [
    {
        inputs: [
            { name: "_debtAmount", type: "uint256" },
            { name: "_upperHint", type: "address" },
            { name: "_lowerHint", type: "address" },
        ],
        name: "openTrove",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { name: "_upperHint", type: "address" },
            { name: "_lowerHint", type: "address" },
        ],
        name: "addColl",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { name: "_MUSDAmount", type: "uint256" },
            { name: "_upperHint", type: "address" },
            { name: "_lowerHint", type: "address" },
        ],
        name: "withdrawMUSD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_MUSDAmount", type: "uint256" },
            { name: "_upperHint", type: "address" },
            { name: "_lowerHint", type: "address" },
        ],
        name: "repayMUSD",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const

// Minimal ABIs for TroveManager contract
export const TROVE_MANAGER_ABI = [
    {
        inputs: [{ name: "_borrower", type: "address" }],
        name: "getTroveDebt",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_borrower", type: "address" }],
        name: "getTroveColl",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_borrower", type: "address" }],
        name: "getTroveStatus",
        outputs: [{ type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_borrower", type: "address" }],
        name: "getTroveInterestOwed",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "_borrower", type: "address" },
            { name: "_price", type: "uint256" },
        ],
        name: "getCurrentICR",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_borrower", type: "address" }],
        name: "Troves",
        outputs: [
            { name: "debt", type: "uint256" },
            { name: "coll", type: "uint256" },
            { name: "stake", type: "uint256" },
            { name: "status", type: "uint8" },
            { name: "arrayIndex", type: "uint128" },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const
