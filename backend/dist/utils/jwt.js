"use strict";
/**
 * 360° РАБОТА - JWT Utilities
 * 🔴 КРИТИЧНО: JWT секреты ОБЯЗАТЕЛЬНЫ!
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateTokens = generateTokens;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.decodeToken = decodeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 🔴 БЕЗОПАСНОСТЬ: Без установленных секретов приложение НЕ запустится!
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('🔴 КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET и JWT_REFRESH_SECRET должны быть установлены!');
    console.error('Добавьте их в .env файл:');
    console.error('  JWT_SECRET=<ваш_сгенерированный_секрет>');
    console.error('  JWT_REFRESH_SECRET=<ваш_сгенерированный_секрет>');
    console.error('\nДля генерации используйте:');
    console.error('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d';
/**
 * Generate access token
 */
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}
/**
 * Generate refresh token
 */
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
}
/**
 * Generate both access and refresh tokens
 */
function generateTokens(payload) {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}
/**
 * Verify access token
 */
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired access token');
    }
}
/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}
/**
 * Decode token without verification
 */
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map