/**
 * x402 Payment Middleware — OKX Native
 *
 * Implements the OKX x402 payment protocol for Aegis's paid endpoints.
 * Returns HTTP 402 with the standard accepts[] challenge format,
 * and verifies PAYMENT-SIGNATURE headers on replay via on-chain RPC.
 *
 * Compatible with onchainos CLI (payment pay / pay-local) on the payer side.
 */

import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentConfig {
    /** Fee for this endpoint in USDT (e.g. 1.5) */
    amount: number;
    /** Token contract address for USDT on the target chain */
    asset?: string;
}

interface PaymentChallenge {
    accepts: Array<{
        scheme: string;
        network: string;
        asset: string;
        amount: string;
        payTo: string;
        decimals?: number;
    }>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RECEIVING_WALLET = process.env.RECEIVING_WALLET_ADDRESS || '';
const ADMIN_BYPASS_KEY = process.env.ADMIN_BYPASS_KEY || '';

// X Layer USDT (correct contract address)
const USDT_XLAYER = process.env.USDT_CONTRACT_ADDRESS || '0x779ded0c9e1022225f8e0630b35a9b54be713736';

// X Layer RPC
const RPC_URL = process.env.RPC_URL || 'https://rpc.xlayer.tech';

// Amount precision: USDT has 6 decimals on X Layer
const USDT_DECIMALS = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a human-readable USDT amount to base units (wei-equivalent for USDT).
 * USDT typically uses 6 decimal places on most chains.
 */
function toBaseUnits(amount: number): string {
    const base = BigInt(Math.round(amount * 10 ** USDT_DECIMALS));
    return base.toString();
}

/**
 * Builds the standard OKX accepts[] payment challenge.
 */
function buildChallenge(amount: number): PaymentChallenge {
    return {
        accepts: [
            {
                scheme: 'payment',
                network: 'xlayer',
                asset: USDT_XLAYER,
                amount: toBaseUnits(amount),
                payTo: RECEIVING_WALLET,
                decimals: USDT_DECIMALS,
            },
        ],
    };
}

// ---------------------------------------------------------------------------
// On-chain verification
// ---------------------------------------------------------------------------

let provider: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(RPC_URL);
    }
    return provider;
}

/**
 * Verifies a transaction hash on-chain.
 * Checks that:
 * 1. The transaction exists and was successful
 * 2. The recipient matches our receiving wallet
 * 3. The value meets or exceeds the required fee
 *
 * Returns true if all checks pass.
 */
async function verifyTransaction(
    txHash: string,
    requiredAmount: number,
): Promise<{ valid: boolean; reason?: string }> {
    try {
        const prov = getProvider();
        const receipt = await prov.getTransactionReceipt(txHash);

        if (!receipt) {
            return { valid: false, reason: 'Transaction not found on chain' };
        }

        if (receipt.status !== 1) {
            return { valid: false, reason: 'Transaction failed on chain' };
        }

        // Get the full transaction to check recipient and value
        const tx = await prov.getTransaction(txHash);
        if (!tx) {
            return { valid: false, reason: 'Could not fetch transaction details' };
        }

        // Check recipient
        if (tx.to?.toLowerCase() !== RECEIVING_WALLET.toLowerCase()) {
            return {
                valid: false,
                reason: `Payment sent to wrong address (expected ${RECEIVING_WALLET.slice(0, 10)}... , got ${tx.to?.slice(0, 10)}...)`,
            };
        }

        // Check value (for native token payments) OR check tx data for USDT transfers
        // USDT transfers use the transfer() method — the value is in the calldata
        const requiredBase = BigInt(toBaseUnits(requiredAmount));

        if (tx.value && tx.value > 0n) {
            // Native token payment
            if (tx.value < requiredBase) {
                return {
                    valid: false,
                    reason: `Payment amount insufficient (got ${tx.value}, required ${requiredBase})`,
                };
            }
        } else if (tx.data && tx.data !== '0x') {
            // ERC-20 transfer: decode the transfer method selector + params
            // transfer(address,uint256) = 0xa9059cbb
            if (tx.data.startsWith('0xa9059cbb')) {
                const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                    ['address', 'uint256'],
                    '0x' + tx.data.slice(10),
                );
                const transferredAmount = decoded[1] as bigint;
                if (transferredAmount < requiredBase) {
                    return {
                        valid: false,
                        reason: `USDT transfer amount insufficient (got ${transferredAmount}, required ${requiredBase})`,
                    };
                }
            }
        }

        return { valid: true };
    } catch (error: any) {
        return { valid: false, reason: `RPC verification error: ${error.message}` };
    }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware factory for x402 payment-gated endpoints.
 *
 * Usage:
 *   app.post('/api/paid/audit', requirePayment({ amount: 1.5 }), handler);
 *
 * On missing/invalid payment:
 *   Returns HTTP 402 with OKX-native challenge format (body + header)
 *
 * On valid payment:
 *   Calls next() to proceed to the route handler
 */
export function requirePayment(config: PaymentConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // -----------------------------------------------------------------
            // 1. Admin Bypass
            // -----------------------------------------------------------------
            if (ADMIN_BYPASS_KEY && req.headers['x-admin-bypass'] === ADMIN_BYPASS_KEY) {
                console.log('[x402] Admin bypass — skipping payment');
                return next();
            }

            // -----------------------------------------------------------------
            // 2. Check for existing PAYMENT-SIGNATURE header (replay)
            // -----------------------------------------------------------------
            const paymentSignature = req.headers['payment-signature'] as string | undefined;

            if (paymentSignature) {
                console.log('[x402] Verifying payment signature...');

                // The PAYMENT-SIGNATURE format from onchainos CLI is:
                // <scheme>:<signature>:<txHash>
                // or just a raw txHash in simpler cases
                const parts = paymentSignature.split(':');
                const txHash = (parts.length >= 3 ? parts[2] : parts[0]) as string || '';

                if (!txHash.startsWith('0x') || txHash.length !== 66) {
                    return res.status(402).json({
                        status: 'error',
                        error: 'Invalid payment signature format',
                        code: 'PAYMENT_INVALID',
                    });
                }

                // Verify on-chain
                const result = await verifyTransaction(txHash, config.amount);

                if (result.valid) {
                    console.log('[x402] Payment verified ✅');
                    return next();
                }

                console.warn('[x402] Payment verification failed:', result.reason);

                // Fall through to re-issue challenge
            }

            // -----------------------------------------------------------------
            // 3. No valid payment — issue challenge
            // -----------------------------------------------------------------
            const challenge = buildChallenge(config.amount);
            const challengeJson = JSON.stringify(challenge);
            const base64Challenge = Buffer.from(challengeJson).toString('base64');

            // Set OKX protocol headers
            res.setHeader('PAYMENT-REQUIRED', base64Challenge);
            res.setHeader('WWW-Authenticate', `Payment realm="Aegis", intent="charge"`);

            // Return 402 with JSON body (Sherpas SDK compatibility fix)
            // Body is the raw challenge JSON — NOT wrapped in an envelope
            res.status(402).json(challenge);
            return;
        } catch (error: any) {
            console.error('[x402] Middleware error:', error);
            return res.status(500).json({
                status: 'error',
                error: 'Payment verification unavailable',
                code: 'PAYMENT_SYSTEM_ERROR',
            });
        }
    };
}
