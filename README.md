# Student Portal - Academic Information System

A complete, production-ready, portfolio-quality Student Portal built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma, and NextAuth.js (Auth.js). Designed for dual-role authorization (Student and Admin) with modern glassmorphic aesthetics, responsive mobile interfaces, and clean database integrations.

## Tech Stack
- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Lucide Icons & Framer Motion
- **Database ORM**: Prisma ORM
- **Database Engine**: PostgreSQL (SQLite configured for local development and build testing)
- **Authentication**: NextAuth.js / Auth.js (Credentials Provider with hashed passwords)
- **Data Charts**: Recharts

---

## Role Features

### 1. Student Features
- **Dashboard**: Card overviews for dynamic CGPA calculations, Semester GPAs, registrations count, and announcements feeds.
- **Profile**: Academic enrollment dossier display featuring passport photo integration.
- **Course Registration**: Dynamic checklist for registering courses with real-time tally of selected units (max credit limit check of 24 units), duplicate registrations check, slip prints, and edit selections.
- **Results & Transcript**: Select session and semester terms, calculate Semester GPA and overall Cumulative GPA, print registration cards, and download slips.
- **Mock Payments Ledger**: Invoice statements tracker for School Fees, Acceptance Fees, and Medical Clearances. Settling payments mock processes invoices and marks them as "Paid".
- **Announcements Bulletins**: Bulletins feed for registry broadcasts.

### 2. Admin Features
- **Dashboard & Analytics**: Analytics counters (Enrolled Students, Registration Counts, Unpaid Invoices, Average CGPA) and visual graphs displaying GPA spreads and enrollment levels.
- **Manage Students (CRUD)**: Enroll new students (hashes passwords, creates mock billing invoices), modify student dossiers, and delete accounts. Includes live searches and filter filters.
- **Manage Courses (CRUD)**: Create courses, update credit weights and requirements, allocate to academic levels/semesters, and delete course listings.
- **Upload Grades (CRUD)**: Record course grades for students. Standardized rules automatically calculate letter grades (A-F) and remarks (PASS/FAIL) from numerical scores.
- **Manage Announcements (CRUD)**: Publish announcements to the student dashboard or archive outdated bulletins.

---

## Local Setup & Installation

### 1. Clone Project
```bash
git clone https://github.com/Ebunx/student-portal.git
cd student-portal
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill the variables:
```bash
cp .env.example .env
```
Make sure `NEXTAUTH_SECRET` and `AUTH_SECRET` are set. For local runs:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="3b9a7c36a43878b27cf1859c6b73a70295837ff4d46ea389ce0d268d0e729a43"
AUTH_SECRET="3b9a7c36a43878b27cf1859c6b73a70295837ff4d46ea389ce0d268d0e729a43"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Create and Seed Local Database
Push the schema to your local SQLite database:
```bash
npx prisma db push
```
Populate the database with seeded mock data:
```bash
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser.

---

## Demo Credentials (Seeded Records)

### Student Accounts (20 Seeded)
- **Username / Matric**: `STA/2023/001` (up to `STA/2023/020`)
- **Password**: `StudentPass123!`

### Administrator Account (1 Seeded)
- **Username / Email**: `admin@portal.com`
- **Password**: `AdminPass123!`

---

## PostgreSQL (Supabase) Production Migration

To migrate from SQLite to PostgreSQL (Supabase or other host) for production:

1. **Update Connection String**: Paste your Supabase connection string in your `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_SUPABASE.supabase.co:5432/postgres?schema=public"
   ```
2. **Switch Schema Provider**: In [prisma/schema.prisma](file:///prisma/schema.prisma), update the datasource block:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. **Re-Generate Client & Run Migrations**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
4. Deploy the project to Vercel. Ensure all variables are configured in Vercel settings!
