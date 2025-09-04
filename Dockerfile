# Stage 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

# Build Next.js
RUN pnpm build

# Stage 2: production image
FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy build and node_modules
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
