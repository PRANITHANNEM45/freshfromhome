# FreshFromFarm - Project Snapshot
**Date**: 2026-01-22 11:39 IST

## Project Overview
FreshFromFarm is a Dairy Sales & Management System built with a modern full-stack architecture.

## Technology Stack

### Frontend
- **Framework**: Next.js v16.1.4
- **UI Library**: React v19.2.3
- **Language**: TypeScript v5
- **Linting**: ESLint v9
- **Dev Server**: Running on default Next.js port (3000)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Language**: JavaScript (CommonJS)
- **Dev Tool**: Nodemon v3.1.11
- **Dev Server**: Running on configured port

### Database & ORM
- **Database**: SQLite v5.1.7
- **ORM**: Sequelize v6.37.7

### Authentication & Security
- **Password Hashing**: bcryptjs v3.0.3
- **Token Management**: jsonwebtoken v9.0.3
- **CORS**: cors v2.8.5

### Configuration
- **Environment Variables**: dotenv v17.2.3

## Current Status
- ✅ Frontend development server running (3h 35m+)
- ✅ Backend development server running (3h 10m+)
- ✅ Both services operational

## Project Structure
```
freshfromfarm/
├── frontend/          # Next.js/React application
├── backend/           # Express.js API server
└── PROJECT_SNAPSHOT.md
```

## Development Commands

### Frontend
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

### Backend
```bash
cd backend
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

## Notes
- Project is currently not under version control (Git)
- Both development servers are running successfully
- SQLite database provides lightweight data persistence
- JWT-based authentication implemented
