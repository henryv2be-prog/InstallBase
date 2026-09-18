# Railway Docker builder: system ffmpeg + skip postinstall until sources are copied.
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
# postinstall runs prisma generate — schema is not in the image yet at this layer
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm", "run", "start"]
