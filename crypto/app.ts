import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const { encrypt, decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);

const createKeyring = async () => {
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

const encryptionContext = {
  stage: 'local',
  purpose: 'test',
  origin: 'crypto-service'
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // 根据路径决定是加密还是解密
  const isEncryption = event.path.endsWith('/encrypt');

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No data provided',
        }),
      };
    }

    const parsedBody = JSON.parse(event.body);
    
    if (isEncryption) {
      // 加密操作 - 使用data参数
      const { data } = parsedBody;
      if (!data) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Data field is required',
          }),
        };
      }

      const keyring = await createKeyring();
      const { result } = await encrypt(keyring, Buffer.from(data), {
        encryptionContext
      });
      
      const encryptedData = result.toString('base64');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Data encrypted successfully',
          encryptedData,
          encryptionContext,
        }),
      };
    } else {
      // 解密操作 - 仅使用encryptedData参数
      const { encryptedData } = parsedBody;
      
      if (!encryptedData) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'encryptedData field is required',
          }),
        };
      }

      const keyring = await createKeyring();
      const { plaintext, messageHeader } = await decrypt(keyring, Buffer.from(encryptedData, 'base64'));
      
      // 验证加密上下文
      const { encryptionContext: decryptedContext } = messageHeader;
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Data decrypted successfully',
          decryptedData: plaintext.toString(),
          encryptionContext: decryptedContext,
        }),
      };
    }
  } catch (err) {
    console.error('Error in crypto process:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error ${isEncryption ? 'encrypting' : 'decrypting'} data`,
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
    };
  }
}; 