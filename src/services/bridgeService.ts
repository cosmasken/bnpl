// @ts-nocheck
import {
    TransactionId,
    Wormhole,
    amount,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import { WalletClient, parseUnits, erc20Abi } from 'viem'

// Register protocol implementations
import "@wormhole-foundation/sdk-evm-ntt";

import { MUSD_NTT_CONTRACTS } from "../bridge/consts.js";
import { parseAmount } from "../bridge/helpers.js";

export interface BridgeTransferParams {
    fromChain: "Mezo" | "BaseSepolia";
    toChain: "Mezo" | "BaseSepolia";
    amount: string;
    recipientAddress?: string;
    walletClient: WalletClient;
}

export interface BridgeTransferResult {
    success: boolean;
    sourceTxIds?: TransactionId[];
    destinationTxIds?: TransactionId[];
    error?: string;
    vaa?: any;
}

export class BridgeService {
    private wh: any;

    constructor() {
        this.wh = new Wormhole("Testnet", [evm.Platform]);
    }

    async bridgeTransfer(params: BridgeTransferParams): Promise<BridgeTransferResult> {
        try {
            const { fromChain, toChain, amount: amountStr, recipientAddress, walletClient } = params;

            const srcChain = this.wh.getChain(fromChain);
            const dstChain = this.wh.getChain(toChain);

            const senderAddress = walletClient.account.address;

            // For EVM chains, we can use the address directly
            // The NTT protocol expects the address in the correct format
            const recipient = recipientAddress || senderAddress;

            const srcNtt = await srcChain.getProtocol("Ntt", {
                ntt: MUSD_NTT_CONTRACTS[fromChain],
            });
            const dstNtt = await dstChain.getProtocol("Ntt", {
                ntt: MUSD_NTT_CONTRACTS[toChain],
            });

            const tokenDecimals = await srcNtt.getTokenDecimals();
            const amt = amount.units(parseAmount(amountStr, tokenDecimals));

            console.log(`Bridging ${amountStr} MUSD from ${fromChain} to ${toChain}`);

            // Approve MUSD token for NTT manager contract
            const tokenAddress = MUSD_NTT_CONTRACTS[fromChain].token;
            const managerAddress = MUSD_NTT_CONTRACTS[fromChain].manager;

            console.log("Approving MUSD for NTT manager...");
            const approvalTx = await walletClient.writeContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [managerAddress as `0x${string}`, parseUnits(amountStr, tokenDecimals)],
                chain: walletClient.chain,
                account: walletClient.account,
            });
            console.log("Approval transaction:", approvalTx);

            // Initiate the NTT transfer - pass recipient address directly for EVM chains
            console.log("Initiating NTT transfer...");
            const transfer = srcNtt.transfer(senderAddress, amt, recipient, {
                queue: false,
                automatic: false,
                gasDropoff: 0n,
            });

            // Get the transaction data and send it manually
            console.log("Sending transfer transaction...");
            const transferTxHash = await walletClient.sendTransaction({
                to: MUSD_NTT_CONTRACTS[fromChain].manager as `0x${string}`,
                data: transfer.data || '0x',
                value: 0n,
                chain: walletClient.chain,
                account: walletClient.account,
            });
            console.log("Transfer transaction sent:", transferTxHash);

            // Wait for source transaction receipt
            const srcPublicClient = await srcChain.getRpc();
            const srcReceipt = await srcPublicClient.waitForTransactionReceipt({ hash: transferTxHash });
            console.log("Transfer confirmed:", srcReceipt);

            // Get VAA from Wormhole
            console.log("Waiting for VAA...");
            const vaa = await this.wh.getVaa(
                transferTxHash,
                "Ntt:WormholeTransfer",
                25 * 60 * 1000
            );

            if (!vaa) {
                throw new Error("Failed to get VAA after 25 minutes");
            }

            console.log("VAA received, redeeming on destination...");

            // Redeem on destination chain - pass recipient address directly
            const redeemTxHash = await walletClient.sendTransaction({
                to: MUSD_NTT_CONTRACTS[toChain].manager as `0x${string}`,
                data: (await dstNtt.redeem([vaa], recipient)).data || '0x',
                value: 0n,
                chain: walletClient.chain,
                account: walletClient.account,
            });
            console.log("Redeem transaction sent:", redeemTxHash);

            // Wait for destination transaction receipt
            const dstPublicClient = await dstChain.getRpc();
            const dstReceipt = await dstPublicClient.waitForTransactionReceipt({ hash: redeemTxHash });
            console.log("Redeem confirmed:", dstReceipt);

            return {
                success: true,
                sourceTxIds: [{ txid: transferTxHash }],
                destinationTxIds: [{ txid: redeemTxHash }],
                vaa,
            };

        } catch (error) {
            console.error("Bridge transfer failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}

export const bridgeService = new BridgeService();
