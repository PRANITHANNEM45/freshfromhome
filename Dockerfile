# Multi-stage production container for 24/7 autonomous deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend/ ./backend/

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend

EXPOSE 5000 3000

CMD ["sh", "-c", "node backend/src/server.js & cd frontend && npm run start"]
