import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  createKeyring, 
  encrypt, 
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
    const { data } = parsedBody;

    if (!data) {
      return createErrorResponse(400, 'Data field is required');
    }

    // 创建KMS密钥环
    const keyring = await createKeyring();
    
    // 使用提供的数据进行加密
    const { result } = await encrypt(keyring, Buffer.from(data), {
      encryptionContext: defaultEncryptionContext
    });
    
    // 转换为Base64编码
    const encryptedData = result.toString('base64');
    
    // 返回成功响应
    return createSuccessResponse({
      message: 'Data encrypted successfully',
      encryptedData,
      encryptionContext: defaultEncryptionContext,
    });
  } catch (err) {
    console.error('Error in encryption process:', err);
    return createErrorResponse(500, 'Error encrypting data', err);
  }
}; 