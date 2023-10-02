FROM node:18.4.0 as api-build

WORKDIR /src

COPY package.json ./

#RUN apk update

ENV TZ=Asia/Bangkok

RUN yarn cache clean
RUN yarn install

ADD . ./

RUN yarn build

FROM node:18.4.0

WORKDIR /app

COPY --from=api-build /src/dist /app/dist
COPY --from=api-build /src/package.json /app/package.json
COPY --from=api-build /src/node_modules /app/node_modules

EXPOSE 3000

USER node

CMD [ "yarn", "start:prod" ]