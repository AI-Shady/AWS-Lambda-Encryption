import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  createKeyring, 
  encrypt, 
  defaultEncryptionContext,
  createSuccessResponse,
  createErrorResponse
} from '../lib/crypto-utils';

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

    // Create KMS keyring
    const keyring = await createKeyring();
    
    // Encrypt data with default context
    const { result } = await encrypt(keyring, Buffer.from(data), {
      encryptionContext: defaultEncryptionContext
    });
    
    // Convert to Base64
    const encryptedData = result.toString('base64');
    
    // Return success response
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