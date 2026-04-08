FROM node:22-alpine AS builder

WORKDIR /app

# Root dependencies
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# Server dependencies + build
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --include=dev

COPY server/ ./server/
RUN cd server && npx tsc

# Client dependencies + build
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm ci --include=dev

COPY client/ ./client/
RUN cd client && npm run build

# --- Production image ---
FROM node:22-alpine

WORKDIR /app

# Server production deps only
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev

# Copy built server
COPY --from=builder /app/server/dist ./server/dist
COPY server/.env* ./server/

# Copy built client (static files served by express)
COPY --from=builder /app/client/dist ./client/dist

# Copy root package.json for start script
COPY package.json ./

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/dist/index.js"]
