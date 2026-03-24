// src/crypto/crypto-sensory-integrity.ts
// ✅ Real, owned, verifiable integrity layer — not borrowed from third parties

import * as ed from 'noble-ed25519';

/**
 * Generate Ed25519 keypair for HONEST sensory layer
 * @returns {signingKey, verifyingKey}
 */
export const generateKeyPair = async () => {
  const secretKey = await ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(secretKey);
  return {
    signingKey: secretKey,
    verifyingKey: publicKey,
  };
};

/**
 * Sign a sensory signal with Ed25519
 * @param message - JSON string of sensory data
 * @param secretKey - Secret key from generateKeyPair()
 * @returns Base64-encoded signature
 */
export const signSensorySignal = async (message: string, secretKey: Uint8Array): Promise<string> => {
  const hash = await ed.utils.sha512(message);
  const signature = await ed.sign(hash, secretKey);
  return Buffer.from(signature).toString('base64');
};

/**
 * Verify a sensory signal signature
 * @param message - Original message (JSON string)
 * @param signature - Base64-encoded signature
 * @param publicKey - Base64-encoded public key
 * @returns true if valid
 */
export const verifySensorySignal = async (
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> => {
  try {
    const hash = await ed.utils.sha512(message);
    const sig = Buffer.from(signature, 'base64');
    const pubKey = Buffer.from(publicKey, 'base64');
    return await ed.verify(sig, hash, pubKey);
  } catch (e) {
    console.error('Verification failed:', e);
    return false;
  }
};

/**
 * Generate a trust anchor for public display
 * @param publicKey - Base64 string
 * @returns Human-readable identity tag
 */
export const generateTrustAnchor = (publicKey: string): string => {
  const hash = ed.utils.sha256(Buffer.from(publicKey, 'base64'));
  return `HONEST-${Buffer.from(hash).toString('hex').slice(0, 8).toUpperCase()}`;
};

/**
 * Example: Sign a sensory output
 */
export const createTrustedSensoryOutput = async (data: any, secretKey: Uint8Array) => {
  const message = JSON.stringify(data, null, 2);
  const signature = await signSensorySignal(message, secretKey);
  const verifiedKey = (await ed.getPublicKey(secretKey)).toString('base64');
  const anchor = generateTrustAnchor(verifiedKey);

  return {
    data,
    signature,
    publicKey: verifiedKey,
    trustAnchor: anchor,
    signedAt: new Date().toISOString(),
  };
};
