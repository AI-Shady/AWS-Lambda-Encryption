import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  createKeyring, 
  decrypt, 
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
    const { encryptedData, encryptionContext = defaultEncryptionContext } = parsedBody;

    if (!encryptedData) {
      return createErrorResponse(400, 'Encrypted data is required');
    }

    // Create KMS keyring
    const keyring = await createKeyring();
    
    // Convert Base64 to Buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    
    // Decrypt data with provided context
    const { plaintext } = await decrypt(keyring, encryptedBuffer, {
      encryptionContext
    });
    
    // Return success response
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