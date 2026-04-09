# LORVault Deployment Guide

This guide covers deploying LORVault to production, including the NestJS backend and React Native mobile app.

## Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL database (Supabase recommended)
- Supabase Storage bucket for PDFs
- Resend account for transactional emails
- Docker (optional, for containerized deployment)

## Environment Configuration

### Backend (.env)

Copy `server/.env.example` to `server/.env` and configure:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# JWT - Generate a secure secret:
# node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
JWT_SECRET="your-secure-jwt-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="LORVault <noreply@yourdomain.com>"

# App URLs
APP_URL="https://api.lorvault.app"
FRONTEND_URL="https://lorvault.app"
NODE_ENV="production"

# CORS - Comma-separated allowed origins
ALLOWED_ORIGINS="https://lorvault.app,https://www.lorvault.app"

# Supabase Storage
SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
SUPABASE_BUCKET="lors"
```

### Mobile App

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=https://api.lorvault.app
```

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon/service keys from Settings → API
3. Get connection strings from Settings → Database → Connection String

### 2. Run Migrations

```bash
cd server
npm install
npx prisma migrate deploy
```

### 3. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `lors`
3. Set bucket to **private** (PDFs should be accessed via signed URLs)
4. Create a policy to allow authenticated service role access:

```sql
CREATE POLICY "Service role can manage lors" ON storage.objects
  FOR ALL USING (bucket_id = 'lors')
  WITH CHECK (bucket_id = 'lors');
```

### 4. Seed Initial Data (Optional)

```bash
cd server
npm run seed
```

Creates demo accounts:
- Super Admin: `admin@lorvault.app` / `changeme123`
- Demo Institution with code: `DEMO-2026`

## Backend Deployment

### Option A: Docker (Recommended)

```bash
cd server

# Build image
docker build -t lorvault-server .

# Run container
docker run -d \
  --name lorvault-server \
  -p 3000:3000 \
  --env-file .env \
  lorvault-server
```

### Option B: Direct Deployment (Railway, Render, Fly.io)

1. Connect your repository
2. Set root directory to `server`
3. Configure environment variables
4. Build command: `npm ci && npm run build && npx prisma migrate deploy`
5. Start command: `npm run start:prod`

### Option C: Vercel (Serverless)

Not recommended for this project due to WebSocket/long-running request limitations.

### Health Checks

Configure your platform's health checks to use:
- **Liveness**: `GET /api/health/live`
- **Readiness**: `GET /api/health/ready`

## Mobile App Deployment

### Build Configuration

Update `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "LORVault",
    "slug": "lorvault",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.lorvault.mobile",
      "buildNumber": "1"
    },
    "android": {
      "package": "app.lorvault.mobile",
      "versionCode": 1
    }
  }
}
```

### EAS Build Setup

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas build:configure
```

### iOS Build & Submit

```bash
# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

Requirements:
- Apple Developer Account ($99/year)
- App Store Connect setup
- Privacy policy URL
- Screenshots for all device sizes

### Android Build & Submit

```bash
# Production APK/AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

Requirements:
- Google Play Developer Account ($25 one-time)
- Play Console setup
- Privacy policy URL
- Screenshots and feature graphic

## Security Checklist

Before going live:

- [ ] JWT secret is unique and secure (min 48 bytes)
- [ ] Database password is strong
- [ ] ALLOWED_ORIGINS restricts to your domains only
- [ ] Supabase bucket is private
- [ ] No secrets in git history
- [ ] HTTPS only (no HTTP)
- [ ] Rate limiting configured (default: 100 req/min)

## Monitoring & Logging

### Recommended Setup

1. **Error Tracking**: Sentry
   - Add `@sentry/node` to backend
   - Add `sentry-expo` to mobile app

2. **Logging**: Backend uses Winston
   - JSON format in production
   - Integrate with CloudWatch, Datadog, or similar

3. **Uptime Monitoring**: 
   - BetterUptime, UptimeRobot, or similar
   - Monitor `/api/health/ready` endpoint

## Troubleshooting

### Database Connection Issues

```bash
# Test direct connection
psql "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# Check Prisma
npx prisma db pull
```

### Build Failures

```bash
# Clear caches
rm -rf node_modules
rm -rf dist
npm ci
npm run build
```

### Mobile App Issues

```bash
# Clear Expo cache
expo start --clear
npx expo-doctor
```

## Scaling Considerations

For high traffic:

1. **Database**: Upgrade Supabase plan or use dedicated Postgres
2. **Backend**: Use multiple instances behind load balancer
3. **Storage**: Supabase Storage handles CDN automatically
4. **Rate Limits**: Adjust ThrottlerModule settings in `app.module.ts`

## Support

For issues, check:
- GitHub Issues
- Supabase Status: status.supabase.com
- Expo Status: status.expo.dev
