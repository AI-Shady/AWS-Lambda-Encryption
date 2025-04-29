import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

// Initialize KMS client
const kmsClient = new KMSClient({});

// Default encryption context
export const defaultEncryptionContext = {
  stage: 'local',
  purpose: 'test',
  origin: 'encryption-service'
};

// API response interface
export interface ApiResponse {
  statusCode: number;
  body: string;
}

// Create success response
export const createSuccessResponse = (data: Record<string, any>): ApiResponse => ({
  statusCode: 200,
  body: JSON.stringify(data)
});

// Create error response
export const createErrorResponse = (statusCode: number, message: string, error?: any): ApiResponse => ({
  statusCode,
  body: JSON.stringify({
    message,
    error: error instanceof Error ? error.message : error || 'Unknown error'
  })
});

export async function encryptData(
  plaintext: string,
  kmsKeyId: string,
  context?: Record<string, string>
): Promise<{ ciphertext: string; encryptionContext: Record<string, string> }> {
  const encryptionContext = context || defaultEncryptionContext;
  
  const command = new EncryptCommand({
    KeyId: kmsKeyId,
    Plaintext: Buffer.from(plaintext),
    EncryptionContext: encryptionContext,
  });

  const response = await kmsClient.send(command);
  
  if (!response.CiphertextBlob) {
    throw new Error("Encryption failed: No ciphertext returned");
  }

  return {
    ciphertext: Buffer.from(response.CiphertextBlob).toString("base64"),
    encryptionContext,
  };
}

export async function decryptData(
  ciphertext: string,
  kmsKeyId: string,
  context?: Record<string, string>
): Promise<string> {
  const encryptionContext = context || defaultEncryptionContext;
  
  const command = new DecryptCommand({
    KeyId: kmsKeyId,
    CiphertextBlob: Buffer.from(ciphertext, "base64"),
    EncryptionContext: encryptionContext,
  });

  const response = await kmsClient.send(command);
  
  if (!response.Plaintext) {
    throw new Error("Decryption failed: No plaintext returned");
  }

  return Buffer.from(response.Plaintext).toString();
} 