# AWS Lambda Encryption Service

A serverless encryption service built with AWS Serverless Application Model (SAM) that provides data encryption and decryption capabilities using AWS KMS.

## Project Structure

```
AWS-Lambda-Encryption/
├── .aws-sam/              # SAM build cache directory
├── decrypt/               # Decryption Lambda function
│   ├── index.ts          # Function entry point
│   ├── package.json      # Function dependencies
│   └── tsconfig.json     # TypeScript configuration
├── encrypt/              # Encryption Lambda function
│   ├── index.ts          # Function entry point
│   ├── package.json      # Function dependencies
│   └── tsconfig.json     # TypeScript configuration
├── lib/                  # Shared code library
│   ├── crypto-utils.ts   # Encryption utility functions
│   ├── package.json      # Library dependencies
│   └── tsconfig.json     # TypeScript configuration
├── events/              # Test events
├── template.yaml        # SAM template
├── samconfig.toml       # SAM configuration
├── env.json            # Environment variables
└── README.md           # Project documentation
```

## Features

- AWS KMS integration for encryption/decryption
- Secure RESTful API endpoints
- Full TypeScript support
- Unit testing support
- API key authentication
- Service discovery
- IAM role-based access control
- Custom domain support via API Gateway

## Architecture

This project follows a microservices architecture approach, where each Lambda function operates as an independent service:

1. **Encryption Service (EncryptFunction)**
   - Path: `/encrypt`
   - Method: POST
   - Function: Encrypts data using KMS

2. **Decryption Service (DecryptFunction)**
   - Path: `/decrypt`
   - Method: POST
   - Function: Decrypts data using KMS

## Extension Points

### Custom Domain Configuration

You can configure a custom domain for your API using API Gateway's custom domain feature. This provides:
- Professional, branded URLs for your API endpoints
- Simplified API versioning through base path mappings
- SSL/TLS certificate management through AWS Certificate Manager
- Regional or Edge-optimized endpoint options

Example custom domain setup:
```bash
# Create custom domain (requires ACM certificate)
aws apigateway create-domain-name \
    --domain-name api.yourdomain.com \
    --regional-certificate-arn your-cert-arn \
    --endpoint-configuration types=REGIONAL

# Create base path mapping
aws apigateway create-base-path-mapping \
    --domain-name api.yourdomain.com \
    --rest-api-id your-api-id \
    --stage Prod
```

## Tech Stack

- AWS Lambda
- AWS KMS
- API Gateway
- TypeScript 5.x
- Node.js 18.x or higher
- AWS SAM
- esbuild

## Prerequisites

- Node.js 18.x or higher
- AWS SAM CLI
- AWS CLI
- TypeScript 4.x
- Docker (for local testing)

## Local Development

1. Install Dependencies

```bash
# Install dependencies for all functions and shared library
cd lib && npm install
cd ../encrypt && npm install
cd ../decrypt && npm install

# Install SAM CLI
brew install aws-sam-cli
```

2. Configure Environment Variables

Create or update `env.json` with your environment variables:

```json
{
  "EncryptFunction": {
    "KMS_KEY_ID": "your-kms-key-arn",
    "API_KEY_VALUE": "your-api-key"
  },
  "DecryptFunction": {
    "KMS_KEY_ID": "your-kms-key-arn",
    "API_KEY_VALUE": "your-api-key"
  }
}
```

3. Local Testing

```bash
# Build the project
sam build

# Start API locally with environment variables
sam local start-api --env-vars env.json

# Run tests
npm test
```

## Deployment Guide

1. Configure AWS Credentials

```bash
aws configure
```

2. Deploy Application

```bash
# First-time deployment
sam deploy --guided

# Subsequent deployments
sam deploy
```

3. Update Application

```bash
# Build
sam build

# Deploy updates
sam deploy
```

## API Usage

### Encrypt Data

```bash
curl -X POST https://your-api-url/encrypt \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"data": "your-data-to-encrypt"}'
```

### Decrypt Data

```bash
curl -X POST https://your-api-url/decrypt \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"encryptedData": "your-encrypted-data"}'
```

## Security

- API key authentication for all endpoints
- AWS KMS for encryption operations
- VPC support for internal network calls
- Service discovery support
- IAM role-based access control

## Monitoring and Logging

- CloudWatch Logs for function logging
- CloudWatch Metrics for performance monitoring
- X-Ray for request tracing
- Custom metrics support

## Maintenance Guide

1. Update Dependencies

```bash
# Update function dependencies
cd lib && npm update
cd ../encrypt && npm update
cd ../decrypt && npm update
```

2. Add New Function

- Create new function directory
- Update template.yaml
- Add test cases

3. Update Shared Code

- Modify lib/crypto-utils.ts
- Update related function dependencies

## Troubleshooting

1. Build Issues

```bash
# Clean build cache
rm -rf .aws-sam

# Rebuild
sam build
```

2. Deployment Issues

```bash
# View deployment logs
sam logs -n YourFunctionName --stack-name your-stack
```

3. API Issues

- Check API Gateway logs
- Verify API key
- Check IAM permissions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Contact

For issues and feature requests, please use the GitHub issue tracker.

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [AWS KMS Documentation](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Notes

- This project is fully TypeScript-based
- All JavaScript files have been removed in favor of TypeScript
- Each function has its own TypeScript configuration
- Shared library (lib) contains common utilities used across functions
