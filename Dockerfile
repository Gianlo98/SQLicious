FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm run build

FROM base
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "run", "start" ]
