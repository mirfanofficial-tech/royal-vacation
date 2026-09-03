# Royal Vacation — client (guest-facing site), production image.
#
# IMPORTANT: build context must be the REPO ROOT, not client/ — this app
# depends on ../packages/api-client via a `file:` reference, which npm
# resolves relative to client/'s own location on disk. Build with:
#   docker build -f client/Dockerfile -t royal-vacation-client .
# (run from the repo root; docker-compose.yml already does this.)

FROM node:22-alpine AS deps
WORKDIR /repo
COPY packages/api-client ./packages/api-client
RUN npm --prefix packages/api-client ci && npm --prefix packages/api-client run build
COPY client/package.json client/package-lock.json ./client/
RUN npm --prefix client install --legacy-peer-deps


FROM node:22-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/packages/api-client ./packages/api-client
COPY --from=deps /repo/client/node_modules ./client/node_modules
COPY client ./client

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# they have to be real at `docker build`, not just at `docker run`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Building from *inside* client/ (not the repo root) is what makes the
# .next/standalone output below self-contained/flat — verified locally.
# @royal-vacation/api-client itself never appears in standalone's
# node_modules: `transpilePackages` inlines its compiled JS straight into
# the webpack bundle at build time, so nothing further to copy for it.
WORKDIR /repo/client
RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /repo/client/.next/standalone ./
COPY --from=builder /repo/client/.next/static ./.next/static
COPY --from=builder /repo/client/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
