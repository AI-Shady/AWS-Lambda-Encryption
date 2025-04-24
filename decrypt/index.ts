import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  createKeyring, 
  decrypt, 
  defaultEncryptionContext,
  createSuccessResponse,
  createErrorResponse
} from 'crypto-utils';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'No data provided');
    }

    const parsedBody = JSON.parse(event.body);
    const { encryptedData, encryptionContext = defaultEncryptionContext } = parsedBody;

    if (!encryptedData) {
      return createErrorResponse(400, 'Encrypted data is required');
    }

    // 创建KMS密钥环
    const keyring = await createKeyring();
    
    // 将Base64编码的加密数据转换为Buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    
    // 使用提供的加密上下文进行解密
    const { plaintext } = await decrypt(keyring, encryptedBuffer, {
      encryptionContext
    });
    
    // 返回成功响应
    return createSuccessResponse({
      message: 'Data decrypted successfully',
      decryptedData: plaintext.toString(),
      encryptionContext
    });
  } catch (err) {
    console.error('Error in decryption process:', err);
    return createErrorResponse(500, 'Error decrypting data', err);
  }
}; 