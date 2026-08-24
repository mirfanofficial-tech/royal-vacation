# Build context is the repo root (see docker-compose.prod.yml) so this can
# reach ../packages/api-client, which client/package.json depends on via
# `file:../packages/api-client`. transpilePackages in next.config.ts bundles
# its compiled output straight into the app — see the "no @royal-vacation in
# node_modules/" behavior confirmed in .next/standalone during setup.

FROM node:22-slim AS builder
WORKDIR /repo

COPY packages/api-client ./packages/api-client
RUN npm --prefix packages/api-client install && npm --prefix packages/api-client run build

COPY client ./client
RUN npm --prefix client install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm --prefix client run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

RUN useradd --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nextjs /repo/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/client/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /repo/client/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
