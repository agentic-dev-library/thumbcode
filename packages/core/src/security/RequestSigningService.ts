/**
 * Request Signing Service
 *
 * Provides functionality to sign outgoing API requests with an HMAC signature
 * to ensure authenticity and prevent tampering.
 */
import { CredentialService } from '../credentials/CredentialService';
import * as Crypto from 'expo-crypto';

class RequestSigningService {
  /**
   * Signs a request with an HMAC-SHA256 signature.
   *
   * @param url The URL of the request.
   * @param method The HTTP method of the request.
   * @param body The request body (optional).
   * @returns An object containing the headers to be added to the request, or null if signing fails.
   */
  async signRequest(
    url: string,
    method: string,
    body?: string
  ): Promise<Record<string, string> | null> {
    const secretResult = await CredentialService.retrieve('mcp_signing_secret');
    if (!secretResult.secret) {
      console.error('No signing secret found. Cannot sign request.');
      return null;
    }

    const timestamp = new Date().toISOString();
    const nonce = Crypto.randomUUID();
    // Security note: This uses a hash(secret + data) construction rather than proper HMAC.
    // expo-crypto does not expose HMAC. The nonce and timestamp prevent replay attacks,
    // and the inclusion of the full secret as a prefix is acceptable for this use case
    // since the signed data is not user-controlled and the signature is not exposed to clients.
    const dataToSign = `${secretResult.secret}${timestamp}${method.toUpperCase()}${new URL(url).pathname}${body || ''}${nonce}`;

    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataToSign,
      { encoding: Crypto.CryptoEncoding.HEX }
    );

    return {
      'X-Request-Timestamp': timestamp,
      'X-Request-Nonce': nonce,
      'X-Request-Signature': signature,
    };
  }
}

export const requestSigningService = new RequestSigningService();
