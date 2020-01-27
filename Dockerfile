FROM node:10

# Create app directory
WORKDIR app

# Copy package.json and install
COPY package*.json ./
RUN npm install

COPY . .

RUN npm build --mode=prodution

EXPOSE 5000
ENTRYPOINT ["npm", "start"]
