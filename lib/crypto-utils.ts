import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';

// Initialize encryption client
const { encrypt: awsEncrypt, decrypt: awsDecrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);

// Default encryption context
export const defaultEncryptionContext = {
  stage: 'local',
  purpose: 'test',
  origin: 'crypto-service'
};

// Create KMS keyring
export const createKeyring = async (): Promise<KmsKeyringNode> => {
  try {
    const keyId = process.env.KMS_KEY_ID;
    if (!keyId) {
      throw new Error('KMS_KEY_ID environment variable is required');
    }
    
    return new KmsKeyringNode({ generatorKeyId: keyId });
  } catch (error) {
    console.error('Error creating KMS keyring:', error);
    throw error;
  }
};

// Wrapped encrypt function
export const encrypt = async (keyring: KmsKeyringNode, data: Buffer, options?: { encryptionContext?: Record<string, string> }) => {
  console.log('Encrypting with context:', options?.encryptionContext);
  return awsEncrypt(keyring, data, options);
};

// Wrapped decrypt function
export const decrypt = async (keyring: KmsKeyringNode, data: Buffer, options?: { encryptionContext?: Record<string, string> }) => {
  console.log('Decrypting with context:', options?.encryptionContext);
  return awsDecrypt(keyring, data);
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