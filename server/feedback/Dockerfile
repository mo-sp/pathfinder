# syntax=docker/dockerfile:1

# Standalone beta-feedback endpoint. Dependency-free, so no build step and no
# npm install — just the single Node script. node:24-slim matches the app's
# build image (glibc Node 24).
FROM node:24-slim

WORKDIR /app
COPY server.mjs ./

# Submissions are appended to a JSON-lines file under /data, which MUST be a
# persistent Coolify volume so the data survives redeploys.
ENV FEEDBACK_FILE=/data/feedback.jsonl
VOLUME /data

# Run as the unprivileged "node" user; ensure it can write the data dir.
RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 8080
CMD ["node", "server.mjs"]
