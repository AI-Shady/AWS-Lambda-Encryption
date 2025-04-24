# Crypto Service

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI. It includes the following files and folders.

- hello - Code for the application's Lambda function written in TypeScript.
- events - Invocation events that you can use to invoke the function.
- hello/tests - Unit tests for the application code. 
- template.yaml - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

* [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Setup

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example.json env.json
   ```

2. Update the KMS key ID in `env.json` with your AWS KMS key ARN:
   ```json
   {
     "CryptoFunction": {
       "KMS_KEY_ID": "arn:aws:kms:<your-region>:<your-account-id>:key/<your-key-id>"
     }
   }
   ```

   Note: Never commit the `env.json` file to version control as it contains sensitive information.

### Local Testing

To test the API locally:

```bash
sam local start-api --env-vars env.json
```

Example API calls:

1. Encrypt data:
   ```bash
   curl -X POST http://127.0.0.1:3000/crypto/encrypt \
     -H "Content-Type: application/json" \
     -d '{"data": "Hello, World!"}'
   ```

2. Decrypt data:
   ```bash
   curl -X POST http://127.0.0.1:3000/crypto/decrypt \
     -H "Content-Type: application/json" \
     -d '{"encryptedData": "<encrypted-data-from-previous-response>"}'
   ```

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 18](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
* **AWS Region**: The AWS region you want to deploy your app to.
* **Parameter KMSKeyId**: The KMS Key ID to use for encryption and decryption.
* **Parameter ApiKeyValue**: The API Key value for API Gateway.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

### Non-interactive Deployment for CI/CD

For CI/CD environments, you can use the following command to deploy without interactive prompts:

```bash
sam deploy \
  --stack-name crypto-service \
  --parameter-overrides \
    KMSKeyId=arn:aws:kms:<region>:<account>:key/<key-id> \
    ApiKeyValue=<your-api-key-value> \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --region <your-region>
```

Alternatively, you can use a parameters file for sensitive values:

1. Create a parameters.json file (don't commit this to version control):
```json
[
  {
    "ParameterKey": "KMSKeyId",
    "ParameterValue": "arn:aws:kms:<region>:<account>:key/<key-id>"
  },
  {
    "ParameterKey": "ApiKeyValue",
    "ParameterValue": "<your-api-key-value>"
  }
]
```

2. Deploy using the parameters file:
```bash
sam deploy \
  --stack-name crypto-service \
  --parameter-overrides file://parameters.json \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --region <your-region>
```

For secure CI/CD pipelines, consider storing the KMS Key ARN and API Key value in a secure parameters store like AWS Systems Manager Parameter Store or AWS Secrets Manager, and reference them in your CI/CD scripts.

### Post-Deployment KMS Configuration

After deployment, you need to configure the KMS key policy to allow the Lambda functions to use the key for encryption and decryption:

1. Get the Lambda function ARNs from CloudFormation outputs:

```bash
aws cloudformation describe-stacks --stack-name crypto-service --query "Stacks[0].Outputs[?OutputKey=='CryptoFunction' || OutputKey=='HelloWorldFunction'].{Key:OutputKey,Value:OutputValue}" --output table
```

2. Update the KMS key policy to allow access from these Lambda functions:

```bash
aws kms get-key-policy --key-id <your-kms-key-id> --policy-name default --output text > kms-policy.json
```

3. Edit the kms-policy.json file to add the following statements (replace the Lambda ARNs and developer IAM ARNs with your actual ARNs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Allow Lambda Functions to use the key",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "<CryptoFunction-ARN>",
          "<HelloWorldFunction-ARN>"
        ]
      },
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Allow Developers to use the key",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::<account-id>:user/<developer-username>",
          "arn:aws:iam::<account-id>:role/<developer-role-name>"
        ]
      },
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Update the key policy:

```bash
aws kms put-key-policy --key-id <your-kms-key-id> --policy-name default --policy file://kms-policy.json
```

Alternatively, you can use the AWS Management Console:
1. Go to AWS KMS in the AWS Management Console
2. Select your KMS key
3. Click on the "Key policy" tab
4. Add the Lambda function ARNs and developer IAM ARNs to the policy

This configuration ensures that both your Lambda functions in AWS and your local development environment (using your developer IAM credentials) can access the KMS key for encryption and decryption operations.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
crypto-service$ sam build
```

The SAM CLI installs dependencies defined in `hello/package.json`, compiles TypeScript with esbuild, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
crypto-service$ sam local invoke HelloWorldFunction --event events/event.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
crypto-service$ sam local start-api
crypto-service$ curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
crypto-service$ sam logs -n HelloWorldFunction --stack-name crypto-service --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `hello/tests` folder in this project. Use NPM to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
crypto-service$ cd hello
hello$ npm install
hello$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete --stack-name crypto-service
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
