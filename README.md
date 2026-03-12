# PayrollHub - Full-Stack Web Application for Payroll & HR Management

> A comprehensive, production-ready web application designed to manage payroll and human resources operations for enterprises in Tunisia, with full compliance to Tunisian labor law, social security regulations, and tax codes.

[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/-MongoDB-13AA52?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development Workflow](#development-workflow)
- [Project Architecture](#project-architecture)
- [API Documentation](#api-documentation)
- [Regulatory Compliance](#regulatory-compliance)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 📌 Overview

**PayrollHub** is a comprehensive, full-stack web application built to streamline payroll and human resources management for organizations operating in Tunisia. The application ensures complete compliance with Tunisian labor law, social security regulations (CNSS), and tax codes (IRPP).

### Key Objectives

- **Automated Payroll Calculation**: Compute employee salaries with accurate deductions for social security, taxes, and other contributions
- **HR Management**: Manage employee profiles, contracts, leave requests, and organizational structure
- **Regulatory Compliance**: Implement all Tunisian regulations including CNSS contributions, IRPP taxation, and mandatory deductions
- **Document Generation**: Automatically generate payslips, work attestations, and compliance documents in PDF format
- **Self-Service Portal**: Provide employees with a portal to access their payslips, request leave, and manage personal information
- **Analytics & Reporting**: Generate comprehensive reports for HR, finance, and management teams
- **Scalability**: Built on modern technologies to handle growing organizational needs

---

## ✨ Key Features

### 1. **Employee Management Module**
- Create, read, update, and archive employee profiles
- Store personal information (name, CIN, date of birth, contact details)
- Track employment details (contract type, position, department, CNSS number)
- Manage family information for tax deductions
- Support multiple contract types: CDI, CDD, SIVP, Karama

### 2. **Payroll Engine**
- **Accurate Calculations**: Based on 2025-2026 regulations
- **Automatic Deductions**: CNSS (9.68% employee, 17.07% employer), IRPP with progressive tax brackets
- **Overtime Computation**: Support for 25%, 50%, and 75% overtime rates
- **Special Allowances**: Handle primes, indemnities, and bonuses
- **Payroll Period Management**: Create and finalize payroll cycles
- **Payslip Generation**: Automated PDF generation with detailed breakdowns

### 3. **Leave & Absence Management**
- Request and track paid leave, sick leave, maternity, and paternity leave
- Automatic leave balance calculation
- Approval workflow for leave requests
- Integration with payroll calculations

### 4. **Document Management**
- Auto-generation of payslips (PDF)
- Work attestations
- CNSS declarations
- Medical certificates tracking
- Secure document storage and retrieval

### 5. **HR Dashboard & Analytics**
- Real-time workforce metrics
- Payroll summary statistics
- Leave tracking and analytics
- Financial overview and cost analysis
- Export reports to various formats

### 6. **User & Access Management**
- Role-based access control (RBAC)
- Support for multiple user roles: Super Admin, HR Admin, Payroll Admin, Accountant, Manager, Employee
- JWT-based authentication
- Account management and password reset
- API key management for external integrations

### 7. **Self-Service Portal**
- Employees can view their payslips
- Request and track leave applications
- Update personal information
- View company announcements and notifications

### 8. **External API Integration**
- RESTful API endpoints for third-party integrations
- Support for bulk operations
- Authentication via API keys
- Comprehensive error handling

### 9. **Configuration Management**
- Store and update regulatory parameters (SMIG, CNSS rates, IRPP brackets)
- Versioning of regulatory changes
- Easy parameter updates for compliance changes

---

## 🛠 Technology Stack

### **Frontend**
| Technology | Purpose | Version |
|---|---|---|
| **React** | UI Framework | 19.2.1 |
| **TypeScript** | Type Safety | Latest |
| **Vite** | Build Tool & Dev Server | Latest |
| **Tailwind CSS** | Styling | Latest |
| **Radix UI** | Accessible Component Library | Latest |
| **React Hook Form** | Form Management | 7.64.0 |
| **Zod** | Schema Validation | 4.1.12 |
| **Recharts** | Data Visualization | 2.15.2 |
| **Wouter** | Client-side Routing | 3.3.5 |
| **Framer Motion** | Animations | 12.23.22 |

### **Backend**
| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | Runtime Environment | LTS |
| **Express.js** | Web Framework | 4.21.2 |
| **TypeScript** | Type Safety | Latest |
| **Mongoose** | MongoDB ODM | 9.2.3 |
| **JWTs** | Authentication | 9.0.3 |
| **Bcryptjs** | Password Hashing | 3.0.3 |
| **Multer** | File Upload | 2.1.0 |
| **PDFKit** | PDF Generation | 0.17.2 |
| **Zod** | Validation | 4.1.12 |

### **Database**
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL Database |
| **Mongoose** | ODM for MongoDB |

### **DevOps & Deployment**
| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Vercel** | Deployment Platform (API & Frontend) |
| **Git** | Version Control |
| **pnpm** | Package Manager |

---

## 📦 Project Structure

```
PayrollHub/
├── tunisian_payroll_landing/          # Main application directory
│   ├── client/                        # Frontend (React)
│   │   ├── src/
│   │   │   ├── components/            # Reusable UI components
│   │   │   │   ├── ui/               # Radix UI components
│   │   │   │   ├── app/              # Application-specific components
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── ManusDialog.tsx
│   │   │   ├── pages/                 # Page components
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   ├── NotFound.tsx
│   │   │   │   └── app/               # Protected pages
│   │   │   │       ├── Dashboard.tsx
│   │   │   │       ├── Employees.tsx
│   │   │   │       ├── PayrollPeriods.tsx
│   │   │   │       ├── Leaves.tsx
│   │   │   │       ├── Documents.tsx
│   │   │   │       ├── Reports.tsx
│   │   │   │       ├── Users.tsx
│   │   │   │       ├── Settings.tsx
│   │   │   │       └── Analytics.tsx
│   │   │   ├── contexts/              # React Context
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   │   ├── useComposition.ts
│   │   │   │   ├── useMobile.tsx
│   │   │   │   └── usePersistFn.ts
│   │   │   ├── lib/                   # Utilities
│   │   │   │   ├── api.ts            # API client
│   │   │   │   └── utils.ts
│   │   │   ├── App.tsx                # Root component
│   │   │   ├── main.tsx               # React entry point
│   │   │   └── index.css              # Global styles
│   │   ├── index.html                 # HTML template
│   │   └── public/                    # Static assets
│   │
│   ├── server/                        # Backend (Express)
│   │   ├── index.ts                   # Server entry point
│   │   ├── auth.ts                    # Authentication logic
│   │   ├── db.ts                      # Database connection
│   │   ├── models.ts                  # Mongoose models
│   │   ├── storage.ts                 # In-memory storage/seed
│   │   ├── payroll-engine.ts          # Payroll calculation logic
│   │   ├── payslip-pdf.ts             # PDF generation
│   │   ├── document-pdf.ts            # Document generation
│   │   ├── notification-service.ts    # Notification system
│   │   ├── multer-config.ts           # File upload config
│   │   ├── declaration-gen.ts         # Declaration generation
│   │   ├── vercel-entry.ts            # Vercel serverless entry
│   │   └── routes/                    # API route handlers
│   │       ├── employees.ts
│   │       ├── users.ts
│   │       ├── entreprises.ts
│   │       ├── parametres.ts
│   │       ├── dashboard.ts
│   │       ├── payroll.ts
│   │       ├── conges.ts
│   │       ├── documents.ts
│   │       ├── declarations.ts
│   │       ├── reports.ts
│   │       ├── notifications.ts
│   │       ├── api-keys.ts
│   │       ├── external-api.ts
│   │       ├── super-external.ts
│   │       ├── document-requests.ts
│   │       └── loans.ts
│   │
│   ├── shared/                        # Shared code (Frontend + Backend)
│   │   ├── const.ts                   # Constants
│   │   ├── schema.ts                  # Zod schemas
│   │   └── types.ts                   # TypeScript types
│   │
│   ├── uploads/                       # File storage
│   │   ├── documents/
│   │   ├── logos/
│   │   └── papers/
│   │
│   ├── api/                           # Vercel serverless functions
│   │   └── index.mjs
│   │
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── package.json                   # Dependencies
│   ├── pnpm-lock.yaml                 # Locked dependencies
│   ├── vercel.json                    # Vercel deployment config
│   └── components.json                # Component library config
│
├── Spécifications Fonctionnelles...   # Functional requirements (French)
├── Guide de Développement Technique...# Technical guide (French)
├── Systemes Paie Tunisie.md          # Tunisian payroll systems guide
└── tasks/                             # Project tasks & documentation

```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (or npm/yarn)
- **MongoDB**: v4.4 or higher (for development, use MongoDB Atlas for cloud or local installation)
- **Git**: For version control
- **Visual Studio Code** (recommended) with TypeScript support

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: Minimum 2GB
- **OS**: Windows, macOS, or Linux

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tunisian_payroll_landing.git
cd tunisian_payroll_landing
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payrollhub?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_min_32_characters
JWT_EXPIRY=7d

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Application Settings
APP_NAME=PayrollHub
APP_URL=http://localhost:5173

# Email Configuration (if enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@payrollhub.tn

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Vercel Deployment (if applicable)
VERCEL_ENV=development
VERCEL_GIT_PROVIDER=github
```

### 4. Database Setup

```bash
# The application will automatically seed the database on first run
# Or manually seed with test data:
pnpm run seed
```

---

## 💻 Development Workflow

### Start Development Servers

```bash
# Start both Frontend (Vite) and Backend (Express) concurrently
pnpm dev

# Or run separately:
# Terminal 1: Frontend
pnpm dev:client

# Terminal 2: Backend
pnpm dev:server
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if available)

### Available Scripts

```bash
# Development
pnpm dev              # Start dev servers (client + server)
pnpm dev:client       # Start Vite dev server only
pnpm dev:server       # Start Express server with watch

# Building
pnpm build            # Build for production
pnpm build:vercel     # Build for Vercel deployment

# Preview & Quality
pnpm preview          # Preview production build
pnpm check            # Type check with TypeScript
pnpm format           # Format code with Prettier

# Production
pnpm start            # Run production build
```

### Type Checking

```bash
# Check TypeScript types without emitting files
pnpm check

# Watch mode for continuous checking
tsc --watch
```

### Code Formatting

```bash
# Format all files
pnpm format

# Format specific file
prettier --write src/pages/Home.tsx
```

---

## 🏗 Project Architecture

### Frontend Architecture

```
┌─────────────────────────────────────┐
│       React Application (Vite)      │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Pages & Components        │   │
│  │  (Dashboard, Employees...)  │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│  ┌──────────────▼──────────────┐   │
│  │   Context API & Hooks       │   │
│  │  (Auth, Theme, Custom)      │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│  ┌──────────────▼──────────────┐   │
│  │   API Client Layer          │   │
│  │  (Axios interceptors)       │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│                 ▼                   │
│   └──────────────────────────┘    │
│   >>> Communicates with API <<<   │
│   └──────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌──────────────────────────────────────┐
│      Express API Server              │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────┐     │
│  │   HTTP Middleware          │     │
│  │  (Auth, CORS, Validation)  │     │
│  └────────┬───────────────────┘     │
│           │                         │
│  ┌────────▼───────────────────┐     │
│  │   Route Controllers        │     │
│  │  (Employees, Payroll...)   │     │
│  └────────┬───────────────────┘     │
│           │                         │
│  ┌────────▼───────────────────┐     │
│  │   Business Logic Layer     │     │
│  │  (Payroll Engine, Calcs)   │     │
│  └────────┬───────────────────┘     │
│           │                         │
│  ┌────────▼───────────────────┐     │
│  │   Data Access Layer        │     │
│  │  (Mongoose Models)         │     │
│  └────────┬───────────────────┘     │
│           │                         │
│           ▼                         │
│  ┌────────────────────────────┐     │
│  │    MongoDB Database        │     │
│  └────────────────────────────┘     │
│                                      │
└──────────────────────────────────────┘
```

### Data Flow Diagram

```
Frontend (React)
    │
    ├─► HTTP Request (JSON)
    │
Backend (Express)
    │
    ├─► Route Handler
    ├─► Validate Input (Zod)
    ├─► Business Logic
    ├─► Database Query (Mongoose)
    ├─► Process Response
    │
    ◄─► MongoDB
    │
    └─► HTTP Response (JSON)
    │
Frontend (React)
    │
    ├─► Update UI
    ├─► Show Notifications
    ├─► Re-render
```

---

## 📡 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: 
{
  "id": "user_id",
  "email": "user@example.com",
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "hr_admin",
  "token": "jwt_token"
}
```

### Employees Module

#### Get All Employees
```http
GET /api/employees?page=1&limit=20
Authorization: Bearer {jwt_token}

Response:
{
  "data": [
    {
      "id": "emp_id",
      "firstName": "Ahmed",
      "lastName": "Ben Ali",
      "email": "ahmed@company.tn",
      "position": "Engineer",
      "department": "IT",
      "salary": 3500,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Ben Ali",
  "email": "ahmed@company.tn",
  "cin": "12345678",
  "dateOfBirth": "1990-01-15",
  "position": "Engineer",
  "department": "IT",
  "contractType": "CDI",
  "salary": 3500,
  "cnssNumber": "CNSS123456",
  "iban": "TN5910006035183910400711"
}

Response:
{
  "id": "emp_id",
  "firstName": "Ahmed",
  "lastName": "Ben Ali",
  ...
}
```

#### Get Employee by ID
```http
GET /api/employees/:id
Authorization: Bearer {jwt_token}
```

#### Update Employee
```http
PUT /api/employees/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "position": "Senior Engineer",
  "department": "Engineering",
  "salary": 4500
}
```

#### Delete Employee
```http
DELETE /api/employees/:id
Authorization: Bearer {jwt_token}
```

### Payroll Module

#### Create Payroll Period
```http
POST /api/payroll/periods
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "month": 3,
  "year": 2025,
  "companyId": "company_id"
}

Response:
{
  "id": "period_id",
  "month": 3,
  "year": 2025,
  "startDate": "2025-03-01",
  "endDate": "2025-03-31",
  "status": "open"
}
```

#### Calculate Payroll
```http
POST /api/payroll/calculate
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "periodId": "period_id",
  "employeeIds": ["emp1", "emp2", "emp3"]
}

Response:
{
  "periodId": "period_id",
  "totalEmployees": 3,
  "totalNetPay": 9500.50,
  "totalGrossPay": 12000,
  "totalDeductions": 2499.50,
  "details": [...]
}
```

#### Generate Payslip
```http
GET /api/payroll/payslips/:periodId/:employeeId/pdf
Authorization: Bearer {jwt_token}

Response: PDF Binary (application/pdf)
```

### Leave Management Module

#### Request Leave
```http
POST /api/conges/request
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "employeeId": "emp_id",
  "type": "paid",
  "startDate": "2025-03-15",
  "endDate": "2025-03-20",
  "reason": "Personal reasons"
}

Response:
{
  "id": "leave_id",
  "status": "pending",
  "daysRequested": 5,
  "remainingBalance": 7
}
```

#### Approve Leave
```http
POST /api/conges/:id/approve
Authorization: Bearer {jwt_token}
```

#### Reject Leave
```http
POST /api/conges/:id/reject
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "reason": "Insufficient notice"
}
```

### Documents Module

#### Get Employee Documents
```http
GET /api/documents/:employeeId
Authorization: Bearer {jwt_token}

