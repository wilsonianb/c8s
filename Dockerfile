FROM node:10 as build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./

RUN npm run build && \
    rm -rf node_modules && \
    npm install --production

FROM node:10-slim
WORKDIR /usr/src/app

COPY --from=build /usr/src/app /usr/src/app
RUN mkdir -p /var/lib/codius

EXPOSE 3000
CMD [ "npm", "start" ]
