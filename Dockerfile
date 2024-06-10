# FROM node:18-alpine

# RUN apk update && apk upgrade

# RUN apk add curl vim iputils-ping

# RUN npm install -g pm2
# RUN pm2 install typescript
# RUN pm2 install pm2-logrotate

# WORKDIR /home/workspace

# COPY . .

# RUN npm install
# RUN npm run build

# ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js", "--only", "data-io"]

# -----------------------------
# base stage
# FROM node:18-alpine as base

# RUN apk update && apk upgrade
# RUN apk add curl vim iputils-ping

# WORKDIR /home/workspace

# COPY . .

# RUN npm install
# RUN npm run build

# # dev stage
# FROM node:18-alpine as dev

# COPY . .

# COPY --from=base /home/workspace ./

# ENV NODE_ENV dev

# RUN npm install

# CMD ["npm", "run", "start:dev"]

# # prod stage
# FROM node:18-alpine as prod

# COPY . .

# RUN npm install -g pm2
# RUN pm2 install typescript
# RUN pm2 install pm2-logrotate

# ENV NODE_ENV prod

# RUN npm install

# ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js", "--only", "data-io"]
# -----------------------------

# Base stage
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /home/workspace

# Install necessary packages for production
RUN apk update && apk upgrade && \
    apk add curl vim iputils-ping

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files
COPY . .

# Dev stage
FROM base AS dev

# Additional development dependencies can be installed here
RUN npm install --only=development

# Command to run in development
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build

# Install build dependencies and build the project
RUN npm install
RUN npm run build

# Prod stage
FROM node:18-alpine AS prod

# Install pm2 globally
RUN npm install -g pm2

# Copy built files and dependencies from build stage
WORKDIR /home/workspace
COPY --from=build /home/workspace .

# Install only production dependencies
RUN npm install --only=production

# Install pm2 modules
RUN pm2 install typescript
RUN pm2 install pm2-logrotate

# Command to run in production
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js", "--only", "data-io"]
