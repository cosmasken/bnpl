// Browser-only helper functions for BitPay Later

/**
 * Format amount for display
 */
export function formatAmount(amount: bigint, decimals: number = 18): string {
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const remainder = amount % divisor;

    if (remainder === 0n) {
        return whole.toString();
    }

    const fractional = remainder.toString().padStart(decimals, '0');
    const trimmed = fractional.replace(/0+$/, '');

    return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

/**
 * Parse amount from string to BigInt
 */
export function parseAmount(amount: string, decimals: number = 18): bigint {
    const [whole, fractional = ''] = amount.split('.');
    const wholeBigInt = BigInt(whole || '0');
    const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
    const fractionalBigInt = BigInt(fractionalPadded || '0');

    return wholeBigInt * BigInt(10 ** decimals) + fractionalBigInt;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
    return truncateAddress(hash, 8, 6);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}