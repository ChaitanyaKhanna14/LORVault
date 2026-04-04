# LORVault

A multi-tenant, blockchain-backed Letter of Recommendation verification platform.

## Quick Start with Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project (remember your database password!)
3. Once created, go to Project Settings > Database
4. Copy the "Connection string" (URI format)
5. Create server/.env file with this content (replace YOUR_PASSWORD and YOUR_PROJECT_REF):

DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
APP_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"
SUPER_ADMIN_EMAIL="admin@lorvault.app"
SUPER_ADMIN_PASSWORD="changeme123"

6. Run these commands:

cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..

7. Start the server:

npm run server

8. In a new terminal, start mobile:

npm run mobile

## Features

- **Teachers**: Upload LOR PDFs for students
- **Admins**: Review and approve/reject LORs
- **Students**: View, acknowledge, and share verified LORs
- **External Verifiers**: Verify LOR authenticity by uploading PDFs
- **Blockchain**: Mock blockchain (PostgreSQL) stores document hashes
- **QR Codes**: Approved PDFs include QR footer for instant verification

## Tech Stack

- **Mobile**: React Native + Expo (SDK 52) with Expo Router
- **Backend**: NestJS + TypeScript + Prisma
- **Database**: PostgreSQL
- **Shared**: TypeScript types package

## Project Structure

```
lorvault/
├── apps/
│   └── mobile/          # React Native Expo app
├── server/              # NestJS backend
├── shared/              # Shared TypeScript types
└── package.json         # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your PostgreSQL connection
   ```

3. **Run database migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed database:**
   ```bash
   npm run db:seed
   ```

### Running the App

1. **Start the backend:**
   ```bash
   npm run server
   ```

2. **Start the mobile app:**
   ```bash
   npm run mobile
   ```

3. **Open on device/emulator:**
   - Scan QR code with Expo Go app, or
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## Demo Accounts

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@lorvault.app | changeme123 |
| Admin | admin@demo.edu | demo123 |
| Teacher | teacher@demo.edu | demo123 |
| Student | student@demo.edu | demo123 |

**Institution Code:** `DEMO-2026`

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/external` - External verifier registration
- `POST /api/auth/refresh` - Refresh tokens

### LORs
- `POST /api/lors` - Upload LOR (Teacher)
- `GET /api/lors` - List LORs
- `PATCH /api/lors/:id/approve` - Approve LOR (Admin)
- `PATCH /api/lors/:id/reject` - Reject LOR (Admin)
- `POST /api/lors/:id/acknowledge` - Acknowledge (Student)

### Verification
- `POST /api/verify/upload` - Verify by PDF upload (Public)
- `GET /api/verify/:lorId` - Verify by LOR ID (Public)

### Institutions (Super Admin)
- `POST /api/institutions` - Create institution
- `GET /api/institutions` - List institutions
- `POST /api/institutions/:id/admins` - Create first admin

### Users (Admin)
- `POST /api/users/invite/teacher` - Invite teacher
- `POST /api/users/students` - Add student to roster
- `POST /api/users/students/import` - Bulk import students

## Git Setup

If you're setting up this project for the first time:

```bash
# Initialize git repository
git init

# Link to GitHub repo
git remote add origin https://github.com/ChaitanyaKhanna14/LORVault.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

## License

MIT
