# Railway: use when the service builder is Dockerfile (or auto-detected).
# Ensures system ffmpeg exists; Linux npm installers are a fallback at runtime.
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm", "run", "start"]
