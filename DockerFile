# 1. Base image
FROM node:22-alpine

# 2. Create app directory
WORKDIR /usr/src/app

# 3. Copy package files
COPY package.json yarn.lock ./

# 4. Install dependencies
RUN yarn install --frozen-lockfile

# 5. Copy project files
COPY . .

# 6. Build NestJS app
RUN yarn build

# 7. Run app
CMD ["node", "dist/main"]
