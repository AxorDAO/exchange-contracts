FROM axorprotocol/node:8.12-alpine-v1

RUN mkdir -p /home/axor/app
WORKDIR /home/axor/app

COPY ./package.json ./package-lock.json ./
RUN npm ci --loglevel warn

COPY ./truffle-config.js ./truffle-config.js
COPY ./contracts ./contracts
RUN DOCKER_COMPILER=false npm run compile -- --all

COPY ./migrations ./migrations
COPY ./scripts ./scripts

RUN mkdir /home/.ganache
RUN sh scripts/docker.sh

EXPOSE 8545

CMD ["npm", "run", "docker_node"]
