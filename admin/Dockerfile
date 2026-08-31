# Royal Vacation — admin panel, production image.
#
# IMPORTANT: build context must be the REPO ROOT (same reasoning as
# client/Dockerfile — the ../packages/api-client `file:` dependency).
#   docker build -f admin/Dockerfile -t royal-vacation-admin .

FROM node:22-alpine AS deps
WORKDIR /repo
COPY packages/api-client ./packages/api-client
RUN npm --prefix packages/api-client ci && npm --prefix packages/api-client run build
COPY admin/package.json admin/package-lock.json ./admin/
RUN npm --prefix admin ci


FROM node:22-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/packages/api-client ./packages/api-client
COPY --from=deps /repo/admin/node_modules ./admin/node_modules
COPY admin ./admin

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /repo/admin
RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /repo/admin/.next/standalone ./
COPY --from=builder /repo/admin/.next/static ./.next/static
COPY --from=builder /repo/admin/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
