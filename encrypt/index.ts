import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { encryptData } from '../lib/crypto-utils';

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

    const { data, context } = JSON.parse(event.body);

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Data is required',
        }),
      };
    }

    const kmsKeyId = process.env.KMS_KEY_ID;
    if (!kmsKeyId) {
      throw new Error('KMS_KEY_ID environment variable is not set');
    }

    const result = await encryptData(data, kmsKeyId, context);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ciphertext: result.ciphertext,
        encryptionContext: result.encryptionContext,
      }),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Encryption failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}; 