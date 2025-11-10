"use strict";
/**
 * 360° РАБОТА - Database Configuration
 * ПЕРЕКЛЮЧАЕМЫЕ ПРОВАЙДЕРЫ через DatabaseService
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.testConnection = testConnection;
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseService_1 = require("../services/database/DatabaseService");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return DatabaseService_1.db; } });
dotenv_1.default.config();
// Test connection
async function testConnection() {
    try {
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const isConnected = await dbService.testConnection();
        if (isConnected) {
            console.log(`✅ Database connected successfully (${dbService.getProvider()})`);
            return true;
        }
        console.error('❌ Database connection failed');
        return false;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Обратная совместимость со старым кодом
exports.default = DatabaseService_1.db;
//# sourceMappingURL=database.js.map