Response:
{
  "data": [
    {
      "id": "doc_id",
      "type": "payslip",
      "month": 2,
      "year": 2025,
      "uploadedAt": "2025-03-01T10:00:00Z",
      "url": "/uploads/payslips/..."
    }
  ]
}
```

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

FormData:
  - file: <binary_file>
  - employeeId: emp_id
  - type: document_type

Response:
{
  "id": "doc_id",
  "url": "/uploads/documents/...",
  "name": "filename.pdf"
}
```

---

## 📊 Regulatory Compliance

### Tunisian Labor Law Integration

The application implements comprehensive compliance with Tunisian regulations:

#### 1. **SMIG (Salaire Minimum Interprofessionnel Garanti)**
- 48-hour week: 528.320 TND/month
- 40-hour week: 448.238 TND/month
- Automatic updates per regulatory changes

#### 2. **CNSS Contributions (2025-2026)**

| Category | Rate |
|---|---|
| Employee Contribution | 9.68% |
| Employer Contribution | 17.07% |
| Breakdown: |
| - Retirement & Disability | 4.99% (emp) / 8.01% (emp) |
| - Health & Maternity | 2.90% (emp) / 4.25% (emp) |
| - Work Accidents | - / 0.40% (emp) |
| - Sick Leave | 0.79% (emp) / 0.79% (emp) |

