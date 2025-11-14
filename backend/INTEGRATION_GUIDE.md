# Backend Optimization Integration Guide

## 📋 Summary

This guide shows how to integrate the new backend optimizations:

1. ✅ **YandexVideoProvider.optimized.ts** - Non-blocking video upload with webhooks
2. ✅ **DTO Validation** - Type-safe request validation with class-validator
3. ✅ **Custom Exceptions** - Consistent error handling
4. ✅ **Webhook Endpoint** - Yandex Cloud callback handler
5. ✅ **Error Handler Middleware** - Global error catching

---

## 🎯 1. Installing Dependencies

First, install required packages:

```bash
cd backend
npm install class-validator class-transformer
```

---

## 🔧 2. Integrating DTO Validation in Auth Routes

### Current auth.routes.ts (Before):

```typescript
router.post('/send-code', AuthController.sendCode);
router.post('/verify-code', AuthController.verifyCode);
```

### Updated auth.routes.ts (After):

```typescript
import { validateDto } from '../middleware/validation';
import { SendCodeDto } from '../dto/auth/SendCodeDto';
import { VerifyCodeDto } from '../dto/auth/VerifyCodeDto';
import { RegisterJobSeekerDto } from '../dto/auth/RegisterJobSeekerDto';

// Add validation middleware
router.post('/send-code', validateDto(SendCodeDto), AuthController.sendCode);
router.post('/verify-code', validateDto(VerifyCodeDto), AuthController.verifyCode);
router.post('/register/jobseeker', validateDto(RegisterJobSeekerDto), AuthController.registerJobSeeker);
```

### Example: Updated AuthController.sendCode

```typescript
import { BadRequestException, TooManyRequestsException } from '../errors/HttpException';

static async sendCode(req: Request, res: Response) {
  // req.body is now validated SendCodeDto instance
  const { phone } = req.body;

  // Check rate limiting
  const recentAttempts = await db.oneOrNone(
    'SELECT COUNT(*) FROM sms_codes WHERE phone = $1 AND created_at > NOW() - INTERVAL \'1 minute\'',
    [phone]
  );

  if (recentAttempts && recentAttempts.count >= 3) {
    throw new TooManyRequestsException('Too many SMS requests. Please wait 1 minute.');
  }

  // Generate code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Send SMS
  const smsResult = await smscService.sendCode(phone, code);

  if (!smsResult.success) {
    throw new BadRequestException('Failed to send SMS', { reason: smsResult.error });
  }

  // Save code
  await db.none(
    'INSERT INTO sms_codes (phone, code, expires_at, created_at) VALUES ($1, $2, NOW() + INTERVAL \'5 minutes\', NOW())',
    [phone, code]
  );

  return res.json({
    success: true,
    message: 'Verification code sent',
    expiresIn: 300, // 5 minutes in seconds
  });
}
```

---

## 🎥 3. Integrating Video DTO Validation

### Updated video.routes.ts:

```typescript
import { validateDto } from '../middleware/validation';
import { UploadVideoDto } from '../dto/video/UploadVideoDto';

router.post(
  '/vacancies/:vacancyId/video',
  authMiddleware,
  requireEmployer,
  upload.single('video'),
  validateDto(UploadVideoDto), // Validate title & description
  VacancyVideoController.uploadVideo
);
```

---

## 🚨 4. Integrating Global Error Handler

### Update app.ts (or main server file):

```typescript
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// ... all your routes ...

// 404 handler (before error handler)
app.use(notFoundHandler);

// Global error handler (MUST be last)
app.use(errorHandler);
```

---

## 📹 5. Using Optimized YandexVideoProvider

### Option A: Replace existing YandexVideoProvider

1. Backup current provider:
   ```bash
   mv src/services/video/YandexVideoProvider.ts src/services/video/YandexVideoProvider.old.ts
   ```

2. Rename optimized version:
   ```bash
   mv src/services/video/YandexVideoProvider.optimized.ts src/services/video/YandexVideoProvider.ts
   ```

3. Update Yandex config to include webhook callback URL:

   ```typescript
   // config/video.config.ts
   export const videoConfig = {
     provider: 'yandex',
     yandex: {
       // ... existing config ...
       callbackUrl: process.env.YANDEX_CALLBACK_URL || 'https://yourdomain.com/api/v1/video/yandex-callback',
     },
   };
   ```

### Option B: Gradual migration with feature flag

