FROM ubuntu:18.04

# Create app directory
WORKDIR app

# Add repositories
RUN apt update
RUN apt install -y curl software-properties-common
RUN add-apt-repository -y ppa:longsleep/golang-backports
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Install nodejs go yarn
RUN apt update
RUN apt install -y nodejs golang-go yarn

# Copy package.json and install
COPY package.json ./
RUN ls -a
RUN yarn

COPY . .

RUN yarn run build --mode=production

EXPOSE 5000
ENTRYPOINT ["go", "run", "server.go"]