#### 3. **IRPP Tax Brackets**

| Income Range (TND) | Tax Rate |
|---|---|
| 0 - 5,000 | 0% |
| 5,001 - 10,000 | 15% |
| 10,001 - 20,000 | 25% |
| 20,001 - 30,000 | 30% |
| 30,001 - 40,000 | 33% |
| 40,001 - 50,000 | 36% |
| 50,001 - 70,000 | 38% |
| 70,000+ | 40% |

#### 4. **Other Employer Contributions**
- FOPROLOS: 1% of gross salary
- TFP: 2% (industry) / 1% (services)

#### 5. **Leave Entitlements**
- Minimum 1 day per month worked (12 days/year)
- Maternity: 98 days
- Paternité: Per latest regulations
- Sick leave: Per medical certificate

#### 6. **Special Regimes**
- **SIVP**: Reduced contributions, apprenticeship regime
- **Karama Contracts**: Partial social contribution exemptions

---

## 🗄 Database Schema

### Core Collections

#### Entreprise
```javascript
{
  _id: ObjectId,
  nom: String,
  adresse: String,
  matriculeFiscal: String,
  codeCNSS: String,
  secteurActivite: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Employe
```javascript
{
  _id: ObjectId,
  entrepriseId: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  cin: String,
  dateOfBirth: Date,
  position: String,
  department: String,
  contractType: String, // CDI, CDD, SIVP, Karama
  salary: Number,
  cnssNumber: String,
  iban: String,
  familyStatus: String,
  children: Number,
  status: String, // active, inactive, archived
  hireDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### PeriodePaie
```javascript
{
  _id: ObjectId,
  entrepriseId: ObjectId,
  month: Number,
  year: Number,
  startDate: Date,
  endDate: Date,
  status: String, // open, closed, finalized
  createdAt: Date,
  updatedAt: Date
}
```

#### ElementPaie
```javascript
{
  _id: ObjectId,
  periodePaieId: ObjectId,
  employeId: ObjectId,
  type: String, // salary_base, prime, cnss_sal, irpp, etc
  amount: Number,
  isVariable: Boolean,
  createdAt: Date
}
```

#### Conge
```javascript
{
  _id: ObjectId,
  employeId: ObjectId,
  type: String, // paid, sick, maternity, paternity
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,
  status: String, // pending, approved, rejected
  reason: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Utilisateur
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  role: String, // super_admin, hr_admin, payroll_admin, employee
  firstName: String,
  lastName: String,
  employeId: ObjectId, // nullable
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Document
```javascript
{
  _id: ObjectId,
  employeId: ObjectId,
  type: String, // payslip, attestation, cnss_declaration
  fileName: String,
  fileUrl: String,
  month: Number, // for payslips
  year: Number,  // for payslips
  fileSize: Number,
  mimeType: String,
  uploadedAt: Date
}
```

#### ParametreReglementaire
```javascript
{
  _id: ObjectId,
  name: String, // SMIG_48H, CNSS_EMP_RATE, IRPP_BRACKET_1, etc
  value: Number,
  description: String,
  effectiveDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Local Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Vercel Deployment

The application is configured for deployment to Vercel:

#### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### 2. Environment Variables
Set the following in Vercel dashboard:
- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- Other variables from `.env.local`

#### 3. Build Configuration
- Build Command: `pnpm build:vercel`
- Output Directory: `dist`
- API Routes: `api/`

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t payrollhub .
docker run -p 5000:5000 --env-file .env.local payrollhub
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/payrollhub
PORT=5000
```

#### Staging
```env
NODE_ENV=staging
MONGODB_URI=<staging_mongodb_uri>
PORT=3000
```

#### Production
```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
PORT=5000
JWT_EXPIRY=7d
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork the Repository
```bash
git clone https://github.com/yourusername/tunisian_payroll_landing.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the existing code style
- Add TypeScript types
- Write meaningful commit messages

### 4. Test Your Changes
```bash
pnpm check
pnpm format
```

### 5. Submit a Pull Request
Provide a clear description of your changes, issue references, and any breaking changes.

### Contribution Guidelines

- **Code Style**: Use Prettier for formatting
- **Type Safety**: Ensure all TypeScript types are properly defined
- **Testing**: Add tests for new features
- **Documentation**: Update docs for significant changes
- **Commit Messages**: Use conventional commits format

```
feat: Add new payroll calculation feature
fix: Resolve issue with CNSS calculation
docs: Update API documentation
refactor: Improve error handling
```

---

## 📚 Additional Resources

- [Tunisian Labor Code Reference](https://www.cnss.tn)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Vite Documentation](https://vitejs.dev)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Primary Developer**: Fedi Mechergui
- **Contributors**: (Add names as needed)

---

## 📞 Support & Contact

For support, issues, or feature requests:

- **Email**: support@payrollhub.tn
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/tunisian_payroll_landing/issues)
- **Documentation**: [Full Docs](./docs)

---

## 🔄 Changelog

### Version 1.0.0 (Latest)
- ✅ Initial release
- ✅ Full payroll calculation engine
- ✅ Employee management module
- ✅ Leave management system
- ✅ Document generation (PDF)
- ✅ User authentication & authorization
- ✅ Dashboard & analytics
- ✅ API integration ready

---

## ⚠️ Important Notes

### Database Backup
Regularly backup your MongoDB database:
```bash
mongodump --uri "mongodb+srv://..." --out ./backups/$(date +%Y%m%d)
```

### Security Best Practices
1. Always use HTTPS in production
2. Keep JWT secrets secure
3. Validate all user inputs
4. Use environment variables for sensitive data
5. Implement rate limiting on API endpoints
6. Regular security audits

### Performance Optimization
1. Enable database indexing on frequently queried fields
2. Use pagination for large datasets
3. Implement caching strategies
4. Monitor API response times
5. Use CDN for static assets

---

**Last Updated**: March 2025  
**Status**: ✅ Production Ready  
**Support**: Active Development

---

> Built with ❤️ for enterprise HR and payroll management in Tunisia