```typescript
// config/video.config.ts
export const videoConfig = {
  useOptimizedYandex: process.env.USE_OPTIMIZED_YANDEX === 'true', // Feature flag
};

// services/video/VideoService.ts
import { YandexVideoProvider } from './YandexVideoProvider';
import { YandexVideoProviderOptimized } from './YandexVideoProvider.optimized';

switch (providerType) {
  case 'yandex':
    this.provider = videoConfig.useOptimizedYandex
      ? new YandexVideoProviderOptimized()
      : new YandexVideoProvider();
    break;
}
```

---

## 🔄 6. Client-Side Changes for Async Video Upload

When using the optimized provider, clients need to poll for video status:

### Frontend: Upload Video

```typescript
// 1. Upload video
const uploadResponse = await api.post('/vacancies/123/video', formData);

if (uploadResponse.video.status === 'processing') {
  // 2. Poll for status
  const checkStatus = async () => {
    const statusResponse = await api.get(`/video/${uploadResponse.video.id}/status`);

    if (statusResponse.status === 'ready') {
      // Video is ready!
      console.log('Video transcoding complete:', statusResponse.playerUrl);
    } else if (statusResponse.status === 'failed') {
      // Transcoding failed
      console.error('Video transcoding failed');
    } else {
      // Still processing, check again in 5 seconds
      setTimeout(checkStatus, 5000);
    }
  };

  checkStatus();
} else {
  // Legacy provider, video is ready immediately
  console.log('Video ready:', uploadResponse.video.playerUrl);
}
```

---

## 🧪 7. Testing

### Test DTO Validation:

```bash
# Invalid phone format
curl -X POST http://localhost:3000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "123"}'

# Expected: 400 Bad Request with validation errors
```

### Test Webhook:

```bash
# Simulate Yandex callback
curl -X POST http://localhost:3000/api/v1/video/yandex-callback \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-video-id",
    "status": "COMPLETED",
    "metadata": {"duration": 30},
    "outputs": {
      "hls": "https://storage.yandexcloud.net/videos/test/master.m3u8",
      "thumbnail": "https://storage.yandexcloud.net/videos/test/thumb.jpg"
    }
  }'

# Expected: 200 OK, video status updated to 'ready'
```

### Test Error Handling:

```typescript
// In any controller
throw new BadRequestException('Invalid data');
throw new UnauthorizedException('Invalid token');
throw new ForbiddenException('Access denied');
throw new NotFoundException('User not found');

// All will be caught by errorHandler and formatted consistently
```

---

## 📊 8. Database Schema Update

Ensure `videos` table has `status` column:

```sql
-- Add status column if not exists
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ready';

-- Update existing videos
UPDATE videos SET status = 'ready' WHERE status IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
```

---

## ✅ 9. Checklist

- [ ] Install `class-validator` and `class-transformer`
- [ ] Add DTO validation to auth routes
- [ ] Add DTO validation to video routes
- [ ] Integrate global error handler in app.ts
- [ ] Update video.config.ts with webhook callback URL
- [ ] Replace YandexVideoProvider with optimized version (or use feature flag)
- [ ] Update frontend to handle 'processing' status
- [ ] Add `status` column to videos table
- [ ] Test DTO validation
- [ ] Test webhook endpoint
- [ ] Test error handling

---

## 🚀 10. Benefits

### Before:
- ❌ 10+ minute blocking video uploads
- ❌ No request validation
- ❌ Inconsistent error responses
- ❌ SQL injection risks

### After:
- ✅ Non-blocking video uploads (<1s response)
- ✅ Type-safe request validation
- ✅ Consistent error responses
- ✅ Better security with DTO whitelisting
- ✅ Async webhook architecture
- ✅ Client can track upload progress

---

## 📝 Notes

1. **Webhook URL**: Must be publicly accessible for Yandex to call it
2. **Rate Limiting**: Consider adding rate limiting middleware for auth endpoints
3. **Monitoring**: Add logging/monitoring for webhook failures
4. **Retry Logic**: Yandex will retry failed webhooks, so ensure idempotency
5. **Security**: Add signature verification for Yandex webhooks (see VideoCallbackController.verifyYandexSignature)

---

## 🔗 Related Files

- `src/dto/auth/*.ts` - Auth DTOs
- `src/dto/video/*.ts` - Video DTOs
- `src/middleware/validation.ts` - Validation middleware
- `src/middleware/errorHandler.ts` - Error handler
- `src/errors/HttpException.ts` - Custom exceptions
- `src/controllers/VideoCallbackController.ts` - Webhook handler
- `src/services/video/YandexVideoProvider.optimized.ts` - Optimized provider
- `BACKEND_OPTIMIZATION_REPORT.md` - Detailed analysis
