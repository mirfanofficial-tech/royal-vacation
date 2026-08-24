# Same pattern as client/Dockerfile — see its comments for why this works
# with the local `file:../packages/api-client` dependency. Build context is
# the repo root.

FROM node:22-slim AS builder
WORKDIR /repo

COPY packages/api-client ./packages/api-client
RUN npm --prefix packages/api-client install && npm --prefix packages/api-client run build

COPY admin ./admin
RUN npm --prefix admin install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm --prefix admin run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3001

RUN useradd --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nextjs /repo/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/admin/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /repo/admin/public ./public

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
