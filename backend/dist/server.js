"use strict";
/**
 * 360° РАБОТА - Main Server Entry Point
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const vacancy_routes_1 = __importDefault(require("./routes/vacancy.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const video_routes_1 = __importDefault(require("./routes/video.routes"));
const moderation_routes_1 = __importDefault(require("./routes/moderation.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
// Initialize Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ===================================
// MIDDLEWARE
// ===================================
// Security
app.use((0, helmet_1.default)());
// CORS - Безопасная конфигурация
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
// В development разрешаем localhost
if (process.env.NODE_ENV === 'development' && allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:8081');
    console.warn('⚠️ CORS: Используются localhost для development');
}
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    console.error('🔴 КРИТИЧЕСКАЯ ОШИБКА: CORS_ORIGIN должен быть установлен в production!');
    console.error('Добавьте в .env:');
    console.error('  CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com');
    process.exit(1);
}
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// Body parsing - Разумные лимиты
// 1MB для обычных API запросов (не для загрузки файлов!)
// Загрузка файлов должна идти через multer с отдельными лимитами
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
// ===================================
// RATE LIMITING (защита от DDoS и брутфорса)
// ===================================
// Применяем общий лимит ко всем API
// Более специфические лимиты (SMS, auth, payments) настроены в отдельных routes
app.use('/api/', rateLimiter_1.apiLimiter);
// ===================================
// ROUTES
// ===================================
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API v1 routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/billing', billing_routes_1.default);
app.use('/api/v1/vacancies', vacancy_routes_1.default);
app.use('/api/v1/applications', application_routes_1.default);
app.use('/api/v1/chats', chat_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1', video_routes_1.default); // Video routes
app.use('/api/v1/moderation', moderation_routes_1.default); // Moderation routes
app.use('/api/v1/analytics', analytics_routes_1.default); // Analytics routes
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});
// ===================================
// START SERVER
// ===================================
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }
        // Start listening
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 360° РАБОТА - Backend Server');
            console.log('='.repeat(50));
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Database: Connected`);
            console.log('='.repeat(50) + '\n');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down gracefully...');
    process.exit(0);
});
// Start the server
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map