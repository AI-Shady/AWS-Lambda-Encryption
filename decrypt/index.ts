import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { decryptData } from '../lib/crypto-utils';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Request body is required',
        }),
      };
    }

    const { ciphertext, context } = JSON.parse(event.body);

    if (!ciphertext) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Ciphertext is required',
        }),
      };
    }

    const kmsKeyId = process.env.KMS_KEY_ID;
    if (!kmsKeyId) {
      throw new Error('KMS_KEY_ID environment variable is not set');
    }

    const plaintext = await decryptData(ciphertext, kmsKeyId, context);

    return {
      statusCode: 200,
      body: JSON.stringify({
        plaintext,
        encryptionContext: context,
      }),
    };
  } catch (error) {
    console.error('Decryption error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Decryption failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}; 