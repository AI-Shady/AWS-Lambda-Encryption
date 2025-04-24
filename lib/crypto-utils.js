"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.createKeyring = exports.defaultEncryptionContext = exports.decrypt = exports.encrypt = void 0;
const client_node_1 = require("@aws-crypto/client-node");
// 构建加密客户端
_a = (0, client_node_1.buildClient)(client_node_1.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT), exports.encrypt = _a.encrypt, exports.decrypt = _a.decrypt;
// 默认加密上下文
exports.defaultEncryptionContext = {
    stage: 'local',
    purpose: 'test',
    origin: 'crypto-service'
};
// 创建KMS密钥环
const createKeyring = async () => {
    try {
        const keyId = process.env.KMS_KEY_ID;
        if (!keyId) {
            throw new Error('KMS_KEY_ID environment variable is required');
        }
        return new client_node_1.KmsKeyringNode({ generatorKeyId: keyId });
    }
    catch (error) {
        console.error('Error creating KMS keyring:', error);
        throw error;
    }
};
exports.createKeyring = createKeyring;
// 创建成功响应
const createSuccessResponse = (data) => {
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};
exports.createSuccessResponse = createSuccessResponse;
// 创建错误响应
const createErrorResponse = (statusCode, message, error) => {
    return {
        statusCode,
        body: JSON.stringify({
            message,
            error: error instanceof Error ? error.message : error || 'Unknown error'
        })
    };
};
exports.createErrorResponse = createErrorResponse;
//# sourceMappingURL=crypto-utils.js.map