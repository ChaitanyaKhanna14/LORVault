# GitHub Secrets Configuration

This document lists all secrets required for CI/CD pipelines and deployment.

## Required Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

### Database & Infrastructure

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection string | `postgresql://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection (for migrations) | `postgresql://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:5432/postgres` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Authentication

| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `JWT_SECRET` | JWT signing secret (min 48 bytes) | `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |

### Email

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `RESEND_API_KEY` | Resend API key | [resend.com/api-keys](https://resend.com/api-keys) |

### Monitoring (Optional)

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `SENTRY_DSN` | Sentry DSN for error tracking | [sentry.io](https://sentry.io) → Project Settings → Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps | [sentry.io](https://sentry.io) → Settings → Auth Tokens |

### Deployment (Optional)

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel deployment token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub account |
| `DOCKER_PASSWORD` | Docker Hub password/token | Docker Hub → Account Settings → Security |

## Environment Variables (Non-Secret)

These can be set as repository variables (not secrets) since they're not sensitive:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NODE_ENV` | Environment name | `production` |
| `APP_URL` | Backend API URL | `https://api.lorvault.app` |
| `FRONTEND_URL` | Frontend/mobile URL | `https://lorvault.app` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://lorvault.app,https://www.lorvault.app` |

## Setting Up Secrets

### Via GitHub UI

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value
5. Click **Add secret**

### Via GitHub CLI

```bash
# Install gh CLI if not installed
# https://cli.github.com/

# Set a secret
gh secret set JWT_SECRET --body "your-secret-value"

# Set from file
gh secret set DATABASE_URL < database_url.txt

# Set multiple secrets from .env file
while IFS='=' read -r key value; do
  gh secret set "$key" --body "$value"
done < production.env
```

## Security Notes

1. **Never commit secrets** to the repository
2. **Rotate secrets regularly** - at least every 90 days for production
3. **Use different secrets** for staging and production environments
4. **Limit access** - only give repository admin access to those who need it
5. **Audit access** - review who has access to secrets periodically

## Verifying Secrets Are Set

In your GitHub Actions workflow, you can verify secrets are available:

```yaml
- name: Check secrets
  run: |
    if [ -z "${{ secrets.JWT_SECRET }}" ]; then
      echo "JWT_SECRET is not set!"
      exit 1
    fi
```
