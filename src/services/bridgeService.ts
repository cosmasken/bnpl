import {
    TransactionId,
    Wormhole,
    amount,
    signSendWait,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import { nttManualRoute } from "@wormhole-foundation/sdk-route-ntt";
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
            const recipient = recipientAddress || senderAddress;

            // Create signers for both chains
            const srcSigner = await srcChain.getSigner(walletClient);
            const dstSigner = await dstChain.getSigner(walletClient);

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

            // Initiate the NTT transfer
            console.log("Initiating NTT transfer...");
            const transfer = srcNtt.transfer(senderAddress, amt, recipient, {
                queue: false,
                automatic: false,
                gasDropoff: 0n,
            });

            // Send transfer transaction on source chain
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

            // FIXED: Use destination chain signer for redeem transaction
            const dstTxids = await signSendWait(
                dstChain,
                dstNtt.redeem([vaa], recipient),
                dstSigner.signer
            );
            console.log("Redeem transaction confirmed:", dstTxids);

            return {
                success: true,
                sourceTxIds: [{ txid: transferTxHash }],
                destinationTxIds: dstTxids,
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
