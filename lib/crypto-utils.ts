import { KmsKeyringNode, buildClient, CommitmentPolicy, DecryptInput } from '@aws-crypto/client-node';

// 构建加密客户端
export const { encrypt, decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);

// 导出 DecryptInput 类型
export type { DecryptInput };

// 默认加密上下文
export const defaultEncryptionContext = {
  stage: 'local',
  purpose: 'test',
  origin: 'crypto-service'
};

// 创建KMS密钥环
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

// 封装API响应
export interface ApiResponse {
  statusCode: number;
  body: string;
}

// 创建成功响应
export const createSuccessResponse = (data: Record<string, any>): ApiResponse => {
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};

// 创建错误响应
export const createErrorResponse = (statusCode: number, message: string, error?: any): ApiResponse => {
  return {
    statusCode,
    body: JSON.stringify({
      message,
      error: error instanceof Error ? error.message : error || 'Unknown error'
    })
  };
}; 